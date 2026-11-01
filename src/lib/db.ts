import { Cracker, Order, OrderStatus, StoreSettings } from '@/types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';

const DEFAULT_SETTINGS: StoreSettings = {
  showPricing: true,
  discountPercentage: 20,
};

// Helper to remove any undefined fields so Firestore setDoc does not throw errors
function sanitizeFirestoreData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? sanitizeFirestoreData(item) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeFirestoreData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// -------------------------------------------------------------
// STORE SETTINGS REPOSITORY (100% FIRESTORE)
// -------------------------------------------------------------

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'store');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as StoreSettings) };
    }
  } catch (err) {
    console.error('Firestore getStoreSettings error:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const now = new Date().toISOString();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  await setDoc(doc(db, 'settings', 'store'), updated, { merge: true });
  return updated;
}

// -------------------------------------------------------------
// CRACKERS REPOSITORY (100% FIRESTORE)
// -------------------------------------------------------------

export async function getCrackers(availableOnly = false): Promise<Cracker[]> {
  const colRef = collection(db, 'crackers');
  let q = query(colRef);
  if (availableOnly) {
    q = query(colRef, where('isAvailable', '==', true));
  }

  const snapshot = await getDocs(q);
  const items: Cracker[] = [];
  snapshot.forEach((d) => {
    items.push({ id: d.id, ...(d.data() as any) } as Cracker);
  });

  // Sort items logically by itemCode if present (e.g. KC001, KC002, ...)
  items.sort((a, b) => {
    const codeA = a.itemCode || '';
    const codeB = b.itemCode || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
  });

  return items;
}

export async function getCrackerById(id: string): Promise<Cracker | null> {
  const docRef = doc(db, 'crackers', id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as any) };
  }
  return null;
}

