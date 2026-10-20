import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DarkMinimalTemplate } from "@/components/templates/DarkMinimalTemplate";
import { VibrantFestivalTemplate } from "@/components/templates/VibrantFestivalTemplate";
import { CleanEditorialTemplate } from "@/components/templates/CleanEditorialTemplate";
import { TemplatePublicData } from "@/types/template";
import { createClient } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams?: Promise<{ template?: string }>;
}

// Mock de alta fidelidade para testes locais, demonstração e validação do template
const DEMO_DARK_MINIMAL_DATA: TemplatePublicData = {
  perfil: {
    id: "demo-dark-minimal",
    nome_artistico: "K R O N O S",
    username: "kronos",
    foto_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
    biografia_pt:
      "Explorando as fronteiras entre o minimalismo analógico e o techno industrial hipnótico. Com apresentações marcadas por sintetizadores modulares e sequências densas de sub-graves, KRONOS constrói narrativas sonoras projetadas para galpões escuros e sound systems de alta pressão sonora.\n\nResidente em Berlim e atuante nos principais clubes do circuito underground internacional, já dividiu noites históricas no Tresor, Bassiani e D-EDGE.",
    biografia_en:
      "Exploring the friction between raw analog minimalism and hypnotic industrial techno. Characterized by modular synthesis and crushing sub-frequencies, KRONOS constructs sonic architectural narratives tailored for pitch-black warehouse basements and heavyweight sound systems.\n\nBased between Berlin and São Paulo, with memorable appearances at Tresor, Bassiani, and D-EDGE.",
    instagram: "https://instagram.com",
    twitter_x: "https://x.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    whatsapp: "+55 11 99999-8888",
    email_booking: "booking@kronos-techno.com",
    template_slug: "dark-minimal",
  },
  fotos: [
    {
      id: "f-1",
      url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=900&auto=format&fit=crop",
      alt_text: "Live Performance at Warehouse, Berlin",
      ordem: 1,
    },
    {
      id: "f-2",
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=900&auto=format&fit=crop",
      alt_text: "Modular Setup & Analog Booth Control",
      ordem: 2,
    },
    {
      id: "f-3",
      url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=900&auto=format&fit=crop",
      alt_text: "Laser Geometry & Crowd Energy",
      ordem: 3,
    },
    {
      id: "f-4",
      url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=900&auto=format&fit=crop",
      alt_text: "Press Shot // Low-key Shadow Contrast",
      ordem: 4,
    },
  ],
  midias: [
    {
      id: "m-1",
      tipo: "spotify",
      url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      titulo: "Resonance // Peak Time Cut",
      ordem: 1,
    },
    {
      id: "m-2",
      tipo: "soundcloud",
      url: "https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-apollo-ep-preview",
      titulo: "Live Modular Mix // Basement Series",
      ordem: 2,
    },
    {
      id: "m-3",
      tipo: "youtube",
      url: "https://www.youtube.com/watch?v=kYv9rE8lQ_U",
      titulo: "Warehouse Set Live Stream (4K)",
      ordem: 3,
    },
  ],
  shows: [
    {
      id: "s-1",
      nome_evento: "Tresor Klubnacht // Vault Session",
      data: "2026-11-14",
      horario: "02:00",
      local: "Tresor Club",
      cidade: "Berlim / DE",
    },
    {
      id: "s-2",
      nome_evento: "Bassiani Underground All-Night",
      data: "2026-12-05",
      horario: "03:30",
      local: "Bassiani Main Room",
      cidade: "Tbilisi / GE",
    },
    {
      id: "s-3",
      nome_evento: "Mothership Showcase // D-EDGE",
      data: "2027-01-23",
      horario: "01:00",
      local: "D-EDGE (Pista 1)",
      cidade: "São Paulo / SP",
    },
  ],
};

