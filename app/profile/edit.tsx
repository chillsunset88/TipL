/**
 * TipL — Edit Profile Screen
 * Change avatar, display name, and email.
 * Theme-aware: supports Dark Mode & Light Mode.
 */

import React, { useState } from 'react';
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
import { PageHeader } from '@/src/components/ui/PageHeader';
import * as ImagePicker from 'expo-image-picker';
import { Typography, Spacing, BorderRadius } from '@/src/lib/constants';
import { Avatar } from '@/src/components/ui/Avatar';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { updateProfile as updateSupabaseProfile, uploadAvatar } from '@/src/services/supabase/profiles';
import { useThemeColors } from '@/src/lib/hooks/useThemeColors';

export default function EditProfileScreen() {
  const C = useThemeColors();
  const { t } = useSettingsStore();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '+62');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUrl ?? null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t.permissionRequired, t.galleryPermission);
      return;
    }
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
    if (!displayName.trim()) {
      Alert.alert(t.error, t.nameEmpty);
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      let finalAvatarUrl = avatarUri;
      if (avatarUri && avatarUri !== user.avatarUrl && !avatarUri.startsWith('http')) {
        finalAvatarUrl = await uploadAvatar(user.id, avatarUri);
      }

      await updateSupabaseProfile(user.id, {
        full_name: displayName.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatar_url: finalAvatarUrl ?? undefined,
      });

      setUser({ ...user, displayName: displayName.trim(), phone: phone.trim(), bio: bio.trim(), avatarUrl: finalAvatarUrl ?? null });

      Alert.alert(t.profileSaved, t.profileUpdated, [
        { text: t.ok, onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert(t.error, t.failedUpdateProfile);
    } finally {
      setLoading(false);
    }
  };

  const s = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.white },
    floatingBack: {
      position: 'absolute', top: 12, left: 20, zIndex: 10,
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.06)',
      alignItems: 'center', justifyContent: 'center',
    },
    container: { flex: 1, paddingHorizontal: Spacing.xl },
    avatarSection: {
      alignItems: 'center', paddingVertical: Spacing['2xl'],
    },
    cameraBadge: {
      position: 'absolute', bottom: 0, right: 0,
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: C.white,
    },
    changePhotoText: {
      fontFamily: Typography.regular.fontFamily, fontSize: Typography.sizes.sm,
      color: C.primary, marginTop: Spacing.sm,
    },
  }), [C]);

  return (
    <SafeAreaView style={s.safe} edges={[]}>
      <PageHeader title={t.editProfileTitle} onBack={() => router.back()} />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity onPress={pickAvatar}>
            <Avatar uri={avatarUri} name={displayName} size="xl" />
            <View style={s.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={s.changePhotoText}>{t.tapToChangePhoto}</Text>
        </View>

        {/* Form */}
        <Input label={t.fullName} value={displayName} onChangeText={setDisplayName} icon="person-outline" />
        <Input label={t.emailLabel} value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" autoCapitalize="none" />
        <Input label={t.phoneNumber} value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
        <Input label={t.bioLabel} value={bio} onChangeText={setBio} placeholder={t.bioPlaceholder} multiline numberOfLines={3} />

        <Button
          title={t.saveChanges}
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
