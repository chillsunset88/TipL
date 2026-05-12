/**
 * TipL — Edit Profile Screen
 * Change avatar, display name, and email.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { auth } from '@/src/lib/firebase';
import { updateProfile } from 'firebase/auth';
import { useAuthStore } from '@/src/store/authStore';
import { updateUserProfile } from '@/src/services/firebase';

export default function EditProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+62');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
      setPhone(user.phone || '+62');
      setBio(user.bio ?? '');
      setAvatarUri(user.avatarUrl);
    }
  }, [user]);

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'No authenticated user found.');
      return;
    }

    if (!displayName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        displayName: displayName.trim(),
        avatarUrl: avatarUri ?? null,
        phone: phone.trim(),
        bio: bio.trim(),
      };

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
          ...(updates.avatarUrl ? { photoURL: updates.avatarUrl } : {}),
        });
      }

      await updateUserProfile(user.id, updates);
      setUser({ ...user, ...updates });

      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.nearBlack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar}>
            <Avatar uri={avatarUri} name={displayName} size="xl" />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Tap to change photo</Text>
        </View>

        {/* Form */}
        <Input label="Full Name" value={displayName} onChangeText={setDisplayName} icon="person-outline" />
        <Input label="Email" value={email} editable={false} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
        <Input label="Bio" value={bio} onChangeText={setBio} placeholder="Tell others about yourself..." multiline numberOfLines={3} />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.lg, marginBottom: Spacing['5xl'] }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.offWhite, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Typography.serifBold.fontFamily, fontSize: Typography.sizes.md, color: Colors.nearBlack,
  },
  container: { flex: 1, paddingHorizontal: Spacing.xl },
  avatarSection: {
    alignItems: 'center', paddingVertical: Spacing['2xl'],
  },
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  changePhotoText: {
    fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
    color: Colors.primary, marginTop: Spacing.sm,
  },
});
