import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { useSettingsStore } from '@/src/store/settingsStore';

const STAR_LABELS = ['Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'];

interface Props {
  visible: boolean;
  travelerName: string;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export function ReviewModal({ visible, travelerName, onClose, onSubmit }: Props) {
  const { t } = useSettingsStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) {
      setRating(0);
      setComment('');
      setLoading(false);
      setDone(false);
    }
  }, [visible]);

  const handleStarPress = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await onSubmit(rating, comment.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDone(true);
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Gagal Mengirim Ulasan', e?.message ?? 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={done ? onClose : undefined} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {done ? (
            /* ── Done state ── */
            <View style={styles.doneWrap}>
              <View style={styles.doneIconRing}>
                <Ionicons name="checkmark-circle" size={56} color={Colors.success} />
              </View>
              <Text style={styles.doneTitle}>{t.reviewSubmitted}</Text>
              <Text style={styles.doneSub}>{t.reviewThankYou}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>{t.close}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Form state ── */
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{t.leaveReview}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={8}>
                  <Ionicons name="close" size={22} color={Colors.charcoal} />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>{t.rateYourExperience}</Text>
              <Text style={styles.travelerName}>{travelerName}</Text>

              {/* Stars */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(star)}
                    activeOpacity={0.7}
                    style={styles.starBtn}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={38}
                      color={star <= rating ? Colors.primary : Colors.midGray}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {rating > 0 && (
                <Text style={styles.ratingLabel}>{STAR_LABELS[rating - 1]}</Text>
              )}

              {/* Comment */}
              <TextInput
                style={styles.commentInput}
                placeholder={t.writeComment}
                placeholderTextColor={Colors.gray}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={3}
                maxLength={300}
              />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, (rating === 0 || loading) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={rating === 0 || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.submitBtnText}>{t.submitReview}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    ...Shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.lightGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.xl,
    color: Colors.nearBlack,
  },
  subtitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  travelerName: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginBottom: Spacing.xl,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  starBtn: {
    padding: Spacing.xs,
  },
  ratingLabel: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.nearBlack,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.offWhite,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    ...Shadows.sm,
  },
  submitBtnDisabled: {
    opacity: 0.45,
  },
  submitBtnText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },

  // Done state
  doneWrap: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  doneIconRing: {
    marginBottom: Spacing.lg,
  },
  doneTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes['2xl'],
    color: Colors.nearBlack,
    marginBottom: Spacing.sm,
  },
  doneSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    marginBottom: Spacing.xl,
  },
  closeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing['2xl'],
  },
  closeBtnText: {
    fontFamily: Typography.semiBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
});
