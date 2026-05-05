/**
 * TipL Design System — Design Tokens
 * Derived from Stitch UI mockups.
 * All visual constants are centralized here.
 */

export const Colors = {
  // Primary palette
  primary: '#C4A265',
  primaryDark: '#A8884D',
  primaryLight: '#D4B87A',
  primaryGradientStart: '#D4AF37',
  primaryGradientEnd: '#C4A265',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#FAFAF7',
  cream: '#F5F5F0',
  lightGray: '#F0F0EB',
  midGray: '#E0E0DB',
  gray: '#B0B0A8',
  darkGray: '#6B6B6B',
  charcoal: '#3A3A3A',
  nearBlack: '#1A1A1A',
  black: '#000000',

  // Semantic
  success: '#34C759',
  successLight: '#E8F9EE',
  warning: '#FF9500',
  warningLight: '#FFF4E5',
  error: '#FF3B30',
  errorLight: '#FFEBE9',
  info: '#007AFF',
  infoLight: '#E5F1FF',

  // Dark mode (chat)
  darkBg: '#1A1A1A',
  darkCard: '#2A2A2A',
  darkCardLight: '#333333',
  darkBorder: '#3A3A3A',
  darkTextPrimary: '#F5F5F5',
  darkTextSecondary: '#999999',

  // Glass
  glassBg: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassShadow: 'rgba(0, 0, 0, 0.08)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.15)',
} as const;

export const Typography = {
  // Serif — for hero text and headlines
  serif: {
    fontFamily: 'PlayfairDisplay',
  },
  serifBold: {
    fontFamily: 'PlayfairDisplay-Bold',
  },

  // Sans — for body and UI
  regular: {
    fontFamily: 'Inter-Regular',
  },
  medium: {
    fontFamily: 'Inter-Medium',
  },
  semiBold: {
    fontFamily: 'Inter-SemiBold',
  },
  bold: {
    fontFamily: 'Inter-Bold',
  },

  // Scale
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    hero: 48,
  },

  lineHeights: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  glow: {
    shadowColor: '#C4A265',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// Escrow order status enum — matches Midtrans + TipL flow
export enum OrderStatus {
  PENDING = 'pending',
  OFFER_ACCEPTED = 'offer_accepted',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  ITEM_PURCHASED = 'item_purchased',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

// Item categories matching the Stitch "What I can bring back" chips
export const ITEM_CATEGORIES = [
  { id: 'luxury', label: 'Luxury Goods', icon: 'diamond-outline' },
  { id: 'skincare', label: 'Skincare', icon: 'leaf-outline' },
  { id: 'food', label: 'Food & Beverages', icon: 'restaurant-outline' },
  { id: 'electronics', label: 'Electronics', icon: 'hardware-chip-outline' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt-outline' },
  { id: 'toys', label: 'Toys & Games', icon: 'game-controller-outline' },
  { id: 'books', label: 'Books', icon: 'book-outline' },
  { id: 'other', label: 'Other', icon: 'grid-outline' },
] as const;
