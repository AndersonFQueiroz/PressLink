import React from "react";
import { render, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { PublicPageTracker } from "@/components/features/estatisticas/PublicPageTracker";

describe("PublicPageTracker", () => {
  let sendBeacon: Mock;

  beforeEach(() => {
    window.sessionStorage.clear();
    sendBeacon = vi.fn();
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeacon,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("registra page_view uma única vez por sessão, mesmo remontando", () => {
    const primeiro = render(<PublicPageTracker perfilId="perfil-1" username="dj" />);
    primeiro.unmount();
    render(<PublicPageTracker perfilId="perfil-1" username="dj" />);

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe("/api/estatisticas/registrar");
  });

  it("não rastreia perfis demo", () => {
    render(<PublicPageTracker perfilId="demo-dark-minimal" username="demo" />);

    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it("conta clique de WhatsApp só na primeira vez da sessão", () => {
    render(<PublicPageTracker perfilId="perfil-2" username="dj" />);
    sendBeacon.mockClear();

    const link = document.createElement("a");
    link.href = "https://wa.me/5511999999999";
    link.textContent = "WhatsApp";
    document.body.appendChild(link);
    link.click();
    link.click();

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    link.remove();
  });

  it("conta clique de e-mail separado do WhatsApp", () => {
    render(<PublicPageTracker perfilId="perfil-3" username="dj" />);
    sendBeacon.mockClear();

    const email = document.createElement("a");
    email.href = "mailto:booking@dj.com";
    email.textContent = "E-mail";
    document.body.appendChild(email);
    email.click();

    expect(sendBeacon).toHaveBeenCalledTimes(1);
    email.remove();
  });
});
