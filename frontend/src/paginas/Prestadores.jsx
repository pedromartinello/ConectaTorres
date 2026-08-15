import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { CartaoPrestador } from '../componentes/CartaoPrestador.jsx';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Prestadores() {
  const [params, setParams] = useSearchParams();
  const [prestadores, setPrestadores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const { usuario } = useAutenticacao();
  const chaves = ['busca', 'categoria', 'cidade', 'preco_max', 'avaliacao_min', 'disponivel_em', 'ordenar'];
  const valores = Object.fromEntries(chaves.map((c) => [c, params.get(c) || '']));

  useEffect(() => { api('/categorias').then((d) => setCategorias(d.categorias)).catch(() => {}); }, []);
  useEffect(() => {
    const query = new URLSearchParams(); chaves.forEach((c) => { if (valores[c]) query.set(c, valores[c]); });
    setCarregando(true); setErro('');
    api(`/prestadores?${query.toString()}`).then((d) => setPrestadores(d.prestadores)).catch((e) => setErro(e.message)).finally(() => setCarregando(false));
  }, [params.toString(), usuario?.id]);

  function atualizar(chave, valor) { const novos = new URLSearchParams(params); if (valor) novos.set(chave, valor); else novos.delete(chave); setParams(novos); }
  function limpar() { setParams({}); }
  async function favoritar(prestador) {
    try {
      if (prestador.favoritado) await api(`/favoritos/${prestador.id}`, { method: 'DELETE' });
      else await api(`/favoritos/${prestador.id}`, { method: 'POST' });
      setPrestadores((lista) => lista.map((p) => p.id === prestador.id ? { ...p, favoritado: !p.favoritado } : p));
    } catch (e) { setErro(e.message); }
  }

  return <main className="container secao"><div className="titulo-secao"><span className="rotulo">Busca</span><h1>Prestadores de servicos</h1><p className="texto-suave">Use os filtros para encontrar profissionais compativeis com o que voce precisa.</p></div><section className="filtros-avancados"><div className="filtro-largo"><label>Buscar<input value={valores.busca} onChange={(e) => atualizar('busca', e.target.value)} placeholder="Servico ou nome do profissional" /></label></div><label>Categoria<select value={valores.categoria} onChange={(e) => atualizar('categoria', e.target.value)}><option value="">Todas</option>{categorias.map((c) => <option key={c.id} value={c.slug}>{c.nome}</option>)}</select></label><label>Cidade<input value={valores.cidade} onChange={(e) => atualizar('cidade', e.target.value)} placeholder="Torres" /></label><label>Preco maximo<input type="number" min="0" value={valores.preco_max} onChange={(e) => atualizar('preco_max', e.target.value)} placeholder="R$" /></label><label>Avaliacao minima<select value={valores.avaliacao_min} onChange={(e) => atualizar('avaliacao_min', e.target.value)}><option value="">Qualquer</option><option value="3">3+ estrelas</option><option value="4">4+ estrelas</option><option value="4.5">4,5+ estrelas</option></select></label><label>Disponivel em<input type="date" value={valores.disponivel_em} onChange={(e) => atualizar('disponivel_em', e.target.value)} /></label><label>Ordenar<select value={valores.ordenar} onChange={(e) => atualizar('ordenar', e.target.value)}><option value="">Relevancia</option><option value="avaliacao">Melhor avaliacao</option><option value="menor_preco">Menor preco</option><option value="nome">Nome</option></select></label><button className="botao-secundario alinhar-fim" onClick={limpar}>Limpar filtros</button></section>{erro && <div className="alerta erro">{erro}</div>}<div className="resultado-contagem">{carregando ? 'Buscando...' : `${prestadores.length} prestador(es) encontrado(s)`}</div>{!carregando && <div className="grade-cards">{prestadores.map((p) => <CartaoPrestador key={p.id} prestador={p} podeFavoritar={usuario?.tipo === 'cliente'} aoFavoritar={favoritar} />)}{!prestadores.length && <div className="vazio">Nenhum prestador encontrado com estes filtros.</div>}</div>}</main>;
}
