/**
 * TipL — Xendit QR Payment Screen
 * Displays the QRIS code generated from Xendit.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';

const GREEN = '#00AA5B';

export default function XenditQRScreen() {
  const { qrString, amount, externalId } = useLocalSearchParams<{ 
    qrString: string; 
    amount: string; 
    externalId: string 
  }>();

  const [loading, setLoading] = useState(true);

  // Generate QR image URL using an external API for simplicity
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString || '')}`;

  const fmtIDR = (v: number) => 'Rp ' + v.toLocaleString('id-ID');

  const handleDone = () => {
    Alert.alert(
      'Payment Confirmation',
      'Have you completed the payment? Once confirmed, your order will be processed.',
      [
        { text: 'Not Yet', style: 'cancel' },
        { 
          text: 'Yes, Done', 
          onPress: () => {
            router.replace('/profile/orders');
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => router.back()} style={st.backBtn}>
          <Ionicons name="close" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Bayar via QRIS</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <View style={st.amountCard}>
          <Text style={st.amountLbl}>Total Pembayaran</Text>
          <Text style={st.amountVal}>{fmtIDR(Number(amount))}</Text>
          <Text style={st.orderId}>Order ID: {externalId}</Text>
        </View>

        <View style={st.qrCard}>
          <View style={st.qrisHeader}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png' }} 
              style={st.qrisLogo}
              contentFit="contain"
            />
          </View>
          
          <View style={st.qrContainer}>
            {loading && <ActivityIndicator style={st.loader} color={GREEN} />}
            <Image 
              source={{ uri: qrImageUrl }} 
              style={st.qrImg}
              onLoadEnd={() => setLoading(false)}
              contentFit="contain"
            />
          </View>

          <Text style={st.qrHint}>Scan QR di atas menggunakan aplikasi m-banking atau e-wallet Anda</Text>
        </View>

        <View style={st.guideCard}>
          <Text style={st.guideTitle}>Cara Pembayaran:</Text>
          <Text style={st.guideStep}>1. Buka aplikasi m-banking atau e-wallet (Gopay, OVO, Dana, dll).</Text>
          <Text style={st.guideStep}>2. Pilih menu Scan/Bayar.</Text>
          <Text style={st.guideStep}>3. Arahkan kamera ke kode QR di atas.</Text>
          <Text style={st.guideStep}>4. Periksa detail pembayaran dan konfirmasi.</Text>
        </View>
      </ScrollView>

      <View style={st.footer}>
        <TouchableOpacity style={st.doneBtn} onPress={handleDone}>
          <Text style={st.doneBtnTxt}>Saya Sudah Bayar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: { width: 32, height: 32, justifyContent: 'center' },
  headerTitle: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack },
  content: { padding: Spacing.xl, alignItems: 'center' },
  
  amountCard: { width: '100%', alignItems: 'center', marginBottom: Spacing.xl },
  amountLbl: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.darkGray, marginBottom: 4 },
  amountVal: { fontFamily: Typography.bold.fontFamily, fontSize: 28, color: Colors.nearBlack, marginBottom: 4 },
  orderId: { fontFamily: Typography.medium.fontFamily, fontSize: 12, color: Colors.midGray },

  qrCard: { 
    backgroundColor: Colors.white, 
    borderRadius: BorderRadius.lg, 
    padding: Spacing.xl, 
    alignItems: 'center',
    width: '100%',
    ...Shadows.md
  },
  qrisHeader: { width: '100%', alignItems: 'center', marginBottom: Spacing.lg },
  qrisLogo: { width: 100, height: 30 },
  qrContainer: { 
    width: 240, 
    height: 240, 
    backgroundColor: Colors.offWhite, 
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg
  },
  loader: { position: 'absolute' },
  qrImg: { width: 220, height: 220 },
  qrHint: { fontFamily: Typography.medium.fontFamily, fontSize: 12, color: Colors.darkGray, textAlign: 'center', lineHeight: 18 },

  guideCard: { width: '100%', marginTop: Spacing.xl, padding: Spacing.lg, backgroundColor: '#E9ECEF', borderRadius: BorderRadius.md },
  guideTitle: { fontFamily: Typography.bold.fontFamily, fontSize: Typography.sizes.sm, color: Colors.nearBlack, marginBottom: Spacing.sm },
  guideStep: { fontFamily: Typography.regular.fontFamily, fontSize: 12, color: Colors.charcoal, marginBottom: 6, lineHeight: 18 },

  footer: { padding: Spacing.xl, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.lightGray },
  doneBtn: { backgroundColor: GREEN, paddingVertical: Spacing.md, borderRadius: BorderRadius.full, alignItems: 'center' },
  doneBtnTxt: { fontFamily: Typography.bold.fontFamily, color: Colors.white, fontSize: Typography.sizes.md },
});
