/**
 * TipL — Internationalization System
 * Supports English (default) and Bahasa Indonesia.
 * Language preference persisted via settingsStore.
 */

export type Locale = 'en' | 'id';

export interface Translations {
  // Home screen
  searchPlaceholder: string;
  checkPoints: string;
  newVouchers: string;
  crewLevel: string;
  trendingDestinations: string;
  upcomingJourneys: string;
  filter: string;
  explore: string;
  origin: string;
  destination: string;
  requestItem: string;

  // Navigation
  home: string;
  order: string;
  chats: string;
  profile: string;

  // Settings
  settings: string;
  account: string;
  editProfile: string;
  paymentMethods: string;
  verification: string;
  verified: string;
  notifications: string;
  pushNotifications: string;
  orderUpdates: string;
  chatMessages: string;
  support: string;
  helpSupport: string;
  termsPrivacy: string;
  aboutApp: string;
  signOut: string;
  signOutConfirm: string;
  cancel: string;
  language: string;
  languageLabel: string;

  // Points / Wallet
  points: string;
  balance: string;
  vouchers: string;

  // Search
  recentSearches: string;
  clearAll: string;
  noSearchHistory: string;

  // Jastip Products
  jastipProducts: string;
  viewAll: string;

  // General
  nearestStore: string;

  // Create Trip
  createTrip: string;
  tripOrigin: string;
  tripDestination: string;
  selectCountry: string;
  searchCountry: string;
  departureDate: string;
  returnDate: string;
  capacityKg: string;
  priceRange: string;
  priceMin: string;
  priceMax: string;
  currency: string;
  tripNotes: string;
  tripNotesPlaceholder: string;
  addProduct: string;
  productName: string;
  productCategory: string;
  productPhoto: string;
  addPhoto: string;
  changePhoto: string;
  removeProduct: string;
  submitTrip: string;
  tripCreated: string;
  tripCreatedMsg: string;
  validationRequired: string;
  validationPriceOrder: string;
  validationDateOrder: string;
  validationMinOneDay: string;
  validationCapacity: string;
}

const en: Translations = {
  // Home
  searchPlaceholder: 'Search products, items, brands...',
  checkPoints: 'Check Points',
  newVouchers: 'New Vouchers',
  crewLevel: 'Crew',
  trendingDestinations: 'Trending Destinations',
  upcomingJourneys: 'Upcoming Journeys',
  filter: 'Filter',
  explore: 'Explore',
  origin: 'ORIGIN',
  destination: 'DESTINATION',
  requestItem: 'Request Item',

  // Navigation
  home: 'Home',
  order: 'Order',
  chats: 'Chats',
  profile: 'Profile',

  // Settings
  settings: 'Settings',
  account: 'ACCOUNT',
  editProfile: 'Edit Profile',
  paymentMethods: 'Payment Methods',
  verification: 'Verification',
  verified: 'Verified',
  notifications: 'NOTIFICATIONS',
  pushNotifications: 'Push Notifications',
  orderUpdates: 'Order Updates',
  chatMessages: 'Chat Messages',
  support: 'SUPPORT',
  helpSupport: 'Help & Support',
  termsPrivacy: 'Terms & Privacy',
  aboutApp: 'About TipL',
  signOut: 'Sign Out',
  signOutConfirm: 'Are you sure you want to sign out?',
  cancel: 'Cancel',
  language: 'LANGUAGE',
  languageLabel: 'Language',

  // Points / Wallet
  points: 'Points',
  balance: 'Balance',
  vouchers: 'Vouchers',

  // Search
  recentSearches: 'Recent Searches',
  clearAll: 'Clear All',
  noSearchHistory: 'No search history yet',

  // Jastip Products
  jastipProducts: 'Jastip Products',
  viewAll: 'View All',

  // General
  nearestStore: 'Nearest Store',

  // Create Trip
  createTrip: 'Create Trip',
  tripOrigin: 'Origin Country',
  tripDestination: 'Destination Country',
  selectCountry: 'Select Country',
  searchCountry: 'Search country...',
  departureDate: 'Departure Date',
  returnDate: 'Return Date',
  capacityKg: 'Capacity (kg)',
  priceRange: 'Price Range',
  priceMin: 'Min Price',
  priceMax: 'Max Price',
  currency: 'Currency',
  tripNotes: 'Notes',
  tripNotesPlaceholder: 'What items can you bring? Any conditions?',
  addProduct: 'Add Product',
  productName: 'Product Name',
  productCategory: 'Category',
  productPhoto: 'Product Photo',
  addPhoto: 'Add Photo',
  changePhoto: 'Change Photo',
  removeProduct: 'Remove',
  submitTrip: 'Publish Trip',
  tripCreated: 'Trip Published!',
  tripCreatedMsg: 'Your trip is now visible to buyers.',
  validationRequired: 'Please fill all required fields.',
  validationPriceOrder: 'Min price must be less than max price.',
  validationDateOrder: 'Departure must be before return date.',
  validationMinOneDay: 'Trip must be at least 1 day.',
  validationCapacity: 'Capacity must be greater than 0.',
};

