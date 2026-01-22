import asyncio
import logging
import os
import re
import aiosqlite
import json
import math
from aiogram import Bot, Dispatcher, Router, F
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart, Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    InlineKeyboardButton, CallbackQuery, Message, 
    InputMediaPhoto, LabeledPrice, PreCheckoutQuery
)
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiocryptopay import AioCryptoPay
from telethon import TelegramClient 

# ================= CONFIG =================
BOT_TOKEN = "8473023190:AAGSz0-cb7i3wheFHdGq660MvOxteciSK2M"
CRYPTO_TOKEN = "517410:AAJT8SL6PPS7pqdC8FR6UYVOCxhgsZOfwgw" 
ADMIN_ID = [7505020504, 7840991394, 7202759734, 8039974517]

# !!! ДАННЫЕ ДЛЯ ВХОДА В АККАУНТЫ (my.telegram.org) !!!
API_ID = 20043822      
API_HASH = "cce323059fbafc7b688a455b83ad621a" 

STARS_PER_DOLLAR = 50 
CHANNEL_ID = "@falense_market" 

# Ссылки и Картинки
CHANNEL_URL = "https://t.me/falense_market"
REVIEWS_URL = "https://t.me/reviews_falanse"
SUPPORT_URL = "https://t.me/falense_support"

# --- ССЫЛКИ НА КАРТИНКИ (ЗАМЕНЕНЫ НА РАБОЧИЕ ЗАГЛУШКИ) ---
# Ваши ссылки с allwebs.ru блокируют Телеграм. Замените их на Direct Link с postimages.org
IMG_WELCOME = "https://i.postimg.cc/vTcG5yzJ/Bez-nazvania18-20260118112836.png" # Добро пожаловать
IMG_CATALOG = "https://i.postimg.cc/VkML7Y8k/Bez-nazvania18-20260118121150.png" # Маркет
IMG_PAY = "https://i.postimg.cc/kM14G1cH/Bez-nazvania18-20260118121407.png" # Оплата
IMG_PROFILE = "https://i.postimg.cc/FHJ12yjk/Bez-nazvania18-20260118121653.png" # Профиль
IMG_ADMIN = "https://i.postimg.cc/593z3Smk/Bez-nazvania18-20260118121934.png"   # Админ панель
IMG_SELECT = "https://i.postimg.cc/DZhWQS4w/Bez-nazvania18-20260118122142.png"  # Выбор

# Папка для сессий
SESSIONS_DIR = "sessions_store"
if not os.path.exists(SESSIONS_DIR):
    os.makedirs(SESSIONS_DIR)

# Словарь флагов для красоты
FLAGS = {
    "USA": "🇺🇸 USA",
    "TKM": "🇹🇲 ТКМ",
    "RUS": "🇷🇺 RUS",
    "UKR": "🇺🇦 UKR",
    "BGD": "🇧🇩 BGD",
    "KZ": "🇰🇿 KZ",
    "OTHER": "🌍 Другое"
}

