import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { CartaoPrestador } from '../componentes/CartaoPrestador.jsx';

export function Prestadores() {
  const [params, setParams] = useSearchParams();
  const [prestadores, setPrestadores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const busca = params.get('busca') || '';
  const categoria = params.get('categoria') || '';
  const cidade = params.get('cidade') || '';

  useEffect(() => {
    api('/categorias').then((d) => setCategorias(d.categorias)).catch(() => {});
  }, []);

  useEffect(() => {
    const query = new URLSearchParams();
    if (busca) query.set('busca', busca);
    if (categoria) query.set('categoria', categoria);
    if (cidade) query.set('cidade', cidade);

    setCarregando(true);
    setErro('');
    api(`/prestadores?${query.toString()}`)
      .then((d) => setPrestadores(d.prestadores))
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, [busca, categoria, cidade]);

  function atualizarParametro(chave, valor) {
    const novos = new URLSearchParams(params);
    if (valor) novos.set(chave, valor);
    else novos.delete(chave);
    setParams(novos);
  }

  return (
    <main className="container secao">
      <div className="titulo-secao">
        <span className="rotulo">Busca</span>
        <h1>Prestadores de servicos</h1>
      </div>

      <div className="filtros">
        <input value={busca} onChange={(e) => atualizarParametro('busca', e.target.value)} placeholder="Buscar servico ou profissional" />
        <select value={categoria} onChange={(e) => atualizarParametro('categoria', e.target.value)}>
          <option value="">Todas as categorias</option>
          {categorias.map((item) => <option key={item.id} value={item.slug}>{item.nome}</option>)}
        </select>
        <input value={cidade} onChange={(e) => atualizarParametro('cidade', e.target.value)} placeholder="Cidade" />
      </div>

      {erro && <div className="alerta erro">{erro}</div>}
      {carregando ? <p>Carregando...</p> : (
        <div className="grade-cards">
          {prestadores.map((prestador) => <CartaoPrestador key={prestador.id} prestador={prestador} />)}
          {!prestadores.length && <div className="vazio">Nenhum prestador encontrado com estes filtros.</div>}
        </div>
      )}
    </main>
  );
}
