/**
 * TipL — Help & Support Center
 * Comprehensive guide for jasa titip flow
 */

import { PageHeader } from "@/src/components/ui/PageHeader";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/src/lib/constants";
import { useSettingsStore } from "@/src/store/settingsStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: "general" | "tiper" | "triper" | "payment" | "dispute";
};

const FAQS_ID: FAQItem[] = [
  // General
  {
    id: "g1",
    question: "Apa itu TipL?",
    answer:
      "TipL adalah platform jasa titip (jastip) yang menghubungkan traveler dengan pembeli. Traveler yang akan bepergian ke luar negeri dapat menawarkan jasa untuk membawa barang, sementara pembeli dapat memesan barang dari luar negeri dengan aman melalui sistem escrow.",
    category: "general",
  },
  {
    id: "g2",
    question: "Bagaimana cara kerja TipL?",
    answer:
      "1) Traveler membuat trip dan menambahkan produk yang bisa dibawa\n2) Pembeli melihat produk/trip dan menghubungi traveler\n3) Setelah sepakat harga, pembeli membuat pesanan\n4) Pembeli membayar dan dana ditahan di escrow\n5) Traveler membeli dan mengirim barang\n6) Pembeli menerima barang dan konfirmasi\n7) Dana escrow dilepas ke traveler",
    category: "general",
  },
  {
    id: "g3",
    question: "Apa itu sistem escrow?",
    answer:
      "Escrow adalah sistem penahanan dana yang aman. Saat pembeli membayar, dana tidak langsung diberikan ke traveler, melainkan ditahan oleh TipL. Dana baru akan dilepas ke traveler setelah pembeli mengkonfirmasi telah menerima barang sesuai pesanan.",
    category: "general",
  },

  // Tiper (Buyer)
  {
    id: "t1",
    question: "Bagaimana cara membeli barang?",
    answer:
      "Anda bisa membeli barang dengan dua cara:\n1) Pilih produk yang sudah ditawarkan traveler di halaman utama\n2) Buat permintaan kustom jika barang yang Anda cari tidak tersedia\nSetelah menemukan traveler, chat untuk negosiasi harga, lalu buat pesanan.",
    category: "tiper",
  },
  {
    id: "t2",
    question: "Bagaimana cara membuat permintaan kustom?",
    answer:
      'Buka menu "Permintaan" di profil, lalu:\n1) Upload foto referensi barang\n2) Isi detail barang (nama, merek, deskripsi)\n3) Pilih kategori dan jumlah\n4) Set budget maksimal\n5) Pilih negara tujuan\n6) Submit request\nTraveler akan melihat request Anda dan bisa mengambilnya.',
    category: "tiper",
  },
  {
    id: "t3",
    question: "Bagaimana cara pembayaran?",
    answer:
      "Pembayaran dilakukan melalui Xendit/Midtrans. Setelah order diterima traveler:\n1) Anda akan menerima link pembayaran\n2) Pilih metode pembayaran (transfer, e-wallet, kartu)\n3) Selesaikan pembayaran\n4) Dana akan ditahan di escrow sampai barang diterima.",
    category: "tiper",
  },
  {
    id: "t4",
    question: "Apa yang harus dilakukan jika barang tidak sesuai?",
    answer:
      "Jika barang yang diterima tidak sesuai dengan pesanan:\n1) Jangan konfirmasi penerimaan\n2) Chat dengan traveler untuk klarifikasi\n3) Jika tidak ada solusi, ajukan dispute melalui halaman order\n4) Tim TipL akan meninjau dan mediasi\n5) Dana escrow akan dikembalikan jika dispute disetujui.",
    category: "tiper",
  },

  // Triper (Traveler)
  {
    id: "r1",
    question: "Bagaimana cara menjadi traveler?",
    answer:
      'Untuk menjadi traveler:\n1) Login ke akun TipL\n2) Buka profil dan klik "Jadilah Jastiper"\n3) Upload foto selfie dan KTP\n4) Tunggu verifikasi (1-2 hari kerja)\n5) Setelah disetujui, Anda bisa membuat trip dan menerima pesanan.',
    category: "triper",
  },
  {
    id: "r2",
    question: "Bagaimana cara membuat trip?",
    answer:
      'Setelah terverifikasi:\n1) Buka menu "Buat Trip"\n2) Isi negara asal dan tujuan\n3) Pilih kota tujuan\n4) Set tanggal berangkat dan pulang\n5) Isi kapasitas bagasi (kg)\n6) Set range harga jasa titip\n7) Tambahkan produk yang bisa dibawa\n8) Submit trip',
    category: "triper",
  },
  {
    id: "r3",
    question: "Bagaimana cara menerima pesanan?",
    answer:
      'Pesanan bisa diterima melalui:\n1) Permintaan kustom dari tiper - Anda bisa langsung ambil\n2) Chat dengan tiper - Setelah sepakat harga, tiper akan buat order\n3) Setelah order dibuat, klik "Terima" di halaman order\n4) Lakukan pembelian dan update status order.',
    category: "triper",
  },
  {
    id: "r4",
    question: "Bagaimana cara mendapatkan pembayaran?",
    answer:
      'Pembayaran dilepas setelah:\n1) Pembeli mengkonfirmasi penerimaan barang\n2) Status order berubah menjadi "completed"\n3) Dana escrow otomatis dilepas ke akun Anda\n4) Pastikan nomor rekening/e-wallet sudah terdaftar di pengaturan.',
    category: "triper",
  },

  // Payment
  {
    id: "p1",
    question: "Metode pembayaran apa yang tersedia?",
    answer:
      "Kami mendukung berbagai metode pembayaran melalui Xendit/Midtrans:\n- Transfer bank (BCA, Mandiri, BNI, dll)\n- E-wallet (GoPay, OVO, Dana, ShopeePay)\n- Kartu kredit/debit\n- QRIS\nMetode yang tersedia dapat bervariasi tergantung nominal transaksi.",
    category: "payment",
  },
  {
    id: "p2",
    question: "Berapa lama dana ditahan di escrow?",
    answer:
      'Dana ditahan di escrow sampai:\n1) Pembeli mengkonfirmasi penerimaan barang\n2) Atau batas waktu yang ditentukan (biasanya 7-14 hari setelah status "delivered")\n3) Jika ada dispute, dana ditahan sampai dispute selesai',
    category: "payment",
  },
  {
    id: "p3",
    question: "Bagaimana jika pembayaran gagal?",
    answer:
      'Jika pembayaran gagal:\n1) Cek koneksi internet\n2) Pastikan saldo/kartu mencukupi\n3) Coba metode pembayaran lain\n4) Jika masih gagal, hubungi tim support kami\nOrder akan tetap dalam status "accepted" selama 24 jam untuk retry pembayaran.',
    category: "payment",
  },

  // Dispute
  {
    id: "d1",
    question: "Kapan saya bisa mengajukan dispute?",
    answer:
      "Dispute bisa diajukan ketika:\n1) Barang tidak diterima dalam batas waktu yang disepakati\n2) Barang yang diterima tidak sesuai dengan deskripsi\n3) Barang rusak atau cacat saat diterima\n4) Traveler tidak merespon komunikasi\nAjukan dispute melalui halaman detail order sebelum mengkonfirmasi penerimaan.",
    category: "dispute",
  },
  {
    id: "d2",
    question: "Bagaimana proses penyelesaian dispute?",
    answer:
      "Proses dispute:\n1) Ajukan dispute dengan alasan jelas\n2) Tim TipL akan meninjau bukti dari kedua pihak\n3) Mediasi dilakukan untuk mencari solusi\n4) Jika tidak ada kesepakatan, tim akan memutuskan berdasarkan bukti\n5) Keputusan bersifat final dan mengikat",
    category: "dispute",
  },
  {
    id: "d3",
    question: "Apakah dana akan dikembalikan jika dispute menang?",
    answer:
      'Ya, jika dispute Anda disetujui:\n1) Dana escrow akan dikembalikan penuh ke pembeli\n2) Traveler tidak akan menerima pembayaran\n3) Order akan ditandai sebagai "disputed" dan kemudian "cancelled"\nPastikan Anda memiliki bukti yang kuat saat mengajukan dispute.',
    category: "dispute",
  },
];