# ================= DATABASE =================
async def init_db():
    async with aiosqlite.connect("shop2.db") as db:
        await db.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, balance REAL DEFAULT 0, banned INTEGER DEFAULT 0)")
        
        # Обновленная таблица товаров
        await db.execute("""
            CREATE TABLE IF NOT EXISTS goods (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                country TEXT,
                price REAL,
                age TEXT,
                is_premium INTEGER DEFAULT 0,
                prem_duration TEXT,
                content TEXT, 
                file_id TEXT, 
                filename TEXT, 
                phone TEXT, 
                is_session INTEGER DEFAULT 0
            )
        """)
        
        # Попытка добавить колонки, если база старая (миграция)
        try:
            columns = [
                ("country", "TEXT"), ("price", "REAL"), ("age", "TEXT"), 
                ("is_premium", "INTEGER DEFAULT 0"), ("prem_duration", "TEXT")
            ]
            for col, type_ in columns:
                try:
                    await db.execute(f"ALTER TABLE goods ADD COLUMN {col} {type_}")
                except:
                    pass # Колонка уже есть
        except:
            pass

        # purchases
        await db.execute("""
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                user_id INTEGER, 
                item_info TEXT, 
                content TEXT, 
                file_id TEXT, 
                filename TEXT, 
                phone TEXT,
                is_session INTEGER DEFAULT 0, 
                price REAL, 
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # --- ТАБЛИЦЫ ДЛЯ ПРОМОКОДОВ ---
        await db.execute("""
            CREATE TABLE IF NOT EXISTS promocodes (
                code TEXT PRIMARY KEY,
                amount REAL,
                activations INTEGER
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS promo_uses (
                user_id INTEGER,
                code TEXT,
                PRIMARY KEY (user_id, code)
            )
        """)

        await db.commit()

async def get_user_data(user_id):
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("SELECT balance, banned FROM users WHERE id = ?", (user_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                await db.execute("INSERT INTO users (id) VALUES (?)", (user_id,))
                await db.commit()
                return {"balance": 0, "banned": 0}
            return {"balance": row[0], "banned": row[1]}

# ================= TELETHON UTILS =================
async def check_last_messages(session_path):
    if not API_ID or not API_HASH:
        return "❌ Ошибка бота: Не настроен API_ID/HASH."

    client = TelegramClient(session_path, API_ID, API_HASH)
    try:
        await client.connect()
        if not await client.is_user_authorized():
            await client.disconnect()
            return "❌ Сессия невалидна (аккаунт вылетел или сменили пароль)."

        messages = await client.get_messages(777000, limit=3)
        await client.disconnect()

        if not messages:
            return "📭 Сообщений от Telegram (777000) нет."
            
        result = "📨 <b>Последние коды:</b>\n\n"
        for msg in messages:
            if not msg.message: continue
            code_match = re.search(r'\b\d{5}\b', msg.message)
            code = code_match.group(0) if code_match else "код не найден"
            text_preview = (msg.message[:50] + '...') if len(msg.message) > 50 else msg.message
            result += f"🔑 <code>{code}</code>\n└ <i>{text_preview}</i>\n\n"
        return result
    except Exception as e:
        await client.disconnect()
        return f"❌ Ошибка подключения: {e}"

# ================= STATES =================
class AdminStates(StatesGroup):
    waiting_for_id_balance = State()
    waiting_for_amount = State()
    waiting_for_ban_id = State()
    waiting_for_broadcast = State()
    waiting_for_promo_data = State() # Новый стейт для создания промокода

class ReviewStates(StatesGroup):
    waiting_for_text = State()

# Новые стейты для детальной загрузки товара
class UploadStates(StatesGroup):
    waiting_for_country = State()
    waiting_for_price = State()
    waiting_for_age = State()
    waiting_for_is_premium = State()
    waiting_for_prem_duration = State()
    waiting_for_phone = State()
    waiting_for_file = State()

# Стейт для активации промокода юзером
class PromoUserStates(StatesGroup):
    waiting_for_code = State()

# ================= KEYBOARDS =================
def main_kb():
    builder = InlineKeyboardBuilder()
    builder.row(
        InlineKeyboardButton(text="📱 Каталог", callback_data="catalog_page_0"),
        InlineKeyboardButton(text="💰 Пополнить", callback_data="top_up")
    )
    # Кнопка активации промокода для всех
    builder.row(InlineKeyboardButton(text="🎟 Активировать промокод", callback_data="activate_promo"))
    builder.row(InlineKeyboardButton(text="👤 Профиль", callback_data="profile"))
    builder.row(InlineKeyboardButton(text="💬 Отзывы", url=REVIEWS_URL), InlineKeyboardButton(text="📢 Канал", url=CHANNEL_URL))
    builder.row(InlineKeyboardButton(text="🆘 Тех. Поддержка", url=SUPPORT_URL))
    return builder.as_markup()

def admin_kb():
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="📥 ЗАГРУЗИТЬ ТОВАР", callback_data="adm_upload_start"))
    # Кнопка создания промокода для админа
    builder.row(InlineKeyboardButton(text="🎁 Создать промокод", callback_data="adm_create_promo"))
    builder.row(InlineKeyboardButton(text="📊 Статистика", callback_data="adm_stats"))
    builder.row(InlineKeyboardButton(text="💸 Выдать баланс", callback_data="adm_give_bal"))
    builder.row(InlineKeyboardButton(text="🚫 Бан/Разбан", callback_data="adm_ban"))
    builder.row(InlineKeyboardButton(text="📢 Рассылка", callback_data="adm_broadcast"))
    return builder.as_markup()

def review_stars_kb():
    builder = InlineKeyboardBuilder()
    for i in range(1, 6):
        builder.button(text=f"{i}⭐", callback_data=f"rate_{i}")
    builder.adjust(5)
    return builder.as_markup()

# ================= UTILS =================
async def check_sub(bot: Bot, user_id: int):
    try:
        member = await bot.get_chat_member(CHANNEL_ID, user_id)
        return member.status in ["member", "administrator", "creator"]
    except:
        return False 

# ================= HANDLERS =================
router = Router()
crypto = AioCryptoPay(CRYPTO_TOKEN)

# --- START & SUB ---
@router.message(CommandStart())
async def start(m: Message, bot: Bot):
    user = await get_user_data(m.from_user.id)
    if user['banned']: return await m.answer("🚫 Вы заблокированы в боте.")

    if not await check_sub(bot, m.from_user.id):
        kb = InlineKeyboardBuilder()
        kb.row(InlineKeyboardButton(text="🔔 Подписаться на канал", url=CHANNEL_URL))
        kb.row(InlineKeyboardButton(text="✅ Я подписался", callback_data="check_sub"))
        return await m.answer_photo(IMG_WELCOME, caption="❌ <b>Доступ ограничен!</b>\n\nЧтобы пользоваться ботом, подпишитесь на наш канал.", reply_markup=kb.as_markup())
    
    await m.answer_photo(IMG_WELCOME, caption=f"🚀 <b>Falense Market</b>\n\n💰 Ваш баланс: <b>{user['balance']}$</b>", reply_markup=main_kb())

@router.callback_query(F.data == "check_sub")
async def check_sub_btn(c: CallbackQuery, bot: Bot):
    if await check_sub(bot, c.from_user.id):
        await c.message.delete()
        user = await get_user_data(c.from_user.id)
        await c.message.answer_photo(IMG_WELCOME, caption=f"✅ Подписка подтверждена!\n💰 Ваш баланс: <b>{user['balance']}$</b>", reply_markup=main_kb())
    else:
        await c.answer("❌ Вы всё еще не подписаны!", show_alert=True)

@router.callback_query(F.data == "to_main")
async def to_main(c: CallbackQuery, state: FSMContext):
    await state.clear() # Очистка стейтов при выходе в меню
    user = await get_user_data(c.from_user.id)
    try:
        await c.message.edit_media(InputMediaPhoto(media=IMG_WELCOME, caption=f"🚀 <b>Главное меню</b>\n💰 Баланс: {user['balance']}$"), reply_markup=main_kb())
    except Exception:
        # Если сообщение такое же, просто отвечаем "ок", чтобы убрать часики загрузки
        await c.answer()

# --- PROFILE ---
@router.callback_query(F.data == "profile")
async def profile_handler(c: CallbackQuery):
    user = await get_user_data(c.from_user.id)
    text = f"👤 <b>Личный кабинет</b>\n\n🆔 ID: <code>{c.from_user.id}</code>\n💵 Баланс: <b>{user['balance']}$</b>"
    kb = InlineKeyboardBuilder().button(text="⬅️ Назад", callback_data="to_main").as_markup()
    await c.message.edit_media(InputMediaPhoto(media=IMG_PROFILE, caption=text), reply_markup=kb)

# --- TOP UP ---
@router.callback_query(F.data == "top_up")
async def top_up_methods(c: CallbackQuery):
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="⭐ Telegram Stars", callback_data="method_stars"))
    kb.row(InlineKeyboardButton(text="⚡ CryptoBot (USDT)", callback_data="method_crypto"))
    kb.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="to_main"))
    await c.message.edit_media(InputMediaPhoto(media=IMG_PAY, caption="💳 <b>Выберите метод пополнения:</b>"), reply_markup=kb.as_markup())

@router.callback_query(F.data.startswith("method_"))
async def top_up_amounts(c: CallbackQuery):
    method = c.data.split("_")[1]
    kb = InlineKeyboardBuilder()
    for amt in [1, 5, 10, 20]: kb.button(text=f"{amt}$", callback_data=f"paytopup_{method}_{amt}")
    kb.adjust(2)
    kb.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="top_up"))
    await c.message.edit_media(InputMediaPhoto(media=IMG_PAY, caption=f"💳 Сумма пополнения ({method}):"), reply_markup=kb.as_markup())

@router.callback_query(F.data.startswith("paytopup_"))
async def process_topup(c: CallbackQuery):
    _, method, amount = c.data.split("_")
    amount = float(amount)
    if method == "crypto":
        inv = await crypto.create_invoice(amount=amount, asset='USDT')
        kb = InlineKeyboardBuilder().row(InlineKeyboardButton(text="💸 Оплатить", url=inv.bot_invoice_url)).row(InlineKeyboardButton(text="✅ Проверить", callback_data=f"checktop_{inv.invoice_id}_{amount}")).as_markup()
        await c.message.answer(f"📦 Пополнение {amount}$\nОплатите счет:", reply_markup=kb)
    elif method == "stars":
        await c.message.answer_invoice(title="Пополнение", description=f"{amount}$", payload=f"topup_stars_{amount}", currency="XTR", prices=[LabeledPrice(label="USD", amount=int(amount * STARS_PER_DOLLAR))], provider_token="")

@router.callback_query(F.data.startswith("checktop_"))
async def check_balance_topup(c: CallbackQuery):
    _, inv_id, amount = c.data.split("_")
    try:
        inv = await crypto.get_invoices(invoice_ids=int(inv_id))
        status = (inv[0] if isinstance(inv, list) else inv).status
        if status == 'paid':
            async with aiosqlite.connect("shop2.db") as db:
                await db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (float(amount), c.from_user.id))
                await db.commit()
            await c.message.delete()
            await c.message.answer(f"✅ Баланс пополнен на {amount}$!")
        else: await c.answer("Не оплачено!", show_alert=True)
    except Exception as e:
        await c.answer(f"Ошибка проверки: {e}", show_alert=True)

# --- ПРОМОКОДЫ (USER) ---
@router.callback_query(F.data == "activate_promo")
async def user_activate_promo_start(c: CallbackQuery, state: FSMContext):
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="❌ Отмена", callback_data="to_main"))
    await c.message.answer("🎟 <b>Введите промокод:</b>", reply_markup=kb.as_markup())
    await state.set_state(PromoUserStates.waiting_for_code)

@router.message(PromoUserStates.waiting_for_code)
async def user_activate_promo_process(m: Message, state: FSMContext):
    code = m.text.strip()
    user_id = m.from_user.id
    
    async with aiosqlite.connect("shop2.db") as db:
        # 1. Проверяем существование кода и кол-во активаций
        async with db.execute("SELECT amount, activations FROM promocodes WHERE code = ?", (code,)) as cur:
            promo = await cur.fetchone()
        
        if not promo:
            return await m.answer("❌ Такого промокода не существует.")
            
        amount, activations_left = promo
        
        if activations_left <= 0:
            return await m.answer("❌ Промокод закончился.")
            
        # 2. Проверяем, не использовал ли юзер уже этот код
        async with db.execute("SELECT * FROM promo_uses WHERE user_id = ? AND code = ?", (user_id, code)) as cur:
            used = await cur.fetchone()
            
        if used:
            return await m.answer("❌ Вы уже активировали этот промокод!")
            
        # 3. Активируем
        await db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (amount, user_id))
        await db.execute("UPDATE promocodes SET activations = activations - 1 WHERE code = ?", (code,))
        await db.execute("INSERT INTO promo_uses (user_id, code) VALUES (?, ?)", (user_id, code))
        await db.commit()
        
    await m.answer(f"✅ <b>Успешно!</b>\n💰 Вам начислено: {amount}$")
    await state.clear()


# --- НОВЫЙ КАТАЛОГ (ВСЕ ВМЕСТЕ) ---
@router.callback_query(F.data.startswith("catalog_page_"))
async def catalog_handler(c: CallbackQuery):
    page = int(c.data.split("_")[2])
    ITEMS_PER_PAGE = 6

    async with aiosqlite.connect("shop2.db") as db:
        # Считаем всего товаров
        async with db.execute("SELECT COUNT(*) FROM goods") as cursor:
            total_items = (await cursor.fetchone())[0]
        
        # Берем товары для текущей страницы
        offset = page * ITEMS_PER_PAGE
        async with db.execute("SELECT id, country, phone, price, age, is_premium, prem_duration FROM goods LIMIT ? OFFSET ?", (ITEMS_PER_PAGE, offset)) as cursor:
            items = await cursor.fetchall()

    kb = InlineKeyboardBuilder()

    if not items:
        kb.row(InlineKeyboardButton(text="⬅️ Назад", callback_data="to_main"))
        return await c.message.edit_media(InputMediaPhoto(media=IMG_CATALOG, caption="📭 <b>В данный момент товаров нет.</b>\nЗагляните позже!"), reply_markup=kb.as_markup())

    # Формируем кнопки для каждого товара
    for item in items:
        i_id, country, phone, price, age, is_prem, prem_dur = item
        flag = FLAGS.get(country, country) # Получаем флаг или код
        
        # Формируем текст кнопки: Флаг | Номер | Отлега | Цена
        btn_text = f"{flag} {phone} | {age} | {price}$"
        if is_prem:
            btn_text += " | 💎"
        
        kb.row(InlineKeyboardButton(text=btn_text, callback_data=f"view_item_{i_id}"))

    # Навигация
    nav_buttons = []
    if page > 0:
        nav_buttons.append(InlineKeyboardButton(text="⬅️", callback_data=f"catalog_page_{page-1}"))
    
    nav_buttons.append(InlineKeyboardButton(text=f"📄 {page+1}", callback_data="noop")) # Просто номер страницы
    
    if (offset + ITEMS_PER_PAGE) < total_items:
        nav_buttons.append(InlineKeyboardButton(text="➡️", callback_data=f"catalog_page_{page+1}"))
    
    kb.row(*nav_buttons)
    kb.row(InlineKeyboardButton(text="⬅️ В меню", callback_data="to_main"))

    msg_text = "🌍 <b>Каталог товаров</b>\nВыберите номер для покупки:"
    
    # Чтобы не было ошибки при обновлении той же страницы
    try:
        await c.message.edit_media(InputMediaPhoto(media=IMG_CATALOG, caption=msg_text), reply_markup=kb.as_markup())
    except:
        await c.answer()

@router.callback_query(F.data == "noop")
async def noop_handler(c: CallbackQuery):
    await c.answer()

# --- ПРОСМОТР ТОВАРА ---
@router.callback_query(F.data.startswith("view_item_"))
async def view_item(c: CallbackQuery):
    item_id = int(c.data.split("_")[2])
    
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("""
            SELECT id, country, price, age, is_premium, prem_duration, content, file_id, filename, phone, is_session 
            FROM goods WHERE id = ?
        """, (item_id,)) as cursor:
            item = await cursor.fetchone()
    
    if not item:
        return await c.answer("Товар уже куплен или удален!", show_alert=True)
    
    i_id, country, price, age, is_prem, prem_dur, _, _, _, phone, _ = item
    
    user = await get_user_data(c.from_user.id)
    flag = FLAGS.get(country, country)
    prem_status = f"✅ Да ({prem_dur})" if is_prem else "❌ Нет"
    
    info_text = (
        f"📦 <b>Информация о товаре #{i_id}</b>\n\n"
        f"🌍 Страна: <b>{flag}</b>\n"
        f"📱 Номер: <code>{phone}</code>\n"
        f"⏳ Отлега: <b>{age}</b>\n"
        f"💎 Premium: <b>{prem_status}</b>\n"
        f"💵 Цена: <b>{price}$</b>\n\n"
        f"💳 Ваш баланс: <b>{user['balance']}$</b>"
    )
    
    kb = InlineKeyboardBuilder()
    if user['balance'] >= price:
        kb.row(InlineKeyboardButton(text=f"✅ Купить за {price}$", callback_data=f"buy_id_{i_id}"))
    else:
        kb.row(InlineKeyboardButton(text="💰 Пополнить", callback_data="top_up"))
        
    kb.row(InlineKeyboardButton(text="⬅️ Назад в каталог", callback_data="catalog_page_0"))
    
    await c.message.edit_media(InputMediaPhoto(media=IMG_SELECT, caption=info_text), reply_markup=kb.as_markup())

# --- ПОКУПКА (ПО ID) ---
@router.callback_query(F.data.startswith("buy_id_"))
async def buy_by_id(c: CallbackQuery):
    item_id = int(c.data.split("_")[2])
    user_id = c.from_user.id
    
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("""
            SELECT id, country, price, age, is_premium, prem_duration, content, file_id, filename, phone, is_session 
            FROM goods WHERE id = ?
        """, (item_id,)) as cur:
            item = await cur.fetchone()
        
        if not item:
            return await c.answer("Товар уже забрали!", show_alert=True)
            
        _, country, price, age, is_prem, prem_dur, content, file_id, filename, phone, is_session = item
        
        async with db.execute("SELECT balance FROM users WHERE id = ?", (user_id,)) as cur:
            bal = (await cur.fetchone())[0]
            
        if bal < price:
            return await c.answer("Недостаточно средств!", show_alert=True)
            
        await db.execute("UPDATE users SET balance = balance - ? WHERE id = ?", (price, user_id))
        await db.execute("DELETE FROM goods WHERE id = ?", (item_id,))
        
        item_info = f"{country} | {phone} | {age}"
        
        await db.execute("""
            INSERT INTO purchases 
            (user_id, item_info, content, file_id, filename, phone, is_session, price) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, item_info, content, file_id, filename, phone, is_session, price))
        
        await db.commit()
        
        purchase_id = (await (await db.execute("SELECT last_insert_rowid()")).fetchone())[0]

    await c.message.delete()
    
    if file_id:
        try:
            await c.message.answer_document(
                file_id, 
                caption=f"✅ <b>Покупка успешна!</b>\n📱 {phone}\n💵 -{price}$"
            )
            
            kb = InlineKeyboardBuilder()
            msg_info = f"📱 <b>Номер:</b> <code>{phone}</code>"

            if is_session:
                file_info = await c.bot.get_file(file_id)
                local_filename = f"{purchase_id}_{filename}"
                local_path = os.path.join(SESSIONS_DIR, local_filename)
                await c.bot.download_file(file_info.file_path, local_path)
                
                kb.row(InlineKeyboardButton(text="🔐 ПОЛУЧИТЬ КОД ВХОДА", callback_data=f"getcode_{purchase_id}_{local_filename}"))
                msg_info += "\n\n👇 <b>Вход в аккаунт:</b>\n1. Введите номер в Telegram.\n2. Нажмите кнопку ниже для получения кода."
            
            await c.message.answer(msg_info, reply_markup=kb.as_markup())
            
        except Exception as e:
            await c.message.answer(f"✅ Куплено, но ошибка отправки файла: {e}")
    else:
        await c.message.answer(f"✅ <b>Успешно!</b>\n\nДанные: <code>{content}</code>")

    # --- ВОТ ТУТ ПРАВИЛЬНЫЙ ЦИКЛ (внутри функции) ---
    for admin in ADMIN_ID:
        try:
            await c.bot.send_message(admin, f"💰 <b>Продажа!</b>\nЮзер: {user_id}\nТовар: {phone} ({country})\nЦена: {price}$")
        except Exception:
            pass

    await asyncio.sleep(1)
    await c.message.answer("⭐ <b>Оцените сервис:</b>", reply_markup=review_stars_kb())

