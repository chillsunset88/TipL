// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  PhoneAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ─────────────────────────────────────────────
// CONFIG
// Ganti dengan nilai dari Firebase Console
// Project Settings → General → Your apps → SDK setup
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Hindari inisialisasi ulang saat hot reload (Expo)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─────────────────────────────────────────────
// AUTH — EMAIL & PASSWORD
// ─────────────────────────────────────────────

/**
 * Register user baru dengan email + password.
 * Otomatis membuat dokumen di Firestore users/{uid}.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} name     - Nama lengkap user
 * @param {string} phone    - No HP format +628xxx (disimpan di profil)
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function registerWithEmail(email, password, name, phone) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const uid = credential.user.uid;

  // Buat dokumen user di Firestore
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    phone,           // Disimpan di profil, belum terverifikasi
    is_triper: false,
    phone_verified: false,
    rating: 0,
    total_trips: 0,
    expo_push_token: null,
    created_at: serverTimestamp(),
  });

  return credential;
}

/**
 * Login dengan email + password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout user yang sedang login.
 */
export async function logout() {
  return signOut(auth);
}

/**
 * Subscribe ke perubahan status auth.
 * Panggil di root app (misalnya di _layout.jsx).
 *
 * @param {function} callback - Dipanggil dengan user object atau null
 * @returns {function} unsubscribe
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────
// PHONE AUTH — VERIFIKASI NO HP

/**
 * Kirim OTP ke nomor HP.
 * Membutuhkan reCAPTCHA verifier — gunakan expo-firebase-recaptcha atau
 * FirebaseRecaptchaVerifierModal dari 'expo-firebase-recaptcha'.
 *
 * Contoh pemanggilan di screen:
 *   const verificationId = await sendPhoneOTP('+628123456789', recaptchaVerifier.current);
 *
 * @param {string} phoneNumber  - Format E.164: +628xxx
 * @param {object} recaptchaVerifier - Instance dari FirebaseRecaptchaVerifierModal
 * @returns {Promise<string>} verificationId
 */
export async function sendPhoneOTP(phoneNumber, recaptchaVerifier) {
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(
    phoneNumber,
    recaptchaVerifier
  );
  return verificationId;
}

/**
 * Verifikasi OTP dan link nomor HP ke akun email yang sudah login.
 * Setelah berhasil, update phone_verified = true di Firestore.
 *
 * @param {string} verificationId - Dari sendPhoneOTP()
 * @param {string} otpCode        - Kode 6 digit dari SMS
 * @returns {Promise<void>}
 */
export async function verifyPhoneOTP(verificationId, otpCode) {
  const phoneCredential = PhoneAuthProvider.credential(verificationId, otpCode);

  // Link kredensial HP ke akun email yang sedang aktif
  await linkWithCredential(auth.currentUser, phoneCredential);

  // Update status di Firestore
  const uid = auth.currentUser.uid;
  await updateDoc(doc(db, 'users', uid), {
    phone_verified: true,
  });
}

// ─────────────────────────────────────────────
// USER FIRESTORE HELPERS
// ─────────────────────────────────────────────

/**
 * Ambil data profil user dari Firestore.
 *
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid, ...snap.data() } : null;
}

/**
 * Update field tertentu di profil user.
 * Contoh: updateUserProfile(uid, { is_triper: true })
 *
 * @param {string} uid
 * @param {object} fields
 * @returns {Promise<void>}
 */
export async function updateUserProfile(uid, fields) {
  return updateDoc(doc(db, 'users', uid), fields);
}

/**
 * Simpan/update expo_push_token ke Firestore.
 * Panggil ini setiap kali app dibuka (token bisa berubah).
 *
 * @param {string} uid
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function savePushToken(uid, token) {
  return updateDoc(doc(db, 'users', uid), {
    expo_push_token: token,
  });
}