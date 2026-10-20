import { Cracker, Order, OrderStatus, StoreSettings } from '@/types';
import { INITIAL_CRACKERS } from './seedData';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Local storage fallback cache/persistence file
const DB_FILE_PATH = path.join(process.cwd(), 'data-store.json');

const DEFAULT_SETTINGS: StoreSettings = {
  showPricing: true,
  discountPercentage: 20, // default 20% discount as requested
};

interface DataStore {
  crackers: Cracker[];
  orders: Order[];
  settings?: StoreSettings;
}

function loadLocalStore(): DataStore {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.settings) {
        parsed.settings = { ...DEFAULT_SETTINGS };
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading local data store:', err);
  }

  // Initial default seed
  const now = new Date().toISOString();
  const crackers: Cracker[] = INITIAL_CRACKERS.map((c) => ({
    ...c,
    createdAt: now,
    updatedAt: now,
  }));
  const store: DataStore = { crackers, orders: [], settings: { ...DEFAULT_SETTINGS } };
  saveLocalStore(store);
  return store;
}

function saveLocalStore(store: DataStore) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local data store:', err);
  }
}

// -------------------------------------------------------------
// STORE SETTINGS REPOSITORY
// -------------------------------------------------------------

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, 'settings', 'store');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...(snap.data() as StoreSettings) };
    }
  } catch (err) {
    console.warn('Firestore getStoreSettings error, using fallback:', err);
  }

  const store = loadLocalStore();
  return store.settings || { ...DEFAULT_SETTINGS };
}

export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();
  const now = new Date().toISOString();
  const updated: StoreSettings = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  const store = loadLocalStore();
  store.settings = updated;
  saveLocalStore(store);

  try {
    await setDoc(doc(db, 'settings', 'store'), updated, { merge: true });
  } catch (err) {
    console.warn('Firestore setStoreSettings error:', err);
  }

  return updated;
}

// -------------------------------------------------------------
// CRACKERS REPOSITORY
// -------------------------------------------------------------

export async function getCrackers(availableOnly = false): Promise<Cracker[]> {
  try {
    const colRef = collection(db, 'crackers');
    let q = query(colRef);
    if (availableOnly) {
      q = query(colRef, where('isAvailable', '==', true));
    }
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
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

      // Update local storage cache with live Firestore records
      const store = loadLocalStore();
      store.crackers = items;
      saveLocalStore(store);

      return items;
    }
  } catch (error) {
    console.warn('Firestore fetch failed, using local persistent fallback:', error);
  }

  // Fallback to local store only if Firestore is completely unreachable
  const store = loadLocalStore();
  return availableOnly
    ? store.crackers.filter((c) => c.isAvailable)
    : store.crackers;
}

export async function getCrackerById(id: string): Promise<Cracker | null> {
  try {
    const docRef = doc(db, 'crackers', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...(snap.data() as any) };
    }
  } catch (error) {
    console.warn('Firestore getCrackerById error, using fallback:', error);
  }
  const store = loadLocalStore();
  return store.crackers.find((c) => c.id === id) || null;
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

  try {
    await setDoc(doc(db, 'crackers', id), newCracker);
  } catch (err) {
    console.warn('Firestore set cracker error:', err);
  }

  const store = loadLocalStore();
  store.crackers.unshift(newCracker);
  saveLocalStore(store);

  return newCracker;
}

export async function updateCracker(id: string, updates: Partial<Cracker>): Promise<Cracker | null> {
  const now = new Date().toISOString();
  let current: Cracker | null = null;

  try {
    const docRef = doc(db, 'crackers', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      current = { id: snap.id, ...(snap.data() as any) };
    }
  } catch (err) {
    console.warn('Firestore fetch before update warning:', err);
  }

  if (!current) {
    const store = loadLocalStore();
    current = store.crackers.find((c) => c.id === id) || null;
  }
  if (!current) return null;

  const updated: Cracker = {
    ...current,
    ...updates,
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

  // 1. Update in Firestore
  try {
    await setDoc(doc(db, 'crackers', id), updated, { merge: true });
  } catch (err) {
    console.warn('Firestore update cracker error:', err);
  }

  // 2. Synchronize local store
  const store = loadLocalStore();
  const idx = store.crackers.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.crackers[idx] = updated;
  } else {
    store.crackers.push(updated);
  }
  saveLocalStore(store);

  return updated;
}

