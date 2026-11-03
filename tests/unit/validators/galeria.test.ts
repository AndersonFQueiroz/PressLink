import { describe, it, expect } from "vitest";
import { galeriaFileSchema, galeriaUploadSchema, MAX_FILE_SIZE, MAX_FILES } from "@/lib/validators/galeria";

describe("galeriaFileSchema", () => {
  it("rejeita >5MB", () => {
    const f = new File([new Uint8Array(MAX_FILE_SIZE + 1)], "a.jpg", { type: "image/jpeg" });
    expect(galeriaFileSchema.safeParse(f).success).toBe(false);
  });
  it("rejeita tipo não permitido gif", () => {
    const f = new File(["x"], "a.gif", { type: "image/gif" });
    expect(galeriaFileSchema.safeParse(f).success).toBe(false);
  });
  it("aceita jpeg válido", () => {
    const f = new File(["x"], "a.jpg", { type: "image/jpeg" });
    expect(galeriaFileSchema.safeParse(f).success).toBe(true);
  });
  it("aceita png válido", () => {
    const f = new File(["x"], "a.png", { type: "image/png" });
    expect(galeriaFileSchema.safeParse(f).success).toBe(true);
  });
});

describe("galeriaUploadSchema", () => {
  it("rejeita upload vazio", () => {
    expect(galeriaUploadSchema.safeParse({ files: [] }).success).toBe(false);
  });
  it("rejeita > MAX_FILES", () => {
    const files = Array.from({ length: MAX_FILES + 1 }, (_, i) => new File(["x"], `a${i}.jpg`, { type: "image/jpeg" }));
    expect(galeriaUploadSchema.safeParse({ files }).success).toBe(false);
  });
  it("aceita 1 arquivo", () => {
    const f = new File(["x"], "a.jpg", { type: "image/jpeg" });
    expect(galeriaUploadSchema.safeParse({ files: [f] }).success).toBe(true);
  });
});
