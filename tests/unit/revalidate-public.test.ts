import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { revalidatePublicPages } from "@/lib/revalidate-public";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("revalidatePublicPages", () => {
  beforeEach(() => {
    vi.mocked(revalidatePath).mockClear();
  });

  it("invalida o segmento dinâmico das páginas públicas", () => {
    revalidatePublicPages();
    expect(revalidatePath).toHaveBeenCalledWith("/[username]", "page");
    expect(revalidatePath).toHaveBeenCalledTimes(1);
  });

  it("invalida também o caminho concreto quando o username é conhecido", () => {
    revalidatePublicPages("dj-presslink");
    expect(revalidatePath).toHaveBeenCalledWith("/dj-presslink");
  });

  it("ignora username vazio", () => {
    revalidatePublicPages("   ");
    expect(revalidatePath).toHaveBeenCalledTimes(1);
  });

  it("escapa caracteres especiais do username", () => {
    revalidatePublicPages("dj teste");
    expect(revalidatePath).toHaveBeenCalledWith("/dj%20teste");
  });
});
