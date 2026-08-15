import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function RotaProtegida({ children, tipos }) {
  const { usuario, carregando } = useAutenticacao();

  if (carregando) return <div className="container espaco-topo">Carregando...</div>;
  if (!usuario) return <Navigate to="/entrar" replace />;
  if (tipos && !tipos.includes(usuario.tipo)) return <Navigate to="/" replace />;

  return children;
}
