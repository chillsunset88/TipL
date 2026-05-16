import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/lib/constants';
import { getCitiesByCountry } from '@/src/services/supabase/trips';
import { COUNTRIES_DATA } from '@/src/lib/countryData';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - Spacing.xl * 2 - Spacing.md) / 2;
const CARD_H = CARD_W * 1.2;

// Static city images for popular cities
const CITY_IMAGES: Record<string, string> = {
  // Japan
  'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
  'Osaka': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600',
  'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
  'Nagoya': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600',
  'Sapporo': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600',
  'Hiroshima': 'https://images.unsplash.com/photo-1601823984263-4dbe0afc71b1?w=600',
  'Fukuoka': 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=600',
  'Nara': 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600',
  'Okinawa': 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=600',
  'Hakone': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600',
  // South Korea
  'Seoul': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600',
  'Busan': 'https://images.unsplash.com/photo-1604909052743-f37a0e25a88b?w=600',
  'Jeju': 'https://images.unsplash.com/photo-1570428695203-fb9a91f7c59f?w=600',
  // UK
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600',
  'Manchester': 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=600',
  'Edinburgh': 'https://images.unsplash.com/photo-1592278330690-a3a9beb59e73?w=600',
  'Oxford': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
  'Cambridge': 'https://images.unsplash.com/photo-1557212056-b7e0af60cbc2?w=600',
  // France
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600',
  'Lyon': 'https://images.unsplash.com/photo-1577058664559-4b73bcb5f12b?w=600',
  'Nice': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600',
  'Cannes': 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=600',
  // USA
  'New York': 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=600',
  'Los Angeles': 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600',
  'Las Vegas': 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600',
  'Miami': 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=600',
  'San Francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600',
  'Chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600',
  // Australia
  'Sydney': 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600',
  'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=600',
  'Brisbane': 'https://images.unsplash.com/photo-1566734904496-9309bb1798ae?w=600',
  'Gold Coast': 'https://images.unsplash.com/photo-1531794508588-f5e80cdf89e0?w=600',
  // UAE
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600',
  'Abu Dhabi': 'https://images.unsplash.com/photo-1574872040571-a03f29a0ea13?w=600',
  // Thailand
  'Bangkok': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
  'Chiang Mai': 'https://images.unsplash.com/photo-1545832964-df7474c32ee4?w=600',
  'Phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600',
  'Pattaya': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
  // Singapore areas
  'Marina Bay': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
  'Orchard': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
  'Sentosa': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600',
  // Malaysia
  'Kuala Lumpur': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600',
  'Penang': 'https://images.unsplash.com/photo-1561551838-a8ca61d9d074?w=600',
  'Langkawi': 'https://images.unsplash.com/photo-1552660084-e9c0f3f81a6b?w=600',
  // Italy
  'Rome': 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=600',
  'Venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600',
  'Milan': 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600',
  'Florence': 'https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=600',
  // Turkey
  'Istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600',
  'Cappadocia': 'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=600',
  'Antalya': 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600',
  // Spain
  'Barcelona': 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=600',
  'Madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600',
  'Seville': 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?w=600',
  'Ibiza': 'https://images.unsplash.com/photo-1505732159444-12e7fc85b701?w=600',
  // India
  'Mumbai': 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600',
  'Delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600',
  'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600',
  'Jaipur': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600',
  // China
  'Shanghai': 'https://images.unsplash.com/photo-1545893835-abaa8e6c13df?w=600',
  'Beijing': 'https://images.unsplash.com/photo-1508804052814-cd3ba865a116?w=600',
  'Chengdu': 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=600',
  // Germany
  'Berlin': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600',
  'Munich': 'https://images.unsplash.com/photo-1577679928694-7b2a70e0ab5a?w=600',
  'Hamburg': 'https://images.unsplash.com/photo-1554168084-c640c2e68df5?w=600',
  // Switzerland
  'Zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600',
  'Geneva': 'https://images.unsplash.com/photo-1569093958564-2cc03a55fd78?w=600',
  'Interlaken': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  'Zermatt': 'https://images.unsplash.com/photo-1467738048261-0b3bbf6d4bcd?w=600',
  // Taiwan
  'Taipei': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600',
  'Jiufen': 'https://images.unsplash.com/photo-1584647494254-1b38b15cd9e5?w=600',
  // Hong Kong
  'Central': 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=600',
  'Tsim Sha Tsui': 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?w=600',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600';

export default function CitiesScreen() {
  const { country } = useLocalSearchParams<{ country: string }>();
  const [supabaseCounts, setSupabaseCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Find static city list for this country
  const countryData = COUNTRIES_DATA.find(
    (c) => c.name.toLowerCase() === (country ?? '').toLowerCase()
  );
  const staticCities = countryData?.cities ?? [];

  useEffect(() => {
    if (!country) { setLoading(false); return; }
    getCitiesByCountry(country)
      .then((data) => {
        const counts: Record<string, number> = {};
        for (const { city, count } of data) counts[city] = count;
        setSupabaseCounts(counts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [country]);

  // Merge static cities with Supabase: sort those with real trips first
  const cities = staticCities.slice().sort((a, b) => {
    const ca = supabaseCounts[a] ?? 0;
    const cb = supabaseCounts[b] ?? 0;
    return cb - ca; // cities with real trips bubble up
  });

  const handleCityPress = (city: string) => {
    router.push({
      pathname: '/destination/[name]',
      params: { name: city, imageUrl: encodeURIComponent(CITY_IMAGES[city] ?? FALLBACK_IMAGE) },
    } as any);
  };

  const handleAllPress = () => {
    router.push({
      pathname: '/destination/[name]',
      params: { name: country, imageUrl: encodeURIComponent(countryData?.imageUrl ?? FALLBACK_IMAGE) },
    } as any);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.nearBlack} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.countryFlag}>{countryData?.flag ?? '🌍'}</Text>
          <Text style={s.headerTitle}>{country}</Text>
          <Text style={s.headerSub}>Pilih kota tujuan</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing['2xl'] }} />
      ) : (
        <FlatList
          data={cities}
          keyExtractor={(item) => item}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Semua Kota card */}
              <TouchableOpacity style={s.allCard} activeOpacity={0.85} onPress={handleAllPress}>
                <LinearGradient
                  colors={[Colors.primary, '#A07820']}
                  style={s.allGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="globe" size={26} color={Colors.white} />
                  <View>
                    <Text style={s.allTitle}>Semua Kota</Text>
                    <Text style={s.allSub}>Lihat semua jastiper ke {country}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
                </LinearGradient>
              </TouchableOpacity>

              <Text style={s.citiesLabel}>KOTA ({cities.length})</Text>
            </>
          }
          renderItem={({ item }) => (
            <CityCard
              city={item}
              count={supabaseCounts[item] ?? 0}
              imageUrl={CITY_IMAGES[item] ?? FALLBACK_IMAGE}
              onPress={() => handleCityPress(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function CityCard({ city, count, imageUrl, onPress }: {
  city: string;
  count: number;
  imageUrl: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={s.cityCard} activeOpacity={0.85} onPress={onPress}>
      <Image source={{ uri: imageUrl }} style={s.cityImg} contentFit="cover" transition={300} />
      <LinearGradient colors={['transparent', 'rgba(20,10,2,0.85)']} style={StyleSheet.absoluteFill}>
        <View style={s.cityInfo}>
          <Text style={s.cityName} numberOfLines={1}>{city}</Text>
          {count > 0 ? (
            <View style={s.cityPill}>
              <Ionicons name="person" size={9} color={Colors.primary} />
              <Text style={s.cityPillTxt}>{count} jastiper</Text>
            </View>
          ) : (
            <View style={[s.cityPill, s.cityPillEmpty]}>
              <Ionicons name="airplane-outline" size={9} color="rgba(255,255,255,0.6)" />
              <Text style={s.cityPillEmptyTxt}>Tersedia</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  countryFlag: { fontSize: 20 },
  headerTitle: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.lg,
    color: Colors.nearBlack,
  },
  headerSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: Colors.darkGray,
  },

  list: { padding: Spacing.xl, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: Spacing.md },

  allCard: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  allGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  allTitle: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },
  allSub: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: Typography.sizes.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  citiesLabel: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 10,
    color: Colors.darkGray,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  cityCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cityImg: { width: '100%', height: '100%' },
  cityInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.md,
    gap: 5,
  },
  cityName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(197,162,103,0.22)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  cityPillTxt: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 9,
    color: Colors.primary,
  },
  cityPillEmpty: {
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cityPillEmptyTxt: {
    fontFamily: Typography.medium.fontFamily,
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
});
