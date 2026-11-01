'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useCartStore } from '@/lib/cartStore';

export default function OrderConfetti() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Clear cart once order confirmation screen is safely displayed
    try {
      clearCart();
    } catch (e) {
      // Ignore
    }

    try {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#D40000', '#FFC400', '#FF6B00', '#FFD700', '#00C853'],
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } catch (e) {
      // Confetti fallback
    }
  }, []);

  return null;
}
