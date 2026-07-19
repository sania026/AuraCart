import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/product.model.js';
import Category from './models/category.model.js';
import User from './models/user.model.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const categoriesToSeed = [
  { name: 'Electronics', description: 'Smart Televisions, Drone Systems, and general home electronics.' },
  { name: 'Smartphones', description: 'Next-generation cellular smartphones and mobile devices.' },
  { name: 'Laptops', description: 'High-performance laptops, workstations, and ultrabooks.' },
  { name: 'Smart Watches', description: 'Wearable smart watches, health trackers, and fitness bands.' },
  { name: 'Headphones', description: 'Over-ear headphones, noise-cancelling devices, and true wireless earbuds.' },
  { name: 'Cameras', description: 'Professional mirrorless cameras, action cams, and digital photography accessories.' },
  { name: 'Gaming', description: 'Next-gen video game consoles, handheld devices, and gaming accessories.' },
  { name: 'Accessories', description: 'Input peripherals, power utilities, storage drives, and cables.' },
  { name: 'Home Appliances', description: 'Smart vacuum cleaners, instant cookers, and kitchen utility devices.' }
];

const productsToSeed = [
  // 1. Electronics
  {
    name: 'Samsung Smart TV 55"',
    brand: 'Samsung',
    price: 54999.00,
    stock: 15,
    sku: 'SAM-TV-4K-55',
    ratings: 4.4,
    numReviews: 32,
    description: '55-inch 4K Crystal UHD Smart TV featuring vibrant color mapping, high dynamic range (HDR), and built-in smart streaming apps.',
    images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Electronics',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'LG OLED C4 65"',
    brand: 'LG',
    price: 149999.00,
    stock: 5,
    sku: 'LG-OLED-65C4',
    ratings: 4.8,
    numReviews: 45,
    description: '65-inch C4 Series 4K OLED Smart TV with self-lit pixels, infinite contrast, a9 AI Processor Gen 7, and Dolby Vision.',
    images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Electronics',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Sony HT-S2000 Soundbar',
    brand: 'Sony',
    price: 34990.00,
    stock: 20,
    sku: 'SON-HTS2000-SND',
    ratings: 4.2,
    numReviews: 18,
    description: 'Compact 3.1ch Dolby Atmos / DTS:X Soundbar delivering powerful cinematic surround sound with an integrated dual subwoofer.',
    images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Electronics',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Apple TV 4K',
    brand: 'Apple',
    price: 14900.00,
    stock: 35,
    sku: 'APP-TV4K-128',
    ratings: 4.7,
    numReviews: 88,
    description: 'Smart streaming media player featuring HDR10+ and Dolby Vision support, integration with the Apple ecosystem, and the A15 Bionic chip.',
    images: ['https://images.unsplash.com/photo-1585647347384-2593bc35786b?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Electronics',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'DJI Mini 4 Pro',
    brand: 'DJI',
    price: 79990.00,
    stock: 12,
    sku: 'DJI-M4P-DRONE',
    ratings: 4.9,
    numReviews: 62,
    description: 'Ultra-lightweight folding mini drone weighing under 249g. Features 4K/60fps HDR True Vertical Shooting, Omnidirectional Obstacle Sensing, and up to 34 minutes of flight time.',
    images: ['https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Electronics',
    isFeatured: true,
    isActive: true
  },

  // 2. Smartphones
  {
    name: 'iPhone 16',
    brand: 'Apple',
    price: 79999.00,
    stock: 25,
    sku: 'APP-IPH16-128',
    ratings: 4.8,
    numReviews: 142,
    description: 'The ultimate iPhone featuring a durable design, the new A18 chip, Camera Control, and a huge leap in battery life.',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smartphones',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Samsung Galaxy S25 Ultra',
    brand: 'Samsung',
    price: 124999.00,
    stock: 18,
    sku: 'SAM-GAL25ULT-256',
    ratings: 4.7,
    numReviews: 98,
    description: 'Next-gen Android flagship with Galaxy AI capabilities, 200MP camera, Snapdragon 8 Elite, and a dynamic 6.8-inch AMOLED display.',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smartphones',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'OnePlus 13',
    brand: 'OnePlus',
    price: 69999.00,
    stock: 30,
    sku: 'OP-13-256',
    ratings: 4.5,
    numReviews: 75,
    description: 'Performance powerhouse with Hasselblad Camera for Mobile, 100W SuperVOOC fast charging, and Snapdragon 8 Elite.',
    images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smartphones',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Google Pixel 10 Pro',
    brand: 'Google',
    price: 79999.00,
    stock: 15,
    sku: 'GOO-PIX10PRO-128',
    ratings: 4.6,
    numReviews: 54,
    description: 'Unlocked Android smartphone with Gemini Nano AI integrated, advanced custom Tensor G5 processor, and professional-grade triple camera system.',
    images: ['https://images.unsplash.com/photo-1610945415295-d9b2101859ec?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smartphones',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Xiaomi 15 Pro',
    brand: 'Xiaomi',
    price: 59999.00,
    stock: 22,
    sku: 'XIA-15PRO-256',
    ratings: 4.3,
    numReviews: 36,
    description: 'Flagship smartphone with Leica optics, Snapdragon processor, 120Hz AMOLED display, and ultra-fast wired and wireless charging.',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smartphones',
    isFeatured: false,
    isActive: true
  },

  // 3. Laptops
  {
    name: 'MacBook Pro M4',
    brand: 'Apple',
    price: 169900.00,
    stock: 10,
    sku: 'APP-MBP-M4-512',
    ratings: 4.9,
    numReviews: 112,
    description: 'High-end developer laptop with the lightning-fast Apple M4 Pro chip, Liquid Retina XDR screen, and up to 22 hours of battery life.',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Laptops',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Dell XPS 15',
    brand: 'Dell',
    price: 149900.00,
    stock: 8,
    sku: 'DEL-XPS15-BLK',
    ratings: 4.6,
    numReviews: 45,
    description: 'Premium productivity laptop featuring a stunning InfinityEdge display, robust chassis, and Intel Core i7 processor.',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Laptops',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'HP Spectre x360',
    brand: 'HP',
    price: 129900.00,
    stock: 12,
    sku: 'HP-SPEC-360-14',
    ratings: 4.7,
    numReviews: 61,
    description: 'Elegant convertible 2-in-1 touchscreen laptop with long battery life, premium sound, and brilliant display metrics.',
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Laptops',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon',
    brand: 'Lenovo',
    price: 159900.00,
    stock: 6,
    sku: 'LEN-TPX1-CARB',
    ratings: 4.8,
    numReviews: 39,
    description: 'The gold standard in business computing. Ultralight carbon-fiber build, legendary spill-resistant keyboard, and top-tier security tools.',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Laptops',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'ASUS ROG Zephyrus G14',
    brand: 'ASUS',
    price: 139900.00,
    stock: 14,
    sku: 'ASU-ROG-G14-SLV',
    ratings: 4.8,
    numReviews: 83,
    description: 'Ultra-portable gaming laptop featuring an AMD Ryzen 9 processor, NVIDIA GeForce RTX 4070 graphics, and custom AniMe Matrix lid display.',
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Laptops',
    isFeatured: true,
    isActive: true
  },

  // 4. Smart Watches
  {
    name: 'Apple Watch Series 10',
    brand: 'Apple',
    price: 39999.00,
    stock: 20,
    sku: 'APP-WCH10-SLV',
    ratings: 4.7,
    numReviews: 120,
    description: 'Advanced wearable device featuring always-on Retina display, ECG monitor, blood oxygen tracker, and custom watchOS features.',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smart Watches',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Samsung Galaxy Watch 7',
    brand: 'Samsung',
    price: 29999.00,
    stock: 15,
    sku: 'SAM-WCH7-BLK',
    ratings: 4.4,
    numReviews: 54,
    description: 'Sleek WearOS smartwatch offering comprehensive body composition analysis, sleep quality reports, and workout routing.',
    images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smart Watches',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Garmin Fenix 8',
    brand: 'Garmin',
    price: 74999.00,
    stock: 8,
    sku: 'GAR-FEN8-TIT',
    ratings: 4.9,
    numReviews: 29,
    description: 'Ultimate multisport GPS watch with sapphire solar charging screen, advanced training stats, map routing, and 28-day battery life.',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smart Watches',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Fitbit Charge 6',
    brand: 'Fitbit',
    price: 14999.00,
    stock: 40,
    sku: 'FIT-CHG6-BLK',
    ratings: 4.1,
    numReviews: 42,
    description: 'Premium fitness tracker with built-in GPS, heart rate monitor, stress mapping, and standard notification sync.',
    images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smart Watches',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Pixel Watch 3',
    brand: 'Google',
    price: 34999.00,
    stock: 12,
    sku: 'GOO-PIXWCH3-SLV',
    ratings: 4.5,
    numReviews: 33,
    description: 'Elegant smartwatch combining the best of Google utility and Fitbit health tracking, featuring custom AI assistant access.',
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Smart Watches',
    isFeatured: true,
    isActive: true
  },

  // 5. Headphones
  {
    name: 'Sony WH-1000XM6',
    brand: 'Sony',
    price: 29990.00,
    stock: 22,
    sku: 'SON-WH1000XM6-BLK',
    ratings: 4.8,
    numReviews: 184,
    description: 'Industry-leading noise cancelling wireless headphones with premium sound quality, multi-device sync, and up to 35 hours of battery life.',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Headphones',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Bose QuietComfort Ultra',
    brand: 'Bose',
    price: 39900.00,
    stock: 10,
    sku: 'BOS-QCU-SLV',
    ratings: 4.7,
    numReviews: 92,
    description: 'Over-ear spatial audio headphones with immersive sound staging, world-class active noise cancellation, and premium fit.',
    images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Headphones',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sennheiser Momentum 4',
    brand: 'Sennheiser',
    price: 29900.00,
    stock: 18,
    sku: 'SEN-MOM4-BLK',
    ratings: 4.6,
    numReviews: 53,
    description: 'Audiophile-grade acoustic profile featuring custom digital noise cancellation and a class-leading 60-hour battery life.',
    images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Headphones',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Apple AirPods Pro 2',
    brand: 'Apple',
    price: 24900.00,
    stock: 30,
    sku: 'APP-APP2-WHT',
    ratings: 4.8,
    numReviews: 210,
    description: 'True wireless earbuds featuring 2x active noise cancellation, adaptive transparency, custom audio tuning, and MagSafe case.',
    images: ['https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Headphones',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'JBL Tune 770NC',
    brand: 'JBL',
    price: 8990.00,
    stock: 50,
    sku: 'JBL-T770NC-BLU',
    ratings: 4.2,
    numReviews: 67,
    description: 'Affordable wireless over-ear headphones with adaptive noise cancelling, pure bass sound signature, and lightweight folding design.',
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Headphones',
    isFeatured: false,
    isActive: true
  },

  // 6. Cameras
  {
    name: 'Canon EOS R50',
    brand: 'Canon',
    price: 67900.00,
    stock: 5,
    sku: 'CAN-EOSR50-KIT',
    ratings: 4.4,
    numReviews: 25,
    description: 'Compact mirrorless camera featuring a 24.2 Megapixel CMOS sensor, 15 fps mechanical shutter, and 4K video recording capability.',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Cameras',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Sony Alpha a7 IV',
    brand: 'Sony',
    price: 229900.00,
    stock: 4,
    sku: 'SON-A7M4-BODY',
    ratings: 4.9,
    numReviews: 94,
    description: 'Full-frame mirrorless camera featuring a 33MP Exmor R sensor, BIONZ XR engine, advanced real-time autofocus, and 4K 60p video capabilities.',
    images: ['https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Cameras',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Fujifilm X-T50',
    brand: 'Fujifilm',
    price: 129900.00,
    stock: 7,
    sku: 'FUJ-XT50-BLK',
    ratings: 4.7,
    numReviews: 31,
    description: 'Retro-inspired compact mirrorless camera housing a 40.2MP X-Trans CMOS 5 HR sensor, 5-axis IBIS, and dedicated film simulation dial.',
    images: ['https://images.unsplash.com/photo-1502920917128-1da500764c6e?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Cameras',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'GoPro HERO13 Black',
    brand: 'GoPro',
    price: 39900.00,
    stock: 25,
    sku: 'GOP-HERO13-BLK',
    ratings: 4.5,
    numReviews: 68,
    description: 'Rugged action camera featuring class-leading HyperSmooth 6.0 stabilization, 5.3K video, HDR photo/video, and dual LCD touchscreens.',
    images: ['https://images.unsplash.com/photo-1565462214646-fa3d9b04fc9a?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Cameras',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Nikon Z50',
    brand: 'Nikon',
    price: 79990.00,
    stock: 6,
    sku: 'NIK-Z50-SLV',
    ratings: 4.6,
    numReviews: 19,
    description: 'Classic DX-format compact mirrorless camera featuring high speed and resolution, paired with robust body framing and retro controls.',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Cameras',
    isFeatured: true,
    isActive: true
  },

  // 7. Gaming
  {
    name: 'PlayStation 5',
    brand: 'Sony',
    price: 54990.00,
    stock: 12,
    sku: 'SON-PS5-SLM',
    ratings: 4.8,
    numReviews: 145,
    description: 'Next-gen gaming console features near-instant loading, ray tracing, haptic feedback, adaptive triggers, and a library of games.',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Gaming',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Xbox Series X',
    brand: 'Microsoft',
    price: 49990.00,
    stock: 8,
    sku: 'MSF-XBSX-1TB',
    ratings: 4.7,
    numReviews: 88,
    description: 'The fastest, most powerful Xbox ever, designed for a console generation that puts you, the player, at its center.',
    images: ['https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Gaming',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Nintendo Switch OLED',
    brand: 'Nintendo',
    price: 34990.00,
    stock: 15,
    sku: 'NIN-SWT-OLED',
    ratings: 4.6,
    numReviews: 112,
    description: 'Features a vibrant 7-inch OLED screen, a wide adjustable stand, a dock with a wired LAN port, 64 GB of internal storage, and enhanced audio.',
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Gaming',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Steam Deck OLED',
    brand: 'Valve',
    price: 54990.00,
    stock: 6,
    sku: 'VAL-STDECK-512',
    ratings: 4.8,
    numReviews: 43,
    description: 'Powerful handheld PC gaming device featuring a custom HDR OLED display, improved battery life, and fast Wi-Fi 6E connectivity.',
    images: ['https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Gaming',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'ASUS ROG Ally X',
    brand: 'ASUS',
    price: 79990.00,
    stock: 10,
    sku: 'ASU-ALLYX-1TB',
    ratings: 4.5,
    numReviews: 24,
    description: 'High-performance handheld gaming console powered by Windows 11, Ryzen Z1 Extreme processor, 24GB of RAM, and a huge 80Wh battery.',
    images: ['https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Gaming',
    isFeatured: true,
    isActive: true
  },

  // 8. Accessories
  {
    name: 'Logitech Mouse',
    brand: 'Logitech',
    price: 8999.00,
    stock: 30,
    sku: 'LOG-MXM3S-WRL',
    ratings: 4.8,
    numReviews: 125,
    description: 'Ergonomic wireless mouse with 8K DPI tracking, ultra-quiet clicks, and MagSpeed electromagnetic scrolling system.',
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Accessories',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Apple Magic Keyboard',
    brand: 'Apple',
    price: 9900.00,
    stock: 25,
    sku: 'APP-MAGKB-WHT',
    ratings: 4.3,
    numReviews: 36,
    description: 'Remarkably comfortable and precise keyboard featuring a rechargeable internal battery and automatic Mac pairing.',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Accessories',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Anker Prime Power Bank',
    brand: 'Anker',
    price: 12900.00,
    stock: 45,
    sku: 'ANK-PRM-20K',
    ratings: 4.6,
    numReviews: 49,
    description: '20,000mAh portable battery pack with 200W total output, smart digital display screen, and rapid charging inputs.',
    images: ['https://images.unsplash.com/photo-1609592424085-f55a1d74659b?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Accessories',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'SanDisk 1TB Portable SSD',
    brand: 'SanDisk',
    price: 11900.00,
    stock: 35,
    sku: 'SND-EXT-1TB',
    ratings: 4.7,
    numReviews: 83,
    description: 'Rugged external solid-state drive featuring 1050MB/s read and 1000MB/s write speeds, with 2-meter drop protection.',
    images: ['https://images.unsplash.com/photo-1601524909162-be87252be298?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Accessories',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Keychron K2 Keyboard',
    brand: 'Keychron',
    price: 7900.00,
    stock: 18,
    sku: 'KEY-K2-MECH',
    ratings: 4.5,
    numReviews: 54,
    description: 'Compact 75% layout wireless mechanical keyboard featuring tactile Gateron switches, RGB backlighting, and dual Mac/Windows setups.',
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Accessories',
    isFeatured: true,
    isActive: true
  },

  // 9. Home Appliances
  {
    name: 'Dyson V15 Vacuum',
    brand: 'Dyson',
    price: 69900.00,
    stock: 10,
    sku: 'DYS-V15-CORD',
    ratings: 4.8,
    numReviews: 67,
    description: 'High-performance cordless stick vacuum cleaner with laser illumination reveal, count sensors, and dynamic power profiling.',
    images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Home Appliances',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Air Fryer',
    brand: 'Philips',
    price: 9999.00,
    stock: 22,
    sku: 'PHI-AIR-XXL',
    ratings: 4.6,
    numReviews: 92,
    description: 'Twin TurboStar technology airfryer lets you fry with up to 90% less fat. Generous family-sized capacity handles whole chickens or batches of fries.',
    images: ['https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Home Appliances',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'iRobot Roomba j7',
    brand: 'iRobot',
    price: 59900.00,
    stock: 8,
    sku: 'IRB-RMB-J7',
    ratings: 4.4,
    numReviews: 38,
    description: 'Smart robotic vacuum identifying pet waste and cables, mapping layouts dynamically, with automatic dirt bin emptying.',
    images: ['https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Home Appliances',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Keurig K-Elite Maker',
    brand: 'Keurig',
    price: 16900.00,
    stock: 15,
    sku: 'KEU-KELT-COF',
    ratings: 4.2,
    numReviews: 29,
    description: 'Single-serve coffee brewer featuring temperature control adjustment, strong brew selection, and a large 75oz water reservoir.',
    images: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Home Appliances',
    isFeatured: false,
    isActive: true
  },
  {
    name: 'Instant Pot',
    brand: 'Instant Pot',
    price: 12999.00,
    stock: 28,
    sku: 'INS-POT-DUO',
    ratings: 4.7,
    numReviews: 104,
    description: 'Multi-use programmable smart cooker combining electric pressure cooking, slow cook, rice cooker, steamer, and yogurt settings.',
    images: ['https://images.unsplash.com/photo-1544224013-034be764020d?w=600&auto=format&fit=crop&q=60'],
    categoryName: 'Home Appliances',
    isFeatured: false,
    isActive: true
  }
];

const importData = async () => {
  try {
    // 1. Clear database first
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('Cleared existing products and categories from database.');

    // 2. Create categories first
    const createdCategories = await Category.insertMany(categoriesToSeed);
    console.log(`Seeded ${createdCategories.length} categories successfully.`);

    // Create a name-to-ID lookup map
    const categoryMap = {};
    createdCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Map categories names to IDs on the products list
    const seedProducts = productsToSeed.map((p) => {
      const { categoryName, ...rest } = p;
      const catId = categoryMap[categoryName];
      if (!catId) {
        throw new Error(`Seeding error: Category name "${categoryName}" on product "${p.name}" does not match any seeded categories.`);
      }
      return {
        ...rest,
        category: catId
      };
    });

    // 4. Insert seeded products
    await Product.insertMany(seedProducts);
    console.log(`Seeded ${seedProducts.length} products successfully!`);

    // 5. Seed default admin user
    const adminEmail = 'admin@auracart.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: 'Admin@123',
        role: 'admin',
        isVerified: true
      });
      console.log('Seeded default admin user successfully.');
    } else {
      adminExists.name = 'System Administrator';
      adminExists.password = 'Admin@123';
      adminExists.role = 'admin';
      adminExists.isVerified = true;
      await adminExists.save();
      console.log('Default admin user reset and updated successfully.');
    }

    // Disconnect and exit
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error with data seeding: ${error.message}`);
    process.exit(1);
  }
};

// Wait for mongoose connection before importing data
mongoose.connection.once('open', () => {
  importData();
});
