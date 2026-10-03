import { Cracker, Order, OrderStatus } from '@/types';
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

interface DataStore {
  crackers: Cracker[];
  orders: Order[];
}

function loadLocalStore(): DataStore {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
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
  const store: DataStore = { crackers, orders: [] };
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
      const results: Cracker[] = [];
      snapshot.forEach((d) => {
        results.push({ id: d.id, ...(d.data() as any) });
      });
      return results;
    } else {
      // If Firestore collection is empty, seed it with the default crackers!
      const store = loadLocalStore();
      for (const cracker of store.crackers) {
        await setDoc(doc(db, 'crackers', cracker.id), cracker).catch(() => {});
      }
      return availableOnly
        ? store.crackers.filter((c) => c.isAvailable)
        : store.crackers;
    }
  } catch (error) {
    console.warn('Firestore fetch failed, using local persistent fallback:', error);
    const store = loadLocalStore();
    if (availableOnly) {
      return store.crackers.filter((c) => c.isAvailable);
    }
    return store.crackers;
  }
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
    quantity: Number(data.quantity),
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
  const store = loadLocalStore();
  const idx = store.crackers.findIndex((c) => c.id === id);

  let current = idx !== -1 ? store.crackers[idx] : null;
  if (!current) {
    current = await getCrackerById(id);
  }
  if (!current) return null;

  const updated: Cracker = {
    ...current,
    ...updates,
    price: updates.price !== undefined ? Number(updates.price) : current.price,
    quantity: updates.quantity !== undefined ? Number(updates.quantity) : current.quantity,
    isAvailable: updates.isAvailable !== undefined ? Boolean(updates.isAvailable) : current.isAvailable,
    updatedAt: now,
  };

  if (updated.quantity < 0) {
    updated.quantity = 0;
  }

  if (idx !== -1) {
    store.crackers[idx] = updated;
    saveLocalStore(store);
  }

  try {
    await updateDoc(doc(db, 'crackers', id), updated as any);
  } catch (err) {
    // If updateDoc fails (e.g. Doc doesn't exist yet in firestore), use setDoc
    try {
      await setDoc(doc(db, 'crackers', id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update cracker error:', e);
    }
  }

  return updated;
}

export async function deleteCracker(id: string): Promise<boolean> {
  const store = loadLocalStore();
  store.crackers = store.crackers.filter((c) => c.id !== id);
  saveLocalStore(store);

  try {
    await deleteDoc(doc(db, 'crackers', id));
  } catch (err) {
    console.warn('Firestore delete cracker error:', err);
  }

  return true;
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
  // Fetch current crackers
  const crackers = await getCrackers(false);
  const now = new Date().toISOString();

  let grandTotal = 0;
  const verifiedItems: { crackerId: string; name: string; price: number; quantity: number }[] = [];

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
    grandTotal += cracker.price * itemReq.quantity;
    verifiedItems.push({
      crackerId: cracker.id,
      name: cracker.name,
      price: cracker.price,
      quantity: itemReq.quantity,
    });
  }

  // Record item sales while keeping available until admin turns off
  for (const it of verifiedItems) {
    const cracker = crackers.find((c) => c.id === it.crackerId);
    if (cracker) {
      const newQty = Math.max(0, cracker.quantity - it.quantity);
      await updateCracker(cracker.id, {
        quantity: newQty,
        // Keep available ON until explicitly toggled off by admin
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
    total: grandTotal,
    status: 'PENDING',
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

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
  const store = loadLocalStore();
  const order = store.orders.find((o) => o.id === orderId) || (await getOrders()).find((o) => o.id === orderId);
  if (!order) return null;

  const oldStatus = order.status;

  // Stock restoration if cancelled
  if (oldStatus !== 'CANCELLED' && status === 'CANCELLED') {
    for (const item of order.items) {
      if (item.crackerId) {
        const cracker = await getCrackerById(item.crackerId);
        if (cracker) {
          await updateCracker(cracker.id, {
            quantity: cracker.quantity + item.quantity,
            isAvailable: true,
          });
        }
      }
    }
  }

  // Deduct again if restored from cancelled
  if (oldStatus === 'CANCELLED' && status !== 'CANCELLED') {
    for (const item of order.items) {
      if (item.crackerId) {
        const cracker = await getCrackerById(item.crackerId);
        if (cracker) {
          const newQty = Math.max(0, cracker.quantity - item.quantity);
          await updateCracker(cracker.id, {
            quantity: newQty,
            isAvailable: newQty > 0,
          });
        }
      }
    }
  }

  const now = new Date().toISOString();
  order.status = status;
  order.updatedAt = now;

  const idx = store.orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    store.orders[idx] = order;
    saveLocalStore(store);
  }

  try {
    await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: now });
  } catch (err) {
    try {
      await setDoc(doc(db, 'orders', orderId), order, { merge: true });
    } catch (e) {
      console.warn('Firestore update order status error:', e);
    }
  }

  return order;
}
