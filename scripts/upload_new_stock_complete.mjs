import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { RAW_NEW_DATA } from './raw_catalog_text.js';

// Load .env
const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach(l => {
  const line = l.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const idx = line.indexOf('=');
    const key = line.substring(0, idx).trim();
    const val = line.substring(idx + 1).trim();
    env[key] = val;
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Normalized category mapping
function normalizeCategory(cat) {
  const c = (cat || '').trim().toUpperCase();
  if (c.includes('SATTAI')) return 'SATTAI';
  if (c.includes('SPARKLER')) return 'SPARKLERS';
  if (c.includes('GROUND CHAKKRA') || c.includes('FANCY CHAKKRA')) return 'CHAKKRA & SPINNERS';
  if (c.includes('GUJARAT') || c.includes('RIM GIM')) return 'GUJARAT POTS';
  if (c.includes('FLOWER POT')) return 'FLOWER POTS';
  if (c.includes('MEGA BOMB') || c.includes('BOMB') && !c.includes('PAPER')) return 'BOMBS';
  if (c.includes('PAPER BOMB')) return 'PAPER BOMBS';
  if (c.includes('KIDS')) return 'KIDS';
  if (c.includes('ROCKET')) return 'ROCKETS';
  if (c.includes('SKY SHOT') || c.includes('MEGA PIPE') || c.includes('PIPE')) return 'FANCY PIPES';
  if (c.includes('DAY FANCY')) return 'DAY FANCY';
  if (c.includes('NIGHT  SHOT') || c.includes('NIGHT SHOT') || c.includes('FAN CAKE')) return 'NIGHT SHOTS';
  if (c.includes('NIGHT FANCY')) return 'NIGHT FANCY';
  if (c.includes('MEGA WALA') || c.includes('WALA')) return 'WALA';
  if (c.includes('GIFT BOX')) return 'GIFT BOXES';
  return c;
}

const IMG_SPARK = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80';
const IMG_SPARK2 = 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&auto=format&fit=crop&q=80';
const IMG_FLOWER = 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80';
const IMG_FLOWER2 = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80';
const IMG_CHAKKAR = 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&auto=format&fit=crop&q=80';
const IMG_CHAKKAR2 = 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80';
const IMG_ROCKET = 'https://images.unsplash.com/photo-1569429593410-b498b3fb3387?w=600&auto=format&fit=crop&q=80';
const IMG_BOMB = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80';
const IMG_FANCY = 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80';
const IMG_KIDS = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80';

function getImageForCategory(cat, idx) {
  switch (cat) {
    case 'SPARKLERS':
    case 'SATTAI':
      return idx % 2 === 0 ? IMG_SPARK : IMG_SPARK2;
    case 'CHAKKRA & SPINNERS':
      return idx % 2 === 0 ? IMG_CHAKKAR : IMG_CHAKKAR2;
    case 'FLOWER POTS':
    case 'GUJARAT POTS':
      return idx % 2 === 0 ? IMG_FLOWER : IMG_FLOWER2;
    case 'ROCKETS':
      return IMG_ROCKET;
    case 'BOMBS':
    case 'PAPER BOMBS':
      return IMG_BOMB;
    case 'KIDS':
      return IMG_KIDS;
    default:
      return idx % 2 === 0 ? IMG_FANCY : IMG_FLOWER;
  }
}

function parseCatalog() {
  const lines = RAW_NEW_DATA.trim().split('\n');
  const items = [];
  const now = new Date().toISOString();

  // skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 3) continue;

    const rawCategory = parts[0];
    const name = parts[1];
    const code = parts[2];
    const priceStr = parts[3];

    if (!name) continue;

    let price = parseFloat(priceStr);
    if (isNaN(price)) {
      if (name.toLowerCase().includes('titanic missile')) price = 180;
      else if (name.includes('4×4 Wheel')) price = 280;
      else price = 100;
    }

    const normCat = normalizeCategory(rawCategory);
    const itemCode = `KC${String(code).padStart(3, '0')}`;
    const id = `kc-item-${String(code).padStart(3, '0')}`;
    const originalPrice = Math.round(price * 4); // Standard actual / MRP price

    items.push({
      id,
      name,
      itemCode,
      piecesContent: '1 Box',
      price,
      originalPrice,
      quantity: 200,
      isAvailable: true,
      category: normCat,
      imageUrl: getImageForCategory(normCat, items.length),
      createdAt: now,
      updatedAt: now
    });
  }

  return items;
}

async function run() {
  console.log('1. Parsing new user catalog data...');
  const newProducts = parseCatalog();
  console.log(`Parsed ${newProducts.length} items from input table.`);

  // Write to src/lib/seedData.ts
  console.log('2. Updating src/lib/seedData.ts...');
  const seedCrackers = newProducts.map(c => ({
    id: c.id,
    name: c.name,
    itemCode: c.itemCode,
    piecesContent: c.piecesContent,
    price: c.price,
    originalPrice: c.originalPrice,
    quantity: c.quantity,
    isAvailable: c.isAvailable,
    category: c.category,
    imageUrl: c.imageUrl
  }));
  const seedContent = `import { Cracker } from '@/types';\n\nexport const INITIAL_CRACKERS: Omit<Cracker, 'createdAt' | 'updatedAt'>[] = ${JSON.stringify(seedCrackers, null, 2)};\n`;
  fs.writeFileSync(path.join(process.cwd(), 'src/lib/seedData.ts'), seedContent, 'utf8');
  console.log('src/lib/seedData.ts updated successfully.');

  // Update Firestore: Delete old stock
  console.log('3. Deleting old stock from Firestore collection "crackers"...');
  const snap = await getDocs(collection(db, 'crackers'));
  console.log(`Found ${snap.docs.length} existing documents in Firestore.`);

  let delCount = 0;
  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, 'crackers', docSnap.id));
    delCount++;
    if (delCount % 40 === 0 || delCount === snap.docs.length) {
      console.log(`Deleted ${delCount}/${snap.docs.length} old documents...`);
    }
  }

  // Upload new products
  console.log('4. Uploading new products to Firestore...');
  let upCount = 0;
  for (const item of newProducts) {
    await setDoc(doc(db, 'crackers', item.id), item);
    upCount++;
    if (upCount % 40 === 0 || upCount === newProducts.length) {
      console.log(`Uploaded ${upCount}/${newProducts.length} products...`);
    }
  }

  console.log(`\nSUCCESS: Uploaded all ${upCount} new products to Firestore and deleted old stock.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error syncing catalog:', err);
  process.exit(1);
});