# --- ПОЛУЧЕНИЕ КОДА (Telethon) ---
@router.callback_query(F.data.startswith("getcode_"))
async def get_login_code(c: CallbackQuery):
    _, pid, fname = c.data.split("_", 2) 
    path = os.path.join(SESSIONS_DIR, fname)
    
    if not os.path.exists(path):
        return await c.answer("❌ Файл сессии не найден.", show_alert=True)
        
    await c.answer("⏳ Подключаюсь...")
    result_text = await check_last_messages(path)
    
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="🔄 Обновить", callback_data=f"getcode_{pid}_{fname}"))
    
    try:
        await c.message.edit_text(f"📱 <b>Аккаунт подключен</b>\n{result_text}", reply_markup=kb.as_markup(), parse_mode=ParseMode.HTML)
    except:
        await c.message.answer(result_text, reply_markup=kb.as_markup())

# --- ОТЗЫВЫ ---
@router.callback_query(F.data.startswith("rate_"))
async def review_rate_handler(c: CallbackQuery, state: FSMContext):
    rating = c.data.split("_")[1]
    await state.update_data(rating=rating)
    await c.message.edit_text(f"Оценка: {rating}⭐\n✍️ <b>Напишите отзыв:</b>")
    await state.set_state(ReviewStates.waiting_for_text)

