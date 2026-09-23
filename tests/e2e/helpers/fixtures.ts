export const png1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  "base64"
);

export const fakeShow = (n = 1) => ({
  nome_evento: `Festa E2E ${n}`,
  data: "2026-12-31",
  horario: "22:00",
  local: "Clube E2E",
  cidade: `Cidade ${n}/SP`,
});
