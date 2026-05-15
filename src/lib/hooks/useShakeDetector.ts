/**
 * TipL — Shake Detector Hook
 * Uses the gyroscope to detect a shake gesture (angular velocity threshold).
 * Fires onShake once per shake event; debounced with a cooldown.
 */

import { useEffect, useRef } from 'react';
import { Gyroscope } from 'expo-sensors';

const SHAKE_THRESHOLD = 2.5; // rad/s
const COOLDOWN_MS = 2000;

export function useShakeDetector(onShake: () => void, enabled = true) {
  const lastFiredAt = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    Gyroscope.setUpdateInterval(100);

    const subscription = Gyroscope.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD && now - lastFiredAt.current > COOLDOWN_MS) {
        lastFiredAt.current = now;
        onShake();
      }
    });

    return () => subscription.remove();
  }, [onShake, enabled]);
}
