export type Product = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  platform: string;
  version: string;
  pricing: "Free" | "Paid";
  icon_url: string;
  cover_url: string;
  screenshots: string[];
  features: string[];
  download_provider: "github" | "direct";
  download_url: string;
  github_repository: string;
  github_tag: string;
  github_asset: string;
  status: "draft" | "published";
  installation: string;
  language: string;
  created_at: string;
  updated_at: string;
};
export const initialProduct: Product = {
  id: "",
  name: "HesabKo — حساب کو",
  slug: "hesabko",
  tagline: "حساب آسان، کاروبار مطمئن",
  description:
    "Offline accounting and inventory management for small shops and businesses in Afghanistan.",
  category: "Business Software",
  platform: "Android",
  version: "v1.0.0",
  pricing: "Free",
  icon_url: "",
  cover_url: "",
  screenshots: [],
  features: [
    "Inventory management",
    "Purchase and selling prices",
    "Sales tracking and profit calculations",
    "Shop expenses",
    "Customer debts",
    "Low-stock reminders",
    "Sales analysis",
  ],
  download_provider: "github",
  download_url: "",
  github_repository: "rohullahr914-pixel/HesabKo-Android",
  github_tag: "v1.0.0",
  github_asset: "HesabKo-v1.4-release.apk",
  status: "published",
  installation:
    "Download the APK on your Android device. Open the file and, if prompted, allow installation from your browser. Install the app, then turn this permission off. Only install files from a source you trust.",
  language: "Dari / Persian",
  created_at: "",
  updated_at: "",
};
