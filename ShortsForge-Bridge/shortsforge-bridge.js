/**
 * ShortsForge Bridge
 *
 * Drop this file into your ShortsForge desktop app and call the exported
 * functions whenever the state of a short changes. The bridge syncs
 * everything to Firebase so your mobile app sees it in real time.
 *
 * Setup:
 *   1. npm install firebase   (in your ShortsForge project)
 *   2. Copy your Firebase config below (same project as the mobile app)
 *   3. Call bridge.connect(userEmail, userPassword) on startup
 *   4. Call bridge.updateShort(...) whenever a short changes
 */

const { initializeApp, getApps } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} = require('firebase/firestore');
const { getDatabase, ref, set, onDisconnect } = require('firebase/database');

// ─── CONFIGURE THIS ────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  databaseURL: 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
// ───────────────────────────────────────────────────────────────────────────────

let _app;
let _auth;
let _db;
let _rtdb;
let _userId = null;

function getApp() {
  if (!_app) {
    _app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    _rtdb = getDatabase(_app);
  }
  return { auth: _auth, db: _db, rtdb: _rtdb };
}

/**
 * Connect to Firebase and mark the desktop as online.
 * Call this once when ShortsForge starts up.
 */
async function connect(email, password) {
  const { auth, rtdb } = getApp();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  _userId = cred.user.uid;

  const statusRef = ref(rtdb, `status/${_userId}`);
  await set(statusRef, {
    online: true,
    lastSeen: Date.now(),
    version: '1.0',
  });

  // Automatically set offline when connection drops
  onDisconnect(statusRef).set({
    online: false,
    lastSeen: Date.now(),
  });

  console.log('[ShortsForge Bridge] Connected. User:', _userId);
  return _userId;
}

/**
 * Disconnect and mark desktop offline.
 * Call this when ShortsForge is closing.
 */
async function disconnect() {
  if (!_userId) return;
  const { rtdb } = getApp();
  const statusRef = ref(rtdb, `status/${_userId}`);
  await set(statusRef, { online: false, lastSeen: Date.now() });
  _userId = null;
}

/**
 * Create or update a short's sync record.
 *
 * @param {object} short
 * @param {string} short.id           - Unique ID (e.g. UUID or filename)
 * @param {string} short.title        - Human-readable title
 * @param {'youtube'|'tiktok'|'instagram'|'all'} short.platform
 * @param {'idle'|'processing'|'rendering'|'exporting'|'done'|'error'} short.status
 * @param {number} short.progress     - 0–100
 * @param {number} short.duration     - seconds
 * @param {string} [short.thumbnailUrl]
 * @param {string} [short.outputUrl]
 * @param {string} [short.errorMessage]
 */
async function updateShort(short) {
  if (!_userId) {
    console.warn('[ShortsForge Bridge] Not connected. Call connect() first.');
    return;
  }

  const { db, rtdb } = getApp();
  const now = serverTimestamp();

  await setDoc(
    doc(_db, 'users', _userId, 'shorts', short.id),
    {
      title: short.title,
      platform: short.platform ?? 'all',
      status: short.status,
      progress: short.progress ?? 0,
      duration: short.duration ?? 0,
      thumbnailUrl: short.thumbnailUrl ?? null,
      outputUrl: short.outputUrl ?? null,
      errorMessage: short.errorMessage ?? null,
      updatedAt: now,
      createdAt: now, // Firestore ignores this on update (setDoc with merge)
    },
    { merge: true }
  );

  // Also update the desktop status with current project name
  const statusRef = ref(rtdb, `status/${_userId}`);
  await set(statusRef, {
    online: true,
    lastSeen: Date.now(),
    currentProject: short.status !== 'done' && short.status !== 'error'
      ? short.title
      : null,
    version: '1.0',
  });
}

module.exports = { connect, disconnect, updateShort };
