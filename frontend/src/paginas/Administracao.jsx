import { useEffect, useState } from 'react';
import { api } from '../servicos/api.js';
import { Paginacao } from '../componentes/Paginacao.jsx';
import { rotuloStatusDenuncia, rotuloTipoUsuario } from '../utilitarios/rotulos.js';

function fmt(v) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(v)); }

export function Administracao() {
  const [aba, setAba] = useState('resumo');
  const [resumo, setResumo] = useState({});
  const [usuarios, setUsuarios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [paginas, setPaginas] = useState({ usuarios: 1, denuncias: 1, avaliacoes: 1 });
  const [paginacoes, setPaginacoes] = useState({});
  const [filtroUsuario, setFiltroUsuario] = useState({ busca: '', tipo: '', ativo: '' });
  const [filtroDenuncia, setFiltroDenuncia] = useState('');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function carregarResumo() {
    const r = await api('/admin/resumo');
    setResumo(r.resumo);
  }

  async function carregarUsuarios(pagina = paginas.usuarios) {
    const q = new URLSearchParams({ pagina: String(pagina), limite: '15' });
    if (filtroUsuario.busca) q.set('busca', filtroUsuario.busca);
    if (filtroUsuario.tipo) q.set('tipo', filtroUsuario.tipo);
    if (filtroUsuario.ativo) q.set('ativo', filtroUsuario.ativo);
    const d = await api(`/admin/usuarios?${q}`);
    setUsuarios(d.usuarios);
    setPaginacoes((p) => ({ ...p, usuarios: d.paginacao }));
  }

  async function carregarCategorias() {
    const c = await api('/admin/categorias');
    setCategorias(c.categorias);
  }

  async function carregarDenuncias(pagina = paginas.denuncias) {
    const q = new URLSearchParams({ pagina: String(pagina), limite: '10' });
    if (filtroDenuncia) q.set('status', filtroDenuncia);
    const d = await api(`/admin/denuncias?${q}`);
    setDenuncias(d.denuncias);
    setPaginacoes((p) => ({ ...p, denuncias: d.paginacao }));
  }

  async function carregarAvaliacoes(pagina = paginas.avaliacoes) {
    const q = new URLSearchParams({ pagina: String(pagina), limite: '10' });
    if (filtroAvaliacao) q.set('visivel', filtroAvaliacao);
    const a = await api(`/admin/avaliacoes?${q}`);
    setAvaliacoes(a.avaliacoes);
    setPaginacoes((p) => ({ ...p, avaliacoes: a.paginacao }));
  }

  async function carregarAba() {
    setCarregando(true);
    setErro('');
    try {
      await carregarResumo();
      if (aba === 'usuarios') await carregarUsuarios();
      if (aba === 'categorias') await carregarCategorias();
      if (aba === 'denuncias') await carregarDenuncias();
      if (aba === 'avaliacoes') await carregarAvaliacoes();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarAba(); }, [aba, paginas.usuarios, paginas.denuncias, paginas.avaliacoes, filtroDenuncia, filtroAvaliacao]);

  async function ativo(u) {
    if (!confirm(`${u.ativo ? 'Desativar' : 'Ativar'} a conta de ${u.nome}?`)) return;
    try {
      await api(`/admin/usuarios/${u.id}/ativo`, { method: 'PATCH', body: JSON.stringify({ ativo: !u.ativo }) });
      await Promise.all([carregarUsuarios(), carregarResumo()]);
    } catch (e) { setErro(e.message); }
  }

  async function aplicarFiltroUsuario(e) {
    e.preventDefault();
    setPaginas((p) => ({ ...p, usuarios: 1 }));
    try { await carregarUsuarios(1); } catch (x) { setErro(x.message); }
  }

  async function criarCat(e) {
    e.preventDefault();
    try {
      await api('/admin/categorias', { method: 'POST', body: JSON.stringify({ nome: novaCategoria }) });
      setNovaCategoria('');
      await carregarCategorias();
    } catch (x) { setErro(x.message); }
  }

  async function toggleCat(c) {
    if (!confirm(`${c.ativa ? 'Desativar' : 'Ativar'} a categoria ${c.nome}?`)) return;
    try {
      await api(`/admin/categorias/${c.id}`, { method: 'PATCH', body: JSON.stringify({ ativa: !c.ativa }) });
      await carregarCategorias();
    } catch (e) { setErro(e.message); }
  }

  async function statusDenuncia(d, status) {
    try {
      await api(`/admin/denuncias/${d.id}`, { method: 'PATCH', body: JSON.stringify({ status, respostaAdmin: d.respostaAdmin || null }) });
      await Promise.all([carregarDenuncias(), carregarResumo()]);
    } catch (e) { setErro(e.message); }
  }

  async function visibilidade(a) {
    if (!confirm(`${a.visivel ? 'Ocultar' : 'Publicar'} esta avaliação?`)) return;
    try {
      await api(`/admin/avaliacoes/${a.id}/visibilidade`, { method: 'PATCH', body: JSON.stringify({ visivel: !a.visivel }) });
      await Promise.all([carregarAvaliacoes(), carregarResumo()]);
    } catch (e) { setErro(e.message); }
  }

  const abas = [['resumo', 'Resumo'], ['usuarios', 'Usuários'], ['categorias', 'Categorias'], ['denuncias', 'Denúncias'], ['avaliacoes', 'Avaliações']];

  return (
    <div>
      <div className="titulo-secao"><span className="rotulo">Administrador</span><h1>Administração</h1><p className="texto-suave">Gerenciamento essencial da plataforma.</p></div>
      {erro && <div className="alerta erro">{erro}</div>}
      <div className="abas">{abas.map(([id, nome]) => <button key={id} className={aba === id ? 'ativo' : ''} onClick={() => setAba(id)}>{nome}{id === 'denuncias' && resumo.denunciasAbertas ? ` (${resumo.denunciasAbertas})` : ''}</button>)}</div>
      {carregando && <div className="resultado-contagem">Atualizando dados...</div>}

      {aba === 'resumo' && <div className="grade-metricas"><div className="metrica"><span>Usuários</span><strong>{resumo.usuarios || 0}</strong></div><div className="metrica"><span>Clientes ativos</span><strong>{resumo.clientes || 0}</strong></div><div className="metrica"><span>Prestadores ativos</span><strong>{resumo.prestadores || 0}</strong></div><div className="metrica"><span>Agendamentos</span><strong>{resumo.agendamentos || 0}</strong></div><div className="metrica"><span>Denúncias abertas</span><strong>{resumo.denunciasAbertas || 0}</strong></div><div className="metrica"><span>Avaliações públicas</span><strong>{resumo.avaliacoes || 0}</strong></div></div>}

      {aba === 'usuarios' && <><form className="filtros-admin" onSubmit={aplicarFiltroUsuario}><input value={filtroUsuario.busca} onChange={(e) => setFiltroUsuario({ ...filtroUsuario, busca: e.target.value })} placeholder="Nome ou e-mail" /><select value={filtroUsuario.tipo} onChange={(e) => setFiltroUsuario({ ...filtroUsuario, tipo: e.target.value })}><option value="">Todos os tipos</option><option value="cliente">Cliente</option><option value="prestador">Prestador</option><option value="admin">Administrador</option></select><select value={filtroUsuario.ativo} onChange={(e) => setFiltroUsuario({ ...filtroUsuario, ativo: e.target.value })}><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select><button className="botao">Filtrar</button></form><div className="tabela-responsiva"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Tipo</th><th>Cadastro</th><th>Status</th><th></th></tr></thead><tbody>{usuarios.map((u) => <tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{rotuloTipoUsuario(u.tipo)}</td><td>{fmt(u.createdAt)}</td><td><span className={`status ${u.ativo ? 'status-aceito' : 'status-cancelado'}`}>{u.ativo ? 'ativo' : 'inativo'}</span></td><td><button className="botao-secundario botao-pequeno" onClick={() => ativo(u)}>{u.ativo ? 'Desativar' : 'Ativar'}</button></td></tr>)}</tbody></table></div><Paginacao paginacao={paginacoes.usuarios} aoMudar={(pagina) => setPaginas((p) => ({ ...p, usuarios: pagina }))} /></>}

      {aba === 'categorias' && <><form className="formulario-inline" onSubmit={criarCat}><input required minLength="2" value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} placeholder="Nova categoria" /><button className="botao">Adicionar</button></form><div className="lista-simples">{categorias.map((c) => <div key={c.id} className="linha-gerencial"><div><strong>{c.nome}</strong><span className="texto-suave bloco">{c.slug}</span></div><button className="botao-secundario botao-pequeno" onClick={() => toggleCat(c)}>{c.ativa ? 'Desativar' : 'Ativar'}</button></div>)}</div></>}

      {aba === 'denuncias' && <><div className="filtros-admin"><select value={filtroDenuncia} onChange={(e) => { setFiltroDenuncia(e.target.value); setPaginas((p) => ({ ...p, denuncias: 1 })); }}><option value="">Todos os status</option><option value="aberta">Aberta</option><option value="em_analise">Em análise</option><option value="resolvida">Resolvida</option><option value="arquivada">Arquivada</option></select></div><div className="lista-simples">{denuncias.map((d) => <article key={d.id} className="linha-gerencial"><div><div className="tags"><span className={`status status-${d.status === 'resolvida' ? 'aceito' : d.status === 'arquivada' ? 'cancelado' : 'pendente'}`}>{rotuloStatusDenuncia(d.status)}</span></div><h3>{d.motivo}</h3><p>{d.descricao || 'Sem detalhes.'}</p><p className="texto-suave">Denunciante: {d.denunciante?.nome} • Prestador: {d.prestador?.nome || '-'} • {fmt(d.createdAt)}</p></div><div className="acoes-coluna"><button className="botao-secundario botao-pequeno" onClick={() => statusDenuncia(d, 'em_analise')}>Em análise</button><button className="botao botao-pequeno" onClick={() => statusDenuncia(d, 'resolvida')}>Resolver</button><button className="botao-secundario botao-pequeno" onClick={() => statusDenuncia(d, 'arquivada')}>Arquivar</button></div></article>)}{!denuncias.length && <div className="vazio">Nenhuma denúncia encontrada.</div>}</div><Paginacao paginacao={paginacoes.denuncias} aoMudar={(pagina) => setPaginas((p) => ({ ...p, denuncias: pagina }))} /></>}

      {aba === 'avaliacoes' && <><div className="filtros-admin"><select value={filtroAvaliacao} onChange={(e) => { setFiltroAvaliacao(e.target.value); setPaginas((p) => ({ ...p, avaliacoes: 1 })); }}><option value="">Todas</option><option value="true">Publicadas</option><option value="false">Ocultas</option></select></div><div className="lista-simples">{avaliacoes.map((a) => <article key={a.id} className="linha-gerencial"><div><div className="estrelas">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</div><p>{a.comentario || 'Sem comentário.'}</p><span className="texto-suave">{a.cliente?.nome} → {a.prestador?.nome} • {fmt(a.createdAt)} • {a.visivel ? 'publicada' : 'oculta'}</span></div><button className="botao-secundario botao-pequeno" onClick={() => visibilidade(a)}>{a.visivel ? 'Ocultar' : 'Publicar'}</button></article>)}{!avaliacoes.length && <div className="vazio">Nenhuma avaliação encontrada.</div>}</div><Paginacao paginacao={paginacoes.avaliacoes} aoMudar={(pagina) => setPaginas((p) => ({ ...p, avaliacoes: pagina }))} /></>}
    </div>
  );
}
