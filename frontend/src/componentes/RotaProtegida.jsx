import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function RotaProtegida({ children, tipos }) {
  const { usuario, carregando } = useAutenticacao();
  if (carregando) return <main className="container secao"><div className="vazio">Carregando...</div></main>;
  if (!usuario) return <Navigate to="/entrar" replace />;
  if (tipos?.length && !tipos.includes(usuario.tipo)) return <Navigate to="/painel" replace />;
  return children;
}
