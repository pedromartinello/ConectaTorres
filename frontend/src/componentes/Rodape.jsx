import { Link } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Rodape() {
  const { usuario } = useAutenticacao();

  return (
    <footer className="rodape">
      <div className="container rodape-conteudo">
        <div>
          <Link className="marca marca-rodape" to="/">
            <span className="marca-simbolo" aria-hidden="true">C</span>
            ConectaTorres
          </Link>
          <p>Conectando clientes e prestadores de serviços locais em Torres/RS e região.</p>
        </div>
        <div className="rodape-links" aria-label="Links do rodapé">
          <Link to="/prestadores">Encontrar prestadores</Link>
          <Link to={usuario ? '/painel' : '/cadastro'}>{usuario ? 'Meu painel' : 'Criar conta'}</Link>
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
