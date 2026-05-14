// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

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
      },
      emailRedirectTo: Linking.createURL('/(tabs)'),
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

// ── CHAT ──────────────────────────────────────

/**
 * Find or create a 1-on-1 chat room between two users.
 * Delegates to the Postgres function create_or_get_chat_room which is atomic.
 * orderId is optional — pass it when chatting about a specific order.
 */
export async function getOrCreateChatRoom(currentUserId, otherUserId, orderId = null) {
  const { data, error } = await supabase.rpc('create_or_get_chat_room', {
    p_user1_id: currentUserId,
    p_user2_id: otherUserId,
    p_order_id: orderId,
  });
  if (error) throw error;
  return data; // uuid of the chat room
}