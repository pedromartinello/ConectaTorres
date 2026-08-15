import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Entrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { entrar } = useAutenticacao();
  const navegar = useNavigate();

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
      navegar('/painel');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container pagina-formulario">
      <form className="formulario-cartao" onSubmit={enviar}>
        <span className="rotulo">Acesso</span>
        <h1>Entrar na conta</h1>
        <label>E-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Senha<input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength="8" /></label>
        {erro && <div className="alerta erro">{erro}</div>}
        <button className="botao" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="texto-suave">Ainda nao possui conta? <Link to="/cadastro">Criar conta</Link></p>
      </form>
    </main>
  );
}
