import { Link } from 'react-router-dom';
import { Avatar } from './Avatar.jsx';

function precoTexto(prestador) {
  if (prestador.menorPreco === null || prestador.menorPreco === undefined) return 'Valor sob consulta';
  return `A partir de R$ ${Number(prestador.menorPreco).toFixed(2).replace('.', ',')}`;
}

export function CartaoPrestador({ prestador, podeFavoritar = false, aoFavoritar }) {
  const perfil = prestador.perfilPrestador || {};
  return (
    <article className="cartao cartao-prestador">
      <div className="cartao-topo">
        <div className="prestador-identidade">
          <Avatar nome={prestador.nome} fotoUrl={prestador.fotoUrl} tamanho="medio" />
          <div><span className="texto-suave texto-pequeno">{perfil.cidade ? `${perfil.cidade}/${perfil.estado || 'RS'}` : 'Regiao nao informada'}</span><h3>{prestador.nome}</h3><p className="texto-suave sem-margem">{perfil.titulo || 'Prestador de servicos'}</p></div>
        </div>
        <div className="acoes-cartao">
          {podeFavoritar && <button className={`botao-icone ${prestador.favoritado ? 'ativo' : ''}`} onClick={() => aoFavoritar?.(prestador)} title={prestador.favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} aria-label="Favoritar prestador">{prestador.favoritado ? '♥' : '♡'}</button>}
          <span className="nota">★ {prestador.mediaAvaliacoes || 0} <small>({prestador.totalAvaliacoes || 0})</small></span>
        </div>
      </div>
      <p>{perfil.descricao ? `${perfil.descricao.slice(0, 150)}${perfil.descricao.length > 150 ? '...' : ''}` : 'Este profissional ainda nao adicionou uma descricao.'}</p>
      <div className="tags">{prestador.servicos?.slice(0, 4).map((s) => <span key={s.id} className="tag">{s.categoria?.nome || s.titulo}</span>)}</div>
      <div className="cartao-rodape"><div><span className="texto-suave texto-pequeno">Valor</span><strong className="bloco">{precoTexto(prestador)}</strong></div><Link className="link-destaque" to={`/prestadores/${prestador.id}`}>Ver perfil →</Link></div>
    </article>
  );
}
