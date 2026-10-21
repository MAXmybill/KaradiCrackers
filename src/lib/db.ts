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
  items: { crackerId: string; quantity: number }[];
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  // Fetch live current crackers and store settings directly from Firestore
  const [crackers, settings] = await Promise.all([getCrackers(false), getStoreSettings()]);
  const now = new Date().toISOString();

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
    const cracker = crackers.find((c) => c.id === itemReq.crackerId);
    if (!cracker) {
      return { success: false, error: 'One or more items in your cart could not be found.' };
    }
    if (!cracker.isAvailable) {
      return { success: false, error: `"${cracker.name}" is currently out of stock.` };
    }
    if (itemReq.quantity <= 0) {
      return { success: false, error: `Invalid quantity for "${cracker.name}".` };
    }
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

  const discountPercentage = Math.max(0, Number(settings.discountPercentage) || 0);
  const discountAmount = Math.round((subtotal * discountPercentage) / 100);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Update product inventory in Firestore
  for (const it of verifiedItems) {
    const cracker = crackers.find((c) => c.id === it.crackerId);
    if (cracker) {
      const newQty = Math.max(0, cracker.quantity - it.quantity);
      await updateCracker(cracker.id, {
        quantity: newQty,
        isAvailable: cracker.isAvailable,
      });
    }
  }

  const orders = await getOrders();
  const currentYear = new Date().getFullYear();
  const orderSequence = String(orders.length + 1).padStart(4, '0');
  const orderNumber = `KC-${currentYear}-${orderSequence}`;
  const orderId = `ord-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const order: Order = {
    id: orderId,
    orderNumber,
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    subtotal,
    discountPercentage,
    discountAmount,
    total: grandTotal,
    status: 'ORDERED',
    items: verifiedItems,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'orders', orderId), sanitizeFirestoreData(order));
  return { success: true, order };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  extraDiscount?: {
    type?: 'flat' | 'percentage';
    value?: number;
    amount?: number;
    finalTotal?: number;
  }
): Promise<Order | null> {
  const orderDoc = await getDoc(doc(db, 'orders', orderId));
  if (!orderDoc.exists()) return null;

  const order = { id: orderDoc.id, ...(orderDoc.data() as any) } as Order;
  const now = new Date().toISOString();
  order.status = status;
  order.updatedAt = now;

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

  await setDoc(doc(db, 'orders', orderId), sanitizeFirestoreData(order), { merge: true });
  return order;
}