const FAQS_EN: FAQItem[] = [
  {
    id: "g1",
    question: "What is TipL?",
    answer:
      "TipL is a package-forwarding marketplace that connects travelers with buyers. Travelers can offer to carry items while traveling abroad, and buyers can securely request and pay for items via TipL’s escrow system.",
    category: "general",
  },
  {
    id: "g2",
    question: "How does TipL work?",
    answer:
      "1) Travelers create trips and list items they can carry\n2) Buyers browse trips or items and contact travelers\n3) After agreeing a price, the buyer creates an order\n4) Buyer pays and funds are held in escrow\n5) Traveler purchases and ships the item\n6) Buyer confirms receipt\n7) Escrow funds are released to the traveler",
    category: "general",
  },
  {
    id: "g3",
    question: "What is an escrow system?",
    answer:
      "Escrow holds buyer payments securely until the buyer confirms receipt of the item. This protects both buyers and travelers by ensuring funds are only released after successful delivery.",
    category: "general",
  },
  // Buyer (Tiper)
  {
    id: "t1",
    question: "How do I buy an item?",
    answer:
      "You can buy items in two ways:\n1) Choose a product listed by a traveler on their trip page\n2) Create a custom request if the item is not listed\nAfter finding a traveler, chat to negotiate price, then create an order.",
    category: "tiper",
  },
  {
    id: "t2",
    question: "How do I create a custom request?",
    answer:
      'Open the "Requests" menu in your profile and:\n1) Upload a reference photo\n2) Fill in item details (name, brand, description)\n3) Select category and quantity\n4) Set a maximum budget\n5) Choose the origin country\n6) Submit the request\nTravelers will see your request and can take it.',
    category: "tiper",
  },
  {
    id: "t3",
    question: "How does payment work?",
    answer:
      "Payments are processed via our payment providers. After an order is accepted:\n1) You will receive a payment link\n2) Choose a payment method (bank transfer, e-wallet, card)\n3) Complete the payment\n4) Funds are held in escrow until delivery confirmation.",
    category: "tiper",
  },
  {
    id: "t4",
    question: "What if the item is different from the listing?",
    answer:
      "If the received item doesn’t match the order:\n1) Do not confirm receipt\n2) Chat with the traveler to try to resolve\n3) If unresolved, file a dispute on the order page\n4) TipL support will review and mediate\n5) Escrow funds will be returned if the dispute is decided in your favor.",
    category: "tiper",
  },
  // Traveler (Triper)
  {
    id: "r1",
    question: "How do I become a traveler?",
    answer:
      'To become a traveler:\n1) Sign in to your TipL account\n2) Open your profile and tap "Become a Tripper"\n3) Upload a selfie and your ID document\n4) Wait for verification (1–2 business days)\n5) Once approved you can create trips and accept orders.',
    category: "triper",
  },
  {
    id: "r2",
    question: "How do I create a trip?",
    answer:
      'After verification:\n1) Open "Create Trip"\n2) Enter origin and destination countries\n3) Choose destination city\n4) Set departure and return dates\n5) Provide baggage capacity (kg)\n6) Set a price range for your service\n7) Add items you can carry and publish the trip.',
    category: "triper",
  },
  {
    id: "r3",
    question: "How do I accept orders?",
    answer:
      'Orders can be accepted by:\n1) Taking a custom request posted by a buyer\n2) Agreeing with the buyer via chat and letting them create an order\n3) When an order appears, tap "Accept" on the order page\n4) Purchase the item and update the order status accordingly.',
    category: "triper",
  },
  {
    id: "r4",
    question: "How do I receive payment?",
    answer:
      'Payments are released when:\n1) The buyer confirms receipt of the item\n2) The order status becomes "completed"\n3) Escrow funds are automatically released to your account\n4) Make sure your payout account is configured in settings.',
    category: "triper",
  },
  // Payment (already had p1..p3 in ID list)
  {
    id: "p1",
    question: "What payment methods are available?",
    answer:
      "We support multiple payment methods via our payment partners:\n- Bank transfers\n- E-wallets (GoPay, OVO, Dana, etc.)\n- Credit/Debit cards\n- QR payments\nAvailable methods may vary depending on transaction amount and region.",
    category: "payment",
  },
  {
    id: "p2",
    question: "How long are funds held in escrow?",
    answer:
      "Funds are held in escrow until:\n1) The buyer confirms receipt\n2) Or a configured timeout elapses (typically 7–14 days after delivery)\n3) If a dispute is filed, funds remain held until the dispute is resolved.",
    category: "payment",
  },
  {
    id: "p3",
    question: "What should I do if payment fails?",
    answer:
      'If a payment attempt fails:\n1) Check your internet connection\n2) Ensure your card or balance has sufficient funds\n3) Try an alternative payment method\n4) Contact support if the issue persists\nOrders may stay in an "accepted" state for a short retry window.',
    category: "payment",
  },
  // Dispute
  {
    id: "d1",
    question: "When can I file a dispute?",
    answer:
      "You can file a dispute when:\n1) The item is not received within the agreed timeframe\n2) The received item does not match the description\n3) The item is damaged on arrival\n4) The traveler is unresponsive\nFile a dispute from the order detail page before confirming receipt.",
    category: "dispute",
  },
  {
    id: "d2",
    question: "How are disputes resolved?",
    answer:
      "Dispute resolution process:\n1) Submit a dispute with clear evidence\n2) TipL reviews evidence from both parties\n3) Mediation is performed to reach a solution\n4) If no agreement, TipL decides based on available evidence\n5) The decision is final and binding.",
    category: "dispute",
  },
  {
    id: "d3",
    question: "Will I get a refund if the dispute is won?",
    answer:
      "Yes, if your dispute is approved:\n1) Escrow funds will be refunded to the buyer\n2) The traveler will not receive payment\n3) The order will be marked as disputed and then cancelled\nProvide strong evidence when filing a dispute.",
    category: "dispute",
  },
];

