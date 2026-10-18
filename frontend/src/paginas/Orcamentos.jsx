import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';
import { rotuloStatusOrcamento } from '../utilitarios/rotulos.js';
import { rolarParaElemento } from '../utilitarios/navegacao.js';

function dinheiro(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor || 0));
}

function dataHora(valor) {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

function dataCurta(valor) {
  if (!valor) return 'Sem validade definida';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'UTC' }).format(new Date(`${valor}T12:00:00Z`));
}

function hojeLocal() {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 10);
}

const formularioVazio = {
  agendamentoId: '',
  valor: '',
  descricao: '',
  materiaisInclusos: false,
  validade: '',
  observacoes: ''
};

export function Orcamentos() {
  const { usuario } = useAutenticacao();
  const { recarregar: recarregarNotificacoes } = useNotificacoes();
  const [params, setParams] = useSearchParams();
  const [orcamentos, setOrcamentos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [formulario, setFormulario] = useState(formularioVazio);
  const [historicos, setHistoricos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  async function carregar() {
    setCarregando(true);
    try {
      const [dadosOrcamentos, dadosAgendamentos] = await Promise.all([
        api('/orcamentos'),
        api('/agendamentos')
      ]);
      setOrcamentos(dadosOrcamentos.orcamentos || []);
      setAgendamentos(dadosAgendamentos.agendamentos || []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [usuario.tipo]);

  const elegiveis = useMemo(() => agendamentos.filter((a) => (
    usuario.tipo === 'prestador'
      && ['pendente', 'aceito'].includes(a.status)
      && !a.concluidoEm
      && Boolean(a.fim)
  )), [agendamentos, usuario.tipo]);

  useEffect(() => {
    if (usuario.tipo !== 'prestador' || carregando) return;
    const agendamentoId = params.get('agendamento');
    if (!agendamentoId) return;
    const agendamento = elegiveis.find((a) => a.id === agendamentoId);
    if (!agendamento) return;
    const existente = orcamentos.find((o) => o.agendamentoId === agendamentoId);
    abrirFormulario(agendamento, existente, false);
  }, [carregando, params.toString()]);

  function abrirFormulario(agendamento, existente = null, rolar = true) {
    setErro('');
    setMensagem('');
    setFormulario({
      agendamentoId: agendamento.id,
      valor: existente?.valor || '',
      descricao: existente?.descricao || '',
      materiaisInclusos: Boolean(existente?.materiaisInclusos),
      validade: existente?.validade || '',
      observacoes: existente?.observacoes || ''
    });
    const novos = new URLSearchParams(params);
    novos.set('agendamento', agendamento.id);
    setParams(novos, { replace: true });
    if (rolar) setTimeout(() => rolarParaElemento('novo-orcamento'), 0);
  }

  function limparFormulario() {
    setFormulario(formularioVazio);
    const novos = new URLSearchParams(params);
    novos.delete('agendamento');
    setParams(novos, { replace: true });
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setSalvando(true);
    try {
      await api('/orcamentos', {
        method: 'POST',
        body: JSON.stringify({
          ...formulario,
          valor: Number(formulario.valor)
        })
      });
      setMensagem('Orçamento enviado ao cliente. Ele recebeu uma notificação para analisar a proposta.');
      limparFormulario();
      await carregar();
      await recarregarNotificacoes();
      setTimeout(() => rolarParaElemento('lista-orcamentos'), 0);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function responder(id, resposta) {
    const verbo = resposta === 'aceitar' ? 'aceitar' : 'recusar';
    if (!confirm(`Tem certeza que deseja ${verbo} este orçamento?`)) return;
    setErro('');
    try {
      await api(`/orcamentos/${id}/responder`, {
        method: 'PATCH',
        body: JSON.stringify({ resposta })
      });
      setMensagem(resposta === 'aceitar' ? 'Orçamento aceito. O prestador foi notificado.' : 'Orçamento recusado. O prestador foi notificado.');
      await carregar();
      await recarregarNotificacoes();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function cancelar(id) {
    if (!confirm('Cancelar este orçamento enviado?')) return;
    setErro('');
    try {
      await api(`/orcamentos/${id}/cancelar`, { method: 'PATCH' });
      setMensagem('Orçamento cancelado.');
      await carregar();
      await recarregarNotificacoes();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function alternarHistorico(agendamentoId) {
    if (historicos[agendamentoId]) {
      setHistoricos((atuais) => ({ ...atuais, [agendamentoId]: null }));
      return;
    }
    try {
      const dados = await api(`/agendamentos/${agendamentoId}/historico`);
      setHistoricos((atuais) => ({ ...atuais, [agendamentoId]: dados.historico || [] }));
    } catch (e) {
      setErro(e.message);
    }
  }

  function agendamentoPorId(id) {
    return agendamentos.find((a) => a.id === id);
  }

  return (
    <div>
      <div className="titulo-secao">
        <span className="rotulo">Fluxo comercial</span>
        <h1>Orçamentos</h1>
        <p className="texto-suave">
          {usuario.tipo === 'prestador'
            ? 'Monte propostas claras, informe o que está incluso e acompanhe a resposta do cliente.'
            : 'Analise as propostas recebidas e aceite somente quando estiver de acordo com os valores e condições.'}
        </p>
      </div>

      {mensagem && <div className="alerta sucesso">{mensagem}</div>}
      {erro && <div className="alerta erro">{erro}</div>}

      {usuario.tipo === 'prestador' && (
        <section id="novo-orcamento" tabIndex="-1" className="formulario-cartao alvo-navegacao orcamento-formulario">
          <div className="titulo-linha">
            <div>
              <h2>{formulario.agendamentoId ? (orcamentos.find((o) => o.agendamentoId === formulario.agendamentoId) ? 'Revisar orçamento' : 'Preparar orçamento') : 'Novo orçamento'}</h2>
              <p className="texto-suave">Selecione uma solicitação com período já definido. Se já existir uma proposta, o reenvio será registrado como uma nova versão do orçamento.</p>
            </div>
            {formulario.agendamentoId && <button type="button" className="botao-secundario" onClick={limparFormulario}>Limpar</button>}
          </div>

          {!formulario.agendamentoId && (
            <div className="grade-orcamentos-elegiveis">
              {elegiveis.map((a) => {
                const existente = orcamentos.find((o) => o.agendamentoId === a.id);
                return (
                  <button key={a.id} type="button" className="orcamento-elegivel" onClick={() => abrirFormulario(a, existente)} disabled={existente?.status === 'aceito'}>
                    <strong>{a.servico?.titulo || 'Serviço não especificado'}</strong>
                    <span>{a.cliente?.nome} • {dataHora(a.inicio)}</span>
                    <small>{existente ? `Versão ${existente.revisao || 1} • ${rotuloStatusOrcamento(existente.status).toLowerCase()}` : 'Ainda sem orçamento'}</small>
                  </button>
                );
              })}
              {!elegiveis.length && <div className="vazio vazio-compacto">Defina o período de uma solicitação na Agenda para poder montar um orçamento.</div>}
            </div>
          )}

          {formulario.agendamentoId && (() => {
            const a = agendamentoPorId(formulario.agendamentoId);
            return (
              <form className="formulario" onSubmit={enviar}>
                <div className="resumo-solicitacao-orcamento">
                  <div><span>Cliente</span><strong>{a?.cliente?.nome || 'Cliente'}</strong></div>
                  <div><span>Serviço</span><strong>{a?.servico?.titulo || 'Não especificado'}</strong></div>
                  <div><span>Período</span><strong>{a?.fim ? `${dataHora(a.inicio)} até ${dataHora(a.fim)}` : 'Defina primeiro na agenda'}</strong></div>
                </div>
                <div className="grade-dois">
                  <label>Valor total estimado (R$)<input type="number" min="0.01" step="0.01" required value={formulario.valor} onChange={(e) => setFormulario({ ...formulario, valor: e.target.value })} placeholder="850,00" /></label>
                  <label>Validade da proposta<input type="date" min={hojeLocal()} value={formulario.validade} onChange={(e) => setFormulario({ ...formulario, validade: e.target.value })} /></label>
                </div>
                <label>Descrição do orçamento<textarea required minLength="10" maxLength="4000" rows="5" value={formulario.descricao} onChange={(e) => setFormulario({ ...formulario, descricao: e.target.value })} placeholder="Ex.: correção das rachaduras, preparação da parede, aplicação de massa, lixamento e pintura..." /></label>
                <label className="campo-checkbox-linha campo-checkbox-orcamento"><input type="checkbox" checked={formulario.materiaisInclusos} onChange={(e) => setFormulario({ ...formulario, materiaisInclusos: e.target.checked })} /><span>Os materiais estão incluídos neste valor</span></label>
                <label>Observações<textarea maxLength="2000" rows="3" value={formulario.observacoes} onChange={(e) => setFormulario({ ...formulario, observacoes: e.target.value })} placeholder="Condições, forma de execução ou informações importantes para o cliente." /></label>
                <div className="acoes">
                  <button className="botao" disabled={salvando}>{salvando ? 'Enviando...' : (orcamentos.some((o) => o.agendamentoId === formulario.agendamentoId) ? 'Revisar e reenviar' : 'Enviar orçamento')}</button>
                  <button type="button" className="botao-secundario" onClick={limparFormulario}>Cancelar</button>
                </div>
              </form>
            );
          })()}
        </section>
      )}

      <section id="lista-orcamentos" tabIndex="-1" className="secao-interna alvo-navegacao">
        <div className="titulo-linha">
          <div>
            <h2>{usuario.tipo === 'prestador' ? 'Orçamentos enviados' : 'Orçamentos recebidos'}</h2>
            <p className="texto-suave">Todo o histórico da negociação fica vinculado à solicitação.</p>
          </div>
        </div>

        {carregando && <div className="vazio">Carregando orçamentos...</div>}
        {!carregando && (
          <div className="lista-orcamentos">
            {orcamentos.map((o) => {
              const a = o.agendamento;
              const podeEditar = usuario.tipo === 'prestador' && ['enviado', 'recusado', 'expirado', 'cancelado'].includes(o.status) && !a?.concluidoEm && !['recusado', 'cancelado'].includes(a?.status);
              const historico = historicos[o.agendamentoId];
              return (
                <article id={`orcamento-${o.id}`} tabIndex="-1" className="orcamento-cartao alvo-navegacao" key={o.id}>
                  <div className="orcamento-topo">
                    <div>
                      <div className="tags"><span className={`status status-orcamento-${o.status}`}>{rotuloStatusOrcamento(o.status)}</span><span className="tag-neutra">Versão {o.revisao || 1}</span>{o.materiaisInclusos && <span className="tag-neutra">Materiais inclusos</span>}</div>
                      <h3>{a?.servico?.titulo || 'Serviço não especificado'}</h3>
                      <p className="texto-suave">{usuario.tipo === 'prestador' ? `Cliente: ${o.cliente?.nome}` : `Prestador: ${o.prestador?.nome}`}</p>
                    </div>
                    <strong className="orcamento-valor">{dinheiro(o.valor)}</strong>
                  </div>

                  <div className="orcamento-detalhes">
                    <div><span>Descrição</span><p>{o.descricao}</p></div>
                    <div className="grade-dois">
                      <div><span>Materiais</span><strong>{o.materiaisInclusos ? 'Inclusos no valor' : 'Não inclusos'}</strong></div>
                      <div><span>Validade</span><strong>{dataCurta(o.validade)}</strong></div>
                    </div>
                    {o.observacoes && <div><span>Observações</span><p>{o.observacoes}</p></div>}
                    <div className="orcamento-metadados"><span>Primeiro envio em {dataHora(o.createdAt)}</span><span>Última atualização em {dataHora(o.updatedAt)}</span>{o.respondidoEm && <span>Respondido em {dataHora(o.respondidoEm)}</span>}</div>
                  </div>

                  <div className="acoes orcamento-acoes">
                    {usuario.tipo === 'cliente' && o.status === 'enviado' && <>
                      <button className="botao" onClick={() => responder(o.id, 'aceitar')}>Aceitar orçamento</button>
                      <button className="botao-secundario" onClick={() => responder(o.id, 'recusar')}>Recusar</button>
                    </>}
                    {usuario.tipo === 'prestador' && o.status === 'enviado' && <button className="botao-secundario" onClick={() => cancelar(o.id)}>Cancelar orçamento</button>}
                    {podeEditar && <button className="botao-secundario" onClick={() => abrirFormulario(a, o)}>Revisar e reenviar</button>}
                    <button className="botao-link link-destaque" onClick={() => alternarHistorico(o.agendamentoId)}>{historico ? 'Ocultar histórico' : 'Ver histórico'}</button>
                  </div>

                  {historico && (
                    <div className="timeline-atendimento">
                      {historico.map((item) => (
                        <div className={`timeline-item timeline-${item.tipo || 'geral'}`} key={item.id}>
                          <span className="timeline-ponto" />
                          <div><strong>{item.titulo}</strong><span>{dataHora(item.createdAt)}{item.usuario?.nome ? ` • ${item.usuario.nome}` : ''}</span>{item.descricao && <p>{item.descricao}</p>}</div>
                        </div>
                      ))}
                      {!historico.length && <div className="vazio vazio-compacto">Nenhum evento registrado ainda.</div>}
                    </div>
                  )}
                </article>
              );
            })}
            {!orcamentos.length && <div className="vazio">{usuario.tipo === 'prestador' ? 'Nenhum orçamento enviado por enquanto.' : 'Você ainda não recebeu nenhum orçamento.'}</div>}
          </div>
        )}
      </section>
    </div>
  );
}
