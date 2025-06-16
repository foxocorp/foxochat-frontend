import { Logger } from "@utils/logger";
import {
	APIAttachment,
	APIMessage,
	APIUser,
	ChannelFlags,
	ChannelType,
	UserStatus,
} from "foxochat.js";

export interface CachedChat {
	id: number;
	name: string;
	display_name: string;
	icon?: APIAttachment | undefined;
	last_message?: APIMessage;
	created_at: number;
	type: ChannelType;
	flags: ChannelFlags;
	member_count: number;
	owner: APIUser;
}

export interface CachedUser {
	id: number;
	username: string;
	display_name: string;
	avatar?: APIAttachment;
	created_at: number;
	status: UserStatus;
	status_updated_at: number;
	flags: number;
	type: number;
	[key: string]: any;
}

/*
const DB_NAME = 'foxogram_meta';
const DB_VERSION = 2;
const CHATS_STORE = 'chats';
const USERS_STORE = 'users';
const META_STORE = 'meta';

interface CacheMeta {
  version: number;
  lastSync: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(CHATS_STORE)) {
        db.createObjectStore(CHATS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        db.createObjectStore(USERS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
    };
  });
}

async function getCacheMeta(): Promise<CacheMeta> {
  const db = await openDB();
  const tx = db.transaction(META_STORE, 'readonly');
  const store = tx.objectStore(META_STORE);
  const request = store.get('meta');

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const meta = request.result || { version: DB_VERSION, lastSync: 0 };
      resolve(meta);
    };
    request.onerror = () => reject(request.error);
  });
}

async function updateCacheMeta(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(META_STORE, 'readwrite');
  const store = tx.objectStore(META_STORE);
  const meta: CacheMeta & { id: string } = {
    id: 'meta',
    version: DB_VERSION,
    lastSync: Date.now()
  };

  return new Promise((resolve, reject) => {
    store.put(meta);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearCache(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([CHATS_STORE, USERS_STORE, META_STORE], 'readwrite');

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    tx.objectStore(CHATS_STORE).clear();
    tx.objectStore(USERS_STORE).clear();
    tx.objectStore(META_STORE).clear();
  });
}

export async function saveChatsToCache(chats: CachedChat[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(CHATS_STORE, 'readwrite');
  const store = tx.objectStore(CHATS_STORE);

  const existingChats = await new Promise<CachedChat[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const existingIds = new Set(existingChats.map(chat => chat.id));
  const newIds = new Set(chats.map(chat => chat.id));

  for (const chat of chats) {
    store.put(chat);
  }

  for (const id of existingIds) {
    if (!newIds.has(id)) {
      store.delete(id);
    }
  }

  await updateCacheMeta();

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadChatsFromCache(): Promise<CachedChat[]> {
  try {
    const meta = await getCacheMeta();

    if (meta.version !== DB_VERSION) {
      await clearCache();
      return [];
    }

    const db = await openDB();
    const tx = db.transaction(CHATS_STORE, 'readonly');
    const store = tx.objectStore(CHATS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    Logger.error(`Failed to load chats from cache: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

export async function saveUsersToCache(users: CachedUser[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(USERS_STORE, 'readwrite');
  const store = tx.objectStore(USERS_STORE);

  const existingUsers = await new Promise<CachedUser[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const existingIds = new Set(existingUsers.map(user => user.id));
  const newIds = new Set(users.map(user => user.id));

  for (const user of users) {
    store.put(user);
  }

  for (const id of existingIds) {
    if (!newIds.has(id)) {
      store.delete(id);
    }
  }

  await updateCacheMeta();

  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadUsersFromCache(): Promise<CachedUser[]> {
  try {
    const meta = await getCacheMeta();

    if (meta.version !== DB_VERSION) {
      await clearCache();
      return [];
    }

    const db = await openDB();
    const tx = db.transaction(USERS_STORE, 'readonly');
    const store = tx.objectStore(USERS_STORE);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    Logger.error(`Failed to load users from cache: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
*/

export function clearCache(): Promise<void> {
	return Promise.resolve();
}

export function saveChatsToCache(chats: CachedChat[]): Promise<void> {
	return Promise.resolve();
}

export function loadChatsFromCache(): Promise<CachedChat[]> {
	return Promise.resolve([]);
}

export function saveUsersToCache(users: CachedUser[]): Promise<void> {
	return Promise.resolve();
}

export function loadUsersFromCache(): Promise<CachedUser[]> {
	return Promise.resolve([]);
}
