/**
 * TipL — Mock Data
 * Realistic demo data for development. Remove when Firebase is connected.
 */

import { Trip, Order, ChatMessage, ChatRoom, JastipRequest, User, JastipProduct } from './types';
import { OrderStatus } from './constants';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    email: 'emi.tanaka@email.com',
    displayName: 'Emi Tanaka',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    phone: '+81801234567',
    rating: 4.8,
    reviewCount: 23,
    verified: true,
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: 'u2',
    email: 'adriana.v@email.com',
    displayName: 'Adriana V.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    phone: '+6281234567890',
    rating: 4.9,
    reviewCount: 47,
    verified: true,
    createdAt: Date.now() - 86400000 * 180,
  },
  {
    id: 'u3',
    email: 'marcus.t@email.com',
    displayName: 'Marcus T.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    phone: '+447700900123',
    rating: 4.7,
    reviewCount: 15,
    verified: true,
    createdAt: Date.now() - 86400000 * 60,
  },
];

// Real Supabase UUIDs — update these when trips are loaded from DB
const SURYA_ID = 'ba5415d4-50d8-470c-95ac-275c21de93fd';
const STEVEN_ID = '76296dd0-d7ac-4082-afe2-0c4a9417b169';

export const MOCK_TRIPS: Trip[] = [
  {
    id: 't1',
    travelerId: SURYA_ID,
    travelerName: 'Surya',
    travelerAvatar: MOCK_USERS[1].avatarUrl,
    travelerRating: 4.9,
    travelerVerified: true,
    origin: 'Tokyo',
    destination: 'Jakarta',
    departDate: '2026-05-15',
    returnDate: '2026-05-28',
    itinerary: [
      { city: 'San Francisco', country: 'USA', arrivalDate: '2026-05-12' },
      { city: 'Tokyo', country: 'Japan', arrivalDate: '2026-05-15', departureDate: '2026-05-24' },
      { city: 'Jakarta', country: 'Indonesia', arrivalDate: '2026-05-28' },
    ],
    categories: ['luxury', 'skincare', 'electronics'],
    description: 'Business trip with 5kg spare luggage capacity. Can pick up items from Shibuya, Shinjuku, and Akihabara areas.',
    maxWeight: 5,
    status: 'upcoming',
    createdAt: Date.now() - 86400000 * 3,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
  },
  {
    id: 't2',
    travelerId: SURYA_ID,
    travelerName: 'Surya',
    travelerAvatar: MOCK_USERS[2].avatarUrl,
    travelerRating: 4.7,
    travelerVerified: true,
    origin: 'London',
    destination: 'Dubai',
    departDate: '2026-06-01',
    returnDate: '2026-06-10',
    itinerary: [
      { city: 'London', country: 'UK', arrivalDate: '2026-05-28' },
      { city: 'Dubai', country: 'UAE', arrivalDate: '2026-06-01' },
    ],
    categories: ['luxury', 'fashion'],
    maxWeight: 3,
    status: 'upcoming',
    createdAt: Date.now() - 86400000 * 1,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
  },
  {
    id: 't3',
    travelerId: STEVEN_ID,
    travelerName: 'Steven',
    travelerAvatar: MOCK_USERS[0].avatarUrl,
    travelerRating: 4.8,
    travelerVerified: true,
    origin: 'Seoul',
    destination: 'Singapore',
    departDate: '2026-06-05',
    returnDate: '2026-06-15',
    itinerary: [
      { city: 'Seoul', country: 'South Korea', arrivalDate: '2026-06-05', departureDate: '2026-06-10' },
      { city: 'Singapore', country: 'Singapore', arrivalDate: '2026-06-12' },
    ],
    categories: ['skincare', 'food', 'electronics'],
    maxWeight: 4,
    status: 'upcoming',
    createdAt: Date.now() - 86400000 * 2,
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800',
  },
];

