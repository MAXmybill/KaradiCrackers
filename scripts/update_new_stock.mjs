import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc
} from 'firebase/firestore';

// Read .env manually
try {
  const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn('Could not read .env, relying on process.env');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Image assets mapping by category
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
    case 'WALA HC':
    case 'WALA FC':
      return idx % 2 === 0 ? IMG_BOMB : IMG_BOMB2;
    case 'ROCKETS':
      return idx % 2 === 0 ? IMG_ROCKET : IMG_ROCKET2;
    case 'KIDS':
    case 'MATCH BOXES':
      return IMG_KIDS;
    case 'FANCY PIPES':
    case 'NIGHT SHOTS':
      return IMG_NIGHT;
    case 'DAY FANCY':
    case 'NIGHT FANCY':
    case 'GIFT BOXES':
    default:
      return idx % 2 === 0 ? IMG_FANCY : IMG_FLOWER;
  }
}

// Complete Catalog Data parsed from the User Request
const catalogData = [
  // 1. Sattai
  { cat: "SATTAI", name: "1.5\" twinkling stars", price: 18, pieces: "1 Box" },
  { cat: "SATTAI", name: "4\" twinkling stars", price: 42, pieces: "1 Box" },
  { cat: "SATTAI", name: "Jil jil stars", price: 190, pieces: "1 Box" },

  // 2. Sparklers
  { cat: "SPARKLERS", name: "7cm Electric", price: 7, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "7cm Crackling", price: 8, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "7cm Green", price: 9, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "7cm Red", price: 10, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "10cm Electric", price: 14, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "10cm Crackling", price: 16, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "10cm Supreme Pink", price: 26, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "10cm Green", price: 17, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "10cm Red", price: 18, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "12cm Electric", price: 20, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "12cm Crackling", price: 22, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "12cm Green", price: 23, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "12cm Red", price: 26, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "15cm Electric", price: 30, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "15cm Crackling", price: 35, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "15cm Green", price: 35, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "15cm Red", price: 40, pieces: "10 Pcs" },
  { cat: "SPARKLERS", name: "30cm Electric", price: 30, pieces: "5 Pcs" },
  { cat: "SPARKLERS", name: "30cm Crackling", price: 35, pieces: "5 Pcs" },
  { cat: "SPARKLERS", name: "30cm Green", price: 30, pieces: "5 Pcs" },
  { cat: "SPARKLERS", name: "30cm Red", price: 30, pieces: "5 Pcs" },
  { cat: "SPARKLERS", name: "50cm Electric", price: 115, pieces: "5 Pcs" },
  { cat: "SPARKLERS", name: "50cm Colour", price: 130, pieces: "5 Pcs" },

  // 3. Match boxes
  { cat: "MATCH BOXES", name: "Super Deluxe 10 in 1", price: 50, pieces: "10 In 1 Box" },

  // 4. Chakkra & Spinners
  { cat: "CHAKKRA & SPINNERS", name: "Chakkra Big(25pcs)", price: 50, pieces: "25 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Ashoka Chakkra", price: 45, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Special Chakkra", price: 55, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Deluxe Chakkra", price: 50, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Deluxe Chakkra (plastic)", price: 95, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Spinner Special", price: 90, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Spinner Deluxe min", price: 70, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Spinner Deluxe max", price: 125, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Vijay Zamin Chakkra", price: 140, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Wire Chakkra", price: 115, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Dancing Chakkra", price: 150, pieces: "5 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Reverse Chakkra", price: 45, pieces: "10 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Whistle Wheel", price: 130, pieces: "5 Pcs" },
  { cat: "CHAKKRA & SPINNERS", name: "Whistle Chakkra", price: 90, pieces: "5 Pcs" },

  // 5. Flower pots
  { cat: "FLOWER POTS", name: "FP. Big", price: 65, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP. Special", price: 85, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP. Ashoka plus", price: 130, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP. Ashoka", price: 100, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP. Giant", price: 50, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Deluxe", price: 50, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP. Col-Koti", price: 150, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "RSR Colour Koti delx", price: 200, pieces: "10 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Elegant", price: 250, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "FP.sizzing fountain", price: 235, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Color Buster", price: 235, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Multi color pots", price: 360, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Lucky", price: 160, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "FP.Gypsy (5pcs)", price: 125, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "Mini Tricolor", price: 146, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "Tricolor", price: 170, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "RSR Tricolor", price: 215, pieces: "5 Pcs" },
  { cat: "FLOWER POTS", name: "sonny Violet pots", price: 500, pieces: "5 Pcs" },

  // 6. Gujarat pots
  { cat: "GUJARAT POTS", name: "Rim gim", price: 80, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Rim gim Delx", price: 165, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Rim gim panchanga", price: 90, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Mini pearl", price: 120, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Colour Change rim gim", price: 420, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "2 in 1 rim gim", price: 315, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Rim Jasmin", price: 290, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Rim Asaraf", price: 290, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Rim Magic Star", price: 290, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Popcorn Rim gim", price: 240, pieces: "1 Box" },
  { cat: "GUJARAT POTS", name: "Gift mega pack", price: 600, pieces: "1 Box" },

  // 7. Bombs
  { cat: "BOMBS", name: "Jallikattu", price: 30, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Jallikattu delx", price: 45, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Lion king", price: 60, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Hulk", price: 30, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "2 3/4\" Kuruvi", price: 8, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "3 1/2\" Kuruvi", price: 18, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "3 1/2\" Lakshmi", price: 10, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "4\" Lakshmi", price: 13, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "4\" Deluxe Lakshmi", price: 27, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "4\"1/2 Bahubali", price: 38, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "Gold Lakshmi", price: 25, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "Gold Deluxe Lakshmi", price: 37, pieces: "1 Pkt (8 Pcs)" },
  { cat: "BOMBS", name: "Hydro bomb", price: 55, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Gorilla bomb", price: 70, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "King bomb", price: 85, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Classic Bomb", price: 110, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Dinosaur bomb", price: 130, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Agni Bomb", price: 145, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Gypsy bomb", price: 160, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Digital Bomb", price: 165, pieces: "1 Box (10 Pcs)" },
  { cat: "BOMBS", name: "King Rider", price: 180, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "Military bomb", price: 200, pieces: "10 Pcs" },
  { cat: "BOMBS", name: "2 Sound", price: 28, pieces: "10 Pcs" },

  // 8. Paper Bombs
  { cat: "PAPER BOMBS", name: "1/4 Kg Paper Bomb", price: 38, pieces: "1 Pc" },
  { cat: "PAPER BOMBS", name: "1/2 Kg Paper Bomb", price: 70, pieces: "1 Pc" },
  { cat: "PAPER BOMBS", name: "1kg Paper Bomb", price: 140, pieces: "1 Pc" },

  // 9. Kids
  { cat: "KIDS", name: "Red bijli", price: 30, pieces: "1 Pkt (100 Pcs)" },
  { cat: "KIDS", name: "Stripped bijli", price: 25, pieces: "1 Pkt (100 Pcs)" },
  { cat: "KIDS", name: "Snake tablet Big", price: 160, pieces: "1 Box" },
  { cat: "KIDS", name: "Thar Car", price: 150, pieces: "1 Pc" },
  { cat: "KIDS", name: "Men In Black Gun", price: 92, pieces: "1 Pc" },
  { cat: "KIDS", name: "Ring Caps", price: 10, pieces: "1 Box (9 Rings)" },
  { cat: "KIDS", name: "Sahara Pistol–320", price: 266, pieces: "1 Pc" },
  { cat: "KIDS", name: "Sahara Pistol–140", price: 116, pieces: "1 Pc" },
  { cat: "KIDS", name: "Sahara - 80", price: 67, pieces: "1 Pc" },
  { cat: "KIDS", name: "Boss Baby", price: 125, pieces: "1 Pc" },
  { cat: "KIDS", name: "Big Giant Gun", price: 400, pieces: "1 Pc" },
  { cat: "KIDS", name: "Elephant toys", price: 180, pieces: "1 Box" },
  { cat: "KIDS", name: "Simba Fountain", price: 215, pieces: "1 Box" },
  { cat: "KIDS", name: "Kunfupanda foun", price: 215, pieces: "1 Box" },
  { cat: "KIDS", name: "Marvel Hammer Ajanta", price: 235, pieces: "1 Box" },
  { cat: "KIDS", name: "Tik tok", price: 130, pieces: "1 Box" },
  { cat: "KIDS", name: "Cylinder", price: 115, pieces: "1 Box" },
  { cat: "KIDS", name: "Pizza", price: 350, pieces: "1 Box" },
  { cat: "KIDS", name: "Vel Toys", price: 140, pieces: "1 Box" },
  { cat: "KIDS", name: "Pubg Gun", price: 170, pieces: "1 Pc" },

  // 10. Rockets
  { cat: "ROCKETS", name: "Whistling Rocket", price: 100, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "Whistling Rocket Delx", price: 150, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "3 Sound Rocket", price: 100, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "2 Sound Rocket", price: 92, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "2 Sound Rocket Delx", price: 120, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "NASA Rocket", price: 65, pieces: "10 Pcs" },
  { cat: "ROCKETS", name: "Lunik Rocket", price: 90, pieces: "10 Pcs" },

  // 11. Fancy Pipes
  { cat: "FANCY PIPES", name: "1½ 3pcs link", price: 150, pieces: "3 Pcs" },
  { cat: "FANCY PIPES", name: "2\" Sky shot", price: 120, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "2½\" Sky shot", price: 125, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "2\" sky shot (2pcs)", price: 230, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "2½ Tesco (2pcs)", price: 300, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "RSR 2 Fancy (3pcs)", price: 225, pieces: "3 Pcs" },
  { cat: "FANCY PIPES", name: "2½ Fancy 3 pcs Starvell", price: 300, pieces: "3 Pcs" },
  { cat: "FANCY PIPES", name: "3\"1/2 Niagara", price: 265, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "4\" Single", price: 250, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "4\" Niagara 2pcs", price: 650, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "4\" (2pcs)", price: 700, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "3\"½ Single", price: 290, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "3\"½ NSV (2pcs)", price: 350, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "3½ double ball (sastha)", price: 400, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "6\" Pipe Sastha", price: 770, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "Wow Star Purple 4\"1/2", price: 415, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "Wow Star Golden 4\"1/2", price: 330, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "wow star starwars 4\"1/2", price: 368, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "wow star colors 4\"1/2", price: 368, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "7 step pipe 4\"", price: 370, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "shammah 7 step 4\"(2pcs)", price: 650, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "Holiday (2pcs)", price: 700, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "Twin towers(2pcs)", price: 780, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "Vertex 4\" (3Pcs)", price: 1000, pieces: "3 Pcs" },
  { cat: "FANCY PIPES", name: "5\"1/2 triple treat (3pcs)", price: 1500, pieces: "3 Pcs" },
  { cat: "FANCY PIPES", name: "Dancing Shooter (Mothers)", price: 200, pieces: "1 Pc" },
  { cat: "FANCY PIPES", name: "6\" RR(2pcs)", price: 800, pieces: "2 Pcs" },
  { cat: "FANCY PIPES", name: "nayagara (2pcs)", price: 430, pieces: "2 Pcs" },

  // 12. Day Fancy
  { cat: "DAY FANCY", name: "15 shot\" colour smoke", price: 250, pieces: "1 Box" },
  { cat: "DAY FANCY", name: "90 Watts", price: 91, pieces: "1 Box" },
  { cat: "DAY FANCY", name: "Smoke", price: 90, pieces: "1 Box" },
  { cat: "DAY FANCY", name: "Smoke XL", price: 135, pieces: "1 Box" },

  // 13. Night Shots
  { cat: "NIGHT SHOTS", name: "Tejas Hand Shot", price: 1000, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "12 Shot \"", price: 145, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "12 Shot \" legends", price: 150, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "20 shot\"", price: 275, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "30 Shot \"", price: 350, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "30 Shot \" Delx", price: 400, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "Pink Shot", price: 750, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "60 Shot\" Maan", price: 700, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "60 Shot\" Delx", price: 770, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "120 Shot \"", price: 1400, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "240 Shot \"", price: 2800, pieces: "1 Pc" },
  { cat: "NIGHT SHOTS", name: "30 setout, 2.5\"", price: 2900, pieces: "1 Box" },
  { cat: "NIGHT SHOTS", name: "25 setout , 3\"", price: 3100, pieces: "1 Box" },
  { cat: "NIGHT SHOTS", name: "Gang Bangers", price: 3000, pieces: "1 Box" },
  { cat: "NIGHT SHOTS", name: "3*10 IPL shot", price: 710, pieces: "1 Box" },
  { cat: "NIGHT SHOTS", name: "10*10 IPL", price: 2350, pieces: "1 Box" },

  // 14. Night Fancy
  { cat: "NIGHT FANCY", name: "Sun, Star, Moon Delx", price: 68, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Mothers Sun, Star, Moon", price: 49, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Red Sun , Moon , star", price: 250, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "KitKat Jeyams", price: 18, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Chit Put", price: 43, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Chit Put (Mothers)", price: 45, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "1000W Mega Fountains", price: 133, pieces: "1 Pc" },
  { cat: "NIGHT FANCY", name: "2000W Mega Fountains", price: 150, pieces: "1 Pc" },
  { cat: "NIGHT FANCY", name: "5000W Mega Fountains", price: 133, pieces: "1 Pc" },
  { cat: "NIGHT FANCY", name: "Teddy 5pcs", price: 200, pieces: "5 Pcs" },
  { cat: "NIGHT FANCY", name: "Jolly bolly Mocktail", price: 450, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "King Star", price: 170, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Mega Crackling Coconut (3 Pcs)", price: 295, pieces: "3 Pcs" },
  { cat: "NIGHT FANCY", name: "4\" Tin single pc", price: 55, pieces: "1 Pc" },
  { cat: "NIGHT FANCY", name: "Tin 2Pcs Pack", price: 135, pieces: "2 Pcs" },
  { cat: "NIGHT FANCY", name: "Tin 3Pcs Pack", price: 260, pieces: "3 Pcs" },
  { cat: "NIGHT FANCY", name: "Lemontree Ayyan", price: 100, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Thirumalas lemon tree", price: 100, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Color Rain", price: 65, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Feather Drops", price: 65, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Golden Drops", price: 65, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Green star", price: 220, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Gold Coin", price: 220, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Little Star", price: 220, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Golden Star", price: 80, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Titanic Drops", price: 250, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Amaze fountain", price: 200, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Red Robo", price: 90, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "oyobla", price: 135, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Min Mini", price: 135, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "RSR Minions", price: 145, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Polo", price: 35, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Ice Fountains", price: 142, pieces: "4 Pcs" },
  { cat: "NIGHT FANCY", name: "Twix", price: 115, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Colour Collection", price: 150, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Penta Force", price: 120, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Lucky penta", price: 110, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Color Deluxe Penta", price: 190, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Planet Wheel starvell (2 Pcs)", price: 175, pieces: "2 Pcs" },
  { cat: "NIGHT FANCY", name: "Monkey star starvell", price: 170, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Welcome Shower (Water Queen)", price: 175, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Waterqueen (ALL)", price: 75, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Butterfly", price: 45, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Lollipop", price: 130, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "chin chan starvell", price: 85, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "i cone", price: 100, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Pink Bada Peacock", price: 368, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Bada Peacock", price: 290, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "RSR Peacock", price: 120, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "wowstar Peacock", price: 150, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Mega Peacock", price: 125, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Motu Patlu", price: 237, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "4×4 Wheel Welcome Shower Delx", price: 160, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Water pencil", price: 115, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Starwell Race Car", price: 400, pieces: "1 Pc" },
  { cat: "NIGHT FANCY", name: "Vadivel Poem", price: 323, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Mad Angles inf", price: 266, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Ayyans Little Dove", price: 55, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "INF Mega Siren", price: 155, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Siren Small", price: 95, pieces: "1 Box" },
  { cat: "NIGHT FANCY", name: "Siren Big (5+5)", price: 105, pieces: "1 Box (10 Pcs)" },

  // 15. Gift Boxes
  { cat: "GIFT BOXES", name: "25 Items (10 pcs pack)", price: 300, pieces: "1 Box" },
  { cat: "GIFT BOXES", name: "35 Items (10 pcs pack)", price: 450, pieces: "1 Box" },
  { cat: "GIFT BOXES", name: "40 Items (10 pcs pack)", price: 550, pieces: "1 Box" },
  { cat: "GIFT BOXES", name: "50 Items (10 pcs pack)", price: 750, pieces: "1 Box" },
  { cat: "GIFT BOXES", name: "51 Items (10 pcs pack)", price: 950, pieces: "1 Box" },
  { cat: "GIFT BOXES", name: "60 Items (10 pcs pack)", price: 950, pieces: "1 Box" },

  // 16. Wala
  { cat: "WALA", name: "28 Giant", price: 18, pieces: "1 Pkt" },
  { cat: "WALA", name: "56 Giant", price: 34, pieces: "1 Pkt" },
  { cat: "WALA", name: "Shower", price: 70, pieces: "1 Box" },
  { cat: "WALA", name: "100 Wala", price: 35, pieces: "1 Box" },
  { cat: "WALA", name: "24 Mega Delx wala", price: 375, pieces: "1 Box" },
  { cat: "WALA", name: "50 Mega Delx wala", price: 140, pieces: "1 Box" },
  { cat: "WALA", name: "100 Delx wala", price: 260, pieces: "1 Box" },

  // 17. Wala HC
  { cat: "WALA HC", name: "1000 HC", price: 120, pieces: "1 Box" },
  { cat: "WALA HC", name: "2000 HC", price: 240, pieces: "1 Box" },
  { cat: "WALA HC", name: "5000 HC", price: 600, pieces: "1 Box" },
  { cat: "WALA HC", name: "10000 HC", price: 1200, pieces: "1 Box" },

  // 18. Wala FC
  { cat: "WALA FC", name: "1000 FC", price: 240, pieces: "1 Box" },
  { cat: "WALA FC", name: "2000 FC", price: 480, pieces: "1 Box" },
  { cat: "WALA FC", name: "5000 FC", price: 1100, pieces: "1 Box" },
  { cat: "WALA FC", name: "10000 FC", price: 2200, pieces: "1 Box" }
];

console.log(`Total items parsed: ${catalogData.length}`);

// Generate final cracker objects:
// Selling price = avg price (price)
// Actual price (originalPrice / MRP) = selling price * 4
const now = new Date().toISOString();
let codeCounter = 1;

const crackers = catalogData.map((item, index) => {
  const codeNum = String(codeCounter++).padStart(3, '0');
  const catCode = item.cat.replace(/[^A-Za-z]/g, '').substring(0, 3).toLowerCase() || 'crk';
  const padIndex = String(index + 1).padStart(3, '0');
  const id = `kc-${catCode}-${padIndex}`;
  
  const sellingPrice = Number(item.price);
  const actualPrice = Math.round(sellingPrice * 4); // "use the avg price as selling orice and then for the acutal price selling price*4 times"

  return {
    id,
    name: item.name,
    itemCode: `KC${codeNum}`,
    piecesContent: item.pieces,
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

async function main() {
  console.log('1. Updating data-store.json with new stock...');
  const dataStorePath = path.join(process.cwd(), 'data-store.json');
  let currentStore = { crackers: [], orders: [], settings: { showPricing: true, discountPercentage: 20 } };
  
  if (fs.existsSync(dataStorePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
      currentStore = {
        ...existing,
        crackers // replace all old stock with new stock
      };
    } catch (e) {
      currentStore.crackers = crackers;
    }
  } else {
    currentStore.crackers = crackers;
  }

  fs.writeFileSync(dataStorePath, JSON.stringify(currentStore, null, 2), 'utf8');
  console.log(`Successfully updated data-store.json with ${crackers.length} crackers.`);

  console.log('2. Updating src/lib/seedData.ts...');
  const seedDataPath = path.join(process.cwd(), 'src/lib/seedData.ts');
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

  const seedContent = `import { Cracker } from '@/types';

export const INITIAL_CRACKERS: Omit<Cracker, 'createdAt' | 'updatedAt'>[] = ${JSON.stringify(seedCrackers, null, 2)};
`;
  fs.writeFileSync(seedDataPath, seedContent, 'utf8');
  console.log('Successfully updated src/lib/seedData.ts.');

  console.log('3. Updating Firestore database (removing old and inserting new)...');
  try {
    const oldDocsSnapshot = await getDocs(collection(db, 'crackers'));
    console.log(`Found ${oldDocsSnapshot.docs.length} old documents in Firestore. Deleting old stock...`);
    
    let deleteBatch = writeBatch(db);
    let delCount = 0;
    for (const docSnap of oldDocsSnapshot.docs) {
      deleteBatch.delete(docSnap.ref);
      delCount++;
      if (delCount % 400 === 0) {
        await deleteBatch.commit();
        deleteBatch = writeBatch(db);
      }
    }
    if (delCount % 400 !== 0) {
      await deleteBatch.commit();
    }
    console.log(`Successfully deleted ${delCount} old documents from Firestore.`);

    console.log('Inserting new stock into Firestore in batches...');
    let insertBatch = writeBatch(db);
    let insCount = 0;
    for (const cracker of crackers) {
      const docRef = doc(db, 'crackers', cracker.id);
      insertBatch.set(docRef, cracker);
      insCount++;
      if (insCount % 400 === 0) {
        await insertBatch.commit();
        insertBatch = writeBatch(db);
      }
    }
    if (insCount % 400 !== 0) {
      await insertBatch.commit();
    }
    console.log(`Successfully inserted ${insCount} new products into Firestore!`);
  } catch (firestoreErr) {
    console.error('Firestore sync error:', firestoreErr);
  }

  console.log('Stock update complete!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during stock update:', err);
  process.exit(1);
});
