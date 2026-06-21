import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, onValue, off } from 'firebase/database';
import { db, rtdb } from './firebase';

export type ProjectStatus =
  | 'idle'
  | 'processing'
  | 'rendering'
  | 'exporting'
  | 'done'
  | 'error';

export interface Short {
  id: string;
  title: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'all';
  status: ProjectStatus;
  progress: number; // 0–100
  duration: number; // seconds
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnailUrl?: string;
  outputUrl?: string;
  errorMessage?: string;
}

export interface DesktopStatus {
  online: boolean;
  lastSeen: number;
  currentProject?: string;
  version?: string;
}

// Subscribe to all shorts for a user, ordered by most recent
export function subscribeToShorts(
  userId: string,
  onUpdate: (shorts: Short[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(
    collection(db, 'users', userId, 'shorts'),
    orderBy('updatedAt', 'desc')
  );

  const unsub = onSnapshot(
    q,
    (snap) => {
      const shorts: Short[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Short, 'id'>),
      }));
      onUpdate(shorts);
    },
    onError
  );

  return unsub;
}

// Subscribe to desktop online/offline status via Realtime DB
export function subscribeToDesktopStatus(
  userId: string,
  onUpdate: (status: DesktopStatus) => void
): () => void {
  const statusRef = ref(rtdb, `status/${userId}`);

  onValue(statusRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.val() as DesktopStatus);
    } else {
      onUpdate({ online: false, lastSeen: 0 });
    }
  });

  return () => off(statusRef);
}

// Acknowledge / mark a completed short as seen
export async function markShortsAsSeen(userId: string, shortId: string) {
  await updateDoc(doc(db, 'users', userId, 'shorts', shortId), {
    seenOnMobile: true,
  });
}