export const MOCK_ORDER: Order = {
  id: 'o1',
  orderNumber: 'JPT-0024',
  requestId: 'r1',
  tripId: 't1',
  travelerId: 'u1',
  travelerName: 'Emi Tanaka',
  buyerId: 'u2',
  buyerName: 'Adriana V.',
  itemName: 'Artisan Leather Ankle Boots',
  itemDescription: 'Size: EU 38 • Color: Cognac',
  itemImageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400',
  quantity: 1,
  status: OrderStatus.PAYMENT_CONFIRMED,
  timeline: [
    { status: OrderStatus.PENDING, label: 'Order Requested', timestamp: Date.now() - 86400000 * 5, description: 'Dec 01, 6:00 PM' },
    { status: OrderStatus.OFFER_ACCEPTED, label: 'Offer Accepted', timestamp: Date.now() - 86400000 * 4, description: 'Dec 02, 10:00 AM' },
    { status: OrderStatus.PAYMENT_CONFIRMED, label: 'Payment Confirmed', timestamp: Date.now() - 86400000 * 3, description: 'Dec 03, 3:30 PM' },
    { status: OrderStatus.ITEM_PURCHASED, label: 'Item Purchased', timestamp: null },
    { status: OrderStatus.IN_TRANSIT, label: 'In Transit', timestamp: null },
    { status: OrderStatus.DELIVERED, label: 'Delivered', timestamp: null },
    { status: OrderStatus.COMPLETED, label: 'Completed', timestamp: null },
  ],
  paymentSummary: {
    itemPrice: 359.00,
    travelerFee: 45.30,
    platformFee: 15.40,
    totalAmount: 419.71,
    currency: 'USD',
  },
  proofOfPurchaseUrls: [],
  createdAt: Date.now() - 86400000 * 5,
  updatedAt: Date.now() - 86400000 * 3,
};

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u2',
    senderName: 'Adriana V.',
    senderAvatar: MOCK_USERS[1].avatarUrl,
    text: "Hi there! I'm interested in picking up a few items from Tokyo. I'm heading to Akihabara to pick up a few things.",
    timestamp: Date.now() - 3600000 * 3,
    read: true,
  },
  {
    id: 'm2',
    senderId: 'u1',
    senderName: 'Emi Tanaka',
    senderAvatar: MOCK_USERS[0].avatarUrl,
    productCard: {
      name: 'Sony WH-1000XM5',
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
      price: '¥44,000',
      description: 'Wireless Noise Cancelling Headphones',
    },
    timestamp: Date.now() - 3600000 * 2,
    read: true,
  },
  {
    id: 'm3',
    senderId: 'u1',
    senderName: 'Emi Tanaka',
    senderAvatar: MOCK_USERS[0].avatarUrl,
    text: "I found these Sony headphones! I noticed so many people have been requesting this. Are you interested?",
    timestamp: Date.now() - 3600000 * 2 + 60000,
    read: true,
  },
  {
    id: 'm4',
    senderId: 'u2',
    senderName: 'Adriana V.',
    senderAvatar: MOCK_USERS[1].avatarUrl,
    text: "Could you tell me more? Can I see a closer look at the packaging?",
    timestamp: Date.now() - 3600000,
    read: false,
  },
];

export const MOCK_CHAT_ROOM: ChatRoom = {
  id: 'cr1',
  participants: ['u1', 'u2'],
  participantNames: { u1: 'Emi Tanaka', u2: 'Adriana V.' },
  participantAvatars: { u1: MOCK_USERS[0].avatarUrl, u2: MOCK_USERS[1].avatarUrl },
  lastMessage: "Could you tell me more? Can I see a closer look at the packaging?",
  lastMessageTimestamp: Date.now() - 3600000,
  unreadCount: { u1: 1, u2: 0 },
  orderId: 'o1',
  createdAt: Date.now() - 86400000,
};

