import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, urlMidia } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';
import { Avatar } from '../componentes/Avatar.jsx';

function formatarData(valor) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor)); }

export function PrestadorDetalhe() {
  const { id } = useParams();
  const { usuario } = useAutenticacao();
  const { recarregar: recarregarNotificacoes } = useNotificacoes();
  const [prestador, setPrestador] = useState(null);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [agendamento, setAgendamento] = useState({ servicoId: '', inicio: '', fim: '', descricao: '' });
  const [denuncia, setDenuncia] = useState(null);
  const [formDenuncia, setFormDenuncia] = useState({ motivo: '', descricao: '' });

  async function carregar() { try { const d = await api(`/prestadores/${id}`); setPrestador(d.prestador); } catch (e) { setErro(e.message); } }
  useEffect(() => { carregar(); }, [id, usuario?.id]);

  async function alternarFavorito() {
    setErro('');
    try { if (prestador.favoritado) await api(`/favoritos/${id}`, { method: 'DELETE' }); else await api(`/favoritos/${id}`, { method: 'POST' }); setPrestador({ ...prestador, favoritado: !prestador.favoritado }); } catch (e) { setErro(e.message); }
  }

  async function solicitar(evento) {
    evento.preventDefault(); setMensagem(''); setErro('');
    try { await api('/agendamentos', { method: 'POST', body: JSON.stringify({ prestadorId: id, servicoId: agendamento.servicoId || null, inicio: new Date(agendamento.inicio).toISOString(), fim: new Date(agendamento.fim).toISOString(), descricao: agendamento.descricao }) }); setMensagem('Solicitacao de horario enviada com sucesso.'); setAgendamento({ servicoId: '', inicio: '', fim: '', descricao: '' }); recarregarNotificacoes(); } catch (e) { setErro(e.message); }
  }

  async function enviarDenuncia(evento) {
    evento.preventDefault(); setErro(''); setMensagem('');
    try { await api('/denuncias', { method: 'POST', body: JSON.stringify({ prestadorId: denuncia.tipo === 'prestador' ? id : null, avaliacaoId: denuncia.tipo === 'avaliacao' ? denuncia.id : null, ...formDenuncia }) }); setMensagem('Denuncia enviada para analise da administracao.'); setDenuncia(null); setFormDenuncia({ motivo: '', descricao: '' }); } catch (e) { setErro(e.message); }
  }

  if (erro && !prestador) return <main className="container secao"><div className="alerta erro">{erro}</div></main>;
  if (!prestador) return <main className="container secao"><div className="vazio">Carregando...</div></main>;
  const perfil = prestador.perfilPrestador || {}; const whatsapp = perfil.whatsapp?.replace(/\D/g, '');

  return <main className="container secao"><section className="perfil-cabecalho"><div className="perfil-principal"><Avatar nome={prestador.nome} fotoUrl={prestador.fotoUrl} tamanho="extra" /><div><span className="rotulo">Prestador local</span><h1>{prestador.nome}</h1><p className="subtitulo">{perfil.titulo || 'Perfil profissional'}</p><p>{perfil.descricao || 'Descricao ainda nao informada.'}</p><div className="tags">{prestador.servicos?.map((s) => <span key={s.id} className="tag">{s.categoria?.nome}</span>)}</div></div></div><aside className="painel-resumo"><strong>★ {prestador.mediaAvaliacoes || 0}</strong><span>{prestador.totalAvaliacoes || 0} avaliacao(oes)</span><span>{perfil.cidade ? `${perfil.cidade}/${perfil.estado || 'RS'}` : 'Cidade nao informada'}</span>{perfil.regiaoAtendimento && <span className="texto-suave">Atende: {perfil.regiaoAtendimento}</span>}{whatsapp && <a className="botao" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>}{usuario?.tipo === 'cliente' && <button className="botao-secundario" onClick={alternarFavorito}>{prestador.favoritado ? '♥ Remover favorito' : '♡ Adicionar favorito'}</button>}{usuario && <button className="link-perigo" onClick={() => setDenuncia({ tipo: 'prestador', id })}>Denunciar perfil</button>}</aside></section>{mensagem && <div className="alerta sucesso espaco-alerta">{mensagem}</div>}{erro && <div className="alerta erro espaco-alerta">{erro}</div>}

  {prestador.portfolio?.length > 0 && <section className="secao-interna"><div className="titulo-linha"><h2>Portfolio</h2><span className="texto-suave">Trabalhos cadastrados pelo profissional</span></div><div className="grade-portfolio">{prestador.portfolio.map((item) => <figure key={item.id}><img src={urlMidia(item.imagemUrl)} alt={item.legenda || 'Trabalho do prestador'} /><figcaption>{item.legenda || 'Trabalho realizado'}</figcaption></figure>)}</div></section>}

  <section className="secao-interna"><h2>Servicos</h2><div className="grade-cards">{prestador.servicos?.map((s) => <div key={s.id} className="cartao-info"><span className="tag">{s.categoria?.nome}</span><h3>{s.titulo}</h3><p>{s.descricao || 'Sem descricao.'}</p><strong>{s.precoBase ? `A partir de R$ ${Number(s.precoBase).toFixed(2).replace('.', ',')}` : 'Valor sob consulta'}</strong></div>)}{!prestador.servicos?.length && <div className="vazio">Nenhum servico cadastrado.</div>}</div></section>

  <section className="secao-interna"><h2>Disponibilidade</h2><div className="lista-simples">{prestador.disponibilidades?.map((item) => <div key={item.id}><strong>{formatarData(item.inicio)}</strong> ate {formatarData(item.fim)}{item.observacao && <span className="texto-suave bloco">{item.observacao}</span>}</div>)}{!prestador.disponibilidades?.length && <p className="vazio">Nenhum horario futuro cadastrado.</p>}</div></section>

  {usuario?.tipo === 'cliente' ? <section className="secao-interna formulario-cartao largura-media"><h2>Solicitar horario</h2><form className="formulario" onSubmit={solicitar}><label>Servico<select value={agendamento.servicoId} onChange={(e) => setAgendamento({ ...agendamento, servicoId: e.target.value })}><option value="">Servico nao especificado</option>{prestador.servicos?.map((s) => <option key={s.id} value={s.id}>{s.titulo}</option>)}</select></label><div className="grade-dois"><label>Inicio<input type="datetime-local" required value={agendamento.inicio} onChange={(e) => setAgendamento({ ...agendamento, inicio: e.target.value })} /></label><label>Fim<input type="datetime-local" required value={agendamento.fim} onChange={(e) => setAgendamento({ ...agendamento, fim: e.target.value })} /></label></div><label>Descricao<textarea rows="4" maxLength="2000" value={agendamento.descricao} onChange={(e) => setAgendamento({ ...agendamento, descricao: e.target.value })} placeholder="Explique brevemente o que precisa." /></label><button className="botao">Enviar solicitacao</button></form></section> : !usuario && <section className="secao-interna chamada-login"><p>Entre na sua conta de cliente para solicitar um horario.</p><Link className="botao" to="/entrar">Entrar</Link></section>}

  <section className="secao-interna"><h2>Avaliacoes</h2><div className="lista-simples">{prestador.avaliacoesRecebidas?.map((a) => <div key={a.id} className="avaliacao"><div className="avaliacao-topo"><div className="prestador-identidade"><Avatar nome={a.cliente?.nome} fotoUrl={a.cliente?.fotoUrl} tamanho="pequeno" /><strong>{a.cliente?.nome || 'Cliente'}</strong></div><strong className="estrelas">{'★'.repeat(a.nota)}{'☆'.repeat(5-a.nota)}</strong></div><p>{a.comentario || 'Sem comentario.'}</p>{usuario && <button className="link-perigo" onClick={() => setDenuncia({ tipo: 'avaliacao', id: a.id })}>Denunciar avaliacao</button>}</div>)}{!prestador.avaliacoesRecebidas?.length && <p className="vazio">Este prestador ainda nao possui avaliacoes.</p>}</div></section>

  {denuncia && <section className="secao-interna formulario-cartao largura-media"><div className="titulo-linha"><h2>Enviar denuncia</h2><button className="botao-icone" onClick={() => setDenuncia(null)}>×</button></div><p className="texto-suave">A administracao recebera a denuncia para moderacao.</p><form className="formulario" onSubmit={enviarDenuncia}><label>Motivo<input required minLength="3" maxLength="120" value={formDenuncia.motivo} onChange={(e) => setFormDenuncia({ ...formDenuncia, motivo: e.target.value })} placeholder="Ex.: informacao inadequada" /></label><label>Detalhes<textarea rows="4" maxLength="2000" value={formDenuncia.descricao} onChange={(e) => setFormDenuncia({ ...formDenuncia, descricao: e.target.value })} /></label><div className="acoes"><button className="botao">Enviar denuncia</button><button type="button" className="botao-secundario" onClick={() => setDenuncia(null)}>Cancelar</button></div></form></section>}
  </main>;
}
