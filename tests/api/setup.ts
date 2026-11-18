import { vi } from "vitest";
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
// Rotas de gravação chamam revalidatePath (issue #22). Fora do runtime do Next
// ele lança "static generation store missing", então os testes usam um stub.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
