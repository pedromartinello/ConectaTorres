import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { rotuloStatusAgendamento } from '../utilitarios/rotulos.js';

function fmt(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

export function PainelInicio() {
  const { usuario } = useAutenticacao();
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api('/painel/resumo').then((d) => setResumo(d.resumo)).catch((e) => setErro(e.message));
  }, [usuario.tipo]);

  if (!resumo && !erro) return <div className="vazio">Carregando resumo do painel...</div>;

  return (
    <div>
      <div className="titulo-secao">
        <span className="rotulo">Área autenticada</span>
        <h1>Olá, {usuario.nome.split(' ')[0]}</h1>
        <p className="texto-suave">Aqui está um resumo da sua conta e do que precisa da sua atenção.</p>
      </div>
      {erro && <div className="alerta erro">{erro}</div>}
      {usuario.tipo !== 'admin' && (
        <div className="grade-metricas">
          <div className="metrica"><span>Agendamentos ativos</span><strong>{resumo?.agendamentosAtivos || 0}</strong><Link to="/painel/agenda#agendamentos">Ver agenda</Link></div>
          {usuario.tipo === 'cliente' && <div className="metrica"><span>Favoritos</span><strong>{resumo?.favoritos || 0}</strong><Link to="/painel/favoritos">Ver favoritos</Link></div>}
          {usuario.tipo === 'cliente' && <div className="metrica"><span>Avaliações pendentes</span><strong>{resumo?.avaliacoesPendentes || 0}</strong><Link to="/painel/avaliacoes">Avaliar</Link></div>}
          {usuario.tipo === 'prestador' && <div className="metrica"><span>Solicitações pendentes</span><strong>{resumo?.solicitacoesPendentes || 0}</strong><Link to="/painel/agenda#agendamentos">Responder</Link></div>}
          {usuario.tipo === 'prestador' && <div className="metrica"><span>Serviços ativos</span><strong>{resumo?.servicosAtivos || 0}</strong><Link to="/painel/servicos">Gerenciar</Link></div>}
          {usuario.tipo === 'prestador' && <div className="metrica"><span>Avaliações recebidas</span><strong>{resumo?.totalAvaliacoes || 0}</strong><Link to="/painel/avaliacoes">Visualizar</Link></div>}
          <div className="metrica"><span>Notificações não lidas</span><strong>{resumo?.notificacoesNaoLidas || 0}</strong><Link to="/painel/notificacoes">Abrir notificações</Link></div>
        </div>
      )}
      {usuario.tipo === 'admin' && (
        <div className="grade-metricas"><div className="metrica"><span>Notificações não lidas</span><strong>{resumo?.notificacoesNaoLidas || 0}</strong><Link to="/painel/notificacoes">Abrir notificações</Link></div><div className="metrica"><span>Administração</span><strong>ADM</strong><Link to="/painel/admin">Abrir painel</Link></div></div>
      )}
      {usuario.tipo !== 'admin' && (
        <section className="secao-interna">
          <div className="titulo-linha"><h2>Próximos agendamentos</h2><Link className="link-destaque" to="/painel/agenda#agendamentos">Ver todos →</Link></div>
          <div className="lista-simples">
            {(resumo?.proximos || []).map((a) => (
              <article key={a.id} className="linha-gerencial">
                <div><strong>{a.servico?.titulo || 'Serviço não especificado'}</strong><span className="texto-suave bloco">{fmt(a.inicio)} • {usuario.tipo === 'prestador' ? a.cliente?.nome : a.prestador?.nome}</span></div>
                <span className={`status status-${a.status}`}>{rotuloStatusAgendamento(a.status)}</span>
              </article>
            ))}
            {!resumo?.proximos?.length && <div className="vazio">Nenhum agendamento futuro ativo.</div>}
          </div>
        </section>
      )}
      <section className="secao-interna">
        <h2>Próximos passos</h2>
        <div className="grade-dois">
          {usuario.tipo === 'prestador' && <><div className="cartao-info"><h3>{resumo?.perfilCompleto ? 'Perfil profissional pronto' : 'Complete seu perfil'}</h3><p>{resumo?.perfilCompleto ? 'Seus dados principais estão preenchidos. Mantenha o portfólio e valores atualizados.' : 'Adicione título, descrição, cidade e WhatsApp para melhorar sua apresentação.'}</p><Link className="link-destaque" to="/painel/profissional">Editar perfil →</Link></div><div className="cartao-info"><h3>Mantenha sua agenda atualizada</h3><p>Cadastre somente períodos em que você realmente pode atender.</p><Link className="link-destaque" to="/painel/agenda">Gerenciar agenda →</Link></div></>}
          {usuario.tipo === 'cliente' && <><div className="cartao-info"><h3>Encontre profissionais</h3><p>Use filtros de categoria, cidade, preço, avaliação e disponibilidade.</p><Link className="link-destaque" to="/prestadores">Pesquisar →</Link></div><div className="cartao-info"><h3>Acompanhe seus atendimentos</h3><p>Veja solicitações pendentes, aceitas e atendimentos concluídos.</p><Link className="link-destaque" to="/painel/agenda#agendamentos">Ver agenda →</Link></div></>}
          {usuario.tipo === 'admin' && <div className="cartao-info"><h3>Administração da plataforma</h3><p>Gerencie usuários, categorias, denúncias e moderação de avaliações.</p><Link className="link-destaque" to="/painel/admin">Abrir administração →</Link></div>}
        </div>
      </section>
    </div>
  );
}
