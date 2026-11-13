"use client";

import { useEffect } from "react";

/**
 * Ajusta o fundo/color-scheme da página inteira ao template público.
 * Sem isso, o overscroll e a barra de rolagem mantêm o tema escuro do app.
 */
export function useTemplateTheme(background: string, foreground: string, scheme: "dark" | "light") {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      background: body.style.backgroundColor,
      color: body.style.color,
      scheme: root.style.colorScheme,
    };

    body.style.backgroundColor = background;
    body.style.color = foreground;
    root.style.colorScheme = scheme;

    return () => {
      body.style.backgroundColor = previous.background;
      body.style.color = previous.color;
      root.style.colorScheme = previous.scheme;
    };
  }, [background, foreground, scheme]);
}
