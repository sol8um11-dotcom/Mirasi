"use client";

import { useCallback, useRef } from "react";

interface CheckoutOptions {
  razorpayOrderId: string;
  amount: number;
  currency?: string;
  key: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onError: (error: { code: string; description: string }) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

/**
 * Hook for loading Razorpay checkout.js and opening the payment modal.
 */
export function useRazorpay() {
  const scriptLoaded = useRef(false);

  const loadScript = useCallback((): Promise<void> => {
    if (scriptLoaded.current && window.Razorpay) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector('script[src*="checkout.razorpay.com"]')) {
        scriptLoaded.current = true;
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error("Failed to load Razorpay checkout."));
      };
      document.body.appendChild(script);
    });
  }, []);

  const openCheckout = useCallback(
    async (options: CheckoutOptions) => {
      await loadScript();

      const rzp = new window.Razorpay({
        key: options.key,
        amount: options.amount,
        currency: options.currency ?? "INR",
        order_id: options.razorpayOrderId,
        name: "Mirasi",
        description: "HD Portrait Download",
        image: "/icons/icon-192x192.png",
        prefill: options.prefill ?? {},
        theme: {
          color: "#C75B12",
        },
        handler: (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          options.onSuccess(response);
        },
        modal: {
          ondismiss: () => {
            options.onDismiss?.();
          },
          escape: true,
          confirm_close: true,
        },
      });

      rzp.open();
    },
    [loadScript]
  );

  return { openCheckout };
}
