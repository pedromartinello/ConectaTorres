import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, urlMidia } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';
import { Avatar } from '../componentes/Avatar.jsx';
import { rolarParaElemento } from '../utilitarios/navegacao.js';
import { DIAS_SEMANA, hojeLocal, montarDataHoraLocal } from '../utilitarios/agenda.js';

function formatarData(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function resumoAgendaDia(agenda) {
  if (!agenda) return null;
  if (agenda.modo === 'legado') {
    if (!agenda.aberto) return { classe: 'indisponivel', texto: 'O prestador não possui disponibilidade cadastrada para esta data.' };
    return { classe: 'disponivel', texto: `Períodos cadastrados: ${agenda.periodos.map((p) => `${p.inicio}–${p.fim}`).join(', ')}.` };
  }
  if (!agenda.horario) return { classe: 'indisponivel', texto: 'O prestador não atende neste dia da semana.' };
  if (!agenda.aberto) return { classe: 'indisponivel', texto: 'O prestador marcou esta data como indisponível.' };
  return { classe: 'disponivel', texto: `Atendimento neste dia: ${agenda.horario.inicio} às ${agenda.horario.fim}.` };
}

export function PrestadorDetalhe() {
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const { recarregar: recarregarNotificacoes } = useNotificacoes();
  const [prestador, setPrestador] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erroAgendamento, setErroAgendamento] = useState('');
  const [mensagemAgendamento, setMensagemAgendamento] = useState('');
  const [enviandoAgendamento, setEnviandoAgendamento] = useState(false);
  const [agendamento, setAgendamento] = useState({ servicoId: '', data: '', horaReferencia: '', descricao: '' });
  const [agendaDia, setAgendaDia] = useState(null);
  const [carregandoAgendaDia, setCarregandoAgendaDia] = useState(false);
  const [verificacao, setVerificacao] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [denuncia, setDenuncia] = useState(null);
  const [formDenuncia, setFormDenuncia] = useState({ motivo: '', descricao: '' });

  async function carregar() {
    try {
      const dados = await api(`/prestadores/${id}`);
      setPrestador(dados.prestador);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => { carregar(); }, [id, usuario?.id]);

  useEffect(() => {
    if (denuncia) rolarParaElemento('formulario-denuncia');
  }, [denuncia]);

  useEffect(() => {
    let cancelado = false;
    if (!agendamento.data) {
      setAgendaDia(null);
      return undefined;
    }
    setCarregandoAgendaDia(true);
    api(`/disponibilidades/prestador/${id}/agenda?data=${encodeURIComponent(agendamento.data)}`)
      .then((dados) => { if (!cancelado) setAgendaDia(dados.agenda); })
      .catch((e) => { if (!cancelado) setAgendaDia({ erro: e.message }); })
      .finally(() => { if (!cancelado) setCarregandoAgendaDia(false); });
    return () => { cancelado = true; };
  }, [id, agendamento.data]);

  useEffect(() => {
    let cancelado = false;
    const inicio = montarDataHoraLocal(agendamento.data, agendamento.horaReferencia);

    if (!inicio) {
      setVerificacao(null);
      setVerificando(false);
      return undefined;
    }

    setVerificando(true);
    setVerificacao(null);
    const temporizador = setTimeout(() => {
      api(`/disponibilidades/prestador/${id}/verificar?inicio=${encodeURIComponent(inicio.toISOString())}`)
        .then((dados) => { if (!cancelado) setVerificacao(dados); })
        .catch((e) => { if (!cancelado) setVerificacao({ disponivel: false, mensagem: e.message }); })
        .finally(() => { if (!cancelado) setVerificando(false); });
    }, 300);

    return () => {
      cancelado = true;
      clearTimeout(temporizador);
    };
  }, [id, agendamento.data, agendamento.horaReferencia]);

  async function alternarFavorito() {
    setErro('');
    try {
      if (prestador.favoritado) await api(`/favoritos/${id}`, { method: 'DELETE' });
      else await api(`/favoritos/${id}`, { method: 'POST' });
      setPrestador({ ...prestador, favoritado: !prestador.favoritado });
    } catch (e) {
      setErro(e.message);
    }
  }

  async function solicitar(evento) {
    evento.preventDefault();
    setErroAgendamento('');
    setMensagemAgendamento('');

    const inicio = montarDataHoraLocal(agendamento.data, agendamento.horaReferencia);
    if (!inicio) {
      setErroAgendamento('Informe a data e o horário em que você estará disponível.');
      return;
    }
    if (inicio <= new Date()) {
      setErroAgendamento('Escolha um horário futuro.');
      return;
    }
    if (verificacao && !verificacao.disponivel) {
      setErroAgendamento(verificacao.mensagem);
      return;
    }

    setEnviandoAgendamento(true);
    try {
      await api('/agendamentos', {
        method: 'POST',
        body: JSON.stringify({
          prestadorId: id,
          servicoId: agendamento.servicoId || null,
          inicio: inicio.toISOString(),
          descricao: agendamento.descricao
        })
      });
      setMensagemAgendamento('Solicitação enviada. O prestador irá definir ou confirmar o período do atendimento.');
      setAgendamento({ servicoId: '', data: '', horaReferencia: '', descricao: '' });
      setAgendaDia(null);
      setVerificacao(null);
      await recarregarNotificacoes();
    } catch (e) {
      setErroAgendamento(e.message);
    } finally {
      setEnviandoAgendamento(false);
    }
  }

  async function enviarDenuncia(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    try {
      await api('/denuncias', {
        method: 'POST',
        body: JSON.stringify({
          prestadorId: denuncia.tipo === 'prestador' ? id : null,
          avaliacaoId: denuncia.tipo === 'avaliacao' ? denuncia.id : null,
          ...formDenuncia
        })
      });
      setMensagem('Denúncia enviada para análise da administração.');
      setDenuncia(null);
      setFormDenuncia({ motivo: '', descricao: '' });
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro && !prestador) return <main className="container secao"><div className="alerta erro">{erro}</div></main>;
  if (!prestador) return <main className="container secao"><div className="vazio">Carregando...</div></main>;

  const perfil = prestador.perfilPrestador || {};
  const whatsapp = perfil.whatsapp?.replace(/\D/g, '');
  const totalAvaliacoes = Number(prestador.totalAvaliacoes || 0);
  const possuiAgendaSemanal = Boolean(prestador.horariosSemanais?.length);
  const resumoDia = resumoAgendaDia(agendaDia);

  return (
    <main className="container secao">
      <section className="perfil-cabecalho">
        <div className="perfil-principal">
          <Avatar nome={prestador.nome} fotoUrl={prestador.fotoUrl} tamanho="extra" />
          <div>
            <span className="rotulo">Prestador local</span>
            <h1>{prestador.nome}</h1>
            <p className="subtitulo">{perfil.titulo || 'Perfil profissional'}</p>
            <p>{perfil.descricao || 'Descrição ainda não informada.'}</p>
            <div className="tags">{prestador.servicos?.map((servico) => <span key={servico.id} className="tag">{servico.categoria?.nome}</span>)}</div>
          </div>
        </div>
        <aside className="painel-resumo">
          <strong>★ {prestador.mediaAvaliacoes || 0}</strong>
          <span>{totalAvaliacoes} {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}</span>
          <span>{perfil.cidade ? `${perfil.cidade}/${perfil.estado || 'RS'}` : 'Cidade não informada'}</span>
          {perfil.regiaoAtendimento && <span className="texto-suave">Atende: {perfil.regiaoAtendimento}</span>}
          {usuario?.tipo === 'cliente' && <button className="botao" onClick={() => rolarParaElemento('formulario-agendamento')}>Solicitar serviço</button>}
          {whatsapp && <a className="botao-secundario" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}
          {usuario?.tipo === 'cliente' && <button className="botao-secundario" onClick={alternarFavorito}>{prestador.favoritado ? '♥ Remover favorito' : '♡ Adicionar favorito'}</button>}
          {usuario && <button className="link-perigo" onClick={() => setDenuncia({ tipo: 'prestador', id })}>Denunciar perfil</button>}
        </aside>
      </section>

      {mensagem && <div className="alerta sucesso espaco-alerta">{mensagem}</div>}
      {erro && <div className="alerta erro espaco-alerta">{erro}</div>}

      {prestador.portfolio?.length > 0 && (
        <section className="secao-interna">
          <div className="titulo-linha"><h2>Portfólio</h2><span className="texto-suave">Trabalhos cadastrados pelo profissional</span></div>
          <div className="grade-portfolio">
            {prestador.portfolio.map((item) => (
              <figure key={item.id}>
                <img src={urlMidia(item.imagemUrl)} alt={item.legenda || 'Trabalho do prestador'} />
                <figcaption>{item.legenda || 'Trabalho realizado'}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <section className="secao-interna">
        <h2>Serviços</h2>
        <div className="grade-cards">
          {prestador.servicos?.map((servico) => (
            <div key={servico.id} className="cartao-info">
              <span className="tag">{servico.categoria?.nome}</span>
              <h3>{servico.titulo}</h3>
              <p>{servico.descricao || 'Sem descrição.'}</p>
              <strong>{servico.precoBase ? `A partir de R$ ${Number(servico.precoBase).toFixed(2).replace('.', ',')}` : 'Valor sob consulta'}</strong>
            </div>
          ))}
          {!prestador.servicos?.length && <div className="vazio">Nenhum serviço cadastrado.</div>}
        </div>
      </section>

      <section className="secao-interna">
        <div className="titulo-linha">
          <div><h2>Horários de atendimento</h2><p className="texto-suave">Rotina semanal informada pelo prestador.</p></div>
        </div>
        {possuiAgendaSemanal ? (
          <div className="grade-horarios-publicos">
            {DIAS_SEMANA.map((dia) => {
              const horario = prestador.horariosSemanais.find((item) => Number(item.diaSemana) === dia.valor);
              const aberto = horario?.ativo;
              return (
                <div className={`horario-publico ${aberto ? 'aberto' : 'fechado'}`} key={dia.valor}>
                  <strong>{dia.curto}</strong>
                  <span>{aberto ? `${String(horario.inicio).slice(0, 5)} – ${String(horario.fim).slice(0, 5)}` : 'Fechado'}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="lista-simples">
            {prestador.disponibilidades?.map((item) => (
              <div key={item.id}><strong>{formatarData(item.inicio)}</strong> até {formatarData(item.fim)}{item.observacao && <span className="texto-suave bloco">{item.observacao}</span>}</div>
            ))}
            {!prestador.disponibilidades?.length && <p className="vazio">Agenda ainda não configurada pelo prestador.</p>}
          </div>
        )}
      </section>

      {usuario?.tipo === 'cliente' ? (
        <section id="formulario-agendamento" tabIndex="-1" className="secao-interna formulario-cartao largura-media alvo-navegacao">
          <h2>Solicitar serviço</h2>
          <p className="texto-suave">Informe a data e o horário em que você estará disponível para receber o prestador. A duração do serviço será definida pelo profissional.</p>
          <form className="formulario" onSubmit={solicitar}>
            <label>
              Serviço
              <select value={agendamento.servicoId} onChange={(e) => setAgendamento({ ...agendamento, servicoId: e.target.value })}>
                <option value="">Serviço não especificado</option>
                {prestador.servicos?.map((servico) => <option key={servico.id} value={servico.id}>{servico.titulo}</option>)}
              </select>
            </label>
            <label>
              Data
              <input type="date" min={hojeLocal()} required value={agendamento.data} onChange={(e) => setAgendamento({ ...agendamento, data: e.target.value, horaReferencia: '' })} />
            </label>

            {agendamento.data && (
              <div className="consulta-agenda" aria-live="polite">
                {carregandoAgendaDia ? <span className="texto-suave">Consultando agenda...</span> : agendaDia?.erro ? (
                  <span className="agenda-indisponivel">{agendaDia.erro}</span>
                ) : resumoDia && (
                  <>
                    <strong className={resumoDia.classe === 'disponivel' ? 'agenda-disponivel' : 'agenda-indisponivel'}>{resumoDia.texto}</strong>
                    {agendaDia?.bloqueios?.filter((b) => !b.diaInteiro).length > 0 && (
                      <div className="faixas-agenda"><span>Indisponível:</span>{agendaDia.bloqueios.filter((b) => !b.diaInteiro).map((b) => <span className="tag" key={b.id}>{b.inicio}–{b.fim}</span>)}</div>
                    )}
                    {agendaDia?.ocupados?.length > 0 && (
                      <div className="faixas-agenda"><span>Horários já comprometidos:</span>{agendaDia.ocupados.map((o, indice) => <span className="tag tag-ocupado" key={`${o.inicio}-${indice}`}>{o.fim ? `${o.inicio}–${o.fim}` : `solicitação às ${o.inicio}`}</span>)}</div>
                    )}
                  </>
                )}
              </div>
            )}

            <label>
              Horário em que você estará disponível
              <input type="time" required disabled={!agendamento.data || agendaDia?.aberto === false} value={agendamento.horaReferencia} onChange={(e) => setAgendamento({ ...agendamento, horaReferencia: e.target.value })} />
              <span className="ajuda-campo">Informe a partir de que horário você estará no local. O prestador definirá ou confirmará o período do atendimento.</span>
            </label>

            {(verificando || verificacao) && (
              <div className={`verificacao-horario ${verificacao?.disponivel ? 'ok' : verificacao ? 'erro' : ''}`} aria-live="polite">
                {verificando ? 'Verificando este horário...' : verificacao?.mensagem}
              </div>
            )}

            <label>
              Descrição
              <textarea rows="4" maxLength="2000" value={agendamento.descricao} onChange={(e) => setAgendamento({ ...agendamento, descricao: e.target.value })} placeholder="Explique brevemente o que precisa." />
            </label>
            <button className="botao" disabled={enviandoAgendamento || verificando || Boolean(verificacao && !verificacao.disponivel)}>{enviandoAgendamento ? 'Enviando...' : 'Enviar solicitação'}</button>
            {erroAgendamento && <div className="alerta erro alerta-formulario" role="alert">{erroAgendamento}</div>}
            {mensagemAgendamento && <div className="alerta sucesso alerta-formulario" role="status">{mensagemAgendamento}</div>}
          </form>
        </section>
      ) : !usuario && (
        <section className="secao-interna chamada-login">
          <p>Entre na sua conta de cliente para solicitar um horário.</p>
          <Link className="botao" to="/entrar">Entrar</Link>
        </section>
      )}

      <section className="secao-interna">
        <h2>Avaliações</h2>
        <div className="lista-simples">
          {prestador.avaliacoesRecebidas?.map((avaliacao) => (
            <div key={avaliacao.id} className="avaliacao">
              <div className="avaliacao-topo">
                <div className="prestador-identidade"><Avatar nome={avaliacao.cliente?.nome} fotoUrl={avaliacao.cliente?.fotoUrl} tamanho="pequeno" /><strong>{avaliacao.cliente?.nome || 'Cliente'}</strong></div>
                <strong className="estrelas">{'★'.repeat(avaliacao.nota)}{'☆'.repeat(5 - avaliacao.nota)}</strong>
              </div>
              <p>{avaliacao.comentario || 'Sem comentário.'}</p>
              {usuario && <button className="link-perigo" onClick={() => setDenuncia({ tipo: 'avaliacao', id: avaliacao.id })}>Denunciar avaliação</button>}
            </div>
          ))}
          {!prestador.avaliacoesRecebidas?.length && <p className="vazio">Este prestador ainda não possui avaliações.</p>}
        </div>
      </section>

      {denuncia && (
        <section id="formulario-denuncia" tabIndex="-1" className="secao-interna formulario-cartao largura-media alvo-navegacao">
          <div className="titulo-linha"><h2>Enviar denúncia</h2><button className="botao-icone" onClick={() => setDenuncia(null)}>×</button></div>
          <p className="texto-suave">A administração receberá a denúncia para moderação.</p>
          <form className="formulario" onSubmit={enviarDenuncia}>
            <label>Motivo<input required minLength="3" maxLength="120" value={formDenuncia.motivo} onChange={(e) => setFormDenuncia({ ...formDenuncia, motivo: e.target.value })} placeholder="Ex.: informação inadequada" /></label>
            <label>Detalhes<textarea rows="4" maxLength="2000" value={formDenuncia.descricao} onChange={(e) => setFormDenuncia({ ...formDenuncia, descricao: e.target.value })} /></label>
            <div className="acoes"><button className="botao">Enviar denúncia</button><button type="button" className="botao-secundario" onClick={() => setDenuncia(null)}>Cancelar</button></div>
          </form>
        </section>
      )}
    </main>
  );
}
