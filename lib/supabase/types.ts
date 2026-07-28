export type Provider = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  description: string | null;
  status: "draft" | "pending_review" | "published";
  created_at: string;
  updated_at: string;
};

export type ProviderService = {
  id: string;
  provider_id: string;
  name: string;
  price_huf: number;
  duration_minutes: number;
  created_at: string;
};
