// lib/checkout/validate.ts
import { z } from "zod";
import { isShippingCountry } from "@/lib/checkout/countries";
import { LAUNCH_JURISDICTIONS } from "@/lib/compliance/age-gate";
import { RETAIL_PAYMENT_METHODS } from "@/lib/payments/methods";

export const checkoutFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  fullName: z.string().min(2, "Enter your full name").max(80),
  line1: z.string().min(3, "Enter a street address").max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2, "Enter a city").max(80),
  state: z
    .string()
    .trim()
    .min(1, "Enter a state, province, or region")
    .max(80, "Enter a valid state, province, or region"),
  postalCode: z
    .string()
    .trim()
    .min(2, "Enter a postal code")
    .max(16, "Enter a valid postal code")
    .regex(/^[A-Za-z0-9][A-Za-z0-9\s-]{1,15}$/, "Enter a valid postal code"),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isShippingCountry, { message: "Select a shipping country" }),
  paymentMethod: z
    .enum(RETAIL_PAYMENT_METHODS, {
      errorMap: () => ({ message: "Select a payment method" }),
    })
    .default("paybis_btc"),
  confirmAge: z.literal("on", {
    errorMap: () => ({ message: "Confirm you are 21 or older" }),
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function isLaunchState(state: string): state is (typeof LAUNCH_JURISDICTIONS)[number] {
  return (LAUNCH_JURISDICTIONS as readonly string[]).includes(state);
}
