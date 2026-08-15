import { NavLink, Outlet } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { Avatar } from './Avatar.jsx';

export function LayoutPainel() {
  const { usuario } = useAutenticacao();
  const links = [
    ['/painel', 'Visao geral', true],
    ['/painel/perfil', 'Meu perfil'],
    ['/painel/agenda', 'Agenda']
  ];
  if (usuario.tipo === 'cliente') links.push(['/painel/favoritos', 'Favoritos'], ['/painel/avaliacoes', 'Avaliacoes']);
  if (usuario.tipo === 'prestador') links.push(['/painel/profissional', 'Perfil profissional'], ['/painel/servicos', 'Meus servicos'], ['/painel/avaliacoes', 'Avaliacoes']);
  links.push(['/painel/notificacoes', 'Notificacoes']);
  if (usuario.tipo === 'admin') links.push(['/painel/admin', 'Administracao']);

  return (
    <main className="container painel-layout">
      <aside className="painel-menu">
        <div className="painel-usuario">
          <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} tamanho="grande" />
          <div><strong>{usuario.nome}</strong><span>{usuario.tipo}</span></div>
        </div>
        <nav>
          {links.map(([to, label, end]) => <NavLink key={to} to={to} end={Boolean(end)}>{label}</NavLink>)}
        </nav>
      </aside>
      <section className="painel-conteudo"><Outlet /></section>
    </main>
  );
}
