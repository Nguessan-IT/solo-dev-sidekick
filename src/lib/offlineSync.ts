/**
 * Offline Sync Queue — stores pending actions in IndexedDB 
 * and replays them when connectivity is restored.
 */

const DB_NAME = "factdigit_offline";
const STORE_NAME = "sync_queue";
const DB_VERSION = 1;

interface SyncAction {
  id: string;
  table: string;
  method: "insert" | "update" | "delete";
  payload: Record<string, any>;
  created_at: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueAction(action: Omit<SyncAction, "id" | "created_at">) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add({
    ...action,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  });
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingActions(): Promise<SyncAction[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function removeAction(id: string) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function replayQueue(
  executor: (action: SyncAction) => Promise<boolean>
) {
  const actions = await getPendingActions();
  for (const action of actions) {
    try {
      const success = await executor(action);
      if (success) await removeAction(action.id);
    } catch {
      // Stop on first failure — will retry later
      break;
    }
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

/** Register sync listeners */
export function initOfflineSync(
  executor: (action: SyncAction) => Promise<boolean>
) {
  window.addEventListener("online", () => {
    console.log("[OfflineSync] Back online — replaying queue...");
    replayQueue(executor);
  });

  // Replay on init if online
  if (isOnline()) {
    replayQueue(executor);
  }
}
