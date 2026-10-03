# Karadi Crackers - Production-Ready Diwali Fireworks Platform 🎆

A modern, fast, responsive web application for **Karadi Crackers** built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase Firestore** with persistent data management, PDF invoice generation, and WhatsApp express ordering.

---

## 🎨 Brand & Design System
- **Primary**: Pure White (`#FFFFFF`) for crisp, clean contrast.
- **Secondary**: Deep Festive Red (`#D40000`) for headers, badges, highlights, and primary buttons.
- **Tertiary**: Brilliant Gold/Yellow (`#FFC400`) for tags, accents, hover states, and banners.
- **Typography**: Google Fonts Lilita One & Poppins.
- **Diwali Festive Theme**: Red sunburst ray backgrounds, yellow dashed-stitch cards, and sparkle animations.

---

## 🚀 Key Features

### 🛒 Customer Side (No Login, No Signup, Zero Online Payment)
1. **Home (`/`)**:
   - Hero banner with mascot logo and tagline: *"Light up your Diwali!"*.
   - 4-Step Process: Pick Crackers ➜ Generate Invoice ➜ Send on WhatsApp ➜ Pay & Collect at Counter.
   - Top selling festive crackers with live stock tags and cart steppers.
2. **Crackers Catalog (`/crackers`)**:
   - Live product card grid with category filter chips and instant search bar.
   - Dynamic quantity stepper respecting maximum stock limits.
   - Live availability badge (`In Stock` / `Out of Stock`).
3. **Shopping Cart (`/cart`)**:
   - Persistent `localStorage` cart with Zustand.
   - Line items with quantity modifiers, line totals, and grand total.
   - Clear checkout navigation (strictly offline payment at counter).
4. **Checkout (`/checkout`)**:
   - Validated Indian 10-digit mobile number (`[6-9]XXXXXXXXX`) & customer name.
   - Server-side stock re-validation preventing over-ordering or manipulated prices.
   - Automatic inventory deduction.
5. **Success Page (`/order/[orderNumber]`)**:
   - Confetti celebration.
   - **Send on WhatsApp** button prefilled with formatted order text, customer info, itemized summary, and public invoice link.
   - **Download PDF Invoice** button.
   - Shop address and counter collection instructions.
6. **PDF Invoice Generator (`GET /api/invoice/[orderNumber]`)**:
   - Clean, professional invoice generated on the fly via `pdf-lib`.
   - Includes shop logo, contact info, itemized pricing, order number, and collection notices.

### 🛡️ Admin Portal (`/admin`)
- **Protected by httpOnly signed JWT cookie session** with route middleware.
- **Credentials**:
  - Admin ID: `karadicrackers`
  - Password: `password123456`
  - Rate-limited login attempts.
- **Dashboard (`/admin`)**:
  - Live counts of total products, available products, total orders, and pending counter collections.
  - Collected counter revenue overview and stock warnings.
- **Crackers Inventory (`/admin/crackers`)**:
  - Instant **ON/OFF availability toggle switch**.
  - **Inline quick edit** of prices and stock quantities with one-click save.
  - Add and Edit Cracker modal with category and image support.
  - Delete with safety confirmation dialog.
- **Orders History (`/admin/orders`)**:
  - Comprehensive order table with date, customer name, phone, items, total, and status.
  - Search by order number, customer name, and phone.
  - Filter by status and date.
  - View full itemized order details in modal.
  - Status updates (`PENDING`, `COLLECTED`, `CANCELLED`). **Cancelling an order automatically restores inventory!**
  - **Export Orders to CSV** with one click.

---

## 🛠️ Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Your `.env` file is pre-configured with the shop details and Firebase Firestore credentials:
```env
ADMIN_ID=karadicrackers
ADMIN_PASSWORD=password123456
SESSION_SECRET=karadi_crackers_diwali_secret_key_super_secure_2025_99999

NEXT_PUBLIC_SHOP_NAME=Karadi Crackers
NEXT_PUBLIC_SHOP_WHATSAPP=919876543210
NEXT_PUBLIC_SHOP_PHONE=+91 98765 43210
NEXT_PUBLIC_SHOP_ADDRESS=12, Sivakasi Main Road, Near Gandhi Statue, Sivakasi, Tamil Nadu - 626123
NEXT_PUBLIC_SITE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBxWFoPYjFfC9Nh-ofciLU-IHxPxf9Romk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=karadicrackers.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=karadicrackers
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=karadicrackers.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=318378840978
NEXT_PUBLIC_FIREBASE_APP_ID=1:318378840978:web:a52e890cfd73486a08274b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YV5KYLXGSB
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the shop, and [http://localhost:3000/admin](http://localhost:3000/admin) to log into the admin dashboard.

---

## 🚀 Deployment (Vercel)
1. Push your repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Set the environment variables from `.env`.
4. Deploy!