export const MOCK_CHAT_MESSAGES_2: ChatMessage[] = [
  {
    id: 'm5',
    senderId: 'u3',
    senderName: 'Marcus T.',
    senderAvatar: MOCK_USERS[2].avatarUrl,
    text: 'I can pick up the bag from Harrods this weekend!',
    timestamp: Date.now() - 3600000 * 5,
    read: false,
  },
  {
    id: 'm6',
    senderId: 'u2',
    senderName: 'Adriana V.',
    senderAvatar: MOCK_USERS[1].avatarUrl,
    text: 'That would be amazing! Can you check if they have the beige color?',
    timestamp: Date.now() - 3600000 * 4,
    read: true,
  },
  {
    id: 'm7',
    senderId: 'u3',
    senderName: 'Marcus T.',
    senderAvatar: MOCK_USERS[2].avatarUrl,
    text: "Sure, I'll check and send you a photo when I'm there.",
    timestamp: Date.now() - 3600000 * 3,
    read: true,
  },
];

export const TRENDING_DESTINATIONS = [
  {
    id: 'd1',
    name: 'Tokyo',
    country: 'Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
    tripCount: 12,
  },
  {
    id: 'd2',
    name: 'Paris',
    country: 'France',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
    tripCount: 8,
  },
  {
    id: 'd3',
    name: 'Seoul',
    country: 'South Korea',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600',
    tripCount: 15,
  },
  {
    id: 'd4',
    name: 'London',
    country: 'United Kingdom',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600',
    tripCount: 6,
  },
];

export const JASTIP_DESTINATIONS = [
  { id: 'sg', name: 'Singapore', icon: 'airplane-outline' },
  { id: 'jp', name: 'Japan', icon: 'airplane-outline' },
  { id: 'kr', name: 'South Korea', icon: 'airplane-outline' },
  { id: 'uk', name: 'London', icon: 'airplane-outline' },
] as const;

