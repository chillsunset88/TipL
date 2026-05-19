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
  trips: string;
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
  fingerprintLock: string;
  faceIdLock: string;
  biometricLock: string;
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
  allCategories: string;
  noItemsAvailable: string;

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

  // Common UI
  save: string;
  delete: string;
  edit: string;
  confirm: string;
  ok: string;
  done: string;
  close: string;
  back: string;
  next: string;
  retry: string;
  loading: string;
  error: string;
  success: string;
  add: string;
  remove: string;
  change: string;
  submit: string;

  // Product Detail
  travelerJastiper: string;
  howItWorks: string;
  howStep1: string;
  howStep2: string;
  howStep3: string;
  addedToCart: string;
  addedToCartMsg: string;
  orderNow: string;
  productNotFound: string;
  escrowProtected: string;
  verifiedTraveler: string;
  stockLabel: string;
  weightLabel: string;
  descriptionLabel: string;

  // Cart
  cart: string;
  emptyCart: string;
  emptyCartDesc: string;
  exploreProducts: string;
  editCart: string;
  buyNow: string;
  subtotal: string;
  serviceFee: string;
  total: string;
  deleteConfirmTitle: string;
  deleteConfirmMsg: string;
  selectItemsFirst: string;
  loginRequired: string;
  loginRequiredDesc: string;
  signIn: string;
  signUp: string;

  // Checkout / Address
  selectAddress: string;
  proceedPayment: string;
  addNewAddress: string;
  noAddresses: string;
  addAddressFirst: string;
  myAddresses: string;
  addAddress: string;
  saveAddress: string;
  setAsDefault: string;
  defaultAddress: string;
  deleteAddressTitle: string;
  addressLabel: string;
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;

  // Notifications
  noNotifications: string;
  noNotificationsDesc: string;
  markAllRead: string;

  // Chat
  typeMessage: string;
  failedSend: string;
  failedSendImage: string;
  online: string;
  searchConversations: string;
  noConversations: string;
  noConversationsDesc: string;
  loginToViewMessages: string;
  imageMessage: string;

  // Profile
  myOrders: string;
  myTrips: string;
  myWishlist: string;
  myFavorites: string;
  wallet: string;
  shareProfile: string;
  editProfileTitle: string;
  noOrders: string;
  noOrdersDesc: string;
  noTrips: string;
  noTripsDesc: string;

  // Verification
  verifyNow: string;
  pendingReview: string;
  rejected: string;
  verifiedStatus: string;

  // Auth - Login
  welcomeBack: string;
  signInToContinue: string;
  forgotPassword: string;
  or: string;
  dontHaveAccount: string;
  tagline: string;
  emailRequired: string;
  invalidEmail: string;
  passwordRequired: string;
  minSixChars: string;
  emailNotFoundError: string;
  incorrectPassword: string;
  loginFailed: string;

  // Auth - Register
  createAccount: string;
  joinCommunity: string;
  fullName: string;
  fullNamePlaceholder: string;
  emailPlaceholder: string;
  minEightCharsPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  agreeWith: string;
  termsConditions: string;
  and: string;
  privacyPolicy: string;
  registerNow: string;
  alreadyHaveAccount: string;
  fullNameRequired: string;
  emailRequiredReg: string;
  invalidEmailReg: string;
  passwordRequiredReg: string;
  minEightChars: string;
  passwordsMismatch: string;
  agreeToTerms: string;
  accountCreated: string;
  accountCreatedMsg: string;
  registerFailed: string;
  tryAgainShort: string;

  // Search
  searchingProducts: string;
  productsFound: string;
  noProductsFound: string;
  tryDifferentKeyword: string;
  searchForProducts: string;
  findUniqueItems: string;

  // Trips tab
  destinationCountries: string;
  noActiveJastipers: string;
  becomeFirstJastiper: string;
  viewTrip: string;
  viewCatalog: string;
  manage: string;
  activeTrips: string;
  cities: string;
  departingOn: string;

  // Trip detail
  yourTraveler: string;
  travelersNotes: string;
  availableProducts: string;
  addProductToTrip: string;
  requestItemFromTrip: string;
  tripNotFound: string;
  deleteTrip: string;
  deleteTripConfirm: string;
  deleteTripFailed: string;
  itemsMax: string;
  tripsCompleted: string;

  // Triper profile
  profileNotFound: string;
  followTriper: string;
  following: string;
  noReviews: string;
  triperNoProducts: string;
  priceTbd: string;
  tripsStatLabel: string;
  productsStatLabel: string;
  reviewsStatLabel: string;
  activeTripsSectionTitle: string;
  productsSectionTitle: string;

  // Order detail statuses
  statusWaiting: string;
  statusWaitingDesc: string;
  statusOfferAccepted: string;
  statusOfferAcceptedDesc: string;
  statusInEscrow: string;
  statusInEscrowDesc: string;
  statusItemPurchased: string;
  statusItemPurchasedDesc: string;
  statusInTransit: string;
  statusInTransitDesc: string;
  statusDelivered: string;
  statusDeliveredDesc: string;
  statusCompleted: string;
  statusCompletedDesc: string;
  statusCancelled: string;
  statusCancelledDesc: string;
  statusDisputed: string;
  statusDisputedDesc: string;
  // Tripper-perspective status labels
  triperStatusPending: string;
  triperStatusPendingDesc: string;
  triperStatusAccepted: string;
  triperStatusAcceptedDesc: string;
  triperStatusInEscrow: string;
  triperStatusInEscrowDesc: string;
  triperStatusPurchased: string;
  triperStatusPurchasedDesc: string;
  triperStatusShipped: string;
  triperStatusShippedDesc: string;
  triperStatusDelivered: string;
  triperStatusDeliveredDesc: string;
  orderNotFound: string;
  viewOnly: string;
  confirmDelivery: string;
  confirmDeliveryMsg: string;
  confirmAndRelease: string;
  paymentReleased: string;
  paymentReleasedMsg: string;
  fileDispute: string;
  fileDisputeMsg: string;
  disputeFiled: string;
  disputeFiledMsg: string;
  orderIdCopied: string;
  orderIdCopiedMsg: string;
  summaryCopied: string;
  summaryCopiedMsg: string;
  currentStatus: string;
  fundsInEscrowBadge: string;
  paymentSummary: string;
  participants: string;
  itemPrice: string;
  buyer: string;
  traveler: string;
  payNow: string;
  confirmReceipt: string;
  acceptOrder: string;
  markAsShipped: string;
  orderTracking: string;
  orderCompletedMsg: string;
  orderCancelledMsg: string;
  disputeFiledStatus: string;
  priceNotSet: string;

  // Review & Rating
  leaveReview: string;
  rateYourExperience: string;
  submitReview: string;
  reviewSubmitted: string;
  reviewThankYou: string;
  writeComment: string;
  alreadyReviewed: string;
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
  trips: 'Trips',
  chats: 'Chats',
  profile: 'Profile',

  // Settings
  settings: 'Settings',
  account: 'ACCOUNT',
  editProfile: 'Edit Profile',
  paymentMethods: 'Payment Methods',
  verification: 'Verification',
  verified: 'Verified',
  notifications: 'Notifications',
  pushNotifications: 'Push Notifications',
  orderUpdates: 'Order Updates',
  chatMessages: 'Chat Messages',
  support: 'SUPPORT',
  helpSupport: 'Help & Support',
  termsPrivacy: 'Terms & Privacy',
  aboutApp: 'About TipL',
  fingerprintLock: 'Fingerprint Lock',
  faceIdLock: 'Face ID Lock',
  biometricLock: 'Biometric Lock',
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
  allCategories: 'All',
  noItemsAvailable: 'No items available yet',

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

  // Common UI
  save: 'Save',
  delete: 'Delete',
  edit: 'Edit',
  confirm: 'Confirm',
  ok: 'OK',
  done: 'Done',
  close: 'Close',
  back: 'Back',
  next: 'Next',
  retry: 'Try Again',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  add: 'Add',
  remove: 'Remove',
  change: 'Change',
  submit: 'Submit',

  // Product Detail
  travelerJastiper: 'Traveler / Jastiper',
  howItWorks: 'How Jastip Works',
  howStep1: 'Place your order & pay securely into escrow',
  howStep2: 'Traveler purchases and ships your item',
  howStep3: 'Confirm delivery to release payment',
  addedToCart: 'Added to Cart',
  addedToCartMsg: 'has been added to your cart.',
  orderNow: 'Order Now',
  productNotFound: 'Product not found',
  escrowProtected: 'Escrow Protected',
  verifiedTraveler: 'Verified Traveler',
  stockLabel: 'Stock',
  weightLabel: 'Weight',
  descriptionLabel: 'Description',

  // Cart
  cart: 'Cart',
  emptyCart: 'Cart is empty',
  emptyCartDesc: 'Discover unique products from travelers',
  exploreProducts: 'Explore Products',
  editCart: 'Edit',
  buyNow: 'Buy Now',
  subtotal: 'Subtotal',
  serviceFee: 'Service fee',
  total: 'Total',
  deleteConfirmTitle: 'Delete Items',
  deleteConfirmMsg: 'items from cart?',
  selectItemsFirst: 'Select items',
  loginRequired: 'Login Required',
  loginRequiredDesc: 'Please sign in to continue checkout.',
  signIn: 'Sign In',
  signUp: 'Sign Up',

  // Checkout / Address
  selectAddress: 'Select Address',
  proceedPayment: 'Proceed to Payment',
  addNewAddress: 'Add New Address',
  noAddresses: 'No addresses yet',
  addAddressFirst: 'Add Address',
  myAddresses: 'My Addresses',
  addAddress: 'Add Address',
  saveAddress: 'Save Address',
  setAsDefault: 'Set as Default',
  defaultAddress: 'Default',
  deleteAddressTitle: 'Delete Address',
  addressLabel: 'Label (e.g. Home, Office)',
  recipientName: 'Recipient Name',
  phoneNumber: 'Phone Number',
  fullAddress: 'Full Address',
  city: 'City',
  province: 'Province',
  postalCode: 'Postal Code',

  // Notifications
  noNotifications: 'No notifications yet',
  noNotificationsDesc: "We'll notify you about orders, messages, and more.",
  markAllRead: 'Mark all read',

  // Chat
  typeMessage: 'Type a message...',
  failedSend: 'Failed to send message',
  failedSendImage: 'Failed to send image',
  online: 'Online',
  searchConversations: 'Search conversations...',
  noConversations: 'No conversations yet',
  noConversationsDesc: 'Start chatting with travelers from trip or product pages.',
  loginToViewMessages: 'Sign in to view messages',
  imageMessage: '📷 Image',

  // Profile
  myOrders: 'My Orders',
  myTrips: 'My Trips',
  myWishlist: 'Wishlist',
  myFavorites: 'Favorites',
  wallet: 'Wallet',
  shareProfile: 'Share Profile',
  editProfileTitle: 'Edit Profile',
  noOrders: 'No orders yet',
  noOrdersDesc: 'Your orders will appear here once placed.',
  noTrips: 'No trips yet',
  noTripsDesc: 'Create your first trip and start accepting jastip orders.',

  // Verification
  verifyNow: 'Verify Now',
  pendingReview: 'Pending Review',
  rejected: 'Rejected',
  verifiedStatus: 'Verified',

  // Auth - Login
  welcomeBack: 'Welcome back',
  signInToContinue: 'Sign in to continue',
  forgotPassword: 'Forgot password?',
  or: 'or',
  dontHaveAccount: "Don't have an account?",
  tagline: 'Your trusted jastip companion',
  emailRequired: 'Email is required',
  invalidEmail: 'Invalid email format',
  passwordRequired: 'Password is required',
  minSixChars: 'Minimum 6 characters',
  emailNotFoundError: 'Email not found or incorrect',
  incorrectPassword: 'Incorrect password',
  loginFailed: 'Login failed. Please try again.',

  // Auth - Register
  createAccount: 'Create Account',
  joinCommunity: 'Join the trusted jastip community',
  fullName: 'Full Name',
  fullNamePlaceholder: 'Your full name',
  emailPlaceholder: 'you@example.com',
  minEightCharsPlaceholder: 'Min. 8 characters',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Repeat password',
  agreeWith: 'I agree to the ',
  termsConditions: 'Terms & Conditions',
  and: ' and ',
  privacyPolicy: 'Privacy Policy',
  registerNow: 'Register Now',
  alreadyHaveAccount: 'Already have an account?',
  fullNameRequired: 'Full name is required',
  emailRequiredReg: 'Email is required',
  invalidEmailReg: 'Invalid email format',
  passwordRequiredReg: 'Password is required',
  minEightChars: 'Minimum 8 characters',
  passwordsMismatch: 'Passwords do not match',
  agreeToTerms: 'Please agree to the terms & conditions',
  accountCreated: 'Account Created!',
  accountCreatedMsg: 'Check your email to verify your account, then sign in.',
  registerFailed: 'Registration Failed',
  tryAgainShort: 'Please try again.',

  // Search
  searchingProducts: 'Searching products...',
  productsFound: 'products found',
  noProductsFound: 'No products found',
  tryDifferentKeyword: 'Try a different keyword or destination',
  searchForProducts: 'Search for products',
  findUniqueItems: 'Find unique items from travelers around the world',

  // Trips tab
  destinationCountries: 'Destination Countries',
  noActiveJastipers: 'No active jastipers yet',
  becomeFirstJastiper: 'Become the First Jastiper',
  viewTrip: 'View Trip',
  viewCatalog: 'View Catalog',
  manage: 'Manage',
  activeTrips: 'active',
  cities: 'cities',
  departingOn: 'Departing',

  // Trip detail
  yourTraveler: 'Your Traveler',
  travelersNotes: "Traveler's Notes",
  availableProducts: 'Available Products',
  addProductToTrip: 'Add Product to Trip',
  requestItemFromTrip: 'Request Item from This Trip',
  tripNotFound: 'Trip not found',
  deleteTrip: 'Delete Trip',
  deleteTripConfirm: 'This trip will be permanently deleted along with all its data. Are you sure?',
  deleteTripFailed: 'Failed to delete trip. Please try again.',
  itemsMax: 'items max',
  tripsCompleted: 'trips completed',

  // Triper profile
  profileNotFound: 'Profile not found',
  followTriper: 'Follow Tripper',
  following: 'Following',
  noReviews: 'No reviews yet',
  triperNoProducts: 'Tripper has not added any products yet',
  priceTbd: 'Price not set',
  tripsStatLabel: 'Trips',
  productsStatLabel: 'Products',
  reviewsStatLabel: 'Reviews',
  activeTripsSectionTitle: 'ACTIVE TRIPS',
  productsSectionTitle: 'PRODUCTS',

  // Order detail statuses
  statusWaiting: 'Waiting for Traveler',
  statusWaitingDesc: 'Your request is pending traveler acceptance.',
  statusOfferAccepted: 'Offer Accepted',
  statusOfferAcceptedDesc: 'Traveler accepted. Please proceed to payment.',
  statusInEscrow: 'Funds in Escrow',
  statusInEscrowDesc: 'Your funds are securely held in escrow.',
  statusItemPurchased: 'Item Purchased',
  statusItemPurchasedDesc: 'Traveler has purchased your item.',
  statusInTransit: 'In Transit',
  statusInTransitDesc: 'Your item is on the way.',
  statusDelivered: 'Delivered',
  statusDeliveredDesc: 'Item delivered. Confirm to release payment.',
  statusCompleted: 'Completed',
  statusCompletedDesc: 'Transaction complete. Funds released.',
  statusCancelled: 'Cancelled',
  statusCancelledDesc: 'This order has been cancelled.',
  statusDisputed: 'Disputed',
  statusDisputedDesc: 'A dispute has been filed. Support will contact you.',
  triperStatusPending: 'New Order Request',
  triperStatusPendingDesc: 'A buyer wants you to purchase something for them.',
  triperStatusAccepted: 'Waiting for Payment',
  triperStatusAcceptedDesc: "You've accepted this order. Waiting for the buyer to pay.",
  triperStatusInEscrow: 'Funds Received — Ready to Buy',
  triperStatusInEscrowDesc: "Payment is secured in escrow. Go ahead and buy the item.",
  triperStatusPurchased: 'Item Purchased',
  triperStatusPurchasedDesc: "You've bought the item. Pack it up and ship when ready.",
  triperStatusShipped: 'Awaiting Delivery Confirmation',
  triperStatusShippedDesc: 'Item is on the way. Waiting for the buyer to confirm receipt.',
  triperStatusDelivered: 'Awaiting Buyer Confirmation',
  triperStatusDeliveredDesc: 'Item arrived. Waiting for the buyer to confirm and release funds.',
  orderNotFound: 'Order not found.',
  viewOnly: 'View only — you are not a participant in this order.',
  confirmDelivery: 'Confirm Delivery',
  confirmDeliveryMsg: 'This will release the escrow funds to the traveler. This cannot be undone.',
  confirmAndRelease: 'Confirm & Release',
  paymentReleased: 'Payment Released',
  paymentReleasedMsg: 'Funds have been released to the traveler.',
  fileDispute: 'File a Dispute',
  fileDisputeMsg: 'Describe the issue with your order.',
  disputeFiled: 'Dispute Filed',
  disputeFiledMsg: 'Our support team will contact you within 24 hours.',
  orderIdCopied: 'Copied!',
  orderIdCopiedMsg: 'Order ID copied to clipboard.',
  summaryCopied: 'Copied!',
  summaryCopiedMsg: 'Order summary copied to clipboard.',
  currentStatus: 'CURRENT STATUS',
  fundsInEscrowBadge: 'Funds in Escrow',
  paymentSummary: 'Payment Summary',
  participants: 'Participants',
  itemPrice: 'Item Price',
  buyer: 'Buyer',
  traveler: 'Traveler',
  payNow: 'Pay Now',
  confirmReceipt: 'Confirm Receipt',
  acceptOrder: 'Accept Order',
  markAsShipped: 'Mark as Shipped',
  orderTracking: 'Order Tracking',
  orderCompletedMsg: 'Order Completed',
  orderCancelledMsg: 'Order Cancelled',
  disputeFiledStatus: 'Dispute Filed — Support will contact you',
  priceNotSet: 'Price not set',

  // Review & Rating
  leaveReview: 'Leave a Review',
  rateYourExperience: 'Rate your experience with this traveler',
  submitReview: 'Submit Review',
  reviewSubmitted: 'Review Submitted!',
  reviewThankYou: 'Thank you for your feedback.',
  writeComment: 'Write a comment (optional)',
  alreadyReviewed: 'Already Reviewed',
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
  trips: 'Perjalanan',
  chats: 'Obrolan',
  profile: 'Profil',

  // Settings
  settings: 'Pengaturan',
  account: 'AKUN',
  editProfile: 'Edit Profil',
  paymentMethods: 'Metode Pembayaran',
  verification: 'Verifikasi',
  verified: 'Terverifikasi',
  notifications: 'Notifikasi',
  pushNotifications: 'Notifikasi Push',
  orderUpdates: 'Update Pesanan',
  chatMessages: 'Pesan Chat',
  support: 'BANTUAN',
  helpSupport: 'Bantuan & Dukungan',
  termsPrivacy: 'Syarat & Privasi',
  aboutApp: 'Tentang TipL',
  fingerprintLock: 'Kunci Sidik Jari',
  faceIdLock: 'Kunci Face ID',
  biometricLock: 'Kunci Biometrik',
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
  allCategories: 'Semua',
  noItemsAvailable: 'Belum ada item tersedia',

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

  // Common UI
  save: 'Simpan',
  delete: 'Hapus',
  edit: 'Ubah',
  confirm: 'Konfirmasi',
  ok: 'OK',
  done: 'Selesai',
  close: 'Tutup',
  back: 'Kembali',
  next: 'Lanjut',
  retry: 'Coba Lagi',
  loading: 'Memuat...',
  error: 'Kesalahan',
  success: 'Berhasil',
  add: 'Tambah',
  remove: 'Hapus',
  change: 'Ganti',
  submit: 'Kirim',

  // Product Detail
  travelerJastiper: 'Traveler / Jastiper',
  howItWorks: 'Cara Jastip Bekerja',
  howStep1: 'Pesan dan bayar secara aman lewat escrow',
  howStep2: 'Traveler membeli dan mengirim barangmu',
  howStep3: 'Konfirmasi pengiriman untuk melepas pembayaran',
  addedToCart: 'Ditambahkan ke Keranjang',
  addedToCartMsg: 'telah ditambahkan ke keranjangmu.',
  orderNow: 'Pesan Sekarang',
  productNotFound: 'Produk tidak ditemukan',
  escrowProtected: 'Dilindungi Escrow',
  verifiedTraveler: 'Traveler Terverifikasi',
  stockLabel: 'Stok',
  weightLabel: 'Berat',
  descriptionLabel: 'Deskripsi',

  // Cart
  cart: 'Keranjang',
  emptyCart: 'Keranjang kosong',
  emptyCartDesc: 'Temukan produk unik dari para traveler',
  exploreProducts: 'Jelajahi Produk',
  editCart: 'Ubah',
  buyNow: 'Beli sekarang',
  subtotal: 'Subtotal',
  serviceFee: 'Biaya layanan',
  total: 'Total',
  deleteConfirmTitle: 'Hapus Item',
  deleteConfirmMsg: 'item dari keranjang?',
  selectItemsFirst: 'Pilih item',
  loginRequired: 'Login Diperlukan',
  loginRequiredDesc: 'Silakan masuk untuk melanjutkan checkout.',
  signIn: 'Masuk',
  signUp: 'Daftar',

  // Checkout / Address
  selectAddress: 'Pilih Alamat',
  proceedPayment: 'Lanjutkan Pembayaran',
  addNewAddress: 'Tambah Alamat Baru',
  noAddresses: 'Belum ada alamat',
  addAddressFirst: 'Tambah Alamat',
  myAddresses: 'Alamat Saya',
  addAddress: 'Tambah Alamat',
  saveAddress: 'Simpan Alamat',
  setAsDefault: 'Jadikan Utama',
  defaultAddress: 'Utama',
  deleteAddressTitle: 'Hapus Alamat',
  addressLabel: 'Label (cth: Rumah, Kantor)',
  recipientName: 'Nama Penerima',
  phoneNumber: 'Nomor HP',
  fullAddress: 'Alamat Lengkap',
  city: 'Kota',
  province: 'Provinsi',
  postalCode: 'Kode Pos',

  // Notifications
  noNotifications: 'Belum ada notifikasi',
  noNotificationsDesc: 'Kami akan memberitahumu tentang pesanan, pesan, dan lainnya.',
  markAllRead: 'Tandai semua terbaca',

  // Chat
  typeMessage: 'Ketik pesan...',
  failedSend: 'Gagal kirim pesan',
  failedSendImage: 'Gagal kirim gambar',
  online: 'Online',
  searchConversations: 'Cari percakapan...',
  noConversations: 'Belum ada percakapan',
  noConversationsDesc: 'Mulai chat dengan jastiper dari halaman trip atau produk.',
  loginToViewMessages: 'Masuk untuk melihat pesan',
  imageMessage: '📷 Gambar',

  // Profile
  myOrders: 'Pesanan Saya',
  myTrips: 'Trip Saya',
  myWishlist: 'Wishlist',
  myFavorites: 'Favorit',
  wallet: 'Dompet',
  shareProfile: 'Bagikan Profil',
  editProfileTitle: 'Edit Profil',
  noOrders: 'Belum ada pesanan',
  noOrdersDesc: 'Pesananmu akan muncul di sini setelah dibuat.',
  noTrips: 'Belum ada trip',
  noTripsDesc: 'Buat trip pertamamu dan mulai terima pesanan jastip.',

  // Verification
  verifyNow: 'Verifikasi Sekarang',
  pendingReview: 'Menunggu Review',
  rejected: 'Ditolak',
  verifiedStatus: 'Terverifikasi',

  // Auth - Login
  welcomeBack: 'Selamat datang kembali',
  signInToContinue: 'Masuk untuk melanjutkan',
  forgotPassword: 'Lupa kata sandi?',
  or: 'atau',
  dontHaveAccount: 'Belum punya akun?',
  tagline: 'Teman jastip terpercayamu',
  emailRequired: 'Email wajib diisi',
  invalidEmail: 'Format email tidak valid',
  passwordRequired: 'Password wajib diisi',
  minSixChars: 'Minimal 6 karakter',
  emailNotFoundError: 'Email tidak ditemukan atau salah',
  incorrectPassword: 'Password salah',
  loginFailed: 'Login gagal. Silakan coba lagi.',

  // Auth - Register
  createAccount: 'Buat Akun',
  joinCommunity: 'Bergabung dengan komunitas jastip terpercaya',
  fullName: 'Nama Lengkap',
  fullNamePlaceholder: 'Nama lengkap kamu',
  emailPlaceholder: 'kamu@email.com',
  minEightCharsPlaceholder: 'Min. 8 karakter',
  confirmPasswordLabel: 'Konfirmasi Password',
  confirmPasswordPlaceholder: 'Ulangi password',
  agreeWith: 'Saya setuju dengan ',
  termsConditions: 'Syarat & Ketentuan',
  and: ' dan ',
  privacyPolicy: 'Kebijakan Privasi',
  registerNow: 'Daftar Sekarang',
  alreadyHaveAccount: 'Sudah punya akun?',
  fullNameRequired: 'Nama lengkap wajib diisi',
  emailRequiredReg: 'Email wajib diisi',
  invalidEmailReg: 'Format email tidak valid',
  passwordRequiredReg: 'Password wajib diisi',
  minEightChars: 'Minimal 8 karakter',
  passwordsMismatch: 'Password tidak sama',
  agreeToTerms: 'Harap setujui syarat & ketentuan',
  accountCreated: 'Akun Berhasil Dibuat!',
  accountCreatedMsg: 'Cek email kamu untuk verifikasi akun, lalu masuk.',
  registerFailed: 'Registrasi Gagal',
  tryAgainShort: 'Silakan coba lagi.',

  // Search
  searchingProducts: 'Mencari produk...',
  productsFound: 'produk ditemukan',
  noProductsFound: 'Produk tidak ditemukan',
  tryDifferentKeyword: 'Coba kata kunci atau destinasi yang berbeda',
  searchForProducts: 'Cari produk',
  findUniqueItems: 'Temukan barang unik dari traveler di seluruh dunia',

  // Trips tab
  destinationCountries: 'Negara Tujuan',
  noActiveJastipers: 'Belum ada jastiper aktif',
  becomeFirstJastiper: 'Jadi Jastiper Pertama',
  viewTrip: 'Lihat Trip',
  viewCatalog: 'Lihat Katalog',
  manage: 'Kelola',
  activeTrips: 'aktif',
  cities: 'kota',
  departingOn: 'Berangkat',

  // Trip detail
  yourTraveler: 'Traveler Kamu',
  travelersNotes: 'Catatan Traveler',
  availableProducts: 'Produk Tersedia',
  addProductToTrip: 'Tambah Produk ke Trip',
  requestItemFromTrip: 'Minta Barang dari Trip Ini',
  tripNotFound: 'Trip tidak ditemukan',
  deleteTrip: 'Hapus Trip',
  deleteTripConfirm: 'Trip ini akan dihapus permanen beserta semua datanya. Yakin?',
  deleteTripFailed: 'Gagal menghapus trip. Coba lagi.',
  itemsMax: 'item maks',
  tripsCompleted: 'trip selesai',

  // Triper profile
  profileNotFound: 'Profil tidak ditemukan',
  followTriper: 'Ikuti Tripper',
  following: 'Mengikuti',
  noReviews: 'Belum ada ulasan',
  triperNoProducts: 'Tripper belum menambahkan produk',
  priceTbd: 'Harga belum diset',
  tripsStatLabel: 'Trip',
  productsStatLabel: 'Produk',
  reviewsStatLabel: 'Ulasan',
  activeTripsSectionTitle: 'TRIP AKTIF',
  productsSectionTitle: 'PRODUK',

  // Order detail statuses
  statusWaiting: 'Menunggu Traveler',
  statusWaitingDesc: 'Permintaanmu menunggu konfirmasi traveler.',
  statusOfferAccepted: 'Penawaran Diterima',
  statusOfferAcceptedDesc: 'Traveler menerima. Silakan lanjutkan pembayaran.',
  statusInEscrow: 'Dana di Escrow',
  statusInEscrowDesc: 'Danamu tersimpan aman di escrow.',
  statusItemPurchased: 'Barang Dibeli',
  statusItemPurchasedDesc: 'Traveler telah membeli barangmu.',
  statusInTransit: 'Dalam Pengiriman',
  statusInTransitDesc: 'Barangmu sedang dalam perjalanan.',
  statusDelivered: 'Terkirim',
  statusDeliveredDesc: 'Barang terkirim. Konfirmasi untuk melepas pembayaran.',
  statusCompleted: 'Selesai',
  statusCompletedDesc: 'Transaksi selesai. Dana dilepaskan.',
  statusCancelled: 'Dibatalkan',
  statusCancelledDesc: 'Pesanan ini telah dibatalkan.',
  statusDisputed: 'Sengketa',
  statusDisputedDesc: 'Sengketa telah diajukan. Tim dukungan akan menghubungimu.',
  triperStatusPending: 'Pesanan Baru',
  triperStatusPendingDesc: 'Seorang pembeli ingin kamu membelikan barang untuknya.',
  triperStatusAccepted: 'Menunggu Pembayaran',
  triperStatusAcceptedDesc: 'Kamu sudah konfirmasi pesanan ini. Menunggu pembeli membayar.',
  triperStatusInEscrow: 'Dana Masuk — Siap Beli',
  triperStatusInEscrowDesc: 'Pembayaran sudah aman di escrow. Silakan beli barangnya sekarang.',
  triperStatusPurchased: 'Barang Sudah Dibeli',
  triperStatusPurchasedDesc: 'Kamu sudah membeli barangnya. Kemas dan kirimkan.',
  triperStatusShipped: 'Menunggu Konfirmasi Pengiriman',
  triperStatusShippedDesc: 'Barang sedang dalam perjalanan. Menunggu pembeli mengkonfirmasi.',
  triperStatusDelivered: 'Menunggu Konfirmasi Pembeli',
  triperStatusDeliveredDesc: 'Barang sudah tiba. Menunggu pembeli mengkonfirmasi dan melepas dana.',
  orderNotFound: 'Pesanan tidak ditemukan.',
  viewOnly: 'Hanya lihat — kamu bukan peserta dalam pesanan ini.',
  confirmDelivery: 'Konfirmasi Penerimaan',
  confirmDeliveryMsg: 'Ini akan melepas dana escrow ke traveler. Tidak bisa dibatalkan.',
  confirmAndRelease: 'Konfirmasi & Lepas Dana',
  paymentReleased: 'Pembayaran Dilepas',
  paymentReleasedMsg: 'Dana telah dilepaskan ke traveler.',
  fileDispute: 'Ajukan Sengketa',
  fileDisputeMsg: 'Jelaskan masalah dengan pesananmu.',
  disputeFiled: 'Sengketa Diajukan',
  disputeFiledMsg: 'Tim dukungan kami akan menghubungimu dalam 24 jam.',
  orderIdCopied: 'Disalin!',
  orderIdCopiedMsg: 'ID pesanan disalin ke clipboard.',
  summaryCopied: 'Disalin!',
  summaryCopiedMsg: 'Ringkasan pesanan disalin ke clipboard.',
  currentStatus: 'STATUS SAAT INI',
  fundsInEscrowBadge: 'Dana di Escrow',
  paymentSummary: 'Ringkasan Pembayaran',
  participants: 'Peserta',
  itemPrice: 'Harga Barang',
  buyer: 'Pembeli',
  traveler: 'Traveler',
  payNow: 'Bayar Sekarang',
  confirmReceipt: 'Konfirmasi Penerimaan',
  acceptOrder: 'Terima Pesanan',
  markAsShipped: 'Tandai Terkirim',
  orderTracking: 'Lacak Pesanan',
  orderCompletedMsg: 'Pesanan Selesai',
  orderCancelledMsg: 'Pesanan Dibatalkan',
  disputeFiledStatus: 'Sengketa Diajukan — Tim dukungan akan menghubungimu',
  priceNotSet: 'Harga belum diset',

  // Review & Rating
  leaveReview: 'Tulis Ulasan',
  rateYourExperience: 'Beri penilaian pengalamanmu dengan traveler ini',
  submitReview: 'Kirim Ulasan',
  reviewSubmitted: 'Ulasan Terkirim!',
  reviewThankYou: 'Terima kasih atas ulasanmu.',
  writeComment: 'Tulis komentar (opsional)',
  alreadyReviewed: 'Sudah Diulas',
};

const translations: Record<Locale, Translations> = { en, id };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
