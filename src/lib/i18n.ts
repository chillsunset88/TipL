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

  // Theme
  appearance: string;
  darkMode: string;
  lightMode: string;

  // Profile screen
  signedOutTitle: string;
  signedOutDesc: string;
  signInSignUp: string;
  jastipSection: string;
  incomingOrders: string;
  becomeTripper: string;
  becomeTriperDesc: string;
  verificationRejectedDesc: string;
  verificationRejectedBadge: string;
  verificationBenefit1: string;
  verificationBenefit2: string;
  verificationBenefit3: string;
  verificationReapply: string;
  verificationStart: string;
  pendingVerification: string;
  pendingVerificationDesc: string;
  pendingVerificationStatus: string;
  helpSection: string;
  helpCenter: string;
  helpCenterSub: string;
  contactUs: string;
  contactUsSub: string;
  privacyPolicySub: string;
  appVersion: string;
  adminPanel: string;
  manageVerification: string;
  manageOrdersDemo: string;

  // Edit Profile
  permissionRequired: string;
  galleryPermission: string;
  galleryPermissionPhoto: string;
  nameEmpty: string;
  profileSaved: string;
  profileUpdated: string;
  failedUpdateProfile: string;
  tapToChangePhoto: string;
  emailLabel: string;
  bioLabel: string;
  bioPlaceholder: string;
  saveChanges: string;

  // Cart / Product alerts
  cannotOrder: string;
  cannotOrderOwnProduct: string;
  myCart: string;
  itemsUnit: string;
  wishlistUpdateFailed: string;
  tripperInfoUnavailable: string;
  ownItemMessage: string;
  ownProductBanner: string;

  // Notifications time
  justNow: string;
  minutesAgoSuffix: string;
  hoursAgoSuffix: string;

  // Order status labels (buyer – My Orders)
  orderStatusPending: string;
  orderStatusAccepted: string;
  orderStatusInEscrow: string;
  orderStatusPurchased: string;
  orderStatusShipped: string;
  orderStatusDelivered: string;
  orderStatusCompleted: string;
  orderStatusCancelled: string;
  orderStatusDisputed: string;

  // Incoming-order status labels (tripper)
  incomingStatusPending: string;
  incomingStatusAccepted: string;
  incomingStatusInEscrow: string;

  // Filter tab labels
  filterAll: string;
  filterUnpaid: string;
  filterProcessing: string;
  filterDone: string;
  filterProblem: string;
  filterNew: string;
  filterActive: string;

  // Request status labels
  reqOpen: string;
  reqTaken: string;

  // Address / Checkout
  selectAddressFirst: string;
  failedLoadPayment: string;

  // Role label
  meLabel: string;

  // Incoming orders page
  tripProducts: string;
  customRequest: string;
  newOrdersWaiting: string;
  noIncomingOrders: string;
  noIncomingOrdersDesc: string;
  noOrdersInCategory: string;
  noCustomRequests: string;
  noCustomRequestsDesc: string;
  tapToConfirmOrder: string;
  tapToViewRequest: string;
  priceNegotiable: string;

  // Payment page
  paymentTitle: string;
  loadingPayment: string;
  escrowNoticeText: string;

  // Home screen extras
  fromLabel: string;
  shopNow: string;
  noProductsFrom: string;

  // Camera permission
  cameraPermission: string;

  // Create trip
  destinationCityLabel: string;
  selectCityPlaceholder: string;
  selectDestFirst: string;
  createTripFailed: string;

  // Product management alerts
  cannotDeleteProduct: string;
  activeOrdersBlock: string;
  deleteProductTitle: string;
  deleteProductConfirmMsg: string;
  failedDeleteProduct: string;
  failedCheckOrders: string;
  productUpdatedMsg: string;
  productAddedMsg: string;
  failedSaveProduct: string;
  productNameRequiredMsg: string;

  // Request create
  createRequest: string;
  requestSubmitted: string;
  requestSubmittedMsg: string;
  requestSentTo: string;
  failedSubmitRequest: string;
  incompleteForm: string;
  itemNameRequiredMsg: string;
  categoryRequiredMsg: string;
  budgetInvalidMsg: string;
  countryRequiredMsg: string;

  // Request create form labels
  requestingTo: string;
  requestBannerDescForTriper: string;
  requestBannerDescGeneral: string;
  visualReference: string;
  uploadReferencePhoto: string;
  uploadReferencePhotoDesc: string;
  gallery: string;
  camera: string;
  itemDetails: string;
  itemNameLabel: string;
  brandOptional: string;
  quantity: string;
  pricingEstimate: string;
  additionalNotes: string;
  targetCountrySection: string;
  whereToShop: string;
  escrowInfoBanner: string;
  submitRequest: string;
  sendTo: string;

  // Verification flow
  verificationSubmitted: string;
  verificationSubmittedMsg: string;
  viewOrder: string;
  paymentStatusError: string;

  // Chat
  failedSendProduct: string;

  // Verification submit
  failedSubmitVerification: string;

  // Payment
  paymentSuccess: string;
  paymentFailed: string;
  paymentFailedMsg: string;

  // General load/save errors
  failedLoad: string;
  failedSave: string;

  // Request list
  noRequests: string;

  // Favorites
  noFavorites: string;

  // Destination / tripers
  noTripersInDest: string;
  noTripers: string;

  // Create trip city modal
  selectCityTitle: string;

  // Request detail
  requestDetail: string;
  requestNotFound: string;
  requestedBy: string;
  noReferencePhoto: string;
  maxBudget: string;
  referenceLink: string;
  dateLabel: string;
  takeRequestTitle: string;
  takeRequestBody: string;
  takeRequestBtn: string;
  failedLoadRequest: string;
  takeRequestFailed: string;
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

  // Theme
  appearance: 'APPEARANCE',
  darkMode: 'Dark Mode',
  lightMode: 'Light Mode',

  // Profile screen
  signedOutTitle: 'Not Signed In',
  signedOutDesc: 'Sign in to view your profile and orders',
  signInSignUp: 'Sign In / Sign Up',
  jastipSection: 'Jastip',
  incomingOrders: 'Incoming Orders',
  becomeTripper: 'Become a Tripper',
  becomeTriperDesc: 'Verify your identity to start accepting requests and earning.',
  verificationRejectedDesc: 'Your verification was rejected. Please reapply.',
  verificationRejectedBadge: 'Rejected — reapply now',
  verificationBenefit1: 'Create & manage trips',
  verificationBenefit2: 'Accept orders from buyers',
  verificationBenefit3: 'Earn extra income',
  verificationReapply: 'Reapply',
  verificationStart: 'Start Verification',
  pendingVerification: 'Waiting for Review',
  pendingVerificationDesc: 'Your documents are under review. This usually takes 1–2 business days.',
  pendingVerificationStatus: 'Under review...',
  helpSection: 'Help',
  helpCenter: 'Help Center',
  helpCenterSub: 'FAQ & usage guide',
  contactUs: 'Contact Us',
  contactUsSub: 'Chat with TipL support',
  privacyPolicySub: 'Privacy policy',
  appVersion: 'Version 1.0.0',
  adminPanel: 'Admin',
  manageVerification: 'Manage Verification',
  manageOrdersDemo: 'Manage Orders (Demo)',

  // Edit Profile
  permissionRequired: 'Permission Required',
  galleryPermission: 'Allow gallery access to select a profile photo.',
  galleryPermissionPhoto: 'Allow gallery access to select photos.',
  nameEmpty: 'Name cannot be empty.',
  profileSaved: 'Saved',
  profileUpdated: 'Your profile has been updated.',
  failedUpdateProfile: 'Failed to update profile.',
  tapToChangePhoto: 'Tap to change photo',
  emailLabel: 'Email',
  bioLabel: 'Bio',
  bioPlaceholder: 'Tell others about yourself...',
  saveChanges: 'Save Changes',

  // Cart / Product alerts
  cannotOrder: 'Cannot Order',
  cannotOrderOwnProduct: 'You cannot order your own product.',
  myCart: 'My Cart',
  itemsUnit: 'items',
  wishlistUpdateFailed: 'Failed to update wishlist. Try again.',
  tripperInfoUnavailable: 'Tripper info unavailable.',
  ownItemMessage: 'This is your own item.',
  ownProductBanner: 'This is your own product',

  // Notifications time
  justNow: 'just now',
  minutesAgoSuffix: 'm ago',
  hoursAgoSuffix: 'h ago',

  // Order status labels (buyer – My Orders)
  orderStatusPending: 'Unpaid',
  orderStatusAccepted: 'Accepted by Traveler',
  orderStatusInEscrow: 'Paid',
  orderStatusPurchased: 'Being Purchased',
  orderStatusShipped: 'Shipped',
  orderStatusDelivered: 'Delivered',
  orderStatusCompleted: 'Completed',
  orderStatusCancelled: 'Cancelled',
  orderStatusDisputed: 'Disputed',

  // Incoming-order status labels (tripper)
  incomingStatusPending: 'Awaiting Confirmation',
  incomingStatusAccepted: 'Accepted',
  incomingStatusInEscrow: 'Payment Received',

  // Filter tab labels
  filterAll: 'All',
  filterUnpaid: 'Unpaid',
  filterProcessing: 'Processing',
  filterDone: 'Done',
  filterProblem: 'Problem',
  filterNew: 'New',
  filterActive: 'Active',

  // Request status labels
  reqOpen: 'Open',
  reqTaken: 'Taken',

  // Address / Checkout
  selectAddressFirst: 'Please select a delivery address first.',
  failedLoadPayment: 'Failed to load payment page. Try again.',

  // Role label
  meLabel: 'Me',

  // Incoming orders page
  tripProducts: 'Trip Products',
  customRequest: 'Custom Request',
  newOrdersWaiting: 'new orders waiting for your confirmation',
  noIncomingOrders: 'No incoming orders yet',
  noIncomingOrdersDesc: 'Orders from buyers will appear here after they checkout.',
  noOrdersInCategory: 'No orders in this category',
  noCustomRequests: 'No custom requests yet',
  noCustomRequestsDesc: 'Custom product requests you take from buyers will appear here.',
  tapToConfirmOrder: 'Tap to confirm this order',
  tapToViewRequest: 'Tap to view request details',
  priceNegotiable: 'Negotiable',

  // Payment page
  paymentTitle: 'Payment',
  loadingPayment: 'Loading payment page...',
  escrowNoticeText: 'Funds held in escrow until delivery is confirmed',

  // Home screen extras
  fromLabel: 'From',
  shopNow: 'Shop Now',
  noProductsFrom: 'No products from',

  // Camera permission
  cameraPermission: 'Allow camera access to take photos.',

  // Create trip
  destinationCityLabel: 'Destination City',
  selectCityPlaceholder: 'Select destination city',
  selectDestFirst: 'Select a destination country before selecting a city.',
  createTripFailed: 'Failed to create trip.',

  // Product management alerts
  cannotDeleteProduct: 'Cannot Delete',
  activeOrdersBlock: 'active orders for this product. Complete all orders first.',
  deleteProductTitle: 'Delete Product',
  deleteProductConfirmMsg: 'This product will be permanently deleted. Are you sure?',
  failedDeleteProduct: 'Failed to delete product.',
  failedCheckOrders: 'Failed to check active orders.',
  productUpdatedMsg: 'Product updated successfully!',
  productAddedMsg: 'Product added to trip!',
  failedSaveProduct: 'Failed to save product.',
  productNameRequiredMsg: 'Product name is required.',

  // Request create
  createRequest: 'Create Request',
  requestSubmitted: 'Submitted!',
  requestSubmittedMsg: 'Your request has been posted.',
  requestSentTo: 'Your request has been sent to',
  failedSubmitRequest: 'Failed to submit request. Try again.',
  incompleteForm: 'Incomplete',
  itemNameRequiredMsg: 'Enter item name.',
  categoryRequiredMsg: 'Select a category.',
  budgetInvalidMsg: 'Enter a valid maximum budget.',
  countryRequiredMsg: 'Select destination country.',

  // Verification flow
  verificationSubmitted: 'Verification Submitted!',
  verificationSubmittedMsg: 'Your documents are under review. We will contact you within 1–2 business days.',
  viewOrder: 'View Order',
  paymentStatusError: 'Payment received but failed to update order status.',

  // Chat
  failedSendProduct: 'Failed to send product.',

  // Verification submit
  failedSubmitVerification: 'Submission failed. Please try again.',

  // Payment
  paymentSuccess: 'Payment Successful',
  paymentFailed: 'Payment Failed',
  paymentFailedMsg: 'Payment was not successful. Please try again.',

  // General load/save errors
  failedLoad: 'Failed to load',
  failedSave: 'Failed to save',

  // Request list
  noRequests: 'No requests for you yet',

  // Favorites
  noFavorites: 'No favorite trippers yet',

  // Destination / tripers
  noTripersInDest: 'No trippers heading to this destination yet',
  noTripers: 'No trippers yet',

  // Create trip city modal
  selectCityTitle: 'Select City',

  // Request create form labels
  requestingTo: 'Requesting to',
  requestBannerDescForTriper: 'Tell us what you want. They will bring it for you.',
  requestBannerDescGeneral: 'Provide the details of the item you wish to purchase. Our travelers will handle the rest.',
  visualReference: 'Visual Reference',
  uploadReferencePhoto: 'Upload Reference Photo',
  uploadReferencePhotoDesc: 'Use gallery or camera to add a visual sample.',
  gallery: 'Gallery',
  camera: 'Camera',
  itemDetails: 'Item Details',
  itemNameLabel: 'Item Name',
  brandOptional: 'Brand (Optional)',
  quantity: 'Quantity',
  pricingEstimate: 'Pricing Estimate',
  additionalNotes: 'Additional Notes',
  targetCountrySection: 'Target Country',
  whereToShop: 'Where should the traveler buy this?',
  escrowInfoBanner: 'Funds will be held in escrow until you confirm delivery. Your purchase is protected.',
  submitRequest: 'Submit Request',
  sendTo: 'Send to',

  // Request detail
  requestDetail: 'Request Detail',
  requestNotFound: 'Request not found',
  requestedBy: 'Requested by',
  noReferencePhoto: 'No reference photos',
  maxBudget: 'Max Budget',
  referenceLink: 'Reference Link',
  dateLabel: 'Date',
  takeRequestTitle: 'Take Request',
  takeRequestBody: 'Take this request and create an order for the buyer?',
  takeRequestBtn: 'Take',
  failedLoadRequest: 'Failed to load request details.',
  takeRequestFailed: 'An error occurred. Try again.',
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

  // Theme
  appearance: 'TAMPILAN',
  darkMode: 'Mode Gelap',
  lightMode: 'Mode Terang',

  // Profile screen
  signedOutTitle: 'Belum Masuk',
  signedOutDesc: 'Masuk untuk melihat profil dan pesanan kamu',
  signInSignUp: 'Masuk / Daftar',
  jastipSection: 'Jastip',
  incomingOrders: 'Pesanan Masuk',
  becomeTripper: 'Jadilah Jastiper',
  becomeTriperDesc: 'Verifikasi identitasmu untuk mulai berjastip dan terima pesanan.',
  verificationRejectedDesc: 'Verifikasi kamu ditolak. Coba ajukan kembali.',
  verificationRejectedBadge: 'Ditolak — ajukan ulang',
  verificationBenefit1: 'Buat & kelola trip sendiri',
  verificationBenefit2: 'Terima pesanan dari tiper',
  verificationBenefit3: 'Dapatkan penghasilan tambahan',
  verificationReapply: 'Ajukan Ulang',
  verificationStart: 'Mulai Verifikasi',
  pendingVerification: 'Menunggu Verifikasi',
  pendingVerificationDesc: 'Dokumenmu sedang ditinjau tim TipL. Proses membutuhkan 1–2 hari kerja.',
  pendingVerificationStatus: 'Sedang ditinjau...',
  helpSection: 'Bantuan',
  helpCenter: 'Pusat Bantuan',
  helpCenterSub: 'FAQ & panduan penggunaan',
  contactUs: 'Hubungi Kami',
  contactUsSub: 'Chat dengan tim TipL',
  privacyPolicySub: 'Kebijakan privasi',
  appVersion: 'Versi 1.0.0',
  adminPanel: 'Admin',
  manageVerification: 'Kelola Verifikasi',
  manageOrdersDemo: 'Kelola Paket (Demo)',

  // Edit Profile
  permissionRequired: 'Izin Diperlukan',
  galleryPermission: 'Izinkan akses galeri untuk memilih foto profil.',
  galleryPermissionPhoto: 'Izinkan akses galeri untuk memilih foto.',
  nameEmpty: 'Nama tidak boleh kosong.',
  profileSaved: 'Tersimpan',
  profileUpdated: 'Profilmu telah diperbarui.',
  failedUpdateProfile: 'Gagal memperbarui profil.',
  tapToChangePhoto: 'Ketuk untuk ganti foto',
  emailLabel: 'Email',
  bioLabel: 'Bio',
  bioPlaceholder: 'Ceritakan tentang dirimu...',
  saveChanges: 'Simpan Perubahan',

  // Cart / Product alerts
  cannotOrder: 'Tidak Bisa Memesan',
  cannotOrderOwnProduct: 'Kamu tidak bisa memesan produkmu sendiri.',
  myCart: 'Keranjang Saya',
  itemsUnit: 'produk',
  wishlistUpdateFailed: 'Tidak bisa update wishlist. Coba lagi.',
  tripperInfoUnavailable: 'Info triper tidak tersedia.',
  ownItemMessage: 'Ini adalah item milikmu sendiri.',
  ownProductBanner: 'Ini produk milikmu sendiri',

  // Notifications time
  justNow: 'baru saja',
  minutesAgoSuffix: 'm lalu',
  hoursAgoSuffix: 'j lalu',

  // Order status labels (buyer – My Orders)
  orderStatusPending: 'Belum Bayar',
  orderStatusAccepted: 'Diterima Traveler',
  orderStatusInEscrow: 'Dibayar',
  orderStatusPurchased: 'Sedang Dibeli',
  orderStatusShipped: 'Dikirim',
  orderStatusDelivered: 'Terkirim',
  orderStatusCompleted: 'Selesai',
  orderStatusCancelled: 'Dibatalkan',
  orderStatusDisputed: 'Sengketa',

  // Incoming-order status labels (tripper)
  incomingStatusPending: 'Menunggu Konfirmasi',
  incomingStatusAccepted: 'Diterima',
  incomingStatusInEscrow: 'Pembayaran Masuk',

  // Filter tab labels
  filterAll: 'Semua',
  filterUnpaid: 'Belum Bayar',
  filterProcessing: 'Diproses',
  filterDone: 'Selesai',
  filterProblem: 'Bermasalah',
  filterNew: 'Baru Masuk',
  filterActive: 'Diproses',

  // Request status labels
  reqOpen: 'Terbuka',
  reqTaken: 'Diambil',

  // Address / Checkout
  selectAddressFirst: 'Silakan pilih alamat pengiriman terlebih dahulu.',
  failedLoadPayment: 'Gagal memuat halaman pembayaran. Coba lagi.',

  // Role label
  meLabel: 'Saya',

  // Incoming orders page
  tripProducts: 'Produk Trip',
  customRequest: 'Request Custom',
  newOrdersWaiting: 'pesanan baru menunggu konfirmasimu',
  noIncomingOrders: 'Belum ada pesanan masuk',
  noIncomingOrdersDesc: 'Pesanan dari pembeli akan muncul di sini setelah mereka checkout.',
  noOrdersInCategory: 'Tidak ada pesanan di kategori ini',
  noCustomRequests: 'Belum ada request custom',
  noCustomRequestsDesc: 'Request produk khusus yang kamu ambil dari pembeli akan muncul di sini.',
  tapToConfirmOrder: 'Ketuk untuk konfirmasi pesanan ini',
  tapToViewRequest: 'Ketuk untuk lihat detail request ini',
  priceNegotiable: 'Nego',

  // Payment page
  paymentTitle: 'Pembayaran',
  loadingPayment: 'Memuat halaman pembayaran...',
  escrowNoticeText: 'Dana ditahan dalam escrow hingga pengiriman dikonfirmasi',

  // Home screen extras
  fromLabel: 'Dari',
  shopNow: 'Belanja Sekarang',
  noProductsFrom: 'Belum ada produk dari',

  // Camera permission
  cameraPermission: 'Izinkan akses kamera untuk mengambil foto.',

  // Create trip
  destinationCityLabel: 'Kota Tujuan',
  selectCityPlaceholder: 'Pilih kota tujuan',
  selectDestFirst: 'Pilih negara tujuan dulu sebelum memilih kota.',
  createTripFailed: 'Gagal membuat trip.',

  // Product management alerts
  cannotDeleteProduct: 'Tidak Bisa Dihapus',
  activeOrdersBlock: 'pesanan aktif untuk produk ini. Selesaikan semua pesanan terlebih dahulu.',
  deleteProductTitle: 'Hapus Produk',
  deleteProductConfirmMsg: 'Produk ini akan dihapus permanen. Yakin?',
  failedDeleteProduct: 'Gagal menghapus produk.',
  failedCheckOrders: 'Gagal memeriksa pesanan aktif.',
  productUpdatedMsg: 'Produk berhasil diperbarui!',
  productAddedMsg: 'Produk berhasil ditambahkan ke trip!',
  failedSaveProduct: 'Gagal menyimpan produk.',
  productNameRequiredMsg: 'Nama produk wajib diisi.',

  // Request create
  createRequest: 'Buat Permintaan',
  requestSubmitted: 'Berhasil!',
  requestSubmittedMsg: 'Permintaanmu sudah diposting.',
  requestSentTo: 'Permintaanmu sudah dikirim ke',
  failedSubmitRequest: 'Gagal submit permintaan. Coba lagi.',
  incompleteForm: 'Info Kurang',
  itemNameRequiredMsg: 'Masukkan nama item.',
  categoryRequiredMsg: 'Pilih kategori.',
  budgetInvalidMsg: 'Masukkan budget maksimal yang valid.',
  countryRequiredMsg: 'Pilih negara tujuan.',

  // Verification flow
  verificationSubmitted: 'Verifikasi Terkirim!',
  verificationSubmittedMsg: 'Dokumen kamu sedang ditinjau tim TipL. Kami akan menghubungi kamu dalam 1–2 hari kerja.',
  viewOrder: 'Lihat Pesanan',
  paymentStatusError: 'Pembayaran diterima namun gagal update status pesanan.',

  // Chat
  failedSendProduct: 'Tidak bisa mengirim produk.',

  // Verification submit
  failedSubmitVerification: 'Gagal mengirimkan. Coba lagi.',

  // Payment
  paymentSuccess: 'Pembayaran Berhasil',
  paymentFailed: 'Pembayaran Gagal',
  paymentFailedMsg: 'Pembayaran tidak berhasil. Silakan coba lagi.',

  // General load/save errors
  failedLoad: 'Gagal memuat',
  failedSave: 'Gagal menyimpan',

  // Request list
  noRequests: 'Belum ada permintaan untukmu',

  // Favorites
  noFavorites: 'Belum ada tripper favorit',

  // Destination / tripers
  noTripersInDest: 'Belum ada triper ke destinasi ini',
  noTripers: 'Belum ada triper',

  // Create trip city modal
  selectCityTitle: 'Pilih Kota',

  // Request create form labels
  requestingTo: 'Permintaan ke',
  requestBannerDescForTriper: 'Ceritakan barang yang kamu inginkan. Mereka akan membawakan untuk kamu.',
  requestBannerDescGeneral: 'Berikan detail barang yang kamu inginkan. Traveler kami yang akan mengurus sisanya.',
  visualReference: 'Referensi Visual',
  uploadReferencePhoto: 'Unggah Foto Referensi',
  uploadReferencePhotoDesc: 'Gunakan galeri atau kamera untuk menambahkan sampel visual.',
  gallery: 'Galeri',
  camera: 'Kamera',
  itemDetails: 'Detail Barang',
  itemNameLabel: 'Nama Barang',
  brandOptional: 'Merek (Opsional)',
  quantity: 'Jumlah',
  pricingEstimate: 'Estimasi Harga',
  additionalNotes: 'Catatan Tambahan',
  targetCountrySection: 'Negara Tujuan',
  whereToShop: 'Di negara mana traveler harus membeli ini?',
  escrowInfoBanner: 'Dana akan ditahan di escrow hingga kamu konfirmasi penerimaan. Pembelianmu terlindungi.',
  submitRequest: 'Kirim Permintaan',
  sendTo: 'Kirim ke',

  // Request detail
  requestDetail: 'Detail Request',
  requestNotFound: 'Request tidak ditemukan',
  requestedBy: 'Diminta oleh',
  noReferencePhoto: 'Tidak ada foto referensi',
  maxBudget: 'Budget Maks',
  referenceLink: 'Link Referensi',
  dateLabel: 'Tanggal',
  takeRequestTitle: 'Ambil Request',
  takeRequestBody: 'Ambil request ini dan buat pesanan untuk pembeli?',
  takeRequestBtn: 'Ambil',
  failedLoadRequest: 'Gagal memuat detail request.',
  takeRequestFailed: 'Terjadi kesalahan. Coba lagi.',
};

const translations: Record<Locale, Translations> = { en, id };

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}