export const JASTIP_PRODUCTS: JastipProduct[] = [
  // Singapore
  { id: 'p1', name: 'Irvins Salted Egg Fish Skin', description: 'Premium salted egg fish skin snack, original from Singapore. Crunchy and addictive flavor that makes the perfect souvenir.', priceIDR: 185000, imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400', category: 'Food', destination: 'Singapore', travelerId: 'u2', travelerName: 'Adriana V.', travelerAvatar: MOCK_USERS[1].avatarUrl, travelerRating: 4.9, travelerVerified: true, weight: 0.3, stock: 5 },
  { id: 'p2', name: 'TWG Tea Luxury Set', description: 'Exquisite luxury tea collection from TWG Singapore. Contains 6 premium tea flavors in elegant packaging.', priceIDR: 750000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'Food', destination: 'Singapore', travelerId: 'u2', travelerName: 'Adriana V.', travelerAvatar: MOCK_USERS[1].avatarUrl, travelerRating: 4.9, travelerVerified: true, weight: 0.5, stock: 3 },
  { id: 'p3', name: 'Charles & Keith Bag', description: 'Stylish crossbody bag from Charles & Keith. Genuine leather with minimalist design, perfect for everyday use.', priceIDR: 1250000, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', category: 'Fashion', destination: 'Singapore', travelerId: 'u2', travelerName: 'Adriana V.', travelerAvatar: MOCK_USERS[1].avatarUrl, travelerRating: 4.9, travelerVerified: true, weight: 0.4, stock: 2 },
  { id: 'p4', name: 'Tiger Balm Gift Set', description: 'Classic Tiger Balm collection set with multiple variants. A must-buy from Singapore for muscle relief and wellness.', priceIDR: 235000, imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400', category: 'Health', destination: 'Singapore', travelerId: 'u2', travelerName: 'Adriana V.', travelerAvatar: MOCK_USERS[1].avatarUrl, travelerRating: 4.9, travelerVerified: true, weight: 0.3, stock: 8 },
  // Japan
  { id: 'p5', name: 'Kit Kat Japan Edition', description: 'Limited edition Japanese Kit Kat assortment. Includes Matcha, Strawberry, Sake, and Wasabi flavors.', priceIDR: 195000, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', category: 'Food', destination: 'Japan', travelerId: 'u1', travelerName: 'Emi Tanaka', travelerAvatar: MOCK_USERS[0].avatarUrl, travelerRating: 4.8, travelerVerified: true, weight: 0.4, stock: 10 },
  { id: 'p6', name: 'Anessa Perfect UV Sunscreen', description: 'Japan\'s #1 sunscreen. SPF50+ PA++++ with water-resistant formula. Lightweight and non-greasy.', priceIDR: 385000, imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', category: 'Skincare', destination: 'Japan', travelerId: 'u1', travelerName: 'Emi Tanaka', travelerAvatar: MOCK_USERS[0].avatarUrl, travelerRating: 4.8, travelerVerified: true, weight: 0.1, stock: 6 },
  { id: 'p7', name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones. 30-hour battery, premium sound quality, featherlight comfort.', priceIDR: 4850000, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400', category: 'Electronics', destination: 'Japan', travelerId: 'u1', travelerName: 'Emi Tanaka', travelerAvatar: MOCK_USERS[0].avatarUrl, travelerRating: 4.8, travelerVerified: true, weight: 0.3, stock: 2 },
  { id: 'p8', name: 'Uniqlo Heattech Inner', description: 'Ultra-warm Heattech innerwear from Uniqlo Japan. Exclusive colors not available in Indonesia.', priceIDR: 310000, imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400', category: 'Fashion', destination: 'Japan', travelerId: 'u1', travelerName: 'Emi Tanaka', travelerAvatar: MOCK_USERS[0].avatarUrl, travelerRating: 4.8, travelerVerified: true, weight: 0.2, stock: 4 },
  // South Korea
  { id: 'p9', name: 'Laneige Water Bank Cream', description: 'Hydrating moisturizer with Blue Hyaluronic Acid. Keeps skin plump and dewy for 48 hours.', priceIDR: 580000, imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', category: 'Skincare', destination: 'South Korea', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.2, stock: 5 },
  { id: 'p10', name: 'Innisfree Green Tea Set', description: 'Complete skincare set with green tea extract from Jeju Island. Includes cleanser, toner, serum, and cream.', priceIDR: 425000, imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', category: 'Skincare', destination: 'South Korea', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.5, stock: 3 },
  { id: 'p11', name: 'Korean Snack Box Premium', description: 'Curated box of 15 popular Korean snacks including Honey Butter Chips, Pepero, and more.', priceIDR: 245000, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Food', destination: 'South Korea', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 1.0, stock: 4 },
  { id: 'p12', name: 'BT21 Official Merchandise', description: 'Authentic BT21 character plushie from LINE Friends Store Seoul. Limited edition design.', priceIDR: 350000, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', category: 'Collectibles', destination: 'South Korea', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.3, stock: 6 },
  // London
  { id: 'p13', name: 'Burberry Scarf Classic', description: 'Iconic Burberry cashmere scarf in classic check pattern. Authentic from London flagship store.', priceIDR: 8500000, imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400', category: 'Fashion', destination: 'London', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.2, stock: 1 },
  { id: 'p14', name: 'Fortnum & Mason Tea', description: 'Premium English tea selection from Fortnum & Mason. Royal Blend and Earl Grey in luxury tin.', priceIDR: 650000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', category: 'Food', destination: 'London', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.4, stock: 4 },
  { id: 'p15', name: 'Jo Malone Cologne Set', description: 'Luxurious fragrance collection from Jo Malone London. Includes 5 travel-size colognes in gift box.', priceIDR: 2750000, imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', category: 'Beauty', destination: 'London', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.3, stock: 2 },
  { id: 'p16', name: 'Harrods Teddy Bear', description: 'Collectible Harrods annual teddy bear. Exclusive design only available at Harrods London.', priceIDR: 950000, imageUrl: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=400', category: 'Collectibles', destination: 'London', travelerId: 'u3', travelerName: 'Marcus T.', travelerAvatar: MOCK_USERS[2].avatarUrl, travelerRating: 4.7, travelerVerified: true, weight: 0.3, stock: 3 },
];
