// lib/integrations/rewards/types.ts
export type RewardsMember = {
  email: string;
  externalId: string | null;
  pointsBalance: number;
  tier: string | null;
  source: "live" | "mock";
};

export type RewardsEventType = "earn" | "redeem" | "adjust";

export type RewardsEvent = {
  email: string;
  type: RewardsEventType;
  points: number;
  reason: string;
  idempotencyKey: string;
};