@router.message(ReviewStates.waiting_for_text)
async def review_text_handler(m: Message, state: FSMContext):
    data = await state.get_data()
    rating = data.get('rating', '?')
    
    # Цикл должен быть С ОТСТУПОМ, чтобы быть частью функции
    for admin in ADMIN_ID:
        try:
            await m.bot.send_message(admin, f"💬 <b>Отзыв!</b>\n👤: {m.from_user.full_name}\n⭐: {rating}\n📝: {m.text}")
        except Exception:
            pass

    await state.clear()
    await m.answer("✅ <b>Спасибо!</b>", reply_markup=main_kb())

# --- ADMIN PANEL ---
@router.message(Command("admin"))
async def admin_panel(m: Message):
    if m.from_user.id not in ADMIN_ID: 
        return
    await m.answer_photo(IMG_ADMIN, caption="🛠 <b>Админка</b>", reply_markup=admin_kb())

# --- ПРОМОКОДЫ (ADMIN) ---
@router.callback_query(F.data == "adm_create_promo")
async def adm_promo_start(c: CallbackQuery, state: FSMContext):
    await c.message.answer("🎁 <b>Создание промокода</b>\n\nВведите данные в формате:\n<code>КОД СУММА КОЛИЧЕСТВО</code>\n\nПример: <code>SALE10 10 5</code>\n(Код SALE10, дает 10$, на 5 человек)")
    await state.set_state(AdminStates.waiting_for_promo_data)

