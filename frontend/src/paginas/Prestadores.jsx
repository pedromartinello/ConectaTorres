import { useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { CartaoPrestador } from '../componentes/CartaoPrestador.jsx';
import { Paginacao } from '../componentes/Paginacao.jsx';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

const chaves = ['busca', 'categoria', 'categorias', 'cidade', 'preco_max', 'avaliacao_min', 'disponivel_em', 'ordenar'];

export function Prestadores() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [prestadores, setPrestadores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [paginacao, setPaginacao] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const { usuario } = useAutenticacao();

  const valores = useMemo(
    () => Object.fromEntries(chaves.map((chave) => [chave, params.get(chave) || ''])),
    [params]
  );
  const pagina = Number(params.get('pagina') || 1);
  const buscaIA = location.state?.buscaIA;
  const usandoIA = params.get('ia') === '1' && Boolean(valores.categorias);

  useEffect(() => {
    api('/categorias').then((d) => setCategorias(d.categorias)).catch(() => {});
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    chaves.forEach((chave) => { if (valores[chave]) query.set(chave, valores[chave]); });
    query.set('pagina', String(pagina));
    query.set('limite', '12');
    setCarregando(true);
    setErro('');
    api(`/prestadores?${query.toString()}`)
      .then((d) => {
        setPrestadores(d.prestadores);
        setPaginacao(d.paginacao);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [params.toString(), usuario?.id]);

  function atualizar(chave, valor) {
    const novos = new URLSearchParams(params);
    if (valor) novos.set(chave, valor); else novos.delete(chave);
    novos.delete('pagina');
    if (chave === 'categoria') {
      novos.delete('categorias');
      novos.delete('ia');
    }
    setParams(novos);
  }

  function mudarPagina(novaPagina) {
    const novos = new URLSearchParams(params);
    if (novaPagina > 1) novos.set('pagina', String(novaPagina)); else novos.delete('pagina');
    setParams(novos);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function limpar() { setParams({}); }

  async function favoritar(prestador) {
    try {
      if (prestador.favoritado) await api(`/favoritos/${prestador.id}`, { method: 'DELETE' });
      else await api(`/favoritos/${prestador.id}`, { method: 'POST' });
      setPrestadores((lista) => lista.map((p) => p.id === prestador.id ? { ...p, favoritado: !p.favoritado } : p));
    } catch (e) {
      setErro(e.message);
    }
  }

  const slugsIA = valores.categorias.split(',').filter(Boolean);
  const nomesIA = slugsIA.map((slug) => categorias.find((c) => c.slug === slug)?.nome || slug);

  return (
    <main className="container secao">
      <div className="titulo-secao">
        <span className="rotulo">Busca</span>
        <h1>Prestadores de serviços</h1>
        <p className="texto-suave">Use os filtros para encontrar profissionais compatíveis com o que você precisa.</p>
      </div>

      {usandoIA && (
        <section className="resultado-ia">
          <div>
            <span className="rotulo">✦ Busca assistida por IA</span>
            <h2>{buscaIA?.mensagem || 'Categorias identificadas a partir da sua necessidade.'}</h2>
            {buscaIA?.descricao && <p className="texto-suave">“{buscaIA.descricao}”</p>}
          </div>
          <div className="chips-ia">{nomesIA.map((nome) => <span key={nome}>{nome}</span>)}</div>
          <p className="ajuda-campo">A IA selecionou categorias. Os profissionais, preços, avaliações e disponibilidade abaixo vêm apenas dos dados cadastrados no ConectaTorres.</p>
        </section>
      )}

      <section className="filtros-avancados">
        <div className="filtro-largo"><label>Buscar<input value={valores.busca} onChange={(e) => atualizar('busca', e.target.value)} placeholder="Serviço ou nome do profissional" /></label></div>
        <label>Categoria<select value={valores.categoria} onChange={(e) => atualizar('categoria', e.target.value)}><option value="">Todas</option>{categorias.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}</select></label>
        <label>Cidade<input value={valores.cidade} onChange={(e) => atualizar('cidade', e.target.value)} placeholder="Torres" /></label>
        <label>Preço máximo<input type="number" min="0" value={valores.preco_max} onChange={(e) => atualizar('preco_max', e.target.value)} placeholder="R$" /></label>
        <label>Avaliação mínima<select value={valores.avaliacao_min} onChange={(e) => atualizar('avaliacao_min', e.target.value)}><option value="">Qualquer</option><option value="3">3+ estrelas</option><option value="4">4+ estrelas</option><option value="4.5">4,5+ estrelas</option></select></label>
        <label>Disponível em<input type="date" value={valores.disponivel_em} onChange={(e) => atualizar('disponivel_em', e.target.value)} /></label>
        <label>Ordenar<select value={valores.ordenar} onChange={(e) => atualizar('ordenar', e.target.value)}><option value="">Relevância</option><option value="avaliacao">Melhor avaliação</option><option value="menor_preco">Menor preço</option><option value="nome">Nome</option></select></label>
        <button className="botao-secundario alinhar-fim" onClick={limpar}>Limpar filtros</button>
      </section>
      {erro && <div className="alerta erro">{erro}</div>}
      <div className="resultado-contagem">{carregando ? 'Buscando...' : (() => { const total = Number(paginacao?.total ?? prestadores.length); return `${total} ${total === 1 ? 'prestador encontrado' : 'prestadores encontrados'}`; })()}</div>
      {carregando && <div className="vazio">Carregando prestadores...</div>}
      {!carregando && (
        <>
          <div className="grade-cards">
            {prestadores.map((p) => <CartaoPrestador key={p.id} prestador={p} podeFavoritar={usuario?.tipo === 'cliente'} aoFavoritar={favoritar} />)}
            {!prestadores.length && <div className="vazio">Nenhum prestador encontrado com estes filtros. Tente remover algum filtro.</div>}
          </div>
          <Paginacao paginacao={paginacao} aoMudar={mudarPagina} />
        </>
      )}
    </main>
  );
}
