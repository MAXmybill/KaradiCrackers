import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Order } from '@/types';
import fs from 'fs';
import path from 'path';

export async function generateInvoicePdf(order: Order): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size (595 x 842 points)
  const { width, height } = page.getSize();

  // Built-in standard fonts (guaranteed across all systems)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette
  const primaryRed = rgb(0.83, 0.0, 0.0);
  const tertiaryYellow = rgb(1.0, 0.77, 0.0);
  const darkGray = rgb(0.12, 0.12, 0.12);
  const mutedGray = rgb(0.45, 0.45, 0.45);
  const lightBg = rgb(0.98, 0.98, 0.98);
  const white = rgb(1, 1, 1);

  // Top header red banner
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: primaryRed,
  });

  // Yellow accent ribbon
  page.drawRectangle({
    x: 0,
    y: height - 126,
    width,
    height: 6,
    color: tertiaryYellow,
  });

  // Embed logo image safely
  let logoPlaced = false;
  try {
    const pngPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(pngPath)) {
      const logoBytes = fs.readFileSync(pngPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: 36,
        y: height - 105,
        width: 85,
        height: 85,
      });
      logoPlaced = true;
    }
  } catch (err) {
    console.warn('PDF logo embed skipped:', err);
  }

  const headerLeftX = logoPlaced ? 135 : 40;

  // Header Title & Tagline
  page.drawText('KARADI CRACKERS', {
    x: headerLeftX,
    y: height - 52,
    size: 24,
    font: fontBold,
    color: tertiaryYellow,
  });

  page.drawText('Diwali 2026 Special | Sivakasi Direct Factory Fireworks', {
    x: headerLeftX,
    y: height - 72,
    size: 10,
    font: fontRegular,
    color: white,
  });

  const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || '12, Sivakasi Main Road, Sivakasi, Tamil Nadu - 626123';
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+91 98765 43210';

  page.drawText(`Store: ${shopAddress}`, {
    x: headerLeftX,
    y: height - 88,
    size: 8.5,
    font: fontRegular,
    color: white,
  });

  page.drawText(`Phone: ${shopPhone} | WhatsApp: +${process.env.NEXT_PUBLIC_SHOP_WHATSAPP || '919876543210'}`, {
    x: headerLeftX,
    y: height - 102,
    size: 8.5,
    font: fontRegular,
    color: white,
  });

  // Invoice Meta Section
  let currentY = height - 160;

  page.drawRectangle({
    x: 36,
    y: currentY - 6,
    width: 140,
    height: 26,
    color: lightBg,
    borderColor: primaryRed,
    borderWidth: 1.5,
  });

  page.drawText('ESTIMATE INVOICE', {
    x: 46,
    y: currentY + 2,
    size: 11,
    font: fontBold,
    color: primaryRed,
  });

  page.drawText(`Order No: `, {
    x: width - 230,
    y: currentY + 4,
    size: 10,
    font: fontRegular,
    color: mutedGray,
  });

  page.drawText(order.orderNumber, {
    x: width - 170,
    y: currentY + 4,
    size: 11,
    font: fontBold,
    color: darkGray,
  });

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  page.drawText(`Date: ${formattedDate}`, {
    x: width - 230,
    y: currentY - 12,
    size: 9,
    font: fontRegular,
    color: mutedGray,
  });

  // Customer Information Card
  currentY -= 45;
  page.drawRectangle({
    x: 36,
    y: currentY - 45,
    width: width - 72,
    height: 55,
    color: rgb(0.99, 0.98, 0.95),
    borderColor: tertiaryYellow,
    borderWidth: 1,
  });

  page.drawText('CUSTOMER DETAILS', {
    x: 48,
    y: currentY - 2,
    size: 9,
    font: fontBold,
    color: primaryRed,
  });

  page.drawText(`Name: ${order.customerName}`, {
    x: 48,
    y: currentY - 20,
    size: 10.5,
    font: fontBold,
    color: darkGray,
  });

  page.drawText(`Mobile: +91 ${order.customerPhone}`, {
    x: 48,
    y: currentY - 35,
    size: 10,
    font: fontRegular,
    color: darkGray,
  });

  page.drawText(`Order Status: ${order.status}`, {
    x: width - 200,
    y: currentY - 20,
    size: 9.5,
    font: fontBold,
    color: order.status === 'COLLECTED' ? rgb(0.1, 0.6, 0.2) : primaryRed,
  });

  // Table Header
  currentY -= 75;
  page.drawRectangle({
    x: 36,
    y: currentY - 8,
    width: width - 72,
    height: 24,
    color: primaryRed,
  });

  page.drawText('#', { x: 46, y: currentY, size: 9, font: fontBold, color: white });
  page.drawText('ITEM DESCRIPTION', { x: 75, y: currentY, size: 9, font: fontBold, color: white });
  page.drawText('RATE (Rs)', { x: 330, y: currentY, size: 9, font: fontBold, color: white });
  page.drawText('QTY', { x: 425, y: currentY, size: 9, font: fontBold, color: white });
  page.drawText('AMOUNT (Rs)', { x: 485, y: currentY, size: 9, font: fontBold, color: white });

  currentY -= 20;

  // Items Rows
  let index = 1;
  for (const item of order.items) {
    if (currentY < 140) {
      break;
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      page.drawRectangle({
        x: 36,
        y: currentY - 6,
        width: width - 72,
        height: 20,
        color: rgb(0.97, 0.97, 0.97),
      });
    }

    page.drawText(`${index}`, {
      x: 46,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: mutedGray,
    });

    const truncatedName = item.name.length > 40 ? item.name.slice(0, 38) + '...' : item.name;
    page.drawText(truncatedName, {
      x: 75,
      y: currentY,
      size: 9.5,
      font: fontRegular,
      color: darkGray,
    });

    page.drawText(`Rs. ${Number(item.price).toFixed(2)}`, {
      x: 330,
      y: currentY,
      size: 9.5,
      font: fontRegular,
      color: darkGray,
    });

    page.drawText(`${item.quantity}`, {
      x: 432,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    const itemTotal = (Number(item.price) * item.quantity).toFixed(2);
    page.drawText(`Rs. ${itemTotal}`, {
      x: 485,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    page.drawLine({
      start: { x: 36, y: currentY - 6 },
      end: { x: width - 36, y: currentY - 6 },
      thickness: 0.5,
      color: rgb(0.88, 0.88, 0.88),
    });

    currentY -= 20;
    index++;
  }

  // Grand Total Box
  currentY -= 15;
  page.drawRectangle({
    x: width - 250,
    y: currentY - 10,
    width: 214,
    height: 35,
    color: rgb(0.99, 0.95, 0.95),
    borderColor: primaryRed,
    borderWidth: 1.5,
  });

  page.drawText('GRAND TOTAL:', {
    x: width - 240,
    y: currentY + 3,
    size: 11,
    font: fontBold,
    color: primaryRed,
  });

  page.drawText(`Rs. ${Number(order.total).toFixed(2)}`, {
    x: width - 130,
    y: currentY + 1,
    size: 13,
    font: fontBold,
    color: primaryRed,
  });

  // Important Counter Collection Note Box
  currentY -= 70;
  page.drawRectangle({
    x: 36,
    y: currentY - 35,
    width: width - 72,
    height: 52,
    color: rgb(1, 0.98, 0.9),
    borderColor: tertiaryYellow,
    borderWidth: 1.5,
  });

  page.drawText('IMPORTANT COLLECTION NOTICE:', {
    x: 48,
    y: currentY + 2,
    size: 9.5,
    font: fontBold,
    color: primaryRed,
  });

  page.drawText(
    'Please visit the shop with this invoice or your phone number to collect your order and pay at the counter.',
    {
      x: 48,
      y: currentY - 14,
      size: 8.5,
      font: fontRegular,
      color: darkGray,
    }
  );

  page.drawText('No online payment is required. We accept Cash / UPI directly at our counter.', {
    x: 48,
    y: currentY - 26,
    size: 8.5,
    font: fontBold,
    color: darkGray,
  });

  // Footer notes & blessings
  page.drawText('Wish you and your family a safe, colorful and prosperous Happy Deepavali 2026!', {
    x: 80,
    y: 40,
    size: 9,
    font: fontOblique,
    color: primaryRed,
  });

  page.drawText('Karadi Crackers • Quality Fireworks Direct from Sivakasi', {
    x: 165,
    y: 25,
    size: 8,
    font: fontRegular,
    color: mutedGray,
  });

  return await pdfDoc.save();
}