const DEMO_VIBRANT_FESTIVAL_DATA: TemplatePublicData = {
  perfil: {
    id: "demo-vibrant-festival",
    nome_artistico: "A U R O R A",
    username: "aurora",
    foto_url:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop",
    biografia_pt:
      "Explodindo nos palcos e arenas com uma fusão eletrizante de EDM, Bass House e sintetizadores eufóricos. AURORA transforma multidões em uma experiência imersiva de pura energia, luzes estroboscópicas e drops inesquecíveis.\n\nCom apresentações épicas em palcos principais e suporte de referências globais da cena eletrônica, coleciona momentos marcantes em grandes festivais.",
    biografia_en:
      "Igniting main stages with a high-octane blend of festival EDM, heavy basslines, and euphoric drops. AURORA crafts unforgettable live show experiences driven by kinetic stage production, lasers, and boundless dancefloor momentum.\n\nPerforming across major summer festivals with global recognition and explosive anthems.",
    instagram: "https://instagram.com",
    twitter_x: "https://x.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    whatsapp: "+55 11 98888-7777",
    email_booking: "booking@aurora-official.com",
    template_slug: "vibrant-festival",
  },
  fotos: [
    {
      id: "vf-1",
      url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=900&auto=format&fit=crop",
      alt_text: "Main Stage Sunset Countdown",
      ordem: 1,
    },
    {
      id: "vf-2",
      url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=900&auto=format&fit=crop",
      alt_text: "Festival Crowd Fireworks & Lasers",
      ordem: 2,
    },
    {
      id: "vf-3",
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=900&auto=format&fit=crop",
      alt_text: "DJ Booth Energy & Live Control",
      ordem: 3,
    },
    {
      id: "vf-4",
      url: "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?q=80&w=900&auto=format&fit=crop",
      alt_text: "Official Festival Press Shoot",
      ordem: 4,
    },
  ],
  midias: [
    {
      id: "vm-1",
      tipo: "spotify",
      url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      titulo: "Euphoria (Festival Anthem Mix)",
      ordem: 1,
    },
    {
      id: "vm-2",
      tipo: "youtube",
      url: "https://www.youtube.com/watch?v=kYv9rE8lQ_U",
      titulo: "Live Main Stage Festival Set (4K)",
      ordem: 2,
    },
    {
      id: "vm-3",
      tipo: "soundcloud",
      url: "https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-apollo-ep-preview",
      titulo: "Radio Show // Episode 100",
      ordem: 3,
    },
  ],
  shows: [
    {
      id: "vs-1",
      nome_evento: "Electric Sunset Festival // Main Stage",
      data: "2026-11-20",
      horario: "22:30",
      local: "Festival Arena",
      cidade: "São Paulo / SP",
    },
    {
      id: "vs-2",
      nome_evento: "Solaris Beach Open Air",
      data: "2026-12-12",
      horario: "19:00",
      local: "Arena Beira-Mar",
      cidade: "Florianópolis / SC",
    },
    {
      id: "vs-3",
      nome_evento: "New Year Countdown Music Festival",
      data: "2026-12-31",
      horario: "23:45",
      local: "Parque Olímpico",
      cidade: "Rio de Janeiro / RJ",
    },
  ],
};

