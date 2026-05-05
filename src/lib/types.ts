/**
 * TipL — Domain Type Definitions
 * Core interfaces for the Jastip escrow platform.
 */

import { OrderStatus } from './constants';

// ─── User ───────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  phone: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  createdAt: number;
  bio?: string;
}

// ─── Trip ───────────────────────────────────────────────────────────
export interface TripStop {
  city: string;
  country: string;
  arrivalDate: string; // ISO date
  departureDate?: string;
}

export interface Trip {
  id: string;
  travelerId: string;
  travelerName: string;
  travelerAvatar: string | null;
  travelerRating: number;
  travelerVerified: boolean;
  origin: string;
  destination: string;
  departDate: string; // ISO date
  returnDate: string; // ISO date
  itinerary: TripStop[];
  categories: string[]; // from ITEM_CATEGORIES ids
  description?: string;
  maxWeight?: number; // kg
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  createdAt: number;
  imageUrl?: string; // destination cover image
}

// ─── Jastip Request ─────────────────────────────────────────────────
export interface JastipRequest {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string | null;
  tripId?: string; // linked trip, if any
  travelerId?: string; // assigned traveler
  itemName: string;
  itemBrand?: string;
  itemDescription: string;
  imageUrls: string[];
  category: string;
  quantity: number;
  estimatedPrice: number;
  currency: string; // e.g. 'JPY', 'USD'
  maxBudget: number; // in IDR
  notes?: string;
  status: 'open' | 'matched' | 'in_progress' | 'fulfilled' | 'cancelled';
  createdAt: number;
}

// ─── Order (Escrow Transaction) ─────────────────────────────────────
export interface TimelineEvent {
  status: OrderStatus;
  label: string;
  timestamp: number | null; // null = not yet reached
  description?: string;
}

export interface PaymentSummary {
  itemPrice: number;
  travelerFee: number;
  platformFee: number;
  totalAmount: number;
  currency: string; // 'IDR'
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. 'JPT-0024'
  requestId: string;
  tripId: string;
  travelerId: string;
  travelerName: string;
  buyerId: string;
  buyerName: string;
  itemName: string;
  itemDescription: string;
  itemImageUrl: string | null;
  quantity: number;
  status: OrderStatus;
  timeline: TimelineEvent[];
  paymentSummary: PaymentSummary;
  midtransToken?: string;
  midtransRedirectUrl?: string;
  proofOfPurchaseUrls: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── Chat ───────────────────────────────────────────────────────────
export interface ProductCard {
  name: string;
  imageUrl: string;
  price: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  text?: string;
  imageUrl?: string;
  productCard?: ProductCard;
  timestamp: number;
  read: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantAvatars: Record<string, string | null>;
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount: Record<string, number>;
  orderId?: string;
  createdAt: number;
}

// ─── Navigation Params ──────────────────────────────────────────────
export type RootStackParamList = {
  '(tabs)': undefined;
  'trip/[id]': { id: string };
  'order/[id]': { id: string };
  'chat/[id]': { id: string };
  'payment/midtrans': { token: string; orderId: string };
  'auth/login': undefined;
  'auth/register': undefined;
};
