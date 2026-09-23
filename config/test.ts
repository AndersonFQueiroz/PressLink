export const SUT_CONFIG = {
  baseUrl: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fake-anon-key-for-tests",
  },
} as const;
