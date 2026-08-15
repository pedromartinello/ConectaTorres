import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

function formatarData(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

export function PrestadorDetalhe() {
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const [prestador, setPrestador] = useState(null);
  const [erro, setErro] = useState('');
  const [agendamento, setAgendamento] = useState({ servicoId: '', inicio: '', fim: '', descricao: '' });
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    api(`/prestadores/${id}`)
      .then((d) => setPrestador(d.prestador))
      .catch((e) => setErro(e.message));
  }, [id]);

  async function solicitar(evento) {
    evento.preventDefault();
    setMensagem('');
    setErro('');
    try {
      await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          prestadorId: id,
          servicoId: agendamento.servicoId || null,
          inicio: new Date(agendamento.inicio).toISOString(),
          fim: new Date(agendamento.fim).toISOString(),
          descricao: agendamento.descricao
        })
      });
      setMensagem('Solicitacao de horario enviada com sucesso.');
      setAgendamento({ servicoId: '', inicio: '', fim: '', descricao: '' });
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro && !prestador) return <main className="container secao"><div className="alerta erro">{erro}</div></main>;
  if (!prestador) return <main className="container secao">Carregando...</main>;

  const perfil = prestador.perfilPrestador || {};
  const whatsapp = perfil.whatsapp?.replace(/\D/g, '');

  return (
    <main className="container secao">
      <section className="perfil-cabecalho">
        <div>
          <span className="rotulo">Prestador local</span>
          <h1>{prestador.nome}</h1>
          <p className="subtitulo">{perfil.titulo || 'Perfil profissional'}</p>
          <p>{perfil.descricao || 'Descricao ainda nao informada.'}</p>
          <div className="tags">
            {prestador.servicos?.map((s) => <span key={s.id} className="tag">{s.categoria?.nome}</span>)}
          </div>
        </div>
        <aside className="painel-resumo">
          <strong>★ {prestador.mediaAvaliacoes || 0}</strong>
          <span>{prestador.totalAvaliacoes || 0} avaliacao(oes)</span>
          <span>{perfil.cidade ? `${perfil.cidade}/${perfil.estado || 'RS'}` : 'Cidade nao informada'}</span>
          {whatsapp && <a className="botao" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}
        </aside>
      </section>

      <section className="secao-interna">
        <h2>Servicos</h2>
        <div className="grade-cards">
          {prestador.servicos?.map((servico) => (
            <div key={servico.id} className="cartao-info">
              <strong>{servico.titulo}</strong>
              <p>{servico.descricao || 'Sem descricao.'}</p>
              <span className="texto-suave">{servico.precoBase ? `A partir de R$ ${Number(servico.precoBase).toFixed(2).replace('.', ',')}` : 'Valor sob consulta'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="secao-interna">
        <h2>Disponibilidade</h2>
        <div className="lista-simples">
          {prestador.disponibilidades?.map((item) => (
            <div key={item.id}><strong>{formatarData(item.inicio)}</strong> ate {formatarData(item.fim)}</div>
          ))}
          {!prestador.disponibilidades?.length && <p className="texto-suave">Nenhum horario futuro cadastrado.</p>}
        </div>
      </section>

      {usuario?.tipo === 'cliente' && (
        <section className="secao-interna formulario-cartao largura-media">
          <h2>Solicitar horario</h2>
          <form className="formulario" onSubmit={solicitar}>
            <label>Servico
              <select value={agendamento.servicoId} onChange={(e) => setAgendamento({ ...agendamento, servicoId: e.target.value })}>
                <option value="">Servico nao especificado</option>
                {prestador.servicos?.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}
              </select>
            </label>
            <div className="grade-dois">
              <label>Inicio<input type="datetime-local" required value={agendamento.inicio} onChange={(e) => setAgendamento({ ...agendamento, inicio: e.target.value })} /></label>
              <label>Fim<input type="datetime-local" required value={agendamento.fim} onChange={(e) => setAgendamento({ ...agendamento, fim: e.target.value })} /></label>
            </div>
            <label>Descricao<textarea rows="4" value={agendamento.descricao} onChange={(e) => setAgendamento({ ...agendamento, descricao: e.target.value })} placeholder="Explique brevemente o que precisa." /></label>
            {mensagem && <div className="alerta sucesso">{mensagem}</div>}
            {erro && <div className="alerta erro">{erro}</div>}
            <button className="botao">Enviar solicitacao</button>
          </form>
        </section>
      )}

      <section className="secao-interna">
        <h2>Avaliacoes</h2>
        <div className="lista-simples">
          {prestador.avaliacoesRecebidas?.map((a) => (
            <div key={a.id} className="avaliacao"><strong>{'★'.repeat(a.nota)}</strong><p>{a.comentario || 'Sem comentario.'}</p></div>
          ))}
          {!prestador.avaliacoesRecebidas?.length && <p className="texto-suave">Este prestador ainda nao possui avaliacoes.</p>}
        </div>
      </section>
    </main>
  );
}