const DEMO_CLEAN_EDITORIAL_DATA: TemplatePublicData = {
  perfil: {
    id: "demo-clean-editorial",
    nome_artistico: "S O P H I A",
    username: "sophia",
    foto_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1200&auto=format&fit=crop",
    biografia_pt:
      "Especialista em ambientações sonoras refinadas para destination weddings, lounges e celebrações corporativas de alto padrão. SOPHIA une a sofisticação do Deep House e Nu-Disco à elegância da Bossa Nova contemporânea e clássicos atemporais.\n\nCom apresentações em resorts de luxo e eventos privados internacionais, desenvolve curadorias musicais exclusivas desenhadas sob medida para cada ocasião.",
    biografia_en:
      "Curating refined soundscapes for destination weddings, luxury lounges, and high-end private galas. SOPHIA seamlessly blends soulful deep house, nu-disco, and timeless melodic classics tailored to discerning audiences.\n\nPerforming across boutique private venues and prestigious international events with tailor-made musical curation.",
    instagram: "https://instagram.com",
    twitter_x: "https://x.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    whatsapp: "+55 11 97777-6666",
    email_booking: "concierge@sophia-music.com",
    template_slug: "clean-editorial",
  },
  fotos: [
    {
      id: "ce-1",
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=900&auto=format&fit=crop",
      alt_text: "Destination Wedding Sunset Lounge",
      ordem: 1,
    },
    {
      id: "ce-2",
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=900&auto=format&fit=crop",
      alt_text: "Private Gala Reception & Atmosphere",
      ordem: 2,
    },
    {
      id: "ce-3",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=900&auto=format&fit=crop",
      alt_text: "Boutique Sound Setup & Modern Booth",
      ordem: 3,
    },
    {
      id: "ce-4",
      url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=900&auto=format&fit=crop",
      alt_text: "Editorial Press Lookbook",
      ordem: 4,
    },
  ],
  midias: [
    {
      id: "cem-1",
      tipo: "soundcloud",
      url: "https://soundcloud.com/charlottedewittemusic/charlotte-de-witte-apollo-ep-preview",
      titulo: "Sunset Nu-Disco & Soulful Session",
      ordem: 1,
    },
    {
      id: "cem-2",
      tipo: "spotify",
      url: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
      titulo: "Lounge Selection // Chapter IV",
      ordem: 2,
    },
    {
      id: "cem-3",
      tipo: "youtube",
      url: "https://www.youtube.com/watch?v=kYv9rE8lQ_U",
      titulo: "Destination Wedding Live Performance",
      ordem: 3,
    },
  ],
  shows: [
    {
      id: "ces-1",
      nome_evento: "Villa Bellagio Gala // Private Wedding",
      data: "2026-11-28",
      horario: "17:00",
      local: "Lake Como Villa",
      cidade: "Como / IT",
    },
    {
      id: "ces-2",
      nome_evento: "Rooftop Sunset Lounge Session",
      data: "2026-12-18",
      horario: "18:30",
      local: "Fasano Rooftop",
      cidade: "São Paulo / SP",
    },
    {
      id: "ces-3",
      nome_evento: "Boutique Wine & Sound Experience",
      data: "2027-01-15",
      horario: "19:00",
      local: "Reserva Cavas",
      cidade: "Mendoza / AR",
    },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username.toUpperCase()} | PressLink EPK`,
    description: `Portfólio e Electronic Press Kit (EPK) oficial de ${username}.`,
  };
}

export default async function PublicArtistPage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const requestedTemplate = resolvedSearchParams.template;
  const cleanUsername = username.toLowerCase().trim();

  let profileData: TemplatePublicData | null = null;

  try {
    const supabase = await createClient();

    // Busca o perfil público pelo username
    const { data: perfil, error: perfilError } = await supabase
      .from("perfil")
      .select("*")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (!perfilError && perfil) {
      // Busca fotos, links e shows vinculados
      const [fotosRes, midiasRes, showsRes] = await Promise.all([
        supabase
          .from("fotogaleria")
          .select("*")
          .eq("perfil_id", perfil.id)
          .order("ordem", { ascending: true }),
        supabase
          .from("linkdemidia")
          .select("*")
          .eq("perfil_id", perfil.id)
          .order("ordem", { ascending: true }),
        supabase
          .from("datadeshow")
          .select("*")
          .eq("perfil_id", perfil.id)
          .order("data", { ascending: true }),
      ]);

      profileData = {
        perfil: {
          id: perfil.id,
          nome_artistico: perfil.nome_artistico,
          username: perfil.username,
          foto_url: perfil.foto_url,
          biografia_pt: perfil.biografia_pt,
          biografia_en: perfil.biografia_en,
          instagram: perfil.instagram,
          facebook: perfil.facebook,
          tiktok: perfil.tiktok,
          twitter_x: perfil.twitter_x,
          whatsapp: perfil.whatsapp,
          email_booking: perfil.email_booking,
          template_slug: perfil.template_slug || "dark-minimal",
        },
        fotos: (fotosRes.data || []).map((f) => ({
          id: f.id,
          url: f.url,
          alt_text: f.alt_text,
          ordem: f.ordem,
        })),
        midias: (midiasRes.data || []).map((m) => ({
          id: m.id,
          tipo: m.tipo,
          url: m.url,
          titulo: m.titulo,
          ordem: m.ordem,
        })),
        shows: (showsRes.data || []).map((s) => ({
          id: s.id,
          nome_evento: s.nome_evento,
          data: s.data,
          horario: s.horario,
          local: s.local,
          cidade: s.cidade,
        })),
      };
    }
  } catch {
    // Ambiente sem Supabase ou erro de conexão
  }

  // Se não encontrou no banco, permite visualização do demo se for "demo", "kronos", "aurora", "sophia", etc., ou se banco estiver indisponível
  if (!profileData) {
    if (
      cleanUsername === "demo-editorial" ||
      cleanUsername === "sophia" ||
      cleanUsername === "editorial" ||
      requestedTemplate === "clean-editorial"
    ) {
      profileData = DEMO_CLEAN_EDITORIAL_DATA;
    } else if (
      cleanUsername === "demo-festival" ||
      cleanUsername === "aurora" ||
      cleanUsername === "festival" ||
      requestedTemplate === "vibrant-festival"
    ) {
      profileData = DEMO_VIBRANT_FESTIVAL_DATA;
    } else if (cleanUsername === "demo" || cleanUsername === "kronos" || cleanUsername === "nomedodj") {
      profileData = DEMO_DARK_MINIMAL_DATA;
    } else {
      // Se estiver em ambiente sem credenciais configuradas, renderiza demo com o username fornecido
      const baseDemo =
        requestedTemplate === "clean-editorial"
          ? DEMO_CLEAN_EDITORIAL_DATA
          : requestedTemplate === "vibrant-festival"
          ? DEMO_VIBRANT_FESTIVAL_DATA
          : DEMO_DARK_MINIMAL_DATA;

      profileData = {
        ...baseDemo,
        perfil: {
          ...baseDemo.perfil,
          nome_artistico: cleanUsername.toUpperCase(),
          username: cleanUsername,
        },
      };
    }
  }

  // Permite sobrescrever o template para preview via query ?template=...
  if (profileData && requestedTemplate) {
    profileData.perfil.template_slug = requestedTemplate;
  }

  if (!profileData) {
    notFound();
  }

  if (profileData.perfil.template_slug === "clean-editorial") {
    return <CleanEditorialTemplate data={profileData} />;
  }

  if (profileData.perfil.template_slug === "vibrant-festival") {
    return <VibrantFestivalTemplate data={profileData} />;
  }

  return <DarkMinimalTemplate data={profileData} />;
}
