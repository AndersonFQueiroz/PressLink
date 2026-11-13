import { TipoMidia } from "@/lib/validators/links";

export interface TemplateDJProfile {
  id: string;
  nome_artistico: string;
  username: string;
  foto_url?: string | null;
  biografia_pt?: string | null;
  biografia_en?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  twitter_x?: string | null;
  whatsapp?: string | null;
  email_booking?: string | null;
  template_slug?: string | null;
}

export interface TemplateFoto {
  id: string;
  url: string;
  alt_text?: string | null;
  ordem?: number;
}

export interface TemplateMidia {
  id: string;
  tipo: TipoMidia;
  url: string;
  titulo?: string | null;
  ordem?: number;
}

export interface TemplateShow {
  id: string;
  nome_evento: string;
  data: string; // Formato YYYY-MM-DD
  horario?: string | null;
  local?: string | null;
  cidade?: string | null;
}

export interface TemplatePublicData {
  perfil: TemplateDJProfile;
  fotos: TemplateFoto[];
  midias: TemplateMidia[];
  shows: TemplateShow[];
}

export interface TemplateComponentProps {
  data: TemplatePublicData;
  isPreview?: boolean;
}
