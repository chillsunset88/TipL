import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { Colors, Typography } from '@/src/lib/constants';

const { width } = Dimensions.get('window');

interface Props {
  authReady: boolean;
  onDone: () => void;
}

export function AnimatedSplash({ authReady, onDone }: Props) {
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const fadingRef = useRef(false);
  const minTimeRef = useRef(false);
  const authReadyRef = useRef(authReady);

  const triggerFadeOut = () => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => onDone());
  };

  // Logo enters on mount + start minimum 1.5s timer
  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 55,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const timer = setTimeout(() => {
      minTimeRef.current = true;
      if (authReadyRef.current) triggerFadeOut();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Fade out when auth is ready AND minimum time has passed
  useEffect(() => {
    authReadyRef.current = authReady;
    if (authReady && minTimeRef.current) triggerFadeOut();
  }, [authReady]);

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.logoWrap,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Logo image */}
        <Image
          source={require('@/assets/images/tipl-icon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Brand name */}
        <Text style={styles.brandName}>TipL</Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Jastip terpercaya, di mana saja
        </Animated.Text>
      </Animated.View>

      {/* Dots loader di bawah */}
      <Animated.View style={[styles.dotsWrap, { opacity: taglineOpacity }]}>
        <LoadingDots />
      </Animated.View>
    </Animated.View>
  );
}

function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ]),
      );

    const a1 = pulse(dot1, 0);
    const a2 = pulse(dot2, 200);
    const a3 = pulse(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.dots}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  brandName: {
    fontFamily: Typography.serifBold.fontFamily,
    fontSize: 40,
    color: Colors.nearBlack,
    letterSpacing: 2,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: Typography.regular.fontFamily,
    fontSize: 14,
    color: Colors.darkGray,
    letterSpacing: 0.5,
  },
  dotsWrap: {
    position: 'absolute',
    bottom: 80,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
