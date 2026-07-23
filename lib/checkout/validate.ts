// lib/checkout/validate.ts
import { z } from "zod";
import { LAUNCH_JURISDICTIONS } from "@/lib/compliance/age-gate";

export const checkoutFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(2, "Enter your full name").max(80),
  line1: z.string().min(3, "Enter a street address").max(120),
  line2: z.string().max(120).optional().or(z.literal("")),
  city: z.string().min(2, "Enter a city").max(80),
  state: z.enum(["CA", "MA"], { errorMap: () => ({ message: "Select CA or MA" }) }),
  postalCode: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code"),
  confirmAge: z.literal("on", {
    errorMap: () => ({ message: "Confirm you are 21 or older" }),
  }),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function isLaunchState(state: string): state is (typeof LAUNCH_JURISDICTIONS)[number] {
  return (LAUNCH_JURISDICTIONS as readonly string[]).includes(state);
}