const id: Translations = {
  // Home
  searchPlaceholder: 'Cari produk, barang, merek...',
  checkPoints: 'Cek Poin',
  newVouchers: 'Voucher Baru',
  crewLevel: 'Crew',
  trendingDestinations: 'Destinasi Trending',
  upcomingJourneys: 'Perjalanan Mendatang',
  filter: 'Filter',
  explore: 'Jelajahi',
  origin: 'ASAL',
  destination: 'TUJUAN',
  requestItem: 'Minta Barang',

  // Navigation
  home: 'Beranda',
  order: 'Pesanan',
  chats: 'Obrolan',
  profile: 'Profil',

  // Settings
  settings: 'Pengaturan',
  account: 'AKUN',
  editProfile: 'Edit Profil',
  paymentMethods: 'Metode Pembayaran',
  verification: 'Verifikasi',
  verified: 'Terverifikasi',
  notifications: 'NOTIFIKASI',
  pushNotifications: 'Notifikasi Push',
  orderUpdates: 'Update Pesanan',
  chatMessages: 'Pesan Chat',
  support: 'BANTUAN',
  helpSupport: 'Bantuan & Dukungan',
  termsPrivacy: 'Syarat & Privasi',
  aboutApp: 'Tentang TipL',
  signOut: 'Keluar',
  signOutConfirm: 'Apakah Anda yakin ingin keluar?',
  cancel: 'Batal',
  language: 'BAHASA',
  languageLabel: 'Bahasa',

  // Points / Wallet
  points: 'Poin',
  balance: 'Saldo',
  vouchers: 'Voucher',

  // Search
  recentSearches: 'Pencarian Terakhir',
  clearAll: 'Hapus Semua',
  noSearchHistory: 'Belum ada riwayat pencarian',

  // Jastip Products
  jastipProducts: 'Produk Jastip',
  viewAll: 'Lihat Semua',

  // General
  nearestStore: 'Toko Terdekat',

  // Create Trip
  createTrip: 'Buat Perjalanan',
  tripOrigin: 'Negara Asal',
  tripDestination: 'Negara Tujuan',
  selectCountry: 'Pilih Negara',
  searchCountry: 'Cari negara...',
  departureDate: 'Tanggal Berangkat',
  returnDate: 'Tanggal Kembali',
  capacityKg: 'Kapasitas (kg)',
  priceRange: 'Rentang Harga',
  priceMin: 'Harga Min',
  priceMax: 'Harga Maks',
  currency: 'Mata Uang',
  tripNotes: 'Catatan',
  tripNotesPlaceholder: 'Barang apa yang bisa kamu bawa? Ada syarat tertentu?',
  addProduct: 'Tambah Produk',
  productName: 'Nama Produk',
  productCategory: 'Kategori',
  productPhoto: 'Foto Produk',
  addPhoto: 'Tambah Foto',
  changePhoto: 'Ganti Foto',
  removeProduct: 'Hapus',
  submitTrip: 'Publikasi Perjalanan',
  tripCreated: 'Perjalanan Dipublikasikan!',
  tripCreatedMsg: 'Perjalananmu kini terlihat oleh pembeli.',
  validationRequired: 'Harap isi semua kolom yang wajib diisi.',
  validationPriceOrder: 'Harga min harus lebih kecil dari harga maks.',
  validationDateOrder: 'Tanggal berangkat harus sebelum tanggal kembali.',
  validationMinOneDay: 'Perjalanan minimal 1 hari.',
  validationCapacity: 'Kapasitas harus lebih dari 0.',
};

const translations: Record<Locale, Translations> = { en, id };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
