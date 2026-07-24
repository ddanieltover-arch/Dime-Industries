// app/(marketing)/validate-actions.ts
"use server";

import { validateProductCode } from "@/lib/account/validate-product";

export type PublicValidateState = {
  error?: string;
  success?: boolean;
  message?: string;
  productSlug?: string;
};

export async function submitPublicValidation(
  _prev: PublicValidateState,
  formData: FormData
): Promise<PublicValidateState> {
  const code = String(formData.get("code") ?? "");
  const result = validateProductCode(code);
  if (!result.ok) return { error: result.message };
  return {
    success: true,
    message: `${result.message} (${result.productName} · ${result.sku})`,
    productSlug: result.productSlug,
  };
}
