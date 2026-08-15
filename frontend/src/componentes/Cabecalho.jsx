import { Link, NavLink } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Cabecalho() {
  const { usuario, sair } = useAutenticacao();

  return (
    <header className="cabecalho">
      <div className="container cabecalho-conteudo">
        <Link to="/" className="marca">ConectaTorres</Link>
        <nav className="navegacao">
          <NavLink to="/prestadores">Prestadores</NavLink>
          {usuario && <NavLink to="/painel">Meu painel</NavLink>}
          {!usuario ? (
            <>
              <NavLink to="/entrar">Entrar</NavLink>
              <Link className="botao botao-pequeno" to="/cadastro">Criar conta</Link>
            </>
          ) : (
            <button className="botao-secundario botao-pequeno" onClick={sair}>Sair</button>
          )}
        </nav>
      </div>
    </header>
  );
}