@router.message(AdminStates.waiting_for_promo_data)
async def adm_promo_save(m: Message, state: FSMContext):
    try:
        code, amount, limit = m.text.split()
        amount = float(amount)
        limit = int(limit)
        
        async with aiosqlite.connect("shop2.db") as db:
            await db.execute("INSERT OR REPLACE INTO promocodes (code, amount, activations) VALUES (?, ?, ?)", (code, amount, limit))
            await db.commit()
            
        await m.answer(f"✅ Промокод <code>{code}</code> на {amount}$ ({limit} шт.) создан!")
    except ValueError:
        await m.answer("❌ Ошибка формата! Введите: КОД СУММА КОЛИЧЕСТВО")
    except Exception as e:
        await m.answer(f"❌ Ошибка БД: {e}")
        
    await state.clear()

# ================= НОВАЯ ЗАГРУЗКА ТОВАРА (WIZARD) =================

# 1. Выбор страны
@router.callback_query(F.data == "adm_upload_start")
async def adm_up_1_country(c: CallbackQuery, state: FSMContext):
    kb = InlineKeyboardBuilder()
    for code, name in FLAGS.items():
        kb.row(InlineKeyboardButton(text=name, callback_data=f"upl_country_{code}"))
    kb.row(InlineKeyboardButton(text="❌ Отмена", callback_data="to_main"))
    
    await c.message.edit_caption(caption="1️⃣ <b>Выберите страну аккаунта:</b>", reply_markup=kb.as_markup())
    await state.set_state(UploadStates.waiting_for_country)

