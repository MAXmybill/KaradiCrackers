import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { Order } from '@/types';
import fs from 'fs';
import path from 'path';

export async function generateInvoicePdf(order: Order): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Page dimensions (A4 standard: 595.28 x 841.89 points)
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Standard fonts
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
  const greenText = rgb(0.1, 0.6, 0.2);

  // Try loading logo PNG once
  let logoImage: any = null;
  try {
    const pngPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(pngPath)) {
      const logoBytes = fs.readFileSync(pngPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
  } catch (err) {
    console.warn('PDF logo embed skipped:', err);
  }

  // Calculate order totals
  const totalItemLines = order.items.length;
  const totalQuantityPcs = order.items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const branch1Text = 'Branch 1: Arasan steels, 120 feet road, Near Old Royal Enfield Showroom, Karaikudi.';
  const branch2Text = 'Branch 2: New Karadi crackers, Opp to Ramraj cotton, 100 feet Road, Karaikudi.';
  const shopPhone = process.env.NEXT_PUBLIC_SHOP_PHONE || '+91 8072044403 / +91 9786848686 / +91 8682830542';

  // Helper to draw Header for Page 1
  function drawFirstPageHeader(page: PDFPage): number {
    // Red banner
    page.drawRectangle({
      x: 0,
      y: pageHeight - 120,
      width: pageWidth,
      height: 120,
      color: primaryRed,
    });

    // Yellow accent line
    page.drawRectangle({
      x: 0,
      y: pageHeight - 126,
      width: pageWidth,
      height: 6,
      color: tertiaryYellow,
    });

    let headerLeftX = 40;
    if (logoImage) {
      page.drawImage(logoImage, {
        x: 36,
        y: pageHeight - 105,
        width: 85,
        height: 85,
      });
      headerLeftX = 135;
    }

    page.drawText('KARADI CRACKERS', {
      x: headerLeftX,
      y: pageHeight - 52,
      size: 24,
      font: fontBold,
      color: tertiaryYellow,
    });

    page.drawText('Diwali 2026 Special Booking', {
      x: headerLeftX,
      y: pageHeight - 72,
      size: 10,
      font: fontRegular,
      color: white,
    });

    page.drawText(branch1Text, {
      x: headerLeftX,
      y: pageHeight - 86,
      size: 7.5,
      font: fontRegular,
      color: white,
    });

    page.drawText(branch2Text, {
      x: headerLeftX,
      y: pageHeight - 97,
      size: 7.5,
      font: fontRegular,
      color: white,
    });

    page.drawText(`Enquiry: ${shopPhone}`, {
      x: headerLeftX,
      y: pageHeight - 109,
      size: 7.5,
      font: fontRegular,
      color: white,
    });

    // Invoice Meta Section
    let currentY = pageHeight - 158;

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

    page.drawText('Order No: ', {
      x: pageWidth - 230,
      y: currentY + 4,
      size: 10,
      font: fontRegular,
      color: mutedGray,
    });

    page.drawText(order.orderNumber, {
      x: pageWidth - 170,
      y: currentY + 4,
      size: 11,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(`Date: ${formattedDate}`, {
      x: pageWidth - 230,
      y: currentY - 12,
      size: 9,
      font: fontRegular,
      color: mutedGray,
    });

    // Customer Information Card (Height 60 with total items count)
    currentY -= 48;
    page.drawRectangle({
      x: 36,
      y: currentY - 50,
      width: pageWidth - 72,
      height: 60,
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
      y: currentY - 18,
      size: 10,
      font: fontBold,
      color: darkGray,
    });

    page.drawText(`Mobile: +91 ${order.customerPhone}`, {
      x: 48,
      y: currentY - 32,
      size: 9.5,
      font: fontRegular,
      color: darkGray,
    });

    // Total Items & Total Quantity count right in the customer details box
    page.drawText(`Total Items: ${totalItemLines}   |   Total Quantity: ${totalQuantityPcs} pcs`, {
      x: 48,
      y: currentY - 45,
      size: 9,
      font: fontBold,
      color: primaryRed,
    });

    page.drawText(`Order Status: ${order.status}`, {
      x: pageWidth - 200,
      y: currentY - 18,
      size: 9.5,
      font: fontBold,
      color: order.status === 'DELIVERED' ? greenText : primaryRed,
    });

    if (order.referredBy) {
      page.drawText(`Ref: ${order.referredBy}`, {
        x: pageWidth - 200,
        y: currentY - 32,
        size: 9,
        font: fontRegular,
        color: darkGray,
      });
    }

    return currentY - 72;
  }

  // Helper to draw Header for Subsequent Pages (Page 2, 3...)
  function drawSubsequentPageHeader(page: PDFPage): number {
    // Compact top red strip
    page.drawRectangle({
      x: 0,
      y: pageHeight - 44,
      width: pageWidth,
      height: 44,
      color: primaryRed,
    });

    page.drawRectangle({
      x: 0,
      y: pageHeight - 48,
      width: pageWidth,
      height: 4,
      color: tertiaryYellow,
    });

    page.drawText('KARADI CRACKERS - ESTIMATE INVOICE', {
      x: 36,
      y: pageHeight - 28,
      size: 12,
      font: fontBold,
      color: white,
    });

    page.drawText(`Order No: ${order.orderNumber}  |  Customer: ${order.customerName}`, {
      x: pageWidth - 290,
      y: pageHeight - 27,
      size: 9,
      font: fontRegular,
      color: tertiaryYellow,
    });

    return pageHeight - 70;
  }

  // Helper to draw Table Header Bar
  function drawTableHeader(page: PDFPage, y: number): number {
    page.drawRectangle({
      x: 36,
      y: y - 8,
      width: pageWidth - 72,
      height: 24,
      color: primaryRed,
    });

    page.drawText('#', { x: 44, y: y, size: 8.5, font: fontBold, color: white });
    page.drawText('CODE', { x: 64, y: y, size: 8.5, font: fontBold, color: white });
    page.drawText('ITEM DESCRIPTION', { x: 120, y: y, size: 8.5, font: fontBold, color: white });
    page.drawText('RATE (Rs)', { x: 335, y: y, size: 8.5, font: fontBold, color: white });
    page.drawText('QTY', { x: 420, y: y, size: 8.5, font: fontBold, color: white });
    page.drawText('AMOUNT (Rs)', { x: 485, y: y, size: 8.5, font: fontBold, color: white });

    return y - 22;
  }

  // Draw Bottom Notice and Blessings (only at end of invoice)
  function drawInvoiceEndSummary(page: PDFPage, startY: number): void {
    let currentY = startY;

    // Subtotal & Discount Calculation
    const hasDiscount = Boolean(order.discountPercentage && order.discountPercentage > 0);
    const subtotalVal = order.subtotal || order.total;
    const discountVal = order.discountAmount || 0;

    if (hasDiscount) {
      currentY -= 12;
      page.drawText('SUBTOTAL:', {
        x: pageWidth - 240,
        y: currentY,
        size: 9.5,
        font: fontRegular,
        color: darkGray,
      });
      page.drawText(`Rs. ${Number(subtotalVal).toFixed(2)}`, {
        x: pageWidth - 130,
        y: currentY,
        size: 9.5,
        font: fontBold,
        color: darkGray,
      });

      currentY -= 14;
      page.drawText(`DISCOUNT (${order.discountPercentage}%):`, {
        x: pageWidth - 240,
        y: currentY,
        size: 9.5,
        font: fontRegular,
        color: greenText,
      });
      page.drawText(`- Rs. ${Number(discountVal).toFixed(2)}`, {
        x: pageWidth - 130,
        y: currentY,
        size: 9.5,
        font: fontBold,
        color: greenText,
      });
    }

    // Extra Counter Discount if applied
    if (order.extraDiscountAmount && order.extraDiscountAmount > 0) {
      currentY -= 14;
      const extraLabel =
        order.extraDiscountType === 'percentage'
          ? `COUNTER EXTRA (${order.extraDiscountValue}%):`
          : 'COUNTER EXTRA DISC:';
      page.drawText(extraLabel, {
        x: pageWidth - 240,
        y: currentY,
        size: 9,
        font: fontRegular,
        color: greenText,
      });
      page.drawText(`- Rs. ${Number(order.extraDiscountAmount).toFixed(2)}`, {
        x: pageWidth - 130,
        y: currentY,
        size: 9,
        font: fontBold,
        color: greenText,
      });
    }

    // Total Items & Total Quantity summary pill
    currentY -= 14;
    page.drawText(`TOTAL ITEMS: ${totalItemLines}   |   TOTAL QTY: ${totalQuantityPcs} pcs`, {
      x: 36,
      y: currentY - 2,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    // Grand Total Box
    page.drawRectangle({
      x: pageWidth - 250,
      y: currentY - 14,
      width: 214,
      height: 32,
      color: rgb(0.99, 0.95, 0.95),
      borderColor: primaryRed,
      borderWidth: 1.5,
    });

    page.drawText('FINAL NET TOTAL:', {
      x: pageWidth - 240,
      y: currentY - 2,
      size: 10,
      font: fontBold,
      color: primaryRed,
    });

    page.drawText(`Rs. ${Number(order.total).toFixed(2)}`, {
      x: pageWidth - 130,
      y: currentY - 4,
      size: 13,
      font: fontBold,
      color: primaryRed,
    });

    // Important Counter Collection Note Box
    currentY -= 52;
    page.drawRectangle({
      x: 36,
      y: currentY - 32,
      width: pageWidth - 72,
      height: 48,
      color: rgb(1, 0.98, 0.9),
      borderColor: tertiaryYellow,
      borderWidth: 1.2,
    });

    page.drawText('IMPORTANT COLLECTION NOTICE:', {
      x: 48,
      y: currentY + 2,
      size: 9,
      font: fontBold,
      color: primaryRed,
    });

    page.drawText(
      'Please visit the shop with this invoice or your phone number to collect your order and pay at the counter.',
      {
        x: 48,
        y: currentY - 12,
        size: 8,
        font: fontRegular,
        color: darkGray,
      }
    );

    page.drawText('No online payment is required. We accept Cash / UPI directly at our counter.', {
      x: 48,
      y: currentY - 24,
      size: 8,
      font: fontBold,
      color: darkGray,
    });

    // Footer note
    page.drawText('Wish you and your family a safe, colorful and prosperous Happy Deepavali 2026!', {
      x: 75,
      y: currentY - 48,
      size: 8.5,
      font: fontOblique,
      color: primaryRed,
    });
  }

  // ==========================================
  // MULTI-PAGE ITEMS RENDERING LOOP
  // ==========================================
  const pages: PDFPage[] = [];
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  pages.push(currentPage);

  let currentY = drawFirstPageHeader(currentPage);
  currentY = drawTableHeader(currentPage, currentY);

  const rowHeight = 20;
  const bottomMargin = 50;
  // Estimate height required for end summary block
  const summaryBlockHeight = 175;

  let itemIndex = 1;

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const isLastItem = i === order.items.length - 1;

    // Check if item fits on current page
    // If it's the last item, we also need room for summaryBlockHeight
    const minRequiredY = isLastItem ? bottomMargin + summaryBlockHeight : bottomMargin;

    if (currentY - rowHeight < minRequiredY) {
      // Need a new page
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pages.push(currentPage);
      currentY = drawSubsequentPageHeader(currentPage);
      currentY = drawTableHeader(currentPage, currentY);
    }

    // Draw item row
    const isEven = itemIndex % 2 === 0;
    if (isEven) {
      currentPage.drawRectangle({
        x: 36,
        y: currentY - 6,
        width: pageWidth - 72,
        height: rowHeight,
        color: rgb(0.97, 0.97, 0.97),
      });
    }

    // # Number
    currentPage.drawText(`${itemIndex}`, {
      x: 44,
      y: currentY,
      size: 8.5,
      font: fontRegular,
      color: mutedGray,
    });

    // Item Code (e.g. KC010)
    const codeDisplay = item.itemCode ? item.itemCode.replace('#', '') : '-';
    currentPage.drawText(codeDisplay, {
      x: 64,
      y: currentY,
      size: 8.5,
      font: fontBold,
      color: darkGray,
    });

    // Truncated Item Name
    const maxChars = 34;
    const truncatedName = item.name.length > maxChars ? item.name.slice(0, maxChars - 2) + '..' : item.name;
    currentPage.drawText(truncatedName, {
      x: 120,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: darkGray,
    });

    // Unit Rate
    currentPage.drawText(`Rs. ${Number(item.price).toFixed(2)}`, {
      x: 335,
      y: currentY,
      size: 9,
      font: fontRegular,
      color: darkGray,
    });

    // Quantity (Bold)
    currentPage.drawText(`${item.quantity}`, {
      x: 426,
      y: currentY,
      size: 9.5,
      font: fontBold,
      color: darkGray,
    });

    // Row Amount (Bold)
    const itemTotal = (Number(item.price) * item.quantity).toFixed(2);
    currentPage.drawText(`Rs. ${itemTotal}`, {
      x: 485,
      y: currentY,
      size: 9,
      font: fontBold,
      color: darkGray,
    });

    // Separator line
    currentPage.drawLine({
      start: { x: 36, y: currentY - 6 },
      end: { x: pageWidth - 36, y: currentY - 6 },
      thickness: 0.5,
      color: rgb(0.88, 0.88, 0.88),
    });

    currentY -= rowHeight;
    itemIndex++;
  }

  // Draw end summary block
  // Double check if summary fits on current page
  if (currentY - summaryBlockHeight < bottomMargin) {
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    pages.push(currentPage);
    currentY = drawSubsequentPageHeader(currentPage) - 10;
  }

  drawInvoiceEndSummary(currentPage, currentY);

  // Add Page X of Y to all pages
  const totalPages = pages.length;
  for (let p = 0; p < totalPages; p++) {
    const pg = pages[p];
    pg.drawText(`Page ${p + 1} of ${totalPages}`, {
      x: pageWidth - 100,
      y: 20,
      size: 8,
      font: fontRegular,
      color: mutedGray,
    });
    pg.drawText('Karadi Crackers  •  Diwali Booking', {
      x: 36,
      y: 20,
      size: 8,
      font: fontRegular,
      color: mutedGray,
    });
  }

  return await pdfDoc.save();
}
