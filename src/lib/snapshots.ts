import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  type Unsubscribe,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db, ROOM_ID } from './firebase';

export interface Snapshot {
  id: string;
  code: string;
  name: string;
  language: string;
  fileName: string | null;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export function subscribeToSnapshots(
  callback: (snapshots: Snapshot[]) => void,
): Unsubscribe {
  const snapshotsRef = collection(db, 'rooms', ROOM_ID, 'snapshots');
  const q = query(snapshotsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const now = Timestamp.now();
    const snapshots = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Snapshot)
      .filter((s) => s.expiresAt.toMillis() > now.toMillis());
    callback(snapshots);
  });
}

export async function saveSnapshot(data: {
  code: string;
  name: string;
  language: string;
  fileName: string | null;
}): Promise<string> {
  // Ensure room document exists
  await setDoc(
    doc(db, 'rooms', ROOM_ID),
    { createdAt: Timestamp.now() },
    { merge: true },
  );

  const snapshotsRef = collection(db, 'rooms', ROOM_ID, 'snapshots');
  const createdAt = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    createdAt.toMillis() + 24 * 60 * 60 * 1000,
  );
  const docRef = await addDoc(snapshotsRef, {
    ...data,
    createdAt,
    expiresAt,
  });
  return docRef.id;
}
