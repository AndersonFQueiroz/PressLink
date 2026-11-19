import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/LegalPage";
import { EMAIL_PRIVACIDADE, REPOSITORIO_PUBLICO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de Privacidade | PressLink",
  description:
    "Quais dados o PressLink coleta, para que servem, com quem são compartilhados e como exercer seus direitos (LGPD).",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      titulo="Política de Privacidade"
      resumo="Esta política explica, em português claro, quais dados o PressLink trata, por quê, com quem compartilha e como você pode exercer os seus direitos previstos na LGPD."
    >
      <h2>1. Quem é o controlador</h2>
      <p>
        O PressLink é um projeto acadêmico (TCC) desenvolvido por Anderson Ferreira Queiroz,
        Pedro Muginski e Luiz Carvalho. Para fins da Lei Geral de Proteção de Dados (Lei
        13.709/2018), o controlador dos dados é a equipe do PressLink, que pode ser contatada
        pelo e-mail <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>.
      </p>

      <h2>2. Dados que coletamos</h2>
      <ul>
        <li>
          <strong>Conta:</strong> nome, e-mail, senha (armazenada apenas como hash pelo
          Supabase Auth), username e data de criação.
        </li>
        <li>
          <strong>Perfil:</strong> nome artístico, foto, biografia em português e inglês,
          links de redes sociais, WhatsApp e e-mail de booking.
        </li>
        <li>
          <strong>Conteúdo:</strong> fotos da galeria, links de música e vídeo e datas de
          shows que você cadastra.
        </li>
        <li>
          <strong>Estatísticas da página:</strong> tipo de evento (visualização, clique em
          WhatsApp, e-mail ou formulário), data e hora, user agent do navegador e um hash
          SHA-256 do endereço IP. O IP original não é armazenado.
        </li>
        <li>
          <strong>Comunicações:</strong> e-mails transacionais de verificação de conta e de
          redefinição de senha.
        </li>
      </ul>

      <h2>3. Para que usamos e com qual base legal</h2>
      <ul>
        <li>
          <strong>Criar e manter sua conta, autenticar e exibir sua página</strong> —
          execução de contrato (art. 7º, V, LGPD).
        </li>
        <li>
          <strong>Gerar as estatísticas do painel</strong> — legítimo interesse (art. 7º, IX),
          com dados pseudonimizados (IP em hash), sem perfilamento individual e sem rastrear
          visitantes em outros sites.
        </li>
        <li>
          <strong>Segurança, prevenção a abuso e suporte</strong> — legítimo interesse e
          cumprimento de obrigações legais.
        </li>
        <li>
          <strong>Enviar e-mails de verificação e recuperação de senha</strong> — execução de
          contrato e legítimo interesse na segurança da conta.
        </li>
      </ul>
      <p>
        Não usamos seus dados para publicidade, não vendemos dados pessoais e não tomamos
        decisões automatizadas que afetem seus direitos.
      </p>

      <h2>4. Cookies</h2>
      <p>
        Usamos apenas os cookies essenciais de sessão do Supabase Auth, necessários para
        manter você logado. Não usamos cookies de analytics, publicidade ou rastreamento de
        terceiros. Por isso, não há banner de consentimento de cookies.
      </p>

      <h2>5. Compartilhamento com terceiros</h2>
      <p>
        Compartilhamos apenas o necessário com os fornecedores que operam a plataforma,
        todos com obrigações contratuais de proteção de dados:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — banco de dados PostgreSQL, autenticação e armazenamento
          das imagens.
        </li>
        <li>
          <strong>Vercel</strong> — hospedagem, CDN e execução da aplicação.
        </li>
        <li>
          <strong>Resend</strong> — envio dos e-mails transacionais.
        </li>
      </ul>
      <p>
        Também podemos divulgar dados se formos obrigados por lei, ordem judicial ou
        autoridade competente.
      </p>

      <h2>6. Transferência internacional</h2>
      <p>
        Os fornecedores acima podem processar dados em servidores fora do Brasil, inclusive
        nos Estados Unidos. A transferência ocorre com base nas garantias contratuais e nas
        políticas de segurança desses fornecedores, nos termos do art. 33 da LGPD.
      </p>

      <h2>7. Por quanto tempo guardamos</h2>
      <ul>
        <li>
          Dados da conta e do perfil ficam armazenados enquanto a conta existir. Ao excluir a
          conta, o perfil, as fotos, os links, a agenda e as estatísticas são removidos.
        </li>
        <li>
          Estatísticas pseudonimizadas podem permanecer por período limitado para fins de
          segurança e integridade do serviço.
        </li>
        <li>
          Cópias de segurança rotativas podem reter os dados por um período curto até serem
          sobrescritas pelos ciclos normais de backup.
        </li>
      </ul>

      <h2>8. Como protegemos os dados</h2>
      <ul>
        <li>HTTPS em todas as conexões, com HSTS habilitado.</li>
        <li>
          Row Level Security (RLS) no banco: cada DJ só acessa os próprios registros;
          visitantes leem apenas perfis publicados.
        </li>
        <li>Senhas armazenadas como hash pelo Supabase Auth; nunca temos acesso à senha.</li>
        <li>Acesso administrativo restrito e mínimo necessário para operar o serviço.</li>
        <li>IP dos visitantes convertido em hash SHA-256 antes de qualquer gravação.</li>
      </ul>

      <h2>9. Seus direitos</h2>
      <p>Nos termos do art. 18 da LGPD, você pode solicitar:</p>
      <ul>
        <li>confirmação da existência de tratamento e acesso aos dados;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
        <li>portabilidade dos dados, mediante requisição;</li>
        <li>eliminação dos dados tratados com base em consentimento;</li>
        <li>informações sobre compartilhamentos e sobre a possibilidade de não consentir;</li>
        <li>revogação do consentimento, quando essa for a base legal.</li>
      </ul>
      <p>
        Você mesmo pode corrigir seus dados no painel e excluir a conta em{" "}
        <Link href="/painel/configuracoes">Configurações → Conta</Link>, com remoção definitiva dos
        dados. Para os demais pedidos, escreva para{" "}
        <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>. Respondemos em até 15
        dias.
      </p>

      <h2>10. Crianças e adolescentes</h2>
      <p>
        A plataforma é destinada a maiores de 18 anos. Não coletamos intencionalmente dados de
        crianças ou adolescentes; se identificarmos uma conta nessa situação, ela será
        encerrada.
      </p>

      <h2>11. Alterações desta política</h2>
      <p>
        Podemos atualizar esta política para refletir mudanças no produto ou na legislação. A
        versão vigente fica sempre nesta página, com a data de atualização no topo. Mudanças
        relevantes serão comunicadas na plataforma.
      </p>

      <h2>12. Contato</h2>
      <p>
        Encarregado pelo tratamento de dados (DPO): equipe PressLink —{" "}
        <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>. Enquanto o domínio
        próprio não estiver ativo, você também pode registrar solicitações no{" "}
        <a href={REPOSITORIO_PUBLICO}>repositório do projeto</a>.
      </p>
    </LegalPage>
  );
}
