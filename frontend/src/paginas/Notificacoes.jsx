import { Link } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';

function fmt(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function linkNotificacao(notificacao) {
  if (!notificacao.link) return null;
  if (notificacao.tipo === 'agendamento' && notificacao.link.startsWith('/painel/agenda') && !notificacao.link.includes('#')) {
    return '/painel/agenda#agendamentos';
  }
  return notificacao.link;
}

export function Notificacoes() {
  const { notificacoes, naoLidas, recarregar } = useNotificacoes();

  async function ler(notificacao) {
    if (!notificacao.lidaEm) await api(`/notificacoes/${notificacao.id}/ler`, { method: 'PATCH' });
    await recarregar();
  }

  async function lerTodas() {
    await api('/notificacoes/ler-todas', { method: 'PATCH' });
    await recarregar();
  }

  return (
    <div>
      <div className="titulo-linha">
        <div className="titulo-secao">
          <span className="rotulo">Central</span>
          <h1>Notificações</h1>
          <p className="texto-suave">{naoLidas === 1 ? '1 notificação não lida.' : `${naoLidas} notificações não lidas.`}</p>
        </div>
        {naoLidas > 0 && <button className="botao-secundario" onClick={lerTodas}>Marcar todas como lidas</button>}
      </div>

      <div className="lista-notificacoes">
        {notificacoes.map((notificacao) => {
          const destino = linkNotificacao(notificacao);
          return (
            <article key={notificacao.id} className={`notificacao ${notificacao.lidaEm ? '' : 'nao-lida'}`}>
              <div className="bolinha-notificacao" />
              <div>
                <div className="titulo-linha">
                  <strong>{notificacao.titulo}</strong>
                  <span className="texto-suave texto-pequeno">{fmt(notificacao.createdAt)}</span>
                </div>
                <p>{notificacao.mensagem}</p>
                {destino ? (
                  <Link className="link-destaque" to={destino} onClick={() => ler(notificacao)}>Abrir →</Link>
                ) : !notificacao.lidaEm && (
                  <button className="link-destaque botao-link" onClick={() => ler(notificacao)}>Marcar como lida</button>
                )}
              </div>
            </article>
          );
        })}
        {!notificacoes.length && <div className="vazio">Nenhuma notificação por enquanto.</div>}
      </div>
    </div>
  );
}
