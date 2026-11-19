import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DesignSystemClient from "./design-system-client";

/**
 * Vitrine interna de componentes. Não é página de produto: fica disponível
 * apenas em desenvolvimento e nunca é indexada.
 */
export const metadata: Metadata = {
  title: "Design system | PressLink",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <DesignSystemClient />;
}