const CATEGORIES_ID = [
  { id: "all", label: "Semua", icon: "apps-outline" as const },
  { id: "general", label: "Umum", icon: "information-circle-outline" as const },
  { id: "tiper", label: "Pembeli", icon: "cart-outline" as const },
  { id: "triper", label: "Traveler", icon: "airplane-outline" as const },
  { id: "payment", label: "Pembayaran", icon: "card-outline" as const },
  { id: "dispute", label: "Dispute", icon: "alert-circle-outline" as const },
];

const CATEGORIES_EN = [
  { id: "all", label: "All", icon: "apps-outline" as const },
  {
    id: "general",
    label: "General",
    icon: "information-circle-outline" as const,
  },
  { id: "tiper", label: "Buyer", icon: "cart-outline" as const },
  { id: "triper", label: "Traveler", icon: "airplane-outline" as const },
  { id: "payment", label: "Payment", icon: "card-outline" as const },
  { id: "dispute", label: "Dispute", icon: "alert-circle-outline" as const },
];

export default function HelpScreen() {
  const { t, locale } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const FAQS = locale === "id" ? FAQS_ID : FAQS_EN;
  const CATEGORIES = locale === "id" ? CATEGORIES_ID : CATEGORIES_EN;

  const filteredFAQs =
    selectedCategory === "all"
      ? FAQS
      : FAQS.filter((faq) => faq.category === selectedCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <PageHeader title={t.helpSupport} onBack={() => router.back()} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.hero}
        >
          <Ionicons name="help-circle-outline" size={48} color={Colors.white} />
          <Text style={styles.heroTitle}>
            {locale === "id" ? "Butuh Bantuan?" : "Need help?"}
          </Text>
          <Text style={styles.heroSub}>
            {locale === "id"
              ? "Temukan jawaban untuk pertanyaan seputar jasa titip"
              : "Find answers to common questions about TipL services"}
          </Text>
        </LinearGradient>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>
            {locale === "id" ? "Kategori" : "Categories"}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={
                    selectedCategory === cat.id ? Colors.white : Colors.darkGray
                  }
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.id &&
                      styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            {locale === "id" ? "Pertanyaan Umum" : "Frequently Asked Questions"}
          </Text>
          {filteredFAQs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqQuestionContent}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: getCategoryColor(faq.category) },
                    ]}
                  />
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                </View>
                <Ionicons
                  name={expandedId === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={Colors.gray}
                />
              </TouchableOpacity>
              {expandedId === faq.id && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>
            {locale === "id" ? "Masih Butuh Bantuan?" : "Still need help?"}
          </Text>
          <Text style={styles.contactSub}>
            {locale === "id"
              ? "Tim support kami siap membantu Anda 24/7"
              : "Our support team is ready to help 24/7"}
          </Text>
          <TouchableOpacity style={styles.contactBtn} onPress={() => {}}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={Colors.white}
            />
            <Text style={styles.contactBtnText}>
              {locale === "id" ? "Hubungi Support" : "Contact Support"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    general: Colors.info,
    tiper: Colors.primary,
    triper: Colors.warning,
    payment: Colors.success,
    dispute: Colors.error,
  };
  return colors[category] ?? Colors.gray;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  scroll: { flex: 1 },

  hero: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  heroTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes["2xl"],
    color: Colors.white,
    marginTop: Spacing.md,
  },
  heroSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },

  categorySection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    flexDirection: "row",
    gap: Spacing.base,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },

  faqSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  faqItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  faqQuestionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  faqQuestionText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    flex: 1,
  },
  faqAnswer: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    backgroundColor: Colors.offWhite,
  },
  faqAnswerText: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.charcoal,
    lineHeight: 22,
  },

  contactSection: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  contactSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  contactBtnText: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
