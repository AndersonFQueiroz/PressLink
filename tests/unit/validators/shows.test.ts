import { describe, it, expect } from "vitest";
import { showCreateSchema } from "@/lib/validators/shows";

describe("showCreateSchema", () => {
  it("rejeita data sem zero-padding", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-1-5" }).success).toBe(false);
  });
  it("aceita horario nulo", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-12-01", horario: null }).success).toBe(true);
  });
  it("aceita horario HH:mm válido", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-12-01", horario: "22:00" }).success).toBe(true);
  });
  it("rejeita horario inválido", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Foo Bar", data: "2026-12-01", horario: "25:00" }).success).toBe(false);
  });
  it("rejeita nome curto <3", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "AB", data: "2026-12-01" }).success).toBe(false);
  });
  it("aceita local/cidade opcionais vazios", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Festa X", data: "2026-12-31", local: "", cidade: "" }).success).toBe(true);
  });
  it("rejeita local 1 char", () => {
    expect(showCreateSchema.safeParse({ nome_evento: "Festa X", data: "2026-12-31", local: "A" }).success).toBe(false);
  });
});
