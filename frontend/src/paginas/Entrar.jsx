import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampoSenha } from '../componentes/CampoSenha.jsx';
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
        <p className="texto-suave">Acesse seu painel do ConectaTorres.</p>
        <label htmlFor="email-login">
          E-mail
          <input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <CampoSenha id="senha-login" nome="senha" rotulo="Senha" valor={senha} aoAlterar={(e) => setSenha(e.target.value)} autoComplete="current-password" />
        <div className="linha-entre-campos"><Link className="link-destaque texto-pequeno" to="/esqueci-senha">Esqueci minha senha</Link></div>
        {erro && <div className="alerta erro">{erro}</div>}
        <button className="botao" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="texto-suave">Ainda não possui conta? <Link className="link-destaque" to="/cadastro">Criar conta</Link></p>
      </form>
    </main>
  );
}
