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

// Clean category mapping preserving all distinct categories from user's sheet
function normalizeCategory(cat) {
  let c = (cat || '').trim();
  // collapse double spaces like "Night  Shots" -> "Night Shots"
  c = c.replace(/\s+/g, ' ');
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
  const upper = (cat || '').toUpperCase();
  if (upper.includes('SPARKLER') || upper.includes('SATTAI')) {
    return idx % 2 === 0 ? IMG_SPARK : IMG_SPARK2;
  }
  if (upper.includes('CHAKKRA') || upper.includes('SPINNER')) {
    return idx % 2 === 0 ? IMG_CHAKKAR : IMG_CHAKKAR2;
  }
  if (upper.includes('FLOWER') || upper.includes('GUJARAT')) {
    return idx % 2 === 0 ? IMG_FLOWER : IMG_FLOWER2;
  }
  if (upper.includes('ROCKET')) {
    return IMG_ROCKET;
  }
  if (upper.includes('BOMB') || upper.includes('WALA')) {
    return IMG_BOMB;
  }
  if (upper.includes('KIDS')) {
    return IMG_KIDS;
  }
  return idx % 2 === 0 ? IMG_FANCY : IMG_FLOWER;
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

  // 5. Update categoryTranslations in settings document
  console.log('5. Updating categoryTranslations in Firestore settings...');
  const categoryTranslations = {
    'Sattai': 'சாட்டை',
    'Sparklers': 'கம்பி மத்தாப்பு',
    'Ground Chakkra': 'தரை சக்கரம்',
    'Fancy Chakkras': 'ஃபேன்சி சக்கரம்',
    'Flower pots': 'பூந்தொட்டி / அனார்',
    'Fancy Flower pots': 'ஃபேன்சி பூந்தொட்டி',
    'Gujarat F/P': 'குஜராத் பாட்ஸ்',
    'Fancy Gujarat F/P': 'ஃபேன்சி குஜராத் பாட்ஸ்',
    'Bombs': 'வெடி & அணுகுண்டு',
    'Mega Bombs': 'மெகா பாம்ப்',
    'Paper Bombs': 'பேப்பர் பாம்ப்',
    'Kids': 'சிறுவர் பட்டாசு',
    'Kids Special': 'கிட்ஸ் ஸ்பெஷல்',
    'Rockets': 'ராக்கெட் ரகங்கள்',
    'Sky shots': 'ஸ்கை ஷாட்ஸ்',
    'Mega Pipes': 'மெகா பைப்',
    'Day Fancy': 'பகல் ஃபேன்சி',
    'Night Shots': 'நைட் ஷாட்ஸ்',
    'Fan cake & set outs': 'ஃபேன் கேக் & செட் அவுட்',
    'Night Fancy': 'இரவு ஃபேன்சி ரகங்கள்',
    'Wala': 'சரவெடி / வாலா',
    'Mega Wala': 'மெகா வாலா சரவெடி',
    'Gift Boxes': 'கிஃப்ட் பாக்ஸ் ரகங்கள்'
  };

  try {
    await setDoc(doc(db, 'settings', 'store'), {
      categoryTranslations
    }, { merge: true });
    console.log('Successfully updated categoryTranslations in settings/store.');
  } catch (err) {
    console.error('Warning: could not update settings/store:', err);
  }

  console.log(`\nSUCCESS: Uploaded all ${upCount} new products with correct categories to Firestore.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error syncing catalog:', err);
  process.exit(1);
});
