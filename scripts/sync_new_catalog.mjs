import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// 1. Read .env file directly so credentials are always loaded
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
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

console.log('Connecting to Firebase project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Category images
const IMG_SPARK = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80";
const IMG_SPARK2 = "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&auto=format&fit=crop&q=80";
const IMG_FLOWER = "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80";
const IMG_FLOWER2 = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80";
const IMG_CHAKKAR = "https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=600&auto=format&fit=crop&q=80";
const IMG_CHAKKAR2 = "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80";
const IMG_ROCKET = "https://images.unsplash.com/photo-1569429593410-b498b3fb3387?w=600&auto=format&fit=crop&q=80";
const IMG_ROCKET2 = "https://images.unsplash.com/photo-1519750783826-e2420f4d687f?w=600&auto=format&fit=crop&q=80";
const IMG_BOMB = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80";
const IMG_BOMB2 = "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=600&auto=format&fit=crop&q=80";
const IMG_NIGHT = "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?w=600&auto=format&fit=crop&q=80";
const IMG_FANCY = "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80";
const IMG_KIDS = "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80";

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
    case 'BOMBS':
    case 'PAPER BOMBS':
    case 'WALA':
      return idx % 2 === 0 ? IMG_BOMB : IMG_BOMB2;
    case 'ROCKETS':
      return idx % 2 === 0 ? IMG_ROCKET : IMG_ROCKET2;
    case 'KIDS':
      return IMG_KIDS;
    case 'FANCY PIPES':
    case 'NIGHT SHOTS':
      return IMG_NIGHT;
    case 'DAY FANCY':
    case 'NIGHT FANCY':
    default:
      return idx % 2 === 0 ? IMG_FANCY : IMG_FLOWER;
  }
}

// Load parsed catalog
const parsedRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'parsed_new_stock.json'), 'utf8'));

// Generate complete items
const now = new Date().toISOString();
let codeCounter = 1;
const crackers = parsedRaw.map((item, index) => {
  const codeNum = String(codeCounter++).padStart(3, '0');
  const catCode = item.cat.replace(/[^A-Za-z]/g, '').substring(0, 3).toLowerCase() || 'crk';
  const padIndex = String(index + 1).padStart(3, '0');
  const id = `kc-${catCode}-${padIndex}`;
  const sellingPrice = Number(item.price);
  const actualPrice = Math.round(sellingPrice * 4); // actualPrice = sellingPrice * 4

  return {
    id,
    name: item.name,
    itemCode: `KC${codeNum}`,
    piecesContent: item.pieces || '1 Box',
    price: sellingPrice,
    originalPrice: actualPrice,
    quantity: 200,
    isAvailable: true,
    category: item.cat,
    imageUrl: getImageForCategory(item.cat, index),
    createdAt: now,
    updatedAt: now
  };
});

console.log(`Prepared ${crackers.length} products to upload.`);

async function main() {
  // 1. Update data-store.json
  console.log('1. Updating data-store.json...');
  const dataStorePath = path.join(process.cwd(), 'data-store.json');
  let currentStore = { crackers: [], orders: [], settings: { showPricing: true, discountPercentage: 20 } };
  if (fs.existsSync(dataStorePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
      currentStore = { ...existing, crackers };
    } catch (e) {
      currentStore.crackers = crackers;
    }
  } else {
    currentStore.crackers = crackers;
  }
  fs.writeFileSync(dataStorePath, JSON.stringify(currentStore, null, 2), 'utf8');
  console.log(`Successfully saved ${crackers.length} crackers to data-store.json`);

  // 2. Update seedData.ts
  console.log('2. Updating src/lib/seedData.ts...');
  const seedCrackers = crackers.map(c => ({
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
  console.log('Successfully updated src/lib/seedData.ts');

  // 3. Update Firestore
  console.log('3. Fetching existing Firestore docs to remove old stock...');
  const oldDocsSnapshot = await getDocs(collection(db, 'crackers'));
  console.log(`Found ${oldDocsSnapshot.docs.length} existing documents in Firestore.`);

  let deletedCount = 0;
  for (const docSnap of oldDocsSnapshot.docs) {
    await deleteDoc(doc(db, 'crackers', docSnap.id));
    deletedCount++;
    if (deletedCount % 25 === 0) {
      console.log(`Deleted ${deletedCount}/${oldDocsSnapshot.docs.length} old documents...`);
    }
  }
  console.log(`Finished deleting all old stock documents.`);

  console.log('4. Uploading new products to Firestore...');
  let uploadedCount = 0;
  for (const cracker of crackers) {
    await setDoc(doc(db, 'crackers', cracker.id), cracker);
    uploadedCount++;
    if (uploadedCount % 25 === 0 || uploadedCount === crackers.length) {
      console.log(`Uploaded ${uploadedCount}/${crackers.length} products...`);
    }
  }

  console.log(`ALL DONE! Successfully synced ${uploadedCount} items to Firestore.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
