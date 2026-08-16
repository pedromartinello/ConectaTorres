import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';
import { Avatar } from './Avatar.jsx';

export function Cabecalho() {
  const { usuario, sair } = useAutenticacao();
  const { naoLidas } = useNotificacoes();
  const navegar = useNavigate();

  async function encerrar() {
    await sair();
    navegar('/');
  }

  return (
    <header className="cabecalho">
      <div className="container cabecalho-conteudo">
        <Link className="marca" to="/"><span className="marca-simbolo">C</span>ConectaTorres</Link>
        <nav className="navegacao" aria-label="Navegação principal">
          <NavLink to="/prestadores">Prestadores</NavLink>
          {!usuario ? (
            <>
              <NavLink to="/entrar">Entrar</NavLink>
              <Link className="botao botao-pequeno" to="/cadastro">Criar conta</Link>
            </>
          ) : (
            <>
              <NavLink className="link-notificacao" to="/painel/notificacoes" aria-label={`${naoLidas} notificações não lidas`}>
                <span aria-hidden="true">&#128276;</span>
                {naoLidas > 0 && <span className="badge-notificacao">{naoLidas > 99 ? '99+' : naoLidas}</span>}
              </NavLink>
              <NavLink className="usuario-cabecalho" to="/painel">
                <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} tamanho="pequeno" />
                <span>{usuario.nome.split(' ')[0]}</span>
              </NavLink>
              <button className="botao-secundario botao-pequeno" onClick={encerrar}>Sair</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
