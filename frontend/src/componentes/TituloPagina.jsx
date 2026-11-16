import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const titulos = [
  ['/prestadores/', 'Perfil do prestador'],
  ['/prestadores', 'Prestadores'],
  ['/confirmar-email', 'Confirmar e-mail'],
  ['/redefinir-senha', 'Redefinir senha'],
  ['/esqueci-senha', 'Recuperar senha'],
  ['/cadastro', 'Criar conta'],
  ['/entrar', 'Entrar'],
  ['/painel/orcamentos', 'Orçamentos'],
  ['/painel/agenda', 'Agenda'],
  ['/painel/favoritos', 'Favoritos'],
  ['/painel/avaliacoes', 'Avaliações'],
  ['/painel/notificacoes', 'Notificações'],
  ['/painel/servicos', 'Serviços'],
  ['/painel/profissional', 'Perfil profissional'],
  ['/painel/perfil', 'Meu perfil'],
  ['/painel/admin', 'Administração'],
  ['/painel', 'Painel']
];

export function TituloPagina() {
  const { pathname } = useLocation();

  useEffect(() => {
    const encontrado = titulos.find(([caminho]) => pathname === caminho || pathname.startsWith(caminho));
    document.title = encontrado ? `${encontrado[1]} | ConectaTorres` : 'ConectaTorres';
  }, [pathname]);

  return null;
}
