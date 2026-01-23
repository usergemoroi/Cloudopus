import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@example.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.email)

  const gamesData = [
    {
      slug: 'world-of-warcraft',
      name: 'World of Warcraft',
      description: 'World of Warcraft (WoW) is a massively multiplayer online role-playing game (MMORPG) released in 2004 by Blizzard Entertainment. Set in the Warcraft fantasy universe, World of Warcraft takes place within the world of Azeroth, approximately four years after the events of the previous game in the series.',
      shortDescription: 'The legendary MMORPG that defined a genre',
      genre: ['MMORPG', 'Fantasy', 'RPG'],
      rating: 4.5,
      imageUrl: 'https://media.rawg.io/media/games/c02/c02d24acfb2c431d5c4c88b0e8e0c3b1.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/c02/c02d24acfb2c431d5c4c88b0e8e0c3b1.jpg',
      screenshots: [
        'https://media.rawg.io/media/screenshots/5e9/5e9e7e8c481e0b1e2bbf2bbf2b36ce3c.jpg',
        'https://media.rawg.io/media/screenshots/4e1/4e1c6d2c3e3e3f5e5d5c5b5a5a5a5a5a.jpg',
      ],
      isFeatured: true,
    },
    {
      slug: 'counter-strike-2',
      name: 'Counter-Strike 2',
      description: 'Counter-Strike 2 is a 2023 multiplayer tactical first-person shooter game developed and published by Valve. It is the fifth main installment in the Counter-Strike series, and is an updated version of Global Offensive.',
      shortDescription: 'The iconic competitive FPS shooter',
      genre: ['FPS', 'Shooter', 'Multiplayer'],
      rating: 4.7,
      imageUrl: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/736/73619bd336c894d6941d926bfd563946.jpg',
      screenshots: [
        'https://media.rawg.io/media/screenshots/ff1/ff16661bb15f7969352103d44d32c327.jpg',
      ],
      isFeatured: true,
    },
    {
      slug: 'league-of-legends',
      name: 'League of Legends',
      description: 'League of Legends (LoL) is a multiplayer online battle arena video game developed and published by Riot Games. In the game, two teams of five players battle in player-versus-player combat, each team occupying and defending their half of the map.',
      shortDescription: 'The worlds most popular MOBA game',
      genre: ['MOBA', 'Strategy', 'Multiplayer'],
      rating: 4.6,
      imageUrl: 'https://media.rawg.io/media/games/78d/78dfae12fb8c5b16cd78648553071e0a.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/78d/78dfae12fb8c5b16cd78648553071e0a.jpg',
      screenshots: [],
      isFeatured: true,
    },
    {
      slug: 'dota-2',
      name: 'Dota 2',
      description: 'Dota 2 is a multiplayer online battle arena (MOBA) video game developed and published by Valve. The game is a sequel to Defense of the Ancients (DotA), which was a community-created mod for Blizzard Entertainments Warcraft III.',
      shortDescription: 'Epic battles in the ultimate MOBA experience',
      genre: ['MOBA', 'Strategy', 'Multiplayer'],
      rating: 4.5,
      imageUrl: 'https://media.rawg.io/media/games/d07/d0790809a13027251b6d0f4dc7538c58.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/d07/d0790809a13027251b6d0f4dc7538c58.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'valorant',
      name: 'Valorant',
      description: 'Valorant is a free-to-play first-person tactical hero shooter developed and published by Riot Games. The game operates on an economy-round, objective-based, first-to-13 competitive format where you select a unique agent to play for the entirety of the match.',
      shortDescription: 'Tactical shooter meets unique agent abilities',
      genre: ['FPS', 'Shooter', 'Tactical'],
      rating: 4.4,
      imageUrl: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
      screenshots: [],
      isFeatured: true,
    },
    {
      slug: 'apex-legends',
      name: 'Apex Legends',
      description: 'Apex Legends is a free-to-play battle royale-hero shooter game developed by Respawn Entertainment and published by Electronic Arts. Players work in squads of three, selecting from pre-designed characters with distinctive abilities.',
      shortDescription: 'Battle royale with legendary characters',
      genre: ['Battle Royale', 'FPS', 'Shooter'],
      rating: 4.3,
      imageUrl: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/b72/b7233d5d5b1e75e86bb860ccc7aeca85.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'fortnite',
      name: 'Fortnite',
      description: 'Fortnite is a free-to-play battle royale game developed and published by Epic Games. It was released as three distinct game modes: Fortnite Battle Royale, a free-to-play battle royale game in which up to 100 players fight to be the last person standing.',
      shortDescription: 'The phenomenon that took over the world',
      genre: ['Battle Royale', 'Shooter', 'Survival'],
      rating: 4.2,
      imageUrl: 'https://media.rawg.io/media/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/1f4/1f47a270b8f241e4676b14d39ec620f7.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'minecraft',
      name: 'Minecraft',
      description: 'Minecraft is a sandbox video game developed by Mojang Studios. The game was created by Markus "Notch" Persson in the Java programming language. In Minecraft, players explore a blocky, procedurally generated 3D world with virtually infinite terrain.',
      shortDescription: 'Build, explore, and survive in blocky worlds',
      genre: ['Sandbox', 'Survival', 'Adventure'],
      rating: 4.8,
      imageUrl: 'https://media.rawg.io/media/games/b4e/b4e4c73d5aa4ec66bbf75375c4847a2b.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/b4e/b4e4c73d5aa4ec66bbf75375c4847a2b.jpg',
      screenshots: [],
      isFeatured: true,
    },
    {
      slug: 'genshin-impact',
      name: 'Genshin Impact',
      description: 'Genshin Impact is an action role-playing game developed and published by miHoYo. The game features an open-world environment and action-based battle system using elemental magic and character-switching.',
      shortDescription: 'Explore a magical open world',
      genre: ['RPG', 'Action', 'Adventure'],
      rating: 4.5,
      imageUrl: 'https://media.rawg.io/media/games/6a1/6a1fb9c9a6dafc0c2697fa57cf24e7c5.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/6a1/6a1fb9c9a6dafc0c2697fa57cf24e7c5.jpg',
      screenshots: [],
      isFeatured: true,
    },
    {
      slug: 'rust',
      name: 'Rust',
      description: 'Rust is a multiplayer-only survival video game developed by Facepunch Studios. The objective of the game is to survive in the wilderness using gathered or stolen materials. Players must successfully manage their hunger, thirst, and health.',
      shortDescription: 'Survive, craft, and dominate',
      genre: ['Survival', 'Multiplayer', 'Crafting'],
      rating: 4.1,
      imageUrl: 'https://media.rawg.io/media/games/c92/c9207a31f0eeb9904a840fc26eae6afb.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/c92/c9207a31f0eeb9904a840fc26eae6afb.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'escape-from-tarkov',
      name: 'Escape from Tarkov',
      description: 'Escape from Tarkov is a hardcore and realistic online first-person action RPG/Simulator with MMO features and a story-driven walkthrough. With each passing day the situation in the Norvinsk region grows more and more complicated.',
      shortDescription: 'Hardcore realistic FPS survival',
      genre: ['FPS', 'Survival', 'RPG'],
      rating: 4.4,
      imageUrl: 'https://media.rawg.io/media/games/5aa/5aa4c12a53bc5f606bf8d92461ec747d.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/5aa/5aa4c12a53bc5f606bf8d92461ec747d.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'destiny-2',
      name: 'Destiny 2',
      description: 'Destiny 2 is a free-to-play online-only multiplayer first-person shooter video game developed by Bungie. It is the sequel to 2014s Destiny and its subsequent expansions. The game features a massively multiplayer online game environment.',
      shortDescription: 'Become legend in this sci-fi shooter',
      genre: ['FPS', 'MMO', 'RPG'],
      rating: 4.3,
      imageUrl: 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc6ab3ac0ce0e.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/34b/34b1f1850a1c06fd971bc6ab3ac0ce0e.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'roblox',
      name: 'Roblox',
      description: 'Roblox is an online game platform and game creation system that allows users to program games and play games created by other users. Created by David Baszucki and Erik Cassel in 2004 and released in 2006.',
      shortDescription: 'Create and play infinite games',
      genre: ['Sandbox', 'Multiplayer', 'Creative'],
      rating: 4.0,
      imageUrl: 'https://media.rawg.io/media/games/d89/d89bd0cf4fcdc10820892980cbba0f49.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/d89/d89bd0cf4fcdc10820892980cbba0f49.jpg',
      screenshots: [],
      isFeatured: false,
    },
    {
      slug: 'grand-theft-auto-v',
      name: 'Grand Theft Auto V',
      description: 'Grand Theft Auto V is an action-adventure game played from either a third-person or first-person perspective. Players complete missions—linear scenarios with set objectives—to progress through the story.',
      shortDescription: 'Experience Los Santos like never before',
      genre: ['Action', 'Adventure', 'Open World'],
      rating: 4.7,
      imageUrl: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/20a/20aa03a10cda45239fe22d035c0ebe64.jpg',
      screenshots: [],
      isFeatured: true,
    },
    {
      slug: 'final-fantasy-xiv',
      name: 'Final Fantasy XIV',
      description: 'Final Fantasy XIV is a massively multiplayer online role-playing game (MMORPG) developed and published by Square Enix. Directed and produced by Naoki Yoshida, it was released worldwide for PlayStation 3 and Windows in August 2013.',
      shortDescription: 'The critically acclaimed MMORPG',
      genre: ['MMORPG', 'RPG', 'Fantasy'],
      rating: 4.6,
      imageUrl: 'https://media.rawg.io/media/games/f87/f87457e8347484033cb34cde6101d08d.jpg',
      backgroundImage: 'https://media.rawg.io/media/games/f87/f87457e8347484033cb34cde6101d08d.jpg',
      screenshots: [],
      isFeatured: false,
    },
  ]

  console.log('🎮 Creating games...')
  
  for (const gameData of gamesData) {
    const game = await prisma.game.upsert({
      where: { slug: gameData.slug },
      update: {},
      create: gameData,
    })

    console.log(`✅ Game created: ${game.name}`)

    const donatePackages = [
      {
        name: 'Starter Pack',
        description: 'Perfect for beginners. Get essential in-game items and currency to kickstart your adventure.',
        priceRUB: 499,
        priceUSD: 5.99,
        priceEUR: 5.49,
        features: ['500 Premium Currency', 'Starter Weapon Skin', '3 Day XP Boost', 'Exclusive Badge'],
        isPopular: false,
        sortOrder: 1,
      },
      {
        name: 'Premium Pack',
        description: 'Most popular choice! Great value with premium items and substantial currency boost.',
        priceRUB: 1499,
        priceUSD: 17.99,
        priceEUR: 16.49,
        features: ['2000 Premium Currency', '3 Exclusive Skins', '7 Day XP Boost', '5 Loot Boxes', 'VIP Status (7 days)'],
        isPopular: true,
        sortOrder: 2,
      },
      {
        name: 'Ultimate Pack',
        description: 'The ultimate package for serious players. Maximum value and exclusive rewards.',
        priceRUB: 2999,
        priceUSD: 35.99,
        priceEUR: 32.99,
        features: ['5000 Premium Currency', '10 Exclusive Skins', '30 Day XP Boost', '20 Loot Boxes', 'VIP Status (30 days)', 'Exclusive Mount/Vehicle'],
        isPopular: false,
        sortOrder: 3,
      },
    ]

    for (const packageData of donatePackages) {
      await prisma.donatePackage.create({
        data: {
          ...packageData,
          gameId: game.id,
        },
      })
    }

    console.log(`  ✅ Created ${donatePackages.length} donate packages for ${game.name}`)
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
