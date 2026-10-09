import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
  doc
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

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

// Helper to calculate MRP (2.2x - 2.5x of price rounded to nearest 5)
function calcMRP(price) {
  return Math.round((price * 2.3) / 5) * 5 || Math.round(price * 2);
}

const rawCatalog = [
  // 1. Sattai
  { cat: "SATTAI", name: "1.5\" Twinkling Stars", price: 18, pieces: "1 Box", img: IMG_SPARK },
  { cat: "SATTAI", name: "4\" Twinkling Stars", price: 38, pieces: "1 Box", img: IMG_SPARK2 },

  // 2. Sparklers
  { cat: "SPARKLERS", name: "7cm Electric Sparklers", price: 7, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "7cm Crackling Sparklers", price: 8, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "7cm Green Sparklers", price: 9, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "7cm Red Sparklers", price: 10, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "10cm Electric Sparklers", price: 13.5, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "10cm Crackling Sparklers", price: 14.5, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "10cm Supreme Pink Sparklers", price: 15, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "10cm Green Sparklers", price: 15.5, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "10cm Red Sparklers", price: 16.5, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "12cm Electric Sparklers", price: 17, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "12cm Crackling Sparklers", price: 18, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "12cm Green Sparklers", price: 19, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "12cm Red Sparklers", price: 20, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "15cm Electric Sparklers", price: 27, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "15cm Crackling Sparklers", price: 28, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "15cm Green Sparklers", price: 29, pieces: "10 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "15cm Red Sparklers", price: 30, pieces: "10 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "30cm Electric Sparklers", price: 27, pieces: "5 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "30cm Crackling Sparklers", price: 28, pieces: "5 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "30cm Green Sparklers", price: 29, pieces: "5 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "30cm Red Sparklers", price: 30, pieces: "5 Pcs", img: IMG_SPARK2 },
  { cat: "SPARKLERS", name: "50cm Electric Sparklers", price: 110, pieces: "5 Pcs", img: IMG_SPARK },
  { cat: "SPARKLERS", name: "50cm Colour Sparklers", price: 120, pieces: "5 Pcs", img: IMG_SPARK2 },

  // 3. Match boxes
  { cat: "MATCH BOXES", name: "Royal Matches", price: 150, pieces: "10 In 1 Box", img: IMG_KIDS },

  // 4. Chakkra & Spinners
  { cat: "CHAKKRA & SPINNERS", name: "Ashoka Chakkra", price: 38, pieces: "10 Pcs", img: IMG_CHAKKAR },
  { cat: "CHAKKRA & SPINNERS", name: "SPL Chakkra", price: 50, pieces: "10 Pcs", img: IMG_CHAKKAR2 },
  { cat: "CHAKKRA & SPINNERS", name: "DEL Chakkra", price: 98, pieces: "10 Pcs", img: IMG_CHAKKAR },
  { cat: "CHAKKRA & SPINNERS", name: "Spinner Special", price: 60, pieces: "10 Pcs", img: IMG_CHAKKAR2 },
  { cat: "CHAKKRA & SPINNERS", name: "Spinner Deluxe", price: 85, pieces: "10 Pcs", img: IMG_CHAKKAR },
  { cat: "CHAKKRA & SPINNERS", name: "Wire Chakkra", price: 115, pieces: "10 Pcs", img: IMG_CHAKKAR2 },
  { cat: "CHAKKRA & SPINNERS", name: "Reverse Chakkra", price: 45, pieces: "10 Pcs", img: IMG_CHAKKAR },
  { cat: "CHAKKRA & SPINNERS", name: "Spr DEL Chakkra", price: 110, pieces: "10 Pcs", img: IMG_CHAKKAR2 },
  { cat: "CHAKKRA & SPINNERS", name: "Whistle Chakkra", price: 120, pieces: "5 Pcs", img: IMG_CHAKKAR },
  { cat: "CHAKKRA & SPINNERS", name: "Dancing Chakkra", price: 95, pieces: "5 Pcs", img: IMG_CHAKKAR2 },

  // 5. Flower pots
  { cat: "FLOWER POTS", name: "FP. Big", price: 60, pieces: "10 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "FP. SPL", price: 70, pieces: "10 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "FP. Ashoka", price: 90, pieces: "10 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "FP. Giant", price: 98, pieces: "10 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "FP. Deluxe", price: 120, pieces: "10 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "FP. Col-Koti", price: 145, pieces: "10 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "FP. Elegant", price: 250, pieces: "5 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "FP. MULTI. COLOUR POTS", price: 360, pieces: "5 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "MINI TRICOLOUR", price: 146, pieces: "5 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "TRICOLOUR Flower Pots", price: 165, pieces: "5 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "Tim Tim Flower Pots", price: 130, pieces: "5 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "Colour Change Tim", price: 150, pieces: "5 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "2 in 1 Tim", price: 140, pieces: "5 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "Tim Jasmin", price: 145, pieces: "5 Pcs", img: IMG_FLOWER2 },
  { cat: "FLOWER POTS", name: "Tim Asaraf", price: 155, pieces: "5 Pcs", img: IMG_FLOWER },
  { cat: "FLOWER POTS", name: "Tim Magic Star", price: 160, pieces: "5 Pcs", img: IMG_FLOWER2 },

  // 6. Vedi & Bombs
  { cat: "VEDI & BOMBS", name: "Jallikattu", price: 45, pieces: "10 Pcs", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "Lion Bomb", price: 60, pieces: "10 Pcs", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "Hulk Bomb", price: 60, pieces: "10 Pcs", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "3 1/2\" Lakshmi Vedi", price: 18, pieces: "1 Pkt (8 Pcs)", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "4\" Lakshmi Vedi", price: 22, pieces: "1 Pkt (8 Pcs)", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "4\" Deluxe Lakshmi", price: 25, pieces: "1 Pkt (8 Pcs)", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "Gold Lakshmi", price: 25, pieces: "1 Pkt (8 Pcs)", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "Digital Bomb", price: 160, pieces: "1 Box (10 Pcs)", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "2 3/4\" Kuruvi", price: 15, pieces: "1 Pkt (8 Pcs)", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "Gypsy Bomb", price: 125, pieces: "10 Pcs", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "Hydro Bomb", price: 65, pieces: "10 Pcs", img: IMG_BOMB },
  { cat: "VEDI & BOMBS", name: "2 Sound Bomb", price: 40, pieces: "10 Pcs", img: IMG_BOMB2 },
  { cat: "VEDI & BOMBS", name: "King Rider Bomb", price: 180, pieces: "10 Pcs", img: IMG_BOMB },

  // 7. Paper Bomb
  { cat: "PAPER BOMB", name: "1/4 Kg Paper Bomb", price: 35, pieces: "1 Pc", img: IMG_BOMB2 },
  { cat: "PAPER BOMB", name: "1/2 Kg Paper Bomb", price: 70, pieces: "1 Pc", img: IMG_BOMB },
  { cat: "PAPER BOMB", name: "1kg Paper Bomb", price: 140, pieces: "1 Pc", img: IMG_BOMB2 },

  // 8. Kids
  { cat: "KIDS", name: "Red Bijli", price: 35, pieces: "1 Pkt (100 Pcs)", img: IMG_KIDS },
  { cat: "KIDS", name: "Snake Tablet", price: 20, pieces: "1 Box (10 Pcs)", img: IMG_KIDS },
  { cat: "KIDS", name: "Big Thar Car", price: 120, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Cylinder Fountain", price: 75, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Men In Black Gun", price: 180, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Ring Caps", price: 25, pieces: "1 Box (9 Rings)", img: IMG_KIDS },
  { cat: "KIDS", name: "Sahara Pistol - 320", price: 320, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Sahara Pistol - 140", price: 140, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Sahara - 80", price: 80, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Big Giant Gun", price: 210, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "KIDS", name: "Elephant Toys", price: 145, pieces: "1 Box", img: IMG_KIDS },
  { cat: "KIDS", name: "Tik Tok", price: 130, pieces: "1 Box", img: IMG_KIDS },
  { cat: "KIDS", name: "Cylinder Novelty", price: 115, pieces: "1 Box", img: IMG_KIDS },

  // 9. Rockets
  { cat: "ROCKETS", name: "Whistling Rocket", price: 95, pieces: "10 Pcs", img: IMG_ROCKET },
  { cat: "ROCKETS", name: "Three Sound Rocket", price: 110, pieces: "10 Pcs", img: IMG_ROCKET2 },
  { cat: "ROCKETS", name: "Two Sound Rocket", price: 85, pieces: "10 Pcs", img: IMG_ROCKET },

  // 10. Fancy Pipes
  { cat: "FANCY PIPES", name: "4\" Single Pipe", price: 180, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "2\" Single Pipe", price: 90, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "2\" (2pcs) Pipe", price: 160, pieces: "2 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "2½ Fancy 3 pcs", price: 240, pieces: "3 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Starvell 4\" (2pcs)", price: 320, pieces: "2 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Tesco 4\" (2pcs)", price: 320, pieces: "2 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Pandyas 3½ Single", price: 160, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "3½ Double Ball (Sastha)", price: 210, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "6\" Pipe Sastha", price: 380, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Wow Star Purple 4\"", price: 220, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Wow Star Golden 4\"", price: 220, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Tesco Ring o Ring", price: 190, pieces: "1 Box", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "1½ Tesco (3pcs)", price: 210, pieces: "3 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "1½ Tesco Single", price: 80, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Riko 4\" (3Pcs)", price: 390, pieces: "3 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "2\" Tesco (3pcs)", price: 250, pieces: "3 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Tesco Chickoo (2Pcs)", price: 180, pieces: "2 Pcs", img: IMG_NIGHT },
  { cat: "FANCY PIPES", name: "Dancing Shooter (silver)", price: 150, pieces: "1 Pc", img: IMG_NIGHT },

  // 11. Day Fancy
  { cat: "DAY FANCY", name: "15 Shot Colour Smoke", price: 260, pieces: "1 Box", img: IMG_FANCY },
  { cat: "DAY FANCY", name: "90 Watts Smoke", price: 90, pieces: "1 Box", img: IMG_FANCY },
  { cat: "DAY FANCY", name: "Siren Small", price: 80, pieces: "1 Box", img: IMG_FANCY },
  { cat: "DAY FANCY", name: "Siren Big (5+5)", price: 150, pieces: "1 Box (10 Pcs)", img: IMG_FANCY },

  // 12. Night Shots
  { cat: "NIGHT SHOTS", name: "12 Shot \"", price: 145, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "12 Shot \" Legends", price: 150, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "30 Shot \"", price: 320, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "60 Shot Maan", price: 620, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "120 Shot \"", price: 1150, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "240 Shot \"", price: 2200, pieces: "1 Pc", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "30 Setout, 2.5\"", price: 750, pieces: "1 Box", img: IMG_NIGHT },
  { cat: "NIGHT SHOTS", name: "25 Setout, 3\"", price: 850, pieces: "1 Box", img: IMG_NIGHT },

  // 13. Fancy items
  { cat: "FANCY ITEMS", name: "Sun Star", price: 90, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Moon Light", price: 95, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "KitKat Jeyams", price: 18, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Monkey Star Starvell", price: 140, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "SINGLE CONE", price: 100, pieces: "1 Pc", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "1000 Watts Mega Fountains", price: 180, pieces: "1 Pc", img: IMG_FLOWER },
  { cat: "FANCY ITEMS", name: "2000 Watts Mega Fountains", price: 320, pieces: "1 Pc", img: IMG_FLOWER2 },
  { cat: "FANCY ITEMS", name: "5000 Watts Mega Fountains", price: 650, pieces: "1 Pc", img: IMG_FLOWER },
  { cat: "FANCY ITEMS", name: "Teddy 5pcs", price: 110, pieces: "5 Pcs", img: IMG_KIDS },
  { cat: "FANCY ITEMS", name: "Penta Force", price: 120, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Planet Wheel (2 Pcs)", price: 130, pieces: "2 Pcs", img: IMG_CHAKKAR },
  { cat: "FANCY ITEMS", name: "Ice Fountains", price: 70, pieces: "4 Pcs", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Mega Crackling Coconut (3 Pcs)", price: 210, pieces: "3 Pcs", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Welcome Shower (Water Queen)", price: 160, pieces: "1 Box", img: IMG_FLOWER },
  { cat: "FANCY ITEMS", name: "WATERQUEEN (ALL)", price: 75, pieces: "1 Box", img: IMG_FLOWER2 },
  { cat: "FANCY ITEMS", name: "Lucky Butterfly", price: 85, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Tin Single Pc", price: 75, pieces: "1 Pc", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Tin 2Pcs Pack", price: 135, pieces: "2 Pcs", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "LOLLIPOP", price: 130, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Chin Chan Starvell", price: 88, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Lemontree Ayyan", price: 100, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Thirumalas Lemon Tree", price: 100, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "i CONE", price: 140, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Selfie Stick", price: 95, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Twix", price: 115, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "COLOUR RAIN", price: 65, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "FEATHER PEACOCK", price: 65, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "GOLDEN PROPS", price: 65, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Bada Peacock", price: 280, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Mega Peacock", price: 125, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "MOTU PATLU", price: 237, pieces: "1 Box", img: IMG_KIDS },
  { cat: "FANCY ITEMS", name: "4×4 Wheel", price: 160, pieces: "1 Box", img: IMG_CHAKKAR },
  { cat: "FANCY ITEMS", name: "Polo", price: 35, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "FLY JET", price: 115, pieces: "1 Box", img: IMG_ROCKET },
  { cat: "FANCY ITEMS", name: "WATER PENCIL", price: 115, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Chit Put (Mothers)", price: 45, pieces: "1 Box", img: IMG_FANCY },
  { cat: "FANCY ITEMS", name: "Starwell Race Car", price: 140, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "FANCY ITEMS", name: "King Star Red Robo", price: 150, pieces: "1 Pc", img: IMG_KIDS },
  { cat: "FANCY ITEMS", name: "Pizza", price: 130, pieces: "1 Box", img: IMG_FANCY },

  // 14. Gift Boxes
  { cat: "GIFT BOXES", name: "25 Items (10 pcs pack)", price: 300, pieces: "1 Box", img: IMG_FANCY },
  { cat: "GIFT BOXES", name: "35 Items (10 pcs pack)", price: 430, pieces: "1 Box", img: IMG_FANCY },
  { cat: "GIFT BOXES", name: "50 Items (10 pcs pack)", price: 750, pieces: "1 Box", img: IMG_FANCY },
  { cat: "GIFT BOXES", name: "60 Items (10 pcs pack)", price: 950, pieces: "1 Box", img: IMG_FANCY },

  // 15. Wala (Arul)
  { cat: "WALA", name: "28 Giant", price: 28, pieces: "1 Pkt", img: IMG_BOMB },
  { cat: "WALA", name: "56 Giant", price: 55, pieces: "1 Pkt", img: IMG_BOMB2 },
  { cat: "WALA", name: "Shower", price: 40, pieces: "1 Box", img: IMG_FLOWER },
  { cat: "WALA", name: "100 Wala", price: 45, pieces: "1 Box", img: IMG_BOMB },
  { cat: "WALA", name: "1000 HC", price: 120, pieces: "1 Box", img: IMG_BOMB },
  { cat: "WALA", name: "2000 HC", price: 240, pieces: "1 Box", img: IMG_BOMB2 },
  { cat: "WALA", name: "5000 HC", price: 600, pieces: "1 Box", img: IMG_BOMB },
  { cat: "WALA", name: "10000 HC", price: 1200, pieces: "1 Box", img: IMG_BOMB2 },

  // 16. Wala FC
  { cat: "WALA FC", name: "1000 FC", price: 220, pieces: "1 Box", img: IMG_BOMB },
  { cat: "WALA FC", name: "2000 FC", price: 440, pieces: "1 Box", img: IMG_BOMB2 },
  { cat: "WALA FC", name: "5000 FC", price: 1100, pieces: "1 Box", img: IMG_BOMB },
  { cat: "WALA FC", name: "10000 FC", price: 2200, pieces: "1 Box", img: IMG_BOMB2 }
];

// Generate structured Cracker objects with itemCode format KC001, KC002, ...
const now = new Date().toISOString();
let codeCounter = 1;
const crackers = rawCatalog.map((item, index) => {
  const codeNum = String(codeCounter++).padStart(3, '0');
  const idPrefix = item.cat.substring(0, 3).toLowerCase();
  const padIndex = String(index + 1).padStart(3, '0');
  const id = `kc-${idPrefix}-${padIndex}`;
  const originalPrice = calcMRP(item.price);

  return {
    id,
    name: item.name,
    itemCode: `KC${codeNum}`,
    piecesContent: item.pieces,
    price: item.price,
    originalPrice,
    quantity: 200,
    isAvailable: true,
    category: item.cat,
    imageUrl: item.img,
    createdAt: now,
    updatedAt: now
  };
});

console.log(`Total products parsed: ${crackers.length}`);

async function main() {
  console.log('1. Updating local data-store.json...');
  const dataStorePath = path.join(process.cwd(), 'data-store.json');
  let currentStore = { crackers: [], orders: [], settings: { showPricing: true, discountPercentage: 20 } };
  if (fs.existsSync(dataStorePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
      currentStore = {
        ...existing,
        crackers
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

  console.log('3. Syncing with Firestore...');
  try {
    const oldDocsSnapshot = await getDocs(collection(db, 'crackers'));
    console.log(`Found ${oldDocsSnapshot.docs.length} old documents in Firestore. Clearing...`);
    
    // Delete in batches of 400
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

    console.log('Inserting new products into Firestore in batches...');
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
    console.log(`Successfully inserted ${insCount} new products into Firestore.`);
  } catch (firestoreErr) {
    console.warn('Firestore sync failed or skipped:', firestoreErr.message || firestoreErr);
    console.log('Local store and seedData have been updated and will serve all products.');
  }

  console.log('All catalog updates successfully finished!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error updating catalog:', err);
  process.exit(1);
});
