// Core Event Names - DO NOT RENAME (consistency matters)
export const CORE_EVENTS = {
  APP_OPENED: 'app_opened',
  COUNTRY_DETECTED: 'country_detected',
  VAT_CALCULATED: 'vat_calculated',
  REVERSE_CHARGE_CHECKED: 'reverse_charge_checked',
  INVOICE_PREVIEWED: 'invoice_previewed',
  INVOICE_DOWNLOADED: 'invoice_downloaded',
  AI_EXPLAIN_CLICKED: 'ai_explain_clicked',
  FREE_LIMIT_REACHED: 'free_limit_reached',
  UPGRADE_CTA_SHOWN: 'upgrade_cta_shown',
  STRIPE_CHECKOUT_CLICKED: 'stripe_checkout_clicked',
  PAYMENT_SUCCESS: 'payment_success',
} as const;

export type CoreEventName = typeof CORE_EVENTS[keyof typeof CORE_EVENTS];
