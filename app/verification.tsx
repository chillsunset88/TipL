import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageHeader } from '@/src/components/ui/PageHeader';
import * as ImagePicker from 'expo-image-picker';
import { Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useAuthStore } from '@/src/store/authStore';
import { submitVerification } from '@/src/services/supabase/verification';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

type Step = 'selfie' | 'ktp' | 'review';

const STEPS: Step[] = ['selfie', 'ktp', 'review'];
const STEP_LABELS = { selfie: 'Selfie', ktp: 'KTP', review: 'Review' };

export default function VerificationScreen() {
  const C = useThemeColors();
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
      cameraType: ImagePicker.CameraType.front,
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

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.offWhite },

    stepper: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: Spacing['2xl'], paddingTop: Spacing.md, paddingBottom: Spacing.base,
      backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.lightGray,
    },
    stepItem: { alignItems: 'center', gap: 4 },
    stepCircle: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: C.lightGray, alignItems: 'center', justifyContent: 'center',
    },
    stepCircleActive: { backgroundColor: C.primary },
    stepNum: { fontFamily: Typography.regular.fontFamily, fontSize: 12, color: C.gray },
    stepNumActive: { color: '#FFFFFF' },
    stepLabel: { fontFamily: Typography.regular.fontFamily, fontSize: 10, color: C.gray },
    stepLabelActive: { color: C.primary, fontFamily: Typography.medium.fontFamily },
    stepLine: { flex: 1, height: 2, backgroundColor: C.lightGray, marginBottom: 14, marginHorizontal: 4 },
    stepLineActive: { backgroundColor: C.primary },

    scroll: { flex: 1 },
    content: { padding: Spacing.xl, paddingBottom: 60 },
    stepContent: { gap: Spacing.lg },

    stepIconWrap: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: C.primary + '15', alignItems: 'center', justifyContent: 'center',
      alignSelf: 'center',
    },
    stepTitle: {
      fontFamily: Typography.serifBold.fontFamily,
      fontSize: Typography.sizes.xl,
      color: C.nearBlack,
      textAlign: 'center',
    },
    stepDesc: {
      fontFamily: Typography.regular.fontFamily,
      fontSize: Typography.sizes.sm,
      color: C.darkGray,
      textAlign: 'center',
      lineHeight: 20,
    },

    tips: { backgroundColor: C.white, borderRadius: BorderRadius.lg, padding: Spacing.base, gap: Spacing.sm, borderWidth: 1, borderColor: C.lightGray },
    tipRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    tipTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm, color: C.charcoal, flex: 1 },

    previewWrap: { alignItems: 'center', gap: Spacing.md },
    selfiePreview: { width: 180, height: 180, borderRadius: 90, borderWidth: 3, borderColor: C.primary },
    ktpPreview: { width: '100%', height: 180, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: C.primary },
    retakeRow: { flexDirection: 'row', gap: Spacing.md },
    retakeBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 5,
      paddingHorizontal: Spacing.md, paddingVertical: 7,
      borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: C.primary,
      backgroundColor: C.primary + '15',
    },
    retakeTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.sm, color: C.primary },

    pickRow: { flexDirection: 'row', gap: Spacing.md },
    cameraBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: C.primary, paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md,
    },
    cameraBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
    galleryBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: C.white, paddingVertical: Spacing.md,
      borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: C.primary,
    },
    galleryBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.primary },

    nextBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: C.primary, paddingVertical: Spacing.md + 2,
      borderRadius: BorderRadius.full,
    },
    nextBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },

    reviewCard: {
      backgroundColor: C.white, borderRadius: BorderRadius.lg,
      padding: Spacing.base, borderWidth: 1, borderColor: C.lightGray, ...Shadows.sm,
    },
    reviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    reviewSelfie: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: C.primary },
    reviewKtp: { width: 90, height: 56, borderRadius: BorderRadius.sm, borderWidth: 2, borderColor: C.primary },
    reviewInfo: { flex: 1, gap: 3 },
    reviewLabel: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: C.nearBlack },
    reviewSub: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.darkGray },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2, alignSelf: 'flex-start' },
    editBtnTxt: { fontFamily: Typography.medium.fontFamily, fontSize: Typography.sizes.xs, color: C.primary },
    reviewDivider: { height: 1, backgroundColor: C.lightGray, marginVertical: Spacing.md },

    infoBox: {
      flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
      backgroundColor: C.primary + '12', borderRadius: BorderRadius.md,
      padding: Spacing.md, borderWidth: 1, borderColor: C.primary + '30',
    },
    infoTxt: { flex: 1, fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.xs, color: C.primary, lineHeight: 18 },

    submitBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
      backgroundColor: C.primary, paddingVertical: Spacing.md + 2,
      borderRadius: BorderRadius.full, ...Shadows.md,
    },
    submitBtnDisabled: { opacity: 0.6 },
    submitBtnTxt: { fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.base, color: '#FFFFFF' },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title="Verifikasi Identitas" onBack={goBack} />

      {/* Step indicator */}
      <View style={s.stepper}>
        {STEPS.map((st, i) => (
          <React.Fragment key={st}>
            <View style={s.stepItem}>
              <View style={[s.stepCircle, i <= stepIndex && s.stepCircleActive]}>
                {i < stepIndex
                  ? <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
          <SelfieStep s={s} selfieUri={selfieUri} onTake={takeSelfie} onNext={() => setStep('ktp')} />
        )}
        {step === 'ktp' && (
          <KTPStep
            s={s}
            C={C}
            ktpUri={ktpUri}
            onPickGallery={pickKTPGallery}
            onPickCamera={pickKTPCamera}
            onNext={() => setStep('review')}
          />
        )}
        {step === 'review' && (
          <ReviewStep
            s={s}
            C={C}
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

function SelfieStep({ s, selfieUri, onTake, onNext }: {
  s: any;
  selfieUri: string | null;
  onTake: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.stepContent}>
      <View style={s.stepIconWrap}>
        <Ionicons name="camera" size={36} color={s.stepIconWrap.backgroundColor} />
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
            <Ionicons name="checkmark-circle" size={16} color={s.stepLabelActive.color} />
            <Text style={s.tipTxt}>{tip}</Text>
          </View>
        ))}
      </View>

      {selfieUri ? (
        <View style={s.previewWrap}>
          <Image source={{ uri: selfieUri }} style={s.selfiePreview} contentFit="cover" />
          <TouchableOpacity style={s.retakeBtn} onPress={onTake}>
            <Ionicons name="refresh" size={16} color={s.stepLabelActive.color} />
            <Text style={s.retakeTxt}>Ambil Ulang</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.cameraBtn} onPress={onTake}>
          <Ionicons name="camera-outline" size={22} color="#FFFFFF" />
          <Text style={s.cameraBtnTxt}>Buka Kamera</Text>
        </TouchableOpacity>
      )}

      {selfieUri && (
        <TouchableOpacity style={s.nextBtn} onPress={onNext}>
          <Text style={s.nextBtnTxt}>Lanjut ke KTP</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Step 2: KTP ───────────────────────────────────────────────────────────────

function KTPStep({ s, C, ktpUri, onPickGallery, onPickCamera, onNext }: {
  s: any;
  C: any;
  ktpUri: string | null;
  onPickGallery: () => void;
  onPickCamera: () => void;
  onNext: () => void;
}) {
  return (
    <View style={s.stepContent}>
      <View style={s.stepIconWrap}>
        <Ionicons name="card" size={36} color={C.primary} />
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
            <Ionicons name="checkmark-circle" size={16} color={C.success} />
            <Text style={s.tipTxt}>{tip}</Text>
          </View>
        ))}
      </View>

      {ktpUri ? (
        <View style={s.previewWrap}>
          <Image source={{ uri: ktpUri }} style={s.ktpPreview} contentFit="cover" />
          <View style={s.retakeRow}>
            <TouchableOpacity style={s.retakeBtn} onPress={onPickCamera}>
              <Ionicons name="camera-outline" size={16} color={C.primary} />
              <Text style={s.retakeTxt}>Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.retakeBtn} onPress={onPickGallery}>
              <Ionicons name="images-outline" size={16} color={C.primary} />
              <Text style={s.retakeTxt}>Galeri</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={s.pickRow}>
          <TouchableOpacity style={[s.cameraBtn, { flex: 1 }]} onPress={onPickCamera}>
            <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={s.cameraBtnTxt}>Foto Langsung</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.galleryBtn, { flex: 1 }]} onPress={onPickGallery}>
            <Ionicons name="images-outline" size={20} color={C.primary} />
            <Text style={s.galleryBtnTxt}>Dari Galeri</Text>
          </TouchableOpacity>
        </View>
      )}

      {ktpUri && (
        <TouchableOpacity style={s.nextBtn} onPress={onNext}>
          <Text style={s.nextBtnTxt}>Review & Kirim</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Step 3: Review & Submit ───────────────────────────────────────────────────

function ReviewStep({ s, C, selfieUri, ktpUri, submitting, onSubmit, onEditSelfie, onEditKTP }: {
  s: any;
  C: any;
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
        <Ionicons name="shield-checkmark" size={36} color={C.primary} />
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
              <Ionicons name="create-outline" size={14} color={C.primary} />
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
              <Ionicons name="create-outline" size={14} color={C.primary} />
              <Text style={s.editBtnTxt}>Ganti</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={s.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color={C.primary} />
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
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="send" size={18} color="#FFFFFF" />
            <Text style={s.submitBtnTxt}>Kirim Verifikasi</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
