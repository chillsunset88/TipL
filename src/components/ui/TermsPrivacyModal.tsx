import { Button } from '@/src/components/ui/Button';
import { Colors, Spacing, Typography } from '@/src/lib/constants';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TermsPrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
  requireAcceptance?: boolean;
  onAccept?: () => void;
}

export const TermsPrivacyModal: React.FC<TermsPrivacyModalProps> = ({ visible, onClose, type, requireAcceptance, onAccept }) => {
  const isTerms = type === 'terms';
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const checkScrollable = (cHeight: number, sHeight: number) => {
    if (!requireAcceptance) return;
    if (cHeight > 0 && sHeight > 0 && cHeight <= sHeight) setIsScrolledToBottom(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!requireAcceptance) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) setIsScrolledToBottom(true);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.btn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            disabled={requireAcceptance}
          >
            {!requireAcceptance && <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />}
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {isTerms ? 'Terms and Privacy' : 'Privacy Policy'}
          </Text>
          <View style={styles.btn} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setScrollViewHeight(h);
            checkScrollable(contentHeight, h);
          }}
          onContentSizeChange={(w, h) => {
            setContentHeight(h);
            checkScrollable(h, scrollViewHeight);
          }}
        >
          <Text style={styles.lastUpdated}>Last updated: May 2026</Text>

          {isTerms ? (
            <>
              <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
              <Text style={styles.paragraph}>By accessing and using this application, you accept and agree to be bound by the terms and provision of this agreement.</Text>

              <Text style={styles.sectionTitle}>2. Use License</Text>
              <Text style={styles.paragraph}>Permission is granted to temporarily download one copy of the materials (information or software) on TipL's app for personal, non-commercial transitory viewing only.</Text>

              <Text style={styles.sectionTitle}>3. Disclaimer</Text>
              <Text style={styles.paragraph}>The materials on TipL's app are provided on an 'as is' basis. TipL makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</Text>

              <Text style={styles.sectionTitle}>4. Limitations</Text>
              <Text style={styles.paragraph}>In no event shall TipL or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TipL's app.</Text>

              <Text style={styles.sectionTitle}>5. Revisions and Errata</Text>
              <Text style={styles.paragraph}>The materials appearing on TipL's app could include technical, typographical, or photographic errors. TipL does not warrant that any of the materials on its app are accurate, complete, or current. TipL may make changes to the materials contained on its app at any time without notice.</Text>

              <Text style={styles.sectionTitle}>6. Links</Text>
              <Text style={styles.paragraph}>TipL has not reviewed all of the sites linked to its app and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TipL of the site. Use of any such linked website is at the user's own risk.</Text>

              <Text style={styles.sectionTitle}>7. Governing Law</Text>
              <Text style={styles.paragraph}>Any claim relating to TipL's app shall be governed by the laws of the State without regard to its conflict of law provisions.</Text>
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>1. Information We Collect</Text>
              <Text style={styles.paragraph}>We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us.</Text>

              <Text style={styles.sectionTitle}>2. How We Use Information</Text>
              <Text style={styles.paragraph}>We may use the information we collect about you to provide, maintain, and improve our services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users, develop safety features, authenticate users, and send product updates and administrative messages.</Text>

              <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
              <Text style={styles.paragraph}>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: with vendors, consultants, marketing partners, and other service providers who need access to such information to carry out work on our behalf.</Text>

              <Text style={styles.sectionTitle}>4. Security</Text>
              <Text style={styles.paragraph}>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.</Text>

              <Text style={styles.sectionTitle}>5. Data Retention</Text>
              <Text style={styles.paragraph}>We store the information we collect about you for as long as is necessary for the purpose(s) for which we originally collected it. We may retain certain information for legitimate business purposes or as required by law.</Text>

              <Text style={styles.sectionTitle}>6. Your Choices</Text>
              <Text style={styles.paragraph}>Account Information: You may update, correct, or delete information about you at any time by logging into your online account or by contacting us. If you wish to delete your account, please email us.</Text>

              <Text style={styles.sectionTitle}>7. Promotional Communications</Text>
              <Text style={styles.paragraph}>You may opt out of receiving promotional messages from us by following the instructions in those messages. If you opt out, we may still send you non-promotional communications, such as those about your account, about Services you have requested, or our ongoing business relations.</Text>
            </>
          )}
        </ScrollView>

        {requireAcceptance && (
          <View style={styles.footer}>
            <Button title="I Accept" onPress={() => onAccept?.()} disabled={!isScrolledToBottom} fullWidth />
            {!isScrolledToBottom && (
              <Text style={styles.scrollPrompt}>Please scroll to the bottom to accept</Text>
            )}
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, // putih, bukan offWhite
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Typography.medium.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    textAlign: 'center',
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  lastUpdated: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.gray,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: Typography.semiBold.fontFamily, // sedikit lebih tebal dari medium
    fontSize: Typography.sizes.base,
    color: Colors.nearBlack,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    backgroundColor: Colors.white,
  },
  scrollPrompt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});