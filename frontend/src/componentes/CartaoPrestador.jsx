import { Link } from 'react-router-dom';

export function CartaoPrestador({ prestador }) {
  const perfil = prestador.perfilPrestador || {};
  return (
    <article className="cartao">
      <div className="cartao-topo">
        <div>
          <span className="rotulo">Prestador</span>
          <h3>{prestador.nome}</h3>
          <p className="texto-suave">{perfil.titulo || 'Perfil profissional'}</p>
        </div>
        <div className="nota">★ {prestador.mediaAvaliacoes || '0.0'}</div>
      </div>
      <p>{perfil.descricao || 'Este profissional ainda nao adicionou uma descricao.'}</p>
      <div className="tags">
        {prestador.servicos?.slice(0, 3).map((servico) => (
          <span className="tag" key={servico.id}>{servico.categoria?.nome || servico.titulo}</span>
        ))}
      </div>
      <div className="cartao-rodape">
        <span className="texto-suave">{perfil.cidade ? `${perfil.cidade}/${perfil.estado || 'RS'}` : 'Regiao nao informada'}</span>
        <Link className="link-destaque" to={`/prestadores/${prestador.id}`}>Ver perfil</Link>
      </div>
    </article>
  );
}
