import { Link } from 'react-router-dom';
export function NaoEncontrado(){return <main className="container secao centro"><span className="rotulo">Erro 404</span><h1>Página não encontrada</h1><p className="texto-suave">O endereço informado não existe no ConectaTorres.</p><Link className="botao" to="/">Voltar ao início</Link></main>}
