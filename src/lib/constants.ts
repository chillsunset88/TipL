/**
 * TipL Design System — Elegant Gold Edition
 * Luxury travel marketplace. Gold (#C5A267) · Cream (#F9F7F2) · Charcoal (#2C2C2C)
 */

export const Colors = {
  // ── Brand — warm luxury gold ──────────────────────────────────────────
  primary: '#C5A267',             // warm gold (main accent)
  primaryDark: '#A8893E',         // deep gold (pressed / dark gradient end)
  primaryLight: '#D4B87D',        // soft gold (light gradient start)
  primaryPale: '#F5EDD9',         // pale gold (badge bg, tinted surface)
  primaryGradientStart: '#D4B87D',
  primaryGradientEnd: '#A8893E',

  // ── Secondary — charcoal dark accent ─────────────────────────────────
  secondary: '#2C2C2C',           // charcoal
  secondaryLight: '#F0EBE1',      // cream (pale secondary bg)

  // ── Neutrals — warm ivory scale ──────────────────────────────────────
  white: '#FFFFFF',
  offWhite: '#F9F7F2',            // main page background (cream)
  cream: '#F0EBE1',               // card / input background
  lightGray: '#E2DDD6',           // dividers, borders (warm)
  midGray: '#C4BCAD',             // inactive elements
  gray: '#8E8E8E',                // placeholders, subtle labels
  darkGray: '#5C5850',            // secondary body text
  charcoal: '#3D3730',            // primary body text
  nearBlack: '#2C2C2C',           // headings, primary text
  black: '#000000',

  // ── Semantic ─────────────────────────────────────────────────────────
  success: '#4E9E6C',
  successLight: '#E6F5EE',
  warning: '#C5A267',             // gold doubles as warning (same family)
  warningLight: '#F5EDD9',
  error: '#B03030',
  errorLight: '#FDEDEB',
  info: '#5B8DB8',
  infoLight: '#EBF2F9',

  // ── Dark surfaces (chat, overlays) ───────────────────────────────────
  darkBg: '#181310',
  darkCard: '#2C2520',
  darkCardLight: '#3D3328',
  darkBorder: '#4D4039',
  darkTextPrimary: '#F9F7F2',
  darkTextSecondary: '#8E8E8E',

  // ── Glass ─────────────────────────────────────────────────────────────
  glassBg: 'rgba(249,247,242,0.92)',
  glassBorder: 'rgba(197,162,103,0.25)',

  // ── Overlays ──────────────────────────────────────────────────────────
  overlay: 'rgba(28,20,12,0.55)',
  overlayLight: 'rgba(28,20,12,0.2)',

  // ── Status chips ──────────────────────────────────────────────────────
  statusPending: '#F5EDD9',
  statusPendingText: '#7A6030',
  statusActive: '#E6F5EE',
  statusActiveText: '#2D7A50',
  statusDone: '#EBF2F9',
  statusDoneText: '#2A5E8A',
  statusDanger: '#FDEDEB',
  statusDangerText: '#8A2A1E',
} as const;

export const Typography = {
  serif: { fontFamily: 'PlayfairDisplay' },
  serifBold: { fontFamily: 'PlayfairDisplay-Bold' },
  regular: { fontFamily: 'Inter-Regular' },
  medium: { fontFamily: 'Inter-Medium' },
  semiBold: { fontFamily: 'Inter-SemiBold' },
  bold: { fontFamily: 'Inter-Bold' },
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
  lineHeights: { tight: 1.15, normal: 1.4, relaxed: 1.6 },
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24,
  '2xl': 32, '3xl': 40, '4xl': 48, '5xl': 64,
} as const;

export const BorderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#1C140C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1C140C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1C140C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#C5A267',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  card: {
    shadowColor: '#1C140C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  OFFER_ACCEPTED = 'accepted',
  IN_ESCROW = 'in_escrow',
  PAYMENT_CONFIRMED = 'in_escrow',
  PURCHASED = 'purchased',
  ITEM_PURCHASED = 'purchased',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export const ITEM_CATEGORIES = [
  { id: 'luxury',      label: 'Luxury Goods',     icon: 'diamond-outline',         color: '#A78BFA' },
  { id: 'skincare',    label: 'Skincare',          icon: 'leaf-outline',            color: '#34D399' },
  { id: 'food',        label: 'Food & Beverages',  icon: 'restaurant-outline',      color: '#F97316' },
  { id: 'electronics', label: 'Electronics',       icon: 'hardware-chip-outline',   color: '#60A5FA' },
  { id: 'fashion',     label: 'Fashion',           icon: 'shirt-outline',           color: '#F472B6' },
  { id: 'toys',        label: 'Toys & Games',      icon: 'game-controller-outline', color: '#FBBF24' },
  { id: 'books',       label: 'Books',             icon: 'book-outline',            color: '#6EE7B7' },
  { id: 'other',       label: 'Other',             icon: 'grid-outline',            color: '#94A3B8' },
] as const;

export const CATEGORY_MAP = Object.fromEntries(
  ITEM_CATEGORIES.map((c) => [c.id, c])
) as Record<string, { id: string; label: string; icon: string; color: string }>;

export const CURRENCIES = ['IDR', 'USD', 'JPY', 'EUR', 'KRW', 'SGD', 'MYR', 'AUD', 'GBP'] as const;
export type Currency = typeof CURRENCIES[number];

export const MIDTRANS_SNAP_URL = process.env.EXPO_PUBLIC_MIDTRANS_SNAP_URL ?? 'https://app.sandbox.midtrans.com/snap/v2/vtweb/';
