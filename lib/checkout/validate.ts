// lib/checkout/validate.ts
import { z } from "zod";
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
    .min(2, "Enter a state")
    .max(40, "Enter a valid state"),
  postalCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code"),
  country: z.literal("US", {
    errorMap: () => ({ message: "Shipping is only available in the United States" }),
  }),
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
