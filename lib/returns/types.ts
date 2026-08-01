// lib/returns/types.ts
export type ReturnStatus = "requested" | "approved" | "denied" | "refunded";

export type ReturnReason =
  | "defective_hardware"
  | "wrong_item"
  | "damaged_shipping"
  | "other";

export type ReturnRequest = {
  id: string;
  orderId: string;
  email: string;
  status: ReturnStatus;
  reason: ReturnReason;
  details: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
};

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  defective_hardware: "Defective hardware",
  wrong_item: "Wrong item received",
  damaged_shipping: "Damaged in shipping",
  other: "Other",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  denied: "Denied",
  refunded: "Refunded",
};

export const RETURN_REASONS = Object.keys(RETURN_REASON_LABELS) as ReturnReason[];
