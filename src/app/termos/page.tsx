import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/legal/LegalPage";
import { EMAIL_PRIVACIDADE, REPOSITORIO_PUBLICO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Termos de Uso | PressLink",
  description:
    "Regras de uso do PressLink: conta, conteúdo publicado, uso aceitável, disponibilidade e encerramento.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <LegalPage
      titulo="Termos de Uso"
      resumo="Estas regras valem para todo mundo que cria uma conta ou usa o PressLink. Elas existem para proteger você, quem visita sua página e a plataforma."
    >
      <h2>1. Aceitação</h2>
      <p>
        Ao criar uma conta ou usar o PressLink, você concorda com estes Termos e com a{" "}
        <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não use a
        plataforma.
      </p>

      <h2>2. O que é o PressLink</h2>
      <p>
        O PressLink é uma plataforma que permite a DJs montarem e publicarem um press kit
        digital (EPK) em uma página pública, com perfil, galeria, músicas, agenda e canais de
        contato. Durante o MVP a plataforma é gratuita e não há cobrança, assinatura ou
        comissão sobre contratações.
      </p>

      <h2>3. Conta e elegibilidade</h2>
      <ul>
        <li>A plataforma é destinada a maiores de 18 anos.</li>
        <li>
          Você é responsável pela veracidade das informações da conta e do perfil, e por
          manter sua senha em segurança.
        </li>
        <li>
          O username é único e funciona como endereço da sua página. Ele não pode imitar
          outra pessoa, marca ou serviço de forma a causar confusão.
        </li>
        <li>
          Atividades feitas com a sua conta são de sua responsabilidade. Se perceber acesso
          indevido, altere a senha e avise a gente.
        </li>
      </ul>

      <h2>4. Conteúdo que você publica</h2>
      <ul>
        <li>
          O conteúdo do seu perfil continua sendo seu: fotos, textos, músicas, vídeos,
          agenda e links.
        </li>
        <li>
          Você concede ao PressLink uma licença gratuita e não exclusiva para hospedar,
          copiar, exibir e adaptar tecnicamente esse conteúdo apenas para operar e divulgar
          a sua página (por exemplo, gerar miniaturas e o card de compartilhamento).
        </li>
        <li>
          Você declara ter os direitos necessários sobre o que publica, incluindo direito de
          imagem de quem aparece nas fotos e autorização para divulgar as músicas e os
          vídeos incorporados.
        </li>
        <li>
          Conteúdo ilegal, ofensivo, discriminatório, que viole direitos autorais ou de
          imagem, ou que induza a erro pode ser removido, e a conta pode ser suspensa.
        </li>
      </ul>

      <h2>5. Uso aceitável</h2>
      <p>Você concorda em não:</p>
      <ul>
        <li>tentar acessar contas, dados ou áreas restritas sem autorização;</li>
        <li>automatizar acessos de forma abusiva, raspar a plataforma ou sobrecarregar o serviço;</li>
        <li>enviar malware, spam ou conteúdo que comprometa a segurança;</li>
        <li>usar a plataforma para golpes, venda de serviços ilegais ou violação de direitos de terceiros;</li>
        <li>copiar, revender ou redistribuir o código, a marca ou os templates do PressLink.</li>
      </ul>

      <h2>6. Publicação e disponibilidade</h2>
      <p>
        A página pública só entra no ar quando os requisitos obrigatórios estão completos
        (nome artístico, ao menos uma foto e ao menos um link de mídia). Você pode publicar
        e despublicar quando quiser; ao despublicar, o endereço deixa de exibir o perfil.
      </p>
      <p>
        A página é servida com cache e pode levar alguns minutos para refletir alterações
        feitas no painel. O serviço é fornecido no estado em que se encontra: buscamos
        manter tudo no ar, mas não garantimos funcionamento ininterrupto ou livre de erros.
      </p>

      <h2>7. Propriedade intelectual da plataforma</h2>
      <p>
        A marca PressLink, o logotipo, o código, o design e os templates são protegidos pela
        legislação aplicável. O uso da plataforma não transfere esses direitos para você.
      </p>

      <h2>8. Encerramento</h2>
      <p>
        Você pode excluir sua conta a qualquer momento em{" "}
        <Link href="/painel/configuracoes">Configurações → Conta</Link>. A exclusão é definitiva e
        remove o perfil, as fotos, a agenda, os links e as estatísticas associadas.
      </p>
      <p>
        Podemos suspender ou encerrar contas que violem estes Termos, mediante aviso quando
        possível, sem prejuízo de medidas legais cabíveis.
      </p>

      <h2>9. Limitação de responsabilidade</h2>
      <p>
        Na máxima extensão permitida pela lei, o PressLink não responde por lucros cessantes,
        perda de oportunidade, contratos firmados entre você e terceiros, ou por conteúdos
        publicados por você. Nada aqui afasta direitos que a legislação brasileira garanta a
        você.
      </p>

      <h2>10. Alterações</h2>
      <p>
        Podemos atualizar estes Termos para refletir mudanças no produto ou na lei. A versão
        vigente fica sempre nesta página, com a data de atualização no topo. Mudanças
        relevantes serão avisadas na plataforma.
      </p>

      <h2>11. Legislação e foro</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Eventuais controvérsias serão
        resolvidas no foro competente segundo as regras gerais de competência, respeitados
        os direitos do consumidor quando aplicáveis.
      </p>

      <h2>12. Contato</h2>
      <p>
        Dúvidas sobre estes Termos: <a href={`mailto:${EMAIL_PRIVACIDADE}`}>{EMAIL_PRIVACIDADE}</a>
        . Enquanto o domínio próprio não estiver ativo, você também pode abrir uma solicitação
        no <a href={REPOSITORIO_PUBLICO}>repositório do projeto</a>.
      </p>
    </LegalPage>
  );
}
