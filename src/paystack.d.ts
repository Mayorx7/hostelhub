// Type declarations for Paystack Inline JS (loaded via CDN in index.html)
interface PaystackPopOptions {
  key: string;
  email: string;
  amount: number; // in kobo
  ref: string;
  currency?: string;
  label?: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

interface PaystackPopHandler {
  openIframe(): void;
}

interface PaystackPopConstructor {
  setup(options: PaystackPopOptions): PaystackPopHandler;
}

declare const PaystackPop: PaystackPopConstructor;
