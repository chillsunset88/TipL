// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;
console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.EXPO_PUBLIC_SUPABASE_KEY ? 'ADA' : 'KOSONG');
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,      
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── AUTH ──────────────────────────────────────
export async function registerWithEmail(email, password, name, phone) {
  // 1. Lempar name (dan phone) ke metadata Supabase Auth
  const { data, error: signUpError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        name: name,
        phone: phone || null,
      }
    }
  });
  
  if (signUpError) throw signUpError;


  return data;
}

export async function loginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe(); // return unsubscribe
}

// ── USER PROFILE ──────────────────────────────
export async function getUserProfile(uid) {
  const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(uid, fields) {
  const { error } = await supabase.from('users').update(fields).eq('id', uid);
  if (error) throw error;
}