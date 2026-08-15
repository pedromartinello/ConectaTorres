import { Link } from 'react-router-dom';

export function NaoEncontrado() {
  return (
    <main className="container secao centro">
      <span className="rotulo">404</span>
      <h1>Pagina nao encontrada</h1>
      <p className="texto-suave">O endereco informado nao existe.</p>
      <Link className="botao" to="/">Voltar ao inicio</Link>
    </main>
  );
}