# 2. Ввод цены
@router.callback_query(F.data.startswith("upl_country_"))
async def adm_up_2_price(c: CallbackQuery, state: FSMContext):
    country = c.data.split("_")[2]
    await state.update_data(country=country)
    
    await c.message.answer(f"🏳️ Страна: {country}\n\n2️⃣ <b>Введите цену в долларах</b> (например: 3.5 или 10):")
    await state.set_state(UploadStates.waiting_for_price)

# 3. Ввод отлеги
@router.message(UploadStates.waiting_for_price)
async def adm_up_3_age(m: Message, state: FSMContext):
    try:
        price = float(m.text.replace(",", "."))
    except:
        return await m.answer("❌ Введите число! (например 5)")
    
    await state.update_data(price=price)
    await m.answer(f"💵 Цена: {price}$\n\n3️⃣ <b>Укажите отлегу:</b>\nНапример: '2 года', '6 месяцев', 'Новорег'.")
    await state.set_state(UploadStates.waiting_for_age)

# 4. Премиум?
@router.message(UploadStates.waiting_for_age)
async def adm_up_4_prem(m: Message, state: FSMContext):
    await state.update_data(age=m.text)
    
    kb = InlineKeyboardBuilder()
    kb.row(InlineKeyboardButton(text="✅ Есть Premium", callback_data="upl_prem_yes"))
    kb.row(InlineKeyboardButton(text="❌ Нет", callback_data="upl_prem_no"))
    
    await m.answer(f"⏳ Отлега: {m.text}\n\n4️⃣ <b>На аккаунте есть Premium?</b>", reply_markup=kb.as_markup())
    await state.set_state(UploadStates.waiting_for_is_premium)

