import { useEffect, useState } from 'react';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';
import { rotuloStatusAgendamento } from '../utilitarios/rotulos.js';
import { DIAS_SEMANA, formatarDataCurta, hojeLocal, mesclarAgendaSemanal } from '../utilitarios/agenda.js';
import { rolarParaElemento } from '../utilitarios/navegacao.js';

function fmt(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function paraLocalInput(valor) {
  const data = new Date(valor);
  data.setMinutes(data.getMinutes() - data.getTimezoneOffset());
  return data.toISOString().slice(0, 16);
}

function agoraLocal() {
  return paraLocalInput(new Date());
}

function rotuloBloqueio(item) {
  if (item.diaInteiro) return `${formatarDataCurta(item.data)} • dia inteiro`;
  return `${formatarDataCurta(item.data)} • ${String(item.inicio).slice(0, 5)} às ${String(item.fim).slice(0, 5)}`;
}

function textoHorarioAgendamento(agendamento, tipoUsuario) {
  const referencia = agendamento.horarioSolicitado || agendamento.inicio;
  if (!agendamento.fim) {
    return tipoUsuario === 'prestador'
      ? `Horário de referência informado pelo cliente: ${fmt(referencia)}`
      : `Horário informado por você: ${fmt(referencia)}`;
  }
  return `${fmt(agendamento.inicio)} até ${fmt(agendamento.fim)}`;
}

export function MinhaAgenda() {
  const { usuario } = useAutenticacao();
  const { recarregar: recarregarNotificacoes } = useNotificacoes();
  const [agendamentos, setAgendamentos] = useState([]);
  const [horariosSemanais, setHorariosSemanais] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [disponibilidadesLegadas, setDisponibilidadesLegadas] = useState(0);
  const [agendaConfigurada, setAgendaConfigurada] = useState(false);
  const [bloqueio, setBloqueio] = useState({ data: '', diaInteiro: true, inicio: '12:00', fim: '13:00', observacao: '' });
  const [ajustando, setAjustando] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvandoAgenda, setSalvandoAgenda] = useState(false);
  const [salvandoBloqueio, setSalvandoBloqueio] = useState(false);

  async function carregar() {
    const dadosAgendamentos = await api('/agendamentos');
    setAgendamentos(dadosAgendamentos.agendamentos);

    if (usuario.tipo === 'prestador') {
      const configuracao = await api('/disponibilidades/minhas/configuracao');
      setAgendaConfigurada(configuracao.horariosSemanais.length > 0);
      setHorariosSemanais(mesclarAgendaSemanal(configuracao.horariosSemanais));
      setBloqueios(configuracao.bloqueios || []);
      setDisponibilidadesLegadas(Number(configuracao.disponibilidadesLegadas || 0));
    }
  }

  useEffect(() => {
    carregar().catch((e) => setErro(e.message));
  }, [usuario.tipo]);

  useEffect(() => {
    if (ajustando) rolarParaElemento('ajuste-horario');
  }, [ajustando]);

  function alterarDia(diaSemana, campo, valor) {
    setHorariosSemanais((atuais) => atuais.map((item) => (
      item.diaSemana === diaSemana ? { ...item, [campo]: valor } : item
    )));
  }

  async function salvarAgendaSemanal(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvandoAgenda(true);
    try {
      const resposta = await api('/disponibilidades/semanais', {
        method: 'PUT',
        body: JSON.stringify({ horarios: horariosSemanais })
      });
      setAgendaConfigurada(true);
      setHorariosSemanais(mesclarAgendaSemanal(resposta.horariosSemanais));
      setMensagem('Agenda semanal salva com sucesso.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoAgenda(false);
    }
  }

  async function adicionarBloqueio(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvandoBloqueio(true);
    try {
      await api('/disponibilidades/bloqueios', {
        method: 'POST',
        body: JSON.stringify(bloqueio)
      });
      setBloqueio({ data: '', diaInteiro: true, inicio: '12:00', fim: '13:00', observacao: '' });
      setMensagem('Indisponibilidade adicionada à agenda.');
      await carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoBloqueio(false);
    }
  }

  async function removerBloqueio(id) {
    if (!confirm('Remover esta indisponibilidade da agenda?')) return;
    setErro('');
    try {
      await api(`/disponibilidades/bloqueios/${id}`, { method: 'DELETE' });
      await carregar();
      setMensagem('Indisponibilidade removida.');
    } catch (e) {
      setErro(e.message);
    }
  }

  function abrirAjuste(agendamento) {
    setAjustando({
      id: agendamento.id,
      inicio: paraLocalInput(agendamento.inicio),
      fim: agendamento.fim ? paraLocalInput(agendamento.fim) : '',
      definindo: !agendamento.fim,
      horarioSolicitado: agendamento.horarioSolicitado || agendamento.inicio
    });
  }

  async function status(id, novoStatus) {
    setErro('');
    try {
      await api(`/agendamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: novoStatus }) });
      await carregar();
      await recarregarNotificacoes();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function concluir(id) {
    setErro('');
    try {
      await api(`/agendamentos/${id}/concluir`, { method: 'PATCH' });
      await carregar();
      await recarregarNotificacoes();
      setMensagem('Atendimento marcado como concluído.');
    } catch (e) {
      setErro(e.message);
    }
  }

  async function salvarHorario(evento) {
    evento.preventDefault();
    setErro('');
    try {
      await api(`/agendamentos/${ajustando.id}/horario`, {
        method: 'PATCH',
        body: JSON.stringify({
          inicio: new Date(ajustando.inicio).toISOString(),
          fim: new Date(ajustando.fim).toISOString()
        })
      });
      setAjustando(null);
      await carregar();
      setMensagem(ajustando.definindo ? 'Período definido. Agora você pode aceitar a solicitação.' : 'Horário ajustado. O cliente foi notificado.');
    } catch (e) {
      setErro(e.message);
    }
  }

  const futuros = [...agendamentos].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

  return (
    <div>
      <div className="titulo-secao">
        <span className="rotulo">Agenda</span>
        <h1>{usuario.tipo === 'prestador' ? 'Agenda e solicitações' : 'Meus agendamentos'}</h1>
        <p className="texto-suave">Acompanhe horários, status e atendimentos.</p>
      </div>

      {mensagem && <div className="alerta sucesso">{mensagem}</div>}
      {erro && <div className="alerta erro">{erro}</div>}

      {usuario.tipo === 'prestador' && (
        <>
          <section className="formulario-cartao agenda-semanal-cartao">
            <div className="titulo-linha">
              <div>
                <h2>Horários de atendimento</h2>
                <p className="texto-suave">Defina sua rotina semanal. Dias desmarcados serão exibidos como fechados.</p>
              </div>
              <span className={`status ${agendaConfigurada ? 'status-aceito' : 'status-pendente'}`}>
                {agendaConfigurada ? 'Agenda configurada' : 'Não salva'}
              </span>
            </div>

            {!agendaConfigurada && disponibilidadesLegadas > 0 && (
              <div className="alerta informacao">
                Você possui {disponibilidadesLegadas} {disponibilidadesLegadas === 1 ? 'período antigo cadastrado' : 'períodos antigos cadastrados'}. Eles continuam válidos até você salvar a nova agenda semanal.
              </div>
            )}

            <form onSubmit={salvarAgendaSemanal}>
              <div className="tabela-agenda-semanal">
                <div className="agenda-cabecalho">
                  <span>Atende</span><span>Dia</span><span>Início</span><span>Fim</span><span>Situação</span>
                </div>
                {DIAS_SEMANA.map((dia) => {
                  const item = horariosSemanais.find((h) => h.diaSemana === dia.valor) || { ativo: false, inicio: '08:00', fim: '18:00' };
                  return (
                    <div className={`agenda-linha ${item.ativo ? 'ativo' : 'fechado'}`} key={dia.valor}>
                      <label className="checkbox-agenda" aria-label={`Atender na ${dia.nome}`}>
                        <input type="checkbox" checked={item.ativo} onChange={(e) => alterarDia(dia.valor, 'ativo', e.target.checked)} />
                        <span />
                      </label>
                      <strong>{dia.nome}</strong>
                      <input type="time" disabled={!item.ativo} required={item.ativo} value={item.inicio} onChange={(e) => alterarDia(dia.valor, 'inicio', e.target.value)} />
                      <input type="time" disabled={!item.ativo} required={item.ativo} value={item.fim} onChange={(e) => alterarDia(dia.valor, 'fim', e.target.value)} />
                      <span className={item.ativo ? 'agenda-aberto' : 'agenda-fechado'}>{item.ativo ? `${item.inicio} – ${item.fim}` : 'Fechado'}</span>
                    </div>
                  );
                })}
              </div>
              <div className="acoes agenda-acoes">
                <button className="botao" disabled={salvandoAgenda}>{salvandoAgenda ? 'Salvando...' : 'Salvar agenda semanal'}</button>
              </div>
            </form>
          </section>

          <section className="formulario-cartao">
            <div className="titulo-linha">
              <div>
                <h2>Exceções e indisponibilidades</h2>
                <p className="texto-suave">Use quando não puder atender em uma data específica, sem alterar sua rotina semanal.</p>
              </div>
            </div>
            <form className="formulario" onSubmit={adicionarBloqueio}>
              <div className="grade-dois">
                <label>
                  Data
                  <input type="date" min={hojeLocal()} required value={bloqueio.data} onChange={(e) => setBloqueio({ ...bloqueio, data: e.target.value })} />
                </label>
                <label className="campo-checkbox-linha">
                  <input type="checkbox" checked={bloqueio.diaInteiro} onChange={(e) => setBloqueio({ ...bloqueio, diaInteiro: e.target.checked })} />
                  <span>Indisponível o dia inteiro</span>
                </label>
              </div>
              {!bloqueio.diaInteiro && (
                <div className="grade-dois">
                  <label>Início<input type="time" required value={bloqueio.inicio} onChange={(e) => setBloqueio({ ...bloqueio, inicio: e.target.value })} /></label>
                  <label>Fim<input type="time" required value={bloqueio.fim} onChange={(e) => setBloqueio({ ...bloqueio, fim: e.target.value })} /></label>
                </div>
              )}
              <label>
                Observação
                <input maxLength="255" value={bloqueio.observacao} onChange={(e) => setBloqueio({ ...bloqueio, observacao: e.target.value })} placeholder="Ex.: compromisso pessoal" />
              </label>
              <button className="botao-secundario largura-botao" disabled={salvandoBloqueio}>{salvandoBloqueio ? 'Adicionando...' : 'Adicionar indisponibilidade'}</button>
            </form>

            <div className="lista-bloqueios">
              {bloqueios.map((item) => (
                <div className="bloqueio-item" key={item.id}>
                  <div>
                    <strong>{rotuloBloqueio(item)}</strong>
                    {item.observacao && <span className="texto-suave bloco">{item.observacao}</span>}
                  </div>
                  <button className="botao-icone" onClick={() => removerBloqueio(item.id)} aria-label="Remover indisponibilidade">×</button>
                </div>
              ))}
              {!bloqueios.length && <div className="vazio vazio-compacto">Nenhuma indisponibilidade futura cadastrada.</div>}
            </div>
          </section>
        </>
      )}

      <section id="agendamentos" tabIndex="-1" className="secao-interna alvo-navegacao">
        <h2>{usuario.tipo === 'prestador' ? 'Agendamentos e solicitações' : 'Meus agendamentos'}</h2>
        <div className="lista-simples">
          {futuros.map((a) => (
            <article key={a.id} className="linha-agendamento">
              <div>
                <div className="tags">
                  <span className={`status status-${a.status}`}>{rotuloStatusAgendamento(a.status)}</span>
                  {a.concluidoEm && <span className="status status-concluido">Concluído</span>}
                </div>
                <h3>{a.servico?.titulo || 'Serviço não especificado'}</h3>
                <p><strong>{textoHorarioAgendamento(a, usuario.tipo)}</strong></p>
                {!a.fim && <p className="texto-suave">A duração ainda será definida pelo prestador antes da confirmação.</p>}
                {a.fim && a.horarioSolicitado && new Date(a.horarioSolicitado).getTime() !== new Date(a.inicio).getTime() && <p className="texto-suave">Horário inicialmente informado pelo cliente: {fmt(a.horarioSolicitado)}</p>}
                <p>{usuario.tipo === 'prestador' ? `Cliente: ${a.cliente?.nome}` : `Prestador: ${a.prestador?.nome}`}</p>
                {a.descricao && <p className="texto-suave">{a.descricao}</p>}
                {a.avaliacao && <span className="texto-suave">Avaliado com {a.avaliacao.nota} {a.avaliacao.nota === 1 ? 'estrela' : 'estrelas'}</span>}
              </div>
              <div className="acoes-coluna">
                {usuario.tipo === 'prestador' && a.status === 'pendente' && !a.concluidoEm && !a.fim && (
                  <button className="botao botao-pequeno" onClick={() => abrirAjuste(a)}>Definir período</button>
                )}
                {usuario.tipo === 'prestador' && a.status === 'pendente' && !a.concluidoEm && a.fim && (
                  <button className="botao botao-pequeno" onClick={() => status(a.id, 'aceito')}>Aceitar</button>
                )}
                {usuario.tipo === 'prestador' && a.status === 'pendente' && !a.concluidoEm && (
                  <button className="botao-secundario botao-pequeno" onClick={() => status(a.id, 'recusado')}>Recusar</button>
                )}
                {usuario.tipo === 'prestador' && ['pendente', 'aceito'].includes(a.status) && !a.concluidoEm && a.fim && (
                  <button className="botao-secundario botao-pequeno" onClick={() => abrirAjuste(a)}>Ajustar horário</button>
                )}
                {usuario.tipo === 'prestador' && a.status === 'aceito' && !a.concluidoEm && (
                  <button className="botao-secundario botao-pequeno" onClick={() => concluir(a.id)}>Concluir atendimento</button>
                )}
                {usuario.tipo === 'cliente' && ['pendente', 'aceito'].includes(a.status) && !a.concluidoEm && (
                  <button className="botao-secundario botao-pequeno" onClick={() => status(a.id, 'cancelado')}>Cancelar</button>
                )}
              </div>
            </article>
          ))}
          {!agendamentos.length && <div className="vazio">Nenhum agendamento por enquanto.</div>}
        </div>
      </section>

      {ajustando && (
        <section id="ajuste-horario" tabIndex="-1" className="modal-inline alvo-navegacao">
          <div className="formulario-cartao">
            <div className="titulo-linha"><h2>{ajustando.definindo ? 'Definir período do atendimento' : 'Ajustar horário'}</h2><button className="botao-icone" onClick={() => setAjustando(null)}>×</button></div>
            {ajustando.definindo && <p className="texto-suave">O cliente informou que estará disponível a partir de {fmt(ajustando.horarioSolicitado)}. Defina a previsão de início e término antes de aceitar.</p>}
            <form className="formulario" onSubmit={salvarHorario}>
              <div className="grade-dois">
                <label>Início previsto<input type="datetime-local" min={agoraLocal()} required value={ajustando.inicio} onChange={(e) => setAjustando({ ...ajustando, inicio: e.target.value })} /></label>
                <label>Término previsto<input type="datetime-local" min={ajustando.inicio || agoraLocal()} required value={ajustando.fim} onChange={(e) => setAjustando({ ...ajustando, fim: e.target.value })} /></label>
              </div>
              <div className="acoes">
                <button className="botao">{ajustando.definindo ? 'Definir período' : 'Salvar horário'}</button>
                <button type="button" className="botao-secundario" onClick={() => setAjustando(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
