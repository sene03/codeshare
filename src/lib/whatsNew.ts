import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface WhatsNewEntry {
  id: string;
  title: string;
  message: string;
  version: string | null;
  createdAt: Timestamp;
}

const STORAGE_KEY = 'whatsNewSeenId';

const SEED_ENTRY = {
  title: 'Welcome to CodeShare!',
  message:
    'You can now share code snippets instantly.\nTry creating your first snapshot.',
  version: null,
  createdAt: Timestamp.fromDate(new Date('2026-01-01')),
};

export async function fetchLatestWhatsNew(): Promise<WhatsNewEntry | null> {
  const ref = collection(db, 'whats_new');
  const q = query(ref, orderBy('createdAt', 'desc'), limit(1));
  const snap = await getDocs(q);

  // Auto-create a seed document if the collection is empty
  if (snap.empty) {
    const docRef = await addDoc(ref, SEED_ENTRY);
    return { id: docRef.id, ...SEED_ENTRY };
  }

  const docSnap = snap.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as WhatsNewEntry;
}

export function getSeenWhatsNewId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function markWhatsNewAsSeen(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}