# 5. Длительность Премиума (если есть) или сразу номер
@router.callback_query(F.data.startswith("upl_prem_"))
async def adm_up_5_duration(c: CallbackQuery, state: FSMContext):
    choice = c.data.split("_")[2]
    
    if choice == "no":
        await state.update_data(is_premium=0, prem_duration="-")
        # Сразу просим номер
        await c.message.answer("💎 Премиум: Нет\n\n5️⃣ <b>Введите номер телефона</b> (+123...):")
        await state.set_state(UploadStates.waiting_for_phone)
    else:
        await state.update_data(is_premium=1)
        await c.message.answer("💎 Премиум: Да\n\n✍️ <b>Напишите срок премиума:</b>\nНапример: '1 месяц', '6 месяцев'.")
        await state.set_state(UploadStates.waiting_for_prem_duration)

@router.message(UploadStates.waiting_for_prem_duration)
async def adm_up_6_phone_after_prem(m: Message, state: FSMContext):
    await state.update_data(prem_duration=m.text)
    await m.answer(f"💎 Срок: {m.text}\n\n5️⃣ <b>Введите номер телефона</b> (+123...):")
    await state.set_state(UploadStates.waiting_for_phone)

# 6. Файл
@router.message(UploadStates.waiting_for_phone)
async def adm_up_7_file(m: Message, state: FSMContext):
    await state.update_data(phone=m.text)
    await m.answer(f"📱 Номер: {m.text}\n\n6️⃣ <b>Отправьте файл</b> (.session, .json и т.д.):")
    await state.set_state(UploadStates.waiting_for_file)

