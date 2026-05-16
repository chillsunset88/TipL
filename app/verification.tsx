import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FloatingBackButton } from '@/src/components/ui/FloatingBackButton';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { submitVerification } from '@/src/services/supabase/verification';

type Step = 'selfie' | 'ktp' | 'review';

const STEPS: Step[] = ['selfie', 'ktp', 'review'];
const STEP_LABELS = { selfie: 'Selfie', ktp: 'KTP', review: 'Review' };

export default function VerificationScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState<Step>('selfie');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [ktpUri, setKtpUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const goBack = () => {
    if (step === 'selfie') router.back();
    else if (step === 'ktp') setStep('selfie');
    else setStep('ktp');
  };

  const takeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses kamera untuk mengambil selfie.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: 'front',
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
    }
  };

  const pickKTPGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses galeri untuk memilih foto KTP.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) setKtpUri(result.assets[0].uri);
  };

  const pickKTPCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Diperlukan', 'Izinkan akses kamera untuk foto KTP.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) setKtpUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!user || !selfieUri || !ktpUri) return;
    setSubmitting(true);
    try {
      await submitVerification(user.id, selfieUri, ktpUri);
      setUser({ ...user, verificationStatus: 'pending' });
      Alert.alert(
        'Verifikasi Terkirim!',
        'Dokumen kamu sedang ditinjau tim TipL. Kami akan menghubungi kamu dalam 1–2 hari kerja.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (e) {
      Alert.alert('Gagal Mengirim', e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <FloatingBackButton onPress={goBack} />

      {/* Step indicator */}
      <View style={s.stepper}>
        {STEPS.map((st, i) => (
          <React.Fragment key={st}>
            <View style={s.stepItem}>
              <View style={[s.stepCircle, i <= stepIndex && s.stepCircleActive]}>
                {i < stepIndex
                  ? <Ionicons name="checkmark" size={14} color={Colors.white} />
                  : <Text style={[s.stepNum, i <= stepIndex && s.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[s.stepLabel, i <= stepIndex && s.stepLabelActive]}>
                {STEP_LABELS[st]}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[s.stepLine, i < stepIndex && s.stepLineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {step === 'selfie' && (
          <SelfieStep selfieUri={selfieUri} onTake={takeSelfie} onNext={() => setStep('ktp')} />
        )}
        {step === 'ktp' && (
          <KTPStep
            ktpUri={ktpUri}
            onPickGallery={pickKTPGallery}
            onPickCamera={pickKTPCamera}
            onNext={() => setStep('review')}
          />
        )}
        {step === 'review' && (
          <ReviewStep
            selfieUri={selfieUri!}
            ktpUri={ktpUri!}
            submitting={submitting}
            onSubmit={handleSubmit}
            onEditSelfie={() => setStep('selfie')}
            onEditKTP={() => setStep('ktp')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Step 1: Selfie ────────────────────────────────────────────────────────────

function SelfieStep({ selfieUri, onTake, onNext }: {
  selfieUri: string | null;
  onTake: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.stepContent}>
      <View style={s.stepIconWrap}>
        <Ionicons name="camera" size={36} color={Colors.primary} />
      </View>
      <Text style={s.stepTitle}>Foto Selfie</Text>
      <Text style={s.stepDesc}>
        Ambil foto selfie dengan wajah menghadap kamera secara jelas. Pastikan pencahayaan cukup
        dan wajah tidak tertutup.
      </Text>

      <View style={s.tips}>
        {[
          'Wajah menghadap kamera langsung',
          'Cahaya cukup, tidak gelap atau silau',
          'Lepas kacamata atau topi',
          'Ekspresi netral, mulut tertutup',
        ].map((tip) => (
          <View key={tip} style={s.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={s.tipTxt}>{tip}</Text>
          </View>
        ))}
      </View>

      {selfieUri ? (
        <View style={s.previewWrap}>
          <Image source={{ uri: selfieUri }} style={s.selfiePreview} contentFit="cover" />
          <TouchableOpacity style={s.retakeBtn} onPress={onTake}>
            <Ionicons name="refresh" size={16} color={Colors.primary} />
            <Text style={s.retakeTxt}>Ambil Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.cameraBtn} onPress={onTake}>
          <Ionicons name="camera-outline" size={22} color={Colors.white} />
          <Text style={s.cameraBtnTxt}>Buka Kamera</Text>
        </TouchableOpacity>
      )}

      {selfieUri && (
        <TouchableOpacity style={s.nextBtn} onPress={onNext}>
          <Text style={s.nextBtnTxt}>Lanjut ke KTP</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Step 2: KTP ───────────────────────────────────────────────────────────────

function KTPStep({ ktpUri, onPickGallery, onPickCamera, onNext }: {
  ktpUri: string | null;
  onPickGallery: () => void;
  onPickCamera: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.stepContent}>
      <View style={s.stepIconWrap}>
        <Ionicons name="card" size={36} color={Colors.primary} />
      </View>
      <Text style={s.stepTitle}>Foto KTP / Identitas</Text>
      <Text style={s.stepDesc}>
        Upload foto KTP, SIM, atau paspor yang masih berlaku. Pastikan semua tulisan terbaca jelas.
      </Text>

      <View style={s.tips}>
        {[
          'Seluruh kartu terlihat dalam frame',
          'Foto tidak buram atau gelap',
          'Tidak ada bayangan menutupi teks',
          'Identitas masih berlaku',
        ].map((tip) => (
          <View key={tip} style={s.tipRow}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={s.tipTxt}>{tip}</Text>
          </View>
        ))}
      </View>

      {ktpUri ? (
        <View style={s.previewWrap}>
          <Image source={{ uri: ktpUri }} style={s.ktpPreview} contentFit="cover" />
          <View style={s.retakeRow}>
            <TouchableOpacity style={s.retakeBtn} onPress={onPickCamera}>
              <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              <Text style={s.retakeTxt}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.retakeBtn} onPress={onPickGallery}>
              <Ionicons name="images-outline" size={16} color={Colors.primary} />
              <Text style={s.retakeTxt}>Galeri</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.pickRow}>
          <TouchableOpacity style={[s.cameraBtn, { flex: 1 }]} onPress={onPickCamera}>
            <Ionicons name="camera-outline" size={20} color={Colors.white} />
            <Text style={s.cameraBtnTxt}>Foto Langsung</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.galleryBtn, { flex: 1 }]} onPress={onPickGallery}>
            <Ionicons name="images-outline" size={20} color={Colors.primary} />
            <Text style={s.galleryBtnTxt}>Dari Galeri</Text>
          </TouchableOpacity>
        </View>
      )}

      {ktpUri && (
        <TouchableOpacity style={s.nextBtn} onPress={onNext}>
          <Text style={s.nextBtnTxt}>Review & Kirim</Text>
          <Ionicons name="arrow-forward" size={18} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Step 3: Review & Submit ───────────────────────────────────────────────────

function ReviewStep({ selfieUri, ktpUri, submitting, onSubmit, onEditSelfie, onEditKTP }: {
  selfieUri: string;
  ktpUri: string;
  submitting: boolean;
  onSubmit: () => void;
  onEditSelfie: () => void;
  onEditKTP: () => void;
}) {
  return (
    <View style={s.stepContent}>
      <View style={s.stepIconWrap}>
        <Ionicons name="shield-checkmark" size={36} color={Colors.primary} />
      </View>
      <Text style={s.stepTitle}>Review Dokumen</Text>
      <Text style={s.stepDesc}>
        Pastikan semua foto terlihat jelas sebelum mengirimkan verifikasi.
      </Text>

      <View style={s.reviewCard}>
        <View style={s.reviewRow}>
          <Image source={{ uri: selfieUri }} style={s.reviewSelfie} contentFit="cover" />
          <View style={s.reviewInfo}>
            <Text style={s.reviewLabel}>Foto Selfie</Text>
            <Text style={s.reviewSub}>Wajah terlihat jelas</Text>
            <TouchableOpacity onPress={onEditSelfie} style={s.editBtn}>
              <Ionicons name="create-outline" size={14} color={Colors.primary} />
              <Text style={s.editBtnTxt}>Ganti</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.reviewDivider} />

        <View style={s.reviewRow}>
          <Image source={{ uri: ktpUri }} style={s.reviewKtp} contentFit="cover" />
          <View style={s.reviewInfo}>
            <Text style={s.reviewLabel}>Foto KTP / Identitas</Text>
            <Text style={s.reviewSub}>Semua teks terbaca</Text>
            <TouchableOpacity onPress={onEditKTP} style={s.editBtn}>
              <Ionicons name="create-outline" size={14} color={Colors.primary} />
              <Text style={s.editBtnTxt}>Ganti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={s.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
        <Text style={s.infoTxt}>
          Data verifikasi kamu disimpan secara aman dan hanya digunakan untuk proses verifikasi
          identitas sesuai ketentuan TipL.
        </Text>
      </View>

      <TouchableOpacity
        style={[s.submitBtn, submitting && s.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <>
            <Ionicons name="send" size={18} color={Colors.white} />
            <Text style={s.submitBtnTxt}>Kirim Verifikasi</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  floatingBack: {
    position: 'absolute', top: 12, left: 20, zIndex: 10,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },

  stepper: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing['2xl'], paddingTop: 56, paddingBottom: Spacing.base,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  stepCircleActive: { backgroundColor: Colors.primary },
  stepNum: { fontFamily: Typography.regular.fontFamily, fontSize: 12, color: Colors.gray },
  stepNumActive: { color: Colors.white },
  stepLabel: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: Colors.gray },
  stepLabelActive: { color: Colors.primary, fontFamily: Typography.medium.fontFamily },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.lightGray, marginBottom: 14, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: Colors.primary },

  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 60 },
  stepContent: { gap: Spacing.lg },

  stepIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primaryPale, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  stepTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },

  tips: { backgroundColor: Colors.white, borderRadius: BorderRadius.lg, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.lightGray },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tipTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: Colors.charcoal, flex: 1 },

  previewWrap: { alignItems: 'center', gap: Spacing.md },
  selfiePreview: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: Colors.primary },
  ktpPreview: { width: '100%', height: 180, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: Colors.primary },
  retakeRow: { flexDirection: 'row', gap: Spacing.md },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.primary,
    backgroundColor: Colors.primaryPale,
  },
  retakeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: Colors.primary },

  pickRow: { flexDirection: 'row', gap: Spacing.md },
  cameraBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  cameraBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.white, paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.primary,
  },
  galleryBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.primary },

  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full,
  },
  nextBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },

  reviewCard: {
    backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.lightGray, ...Shadows.sm,
  },
  reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reviewSelfie: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: Colors.primaryLight },
  reviewKtp: { width: 90, height: 56, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: Colors.primaryLight },
  reviewInfo: { flex: 1, gap: 3 },
  reviewLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.nearBlack },
  reviewSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.darkGray },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, alignSelf: 'flex-start' },
  editBtnTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: Colors.primary },
  reviewDivider: { height: 1, backgroundColor: Colors.lightGray, marginVertical: Spacing.md },

  infoBox: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: BorderRadius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: Colors.info, lineHeight: 18 },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
    backgroundColor: Colors.primary, paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.full, ...Shadows.md,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: Colors.white },
});