export async function createCracker(data: Omit<Cracker, 'id' | 'createdAt' | 'updatedAt'>): Promise<Cracker> {
  const id = `kc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newCracker: Cracker = {
    id,
    name: data.name,
    price: Number(data.price),
    originalPrice: data.originalPrice !== undefined ? Number(data.originalPrice) : undefined,
    itemCode: data.itemCode || undefined,
    piecesContent: data.piecesContent || undefined,
    quantity: Number(data.quantity || 999999),
    isAvailable: Boolean(data.isAvailable),
    category: data.category || 'General',
    imageUrl:
      data.imageUrl ||
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'crackers', id), sanitizeFirestoreData(newCracker));
  return newCracker;
}

export async function updateCracker(id: string, updates: Partial<Cracker>): Promise<Cracker | null> {
  const now = new Date().toISOString();
  const current = await getCrackerById(id);
  if (!current) return null;

  const updated: Cracker = {
    ...current,
    ...updates,
    name: updates.name !== undefined ? updates.name.trim() : current.name,
    category: updates.category !== undefined ? updates.category.trim() : current.category,
    imageUrl: updates.imageUrl !== undefined ? updates.imageUrl : current.imageUrl,
    price: updates.price !== undefined ? Number(updates.price) : current.price,
    originalPrice:
      updates.originalPrice !== undefined ? Number(updates.originalPrice) : current.originalPrice,
    itemCode: updates.itemCode !== undefined ? updates.itemCode : current.itemCode,
    piecesContent: updates.piecesContent !== undefined ? updates.piecesContent : current.piecesContent,
    quantity: updates.quantity !== undefined ? Number(updates.quantity) : current.quantity,
    isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : current.isAvailable,
    updatedAt: now,
  };

  if (updated.quantity < 0) {
    updated.quantity = 0;
  }

  await setDoc(doc(db, 'crackers', id), sanitizeFirestoreData(updated), { merge: true });
  return updated;
}

export async function deleteCracker(id: string): Promise<boolean> {
  await deleteDoc(doc(db, 'crackers', id));
  return true;
}

export async function bulkUpdateCrackerPrices(
  percentage: number,
  type: 'increase' | 'decrease',
  selectedCategories?: string[]
): Promise<{ count: number; crackers: Cracker[] }> {
  const crackers = await getCrackers(false);
  const now = new Date().toISOString();
  const factor = type === 'increase' ? 1 + percentage / 100 : Math.max(0.01, 1 - percentage / 100);

  const categorySet =
    selectedCategories && selectedCategories.length > 0
      ? new Set(selectedCategories.map((c) => c.trim().toUpperCase()))
      : null;

  let updatedCount = 0;
  let batch = writeBatch(db);
  let batchOps = 0;

  const updatedCrackers: Cracker[] = [];

  for (const c of crackers) {
    const crackerCat = (c.category || '').trim().toUpperCase();
    const shouldUpdate = !categorySet || categorySet.has(crackerCat);

    if (shouldUpdate) {
      let newPrice = Math.round(c.price * factor);
      if (newPrice < 1) newPrice = 1;
      updatedCount++;

      const updated = {
        ...c,
        price: newPrice, // Update ONLY selling price
        updatedAt: now,
      };
      updatedCrackers.push(updated);

      batch.update(doc(db, 'crackers', c.id), {
        price: newPrice,
        updatedAt: now,
      });
      batchOps++;

      if (batchOps % 400 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    } else {
      updatedCrackers.push(c);
    }
  }

  if (batchOps % 400 !== 0) {
    await batch.commit();
  }

  return { count: updatedCount, crackers: updatedCrackers };
}

export async function renameCategoryInFirestore(
  oldCategory: string,
  newCategory: string
): Promise<{ count: number }> {
  const oldNormalized = oldCategory.trim().toUpperCase();
  const newNormalized = newCategory.trim().toUpperCase();
  if (oldNormalized === newNormalized) return { count: 0 };

  const crackers = await getCrackers(false);
  const now = new Date().toISOString();
  let count = 0;
  let batch = writeBatch(db);
  let batchOps = 0;

  for (const c of crackers) {
    if ((c.category || '').trim().toUpperCase() === oldNormalized) {
      batch.update(doc(db, 'crackers', c.id), {
        category: newNormalized,
        updatedAt: now,
      });
      batchOps++;
      count++;
      if (batchOps % 400 === 0) {
        await batch.commit();
        batch = writeBatch(db);
      }
    }
  }

  if (batchOps % 400 !== 0) {
    await batch.commit();
  }

  return { count };
}

// -------------------------------------------------------------
// ORDERS REPOSITORY (100% FIRESTORE)
// -------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  try {
    const colRef = collection(db, 'orders');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((d) => {
      orders.push({ id: d.id, ...(d.data() as any) });
    });
    return orders;
  } catch (error) {
    console.error('Firestore getOrders error:', error);
    return [];
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const colRef = collection(db, 'orders');
  const q = query(colRef, where('orderNumber', '==', orderNumber.trim()));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const docData = snapshot.docs[0];
    return { id: docData.id, ...(docData.data() as any) };
  }
  return null;
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  referredBy?: string;
  items: { crackerId: string; quantity: number }[];
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const settings = await getStoreSettings();
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const currentYear = new Date().getFullYear();
    const orderSequence = String(ordersSnap.size + 1).padStart(4, '0');
    const orderNumber = `KC-${currentYear}-${orderSequence}`;
    const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const createdOrder = await runTransaction(db, async (transaction) => {
      // 1. Transaction Read Phase: Fetch all cracker documents
      const crackerReads: {
        crackerRef: any;
        cracker: Cracker;
        requestedQty: number;
      }[] = [];

      let subtotal = 0;
      const verifiedItems: {
        crackerId: string;
        name: string;
        price: number;
        originalPrice?: number;
        itemCode?: string;
        piecesContent?: string;
        quantity: number;
      }[] = [];

      for (const itemReq of data.items) {
        if (!itemReq.crackerId || itemReq.quantity <= 0) {
          throw new Error('Invalid cart item quantity');
        }

        const crackerRef = doc(db, 'crackers', itemReq.crackerId);
        const crackerDoc = await transaction.get(crackerRef);

        if (!crackerDoc.exists()) {
          throw new Error('One or more items in your cart could not be found');
        }

        const cracker = { id: crackerDoc.id, ...(crackerDoc.data() as any) } as Cracker;

        if (!cracker.isAvailable) {
          throw new Error(`"${cracker.name}" is currently out of stock`);
        }

        // Verify stock sufficiency
        const currentStock = Number(cracker.quantity) || 0;
        if (currentStock < itemReq.quantity) {
          throw new Error(
            `Insufficient stock for "${cracker.name}". Available: ${currentStock}, Requested: ${itemReq.quantity}`
          );
        }

        crackerReads.push({
          crackerRef,
          cracker,
          requestedQty: itemReq.quantity,
        });

        subtotal += cracker.price * itemReq.quantity;
        verifiedItems.push({
          crackerId: cracker.id,
          name: cracker.name,
          price: cracker.price,
          originalPrice: cracker.originalPrice,
          itemCode: cracker.itemCode,
          piecesContent: cracker.piecesContent,
          quantity: itemReq.quantity,
        });
      }

      // Calculate totals
      const discountPercentage = Math.max(0, Number(settings.discountPercentage) || 0);
      const discountAmount = Math.round((subtotal * discountPercentage) / 100);
      const grandTotal = Math.max(0, subtotal - discountAmount);

      // 2. Transaction Write Phase: Deduct inventory atomically
      for (const { crackerRef, cracker, requestedQty } of crackerReads) {
        const remainingStock = Math.max(0, (Number(cracker.quantity) || 0) - requestedQty);
        transaction.update(crackerRef, {
          quantity: remainingStock,
          isAvailable: cracker.isAvailable,
          updatedAt: now,
        });
      }

      // 3. Transaction Write Phase: Save order atomically
      const orderRef = doc(db, 'orders', orderId);
      const orderData: Order = {
        id: orderId,
        orderNumber,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
        referredBy: data.referredBy?.trim() ? data.referredBy.trim() : undefined,
        subtotal,
        discountPercentage,
        discountAmount,
        total: grandTotal,
        status: 'ORDERED',
        items: verifiedItems,
        createdAt: now,
        updatedAt: now,
      };

      transaction.set(orderRef, sanitizeFirestoreData(orderData));
      return orderData;
    });

    return { success: true, order: createdOrder };
  } catch (err: any) {
    console.error('ACID createOrder error:', err);
    return { success: false, error: err.message || 'Failed to place order' };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extraDiscount?: {
    type?: 'flat' | 'percentage';
    value?: number;
    amount?: number;
    finalTotal?: number;
  },
  options?: {
    paymentType?: 'SETTLED' | 'CREDIT';
    branch?: 'BRANCH_1' | 'BRANCH_2';
  }
): Promise<Order | null> {
  try {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) return null;

      const order = { id: orderDoc.id, ...(orderDoc.data() as any) } as Order;
      const now = new Date().toISOString();
      order.status = status;
      order.updatedAt = now;

      if (options?.paymentType) {
        order.paymentType = options.paymentType;
        if (options.paymentType === 'SETTLED') {
          order.settledAt = now;
        }
      }

      if (options?.branch) {
        order.branch = options.branch;
      }

      if (extraDiscount && typeof extraDiscount.finalTotal === 'number') {
        if (order.originalTotal === undefined) {
          order.originalTotal = order.total;
        }
        order.extraDiscountType = extraDiscount.type;
        order.extraDiscountValue = extraDiscount.value;
        order.extraDiscountAmount = extraDiscount.amount;
        order.total = Math.max(0, Math.round(extraDiscount.finalTotal));
      } else if (status === 'ORDERED' && order.originalTotal !== undefined) {
        order.total = order.originalTotal;
        delete order.extraDiscountType;
        delete order.extraDiscountValue;
        delete order.extraDiscountAmount;
      }

      transaction.set(orderRef, sanitizeFirestoreData(order), { merge: true });
      return order;
    });
  } catch (err) {
    console.error('ACID updateOrderStatus error:', err);
    throw err;
  }
}

export async function updateOrderItems(
  orderId: string,
  updatedItems: Order['items']
): Promise<Order | null> {
  try {
    const now = new Date().toISOString();

    const result = await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) throw new Error('Order not found');

      const order = { id: orderDoc.id, ...(orderDoc.data() as any) } as Order;
      if (order.status === 'CANCELLED') {
        throw new Error('Cannot edit items of a cancelled order');
      }

      // Map previous quantities by crackerId
      const prevQuantities = new Map<string, number>();
      for (const it of order.items || []) {
        if (it.crackerId) {
          prevQuantities.set(it.crackerId, (prevQuantities.get(it.crackerId) || 0) + Number(it.quantity || 0));
        }
      }

      // Map new quantities by crackerId
      const newQuantities = new Map<string, number>();
      for (const it of updatedItems || []) {
        if (it.crackerId) {
          newQuantities.set(it.crackerId, (newQuantities.get(it.crackerId) || 0) + Number(it.quantity || 0));
        }
      }

      // Identify all affected cracker IDs
      const allCrackerIds = new Set([...Array.from(prevQuantities.keys()), ...Array.from(newQuantities.keys())]);

      // Transaction Read Phase: Read all affected crackers
      const crackerUpdates: { ref: any; newStock: number }[] = [];

      for (const cId of Array.from(allCrackerIds)) {
        const prevQty = prevQuantities.get(cId) || 0;
        const newQty = newQuantities.get(cId) || 0;
        const delta = newQty - prevQty; // Positive: customer wants more; Negative: customer wants less

        if (delta !== 0) {
          const crackerRef = doc(db, 'crackers', cId);
          const crackerDoc = await transaction.get(crackerRef);
          if (crackerDoc.exists()) {
            const currentStock = Number(crackerDoc.data().quantity) || 0;
            if (delta > 0 && currentStock < delta) {
              throw new Error(
                `Insufficient stock for "${crackerDoc.data().name}". Available additional: ${currentStock}, Requested: ${delta}`
              );
            }
            const updatedStock = Math.max(0, currentStock - delta);
            crackerUpdates.push({ ref: crackerRef, newStock: updatedStock });
          }
        }
      }

      // Recalculate order financials
      let newSubtotal = 0;
      for (const it of updatedItems) {
        newSubtotal += Number(it.price || 0) * Number(it.quantity || 0);
      }

      const discountPercentage = Math.max(0, Number(order.discountPercentage) || 0);
      const discountAmount = Math.round((newSubtotal * discountPercentage) / 100);
      let newTotal = Math.max(0, newSubtotal - discountAmount);

      // Reapply extra counter discount if present
      if (order.extraDiscountType === 'percentage' && order.extraDiscountValue) {
        const extraAmt = Math.round((newTotal * order.extraDiscountValue) / 100);
        order.extraDiscountAmount = extraAmt;
        newTotal = Math.max(0, newTotal - extraAmt);
      } else if (order.extraDiscountType === 'flat' && order.extraDiscountValue) {
        order.extraDiscountAmount = order.extraDiscountValue;
        newTotal = Math.max(0, newTotal - order.extraDiscountValue);
      }

      // Transaction Write Phase: Apply cracker stock adjustments
      for (const { ref, newStock } of crackerUpdates) {
        transaction.update(ref, { quantity: newStock, updatedAt: now });
      }

      // Transaction Write Phase: Update order document
      order.items = updatedItems;
      order.subtotal = newSubtotal;
      order.discountAmount = discountAmount;
      order.total = newTotal;
      order.updatedAt = now;

      transaction.update(orderRef, sanitizeFirestoreData({
        items: updatedItems,
        subtotal: newSubtotal,
        discountAmount,
        total: newTotal,
        extraDiscountAmount: order.extraDiscountAmount,
        updatedAt: now,
      }));

      return order;
    });

    return result;
  } catch (err: any) {
    console.error('ACID updateOrderItems error:', err);
    throw err;
  }
}

export async function settleOrderCredit(orderId: string): Promise<Order | null> {
  try {
    return await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists()) return null;

      const order = { id: orderDoc.id, ...(orderDoc.data() as any) } as Order;
      const now = new Date().toISOString();

      order.paymentType = 'SETTLED';
      order.settledAt = now;
      order.updatedAt = now;

      transaction.set(orderRef, sanitizeFirestoreData(order), { merge: true });
      return order;
    });
  } catch (err) {
    console.error('ACID settleOrderCredit error:', err);
    throw err;
  }
}

/**
 * ACID Transactional Order Cancellation:
 * Atomicity: Order cancellation and inventory restoration occur together in a single transaction;
 *            if anything fails, the entire transaction rolls back.
 * Consistency: Product stock counts cannot become negative, and cancelled orders retain their snapshot.
 * Isolation: Firestore transaction locks documents, preventing concurrent races or double cancellations.
 * Durability: Changes are committed and persisted across Firestore nodes before returning.
 */
export async function cancelOrder(
  orderId: string,
  cancelReason?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await transaction.get(orderRef);

      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }

      const orderData = orderDoc.data() as Order;

      if (orderData.status === 'CANCELLED') {
        throw new Error('Order is already cancelled');
      }

      // Read phase: Fetch all cracker documents inside transaction
      const crackerReads: { crackerRef: any; currentQuantity: number; addQuantity: number }[] = [];
      const items = orderData.items || [];

      for (const item of items) {
        if (item.crackerId && item.quantity > 0) {
          const crackerRef = doc(db, 'crackers', item.crackerId);
          const crackerDoc = await transaction.get(crackerRef);
          if (crackerDoc.exists()) {
            const currentQuantity = Number(crackerDoc.data().quantity) || 0;
            crackerReads.push({
              crackerRef,
              currentQuantity,
              addQuantity: Number(item.quantity) || 0,
            });
          }
        }
      }

      // Write phase: Restore cracker stock atomically
      const now = new Date().toISOString();
      for (const { crackerRef, currentQuantity, addQuantity } of crackerReads) {
        transaction.update(crackerRef, {
          quantity: currentQuantity + addQuantity,
          updatedAt: now,
        });
      }

      // Update order status to CANCELLED
      const updatedOrder: Order = {
        ...orderData,
        id: orderDoc.id,
        status: 'CANCELLED',
        cancelledAt: now,
        cancelReason: cancelReason?.trim() || 'Cancelled by Admin',
        updatedAt: now,
      };

      transaction.update(orderRef, sanitizeFirestoreData({
        status: 'CANCELLED',
        cancelledAt: now,
        cancelReason: cancelReason?.trim() || 'Cancelled by Admin',
        updatedAt: now,
      }));

      return updatedOrder;
    });

    return { success: true, order: result };
  } catch (err: any) {
    console.error('ACID cancelOrder error:', err);
    return { success: false, error: err.message || 'Failed to cancel order' };
  }
}