# 7. Финиш
@router.message(UploadStates.waiting_for_file)
async def adm_up_finish(m: Message, state: FSMContext):
    if not m.document:
        return await m.answer("❌ Жду файл документа!")

    data = await state.get_data()
    file_id = m.document.file_id
    filename = m.document.file_name
    is_session = 1 if filename.endswith('.session') else 0
    
    async with aiosqlite.connect("shop2.db") as db:
        await db.execute("""
            INSERT INTO goods (country, price, age, is_premium, prem_duration, content, file_id, filename, phone, is_session)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data['country'], 
            data['price'], 
            data['age'], 
            data['is_premium'], 
            data['prem_duration'], 
            "Файл", 
            file_id, 
            filename, 
            data['phone'], 
            is_session
        ))
        await db.commit()
    
    info = (
        f"✅ <b>Товар добавлен!</b>\n"
        f"🏳️ {data['country']}\n"
        f"💵 {data['price']}$\n"
        f"📱 {data['phone']}\n"
        f"⏳ {data['age']}\n"
        f"💎 Prem: {'Да ('+data['prem_duration']+')' if data['is_premium'] else 'Нет'}"
    )
    
    await m.answer(info, reply_markup=admin_kb())
    await state.clear()

# --- OTHER ADMIN COMMANDS ---
@router.callback_query(F.data == "adm_stats")
async def adm_stats(c: CallbackQuery):
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("SELECT COUNT(*), SUM(balance) FROM users") as cur:
            count, total = await cur.fetchone()
        async with db.execute("SELECT COUNT(*) FROM goods") as cur:
            goods_count = (await cur.fetchone())[0]
            
    await c.message.answer(f"📊 <b>Статистика:</b>\n👥 Юзеров: {count}\n💰 Общий баланс: {total or 0:.2f}$\n📦 Товаров в наличии: {goods_count}")

@router.callback_query(F.data == "adm_give_bal")
async def adm_give_start(c: CallbackQuery, state: FSMContext):
    await c.message.answer("Введите ID пользователя:")
    await state.set_state(AdminStates.waiting_for_id_balance)

@router.message(AdminStates.waiting_for_id_balance)
async def adm_id_bal(m: Message, state: FSMContext):
    await state.update_data(tid=m.text)
    await m.answer("Введите сумму для выдачи:")
    await state.set_state(AdminStates.waiting_for_amount)

@router.message(AdminStates.waiting_for_amount)
async def adm_amt_bal(m: Message, state: FSMContext):
    d = await state.get_data()
    try:
        async with aiosqlite.connect("shop2.db") as db:
            await db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (float(m.text), int(d['tid'])))
            await db.commit()
        await m.answer("✅ Баланс выдан!")
        await m.bot.send_message(d['tid'], f"💰 Вам начислено {m.text}$")
    except: await m.answer("❌ Ошибка (возможно нет такого ID).")
    await state.clear()

@router.callback_query(F.data == "adm_ban")
async def adm_ban_start(c: CallbackQuery, state: FSMContext):
    await c.message.answer("Введите ID пользователя для Бана/Разбана:")
    await state.set_state(AdminStates.waiting_for_ban_id)

@router.message(AdminStates.waiting_for_ban_id)
async def adm_ban_proc(m: Message, state: FSMContext):
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("SELECT banned FROM users WHERE id = ?", (m.text,)) as cur:
            res = await cur.fetchone()
            if res:
                new = 0 if res[0] else 1
                await db.execute("UPDATE users SET banned = ? WHERE id = ?", (new, m.text))
                await db.commit()
                await m.answer(f"✅ Новый статус: {'🚫 БАН' if new else '🟢 АКТИВЕН'}")
            else: await m.answer("Нет такого юзера.")
    await state.clear()

@router.callback_query(F.data == "adm_broadcast")
async def adm_br_start(c: CallbackQuery, state: FSMContext):
    await c.message.answer("Отправьте сообщение (текст/фото) для рассылки всем:")
    await state.set_state(AdminStates.waiting_for_broadcast)

@router.message(AdminStates.waiting_for_broadcast)
async def adm_br_proc(m: Message, state: FSMContext):
    async with aiosqlite.connect("shop2.db") as db:
        async with db.execute("SELECT id FROM users") as cur:
            rows = await cur.fetchall()
    count = 0
    for r in rows:
        try:
            await m.copy_to(r[0])
            count += 1
        except: pass
    await m.answer(f"✅ Рассылка завершена. Получили: {count} чел.")
    await state.clear()

@router.pre_checkout_query()
async def pre_ch(q: PreCheckoutQuery): await q.answer(ok=True)

@router.message(F.successful_payment)
async def success_p(m: Message):
    payload = m.successful_payment.invoice_payload
    if "topup_stars" in payload:
        amt = float(payload.split("_")[2])
        async with aiosqlite.connect("shop2.db") as db:
            await db.execute("UPDATE users SET balance = balance + ? WHERE id = ?", (amt, m.from_user.id))
            await db.commit()
        await m.answer(f"✅ Зачислено {amt}$")

# --- MAIN ---
async def main():
    await init_db()
    bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())

