import { randomUUID } from "crypto";

export const perfilFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(),
  usuario_id: "user-1",
  nome_artistico: "DJ Test",
  username: "dj-test",
  foto_url: "",
  biografia_pt: "",
  publicado: false,
  ...over,
});

export const fotoFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(),
  perfil_id: "perfil-1",
  url: "https://cdn.test/foto.jpg",
  ordem: 0,
  alt_text: "foto",
  created_at: new Date().toISOString(),
  ...over,
});

export const showFactory = (over: Partial<any> = {}) => ({
  id: randomUUID(),
  perfil_id: "perfil-1",
  nome_evento: "Festa Teste",
  data: "2026-12-31",
  horario: "22:00",
  local: "Clube X",
  cidade: "São Paulo/SP",
  ...over,
});