export async function deleteCracker(id: string): Promise<boolean> {
  // 1. Delete from Firestore
  try {
    await deleteDoc(doc(db, 'crackers', id));
  } catch (err) {
    console.warn('Firestore delete cracker error:', err);
  }

  // 2. Delete from local cache
  const store = loadLocalStore();
  store.crackers = store.crackers.filter((c) => c.id !== id);
  saveLocalStore(store);

  return true;
}

export async function bulkUpdateCrackerPrices(
  percentage: number,
  type: 'increase' | 'decrease',
  selectedCategories?: string[]
): Promise<{ count: number; crackers: Cracker[] }> {
  const store = loadLocalStore();
  const now = new Date().toISOString();
  const factor = type === 'increase' ? 1 + percentage / 100 : Math.max(0.01, 1 - percentage / 100);

  const categorySet = selectedCategories && selectedCategories.length > 0 
    ? new Set(selectedCategories.map((c) => c.trim().toUpperCase())) 
    : null;

  let updatedCount = 0;
  const updatedCrackers = store.crackers.map((c) => {
    const crackerCat = (c.category || '').trim().toUpperCase();
    const shouldUpdate = !categorySet || categorySet.has(crackerCat);

    if (shouldUpdate) {
      let newPrice = Math.round(c.price * factor);
      if (newPrice < 1) newPrice = 1;
      updatedCount++;

      return {
        ...c,
        price: newPrice, // Update ONLY selling price
        updatedAt: now,
      };
    }

    return c;
  });

  store.crackers = updatedCrackers;
  saveLocalStore(store);

  try {
    const { writeBatch } = await import('firebase/firestore');
    let batch = writeBatch(db);
    let count = 0;
    for (const c of updatedCrackers) {
      const crackerCat = (c.category || '').trim().toUpperCase();
      const shouldUpdate = !categorySet || categorySet.has(crackerCat);
      if (shouldUpdate) {
        batch.update(doc(db, 'crackers', c.id), {
          price: c.price,
          updatedAt: now,
        });
        count++;
        if (count % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
    }
    if (count % 400 !== 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore bulk price update error:', err);
  }

  return { count: updatedCount, crackers: updatedCrackers };
}

// -------------------------------------------------------------
// ORDERS REPOSITORY
// -------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  try {
    const colRef = collection(db, 'orders');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const orders: Order[] = [];
      snapshot.forEach((d) => {
        orders.push({ id: d.id, ...(d.data() as any) });
      });
      return orders;
    }
  } catch (error) {
    console.warn('Firestore getOrders error, using fallback:', error);
  }

  const store = loadLocalStore();
  return store.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const colRef = collection(db, 'orders');
    const q = query(colRef, where('orderNumber', '==', orderNumber.trim()));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0];
      return { id: docData.id, ...(docData.data() as any) };
    }
  } catch (error) {
    console.warn('Firestore getOrderByNumber error, using fallback:', error);
  }

  const store = loadLocalStore();
  return store.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase().trim()) || null;
}

export async function createOrder(data: {
  customerName: string;
  customerPhone: string;
  items: { crackerId: string; quantity: number }[];
}): Promise<{ success: boolean; order?: Order; error?: string }> {
  // Fetch current crackers and settings
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

  // Record item sales
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

  try {
    await setDoc(doc(db, 'orders', orderId), order);
  } catch (err) {
    console.warn('Firestore createOrder setDoc error:', err);
  }

  const store = loadLocalStore();
  store.orders.unshift(order);
  saveLocalStore(store);

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
  const store = loadLocalStore();
  const order = store.orders.find((o) => o.id === orderId) || (await getOrders()).find((o) => o.id === orderId);
  if (!order) return null;

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

  const idx = store.orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    store.orders[idx] = order;
    saveLocalStore(store);
  }

  try {
    await setDoc(doc(db, 'orders', orderId), order, { merge: true });
  } catch (err) {
    console.warn('Firestore update order status error:', err);
  }

  return order;
}
