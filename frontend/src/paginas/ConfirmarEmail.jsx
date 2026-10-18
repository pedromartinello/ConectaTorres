import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../servicos/api.js';

export function ConfirmarEmail() {
  const [params] = useSearchParams();
  const location = useLocation();
  const token = params.get('token') || '';
  const [email, setEmail] = useState(params.get('email') || '');
  const [estado, setEstado] = useState(token ? 'confirmando' : 'aguardando');
  const [mensagem, setMensagem] = useState(location.state?.mensagem || (token ? 'Confirmando seu e-mail...' : 'Enviamos um link de confirmação para o endereço informado.'));
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) return;
    api('/autenticacao/confirmar-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((dados) => { setEstado('confirmado'); setMensagem(dados.mensagem); })
      .catch((e) => { setEstado('erro'); setErro(e.message); });
  }, [token]);

  async function reenviar(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      const dados = await api('/autenticacao/reenviar-confirmacao', { method: 'POST', body: JSON.stringify({ email }) });
      setMensagem(dados.mensagem);
    } catch (x) {
      setErro(x.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container pagina-formulario">
      <section className="formulario-cartao confirmacao-email-cartao">
        <span className="rotulo">Segurança da conta</span>
        <h1>{estado === 'confirmado' ? 'E-mail confirmado' : 'Confirme seu e-mail'}</h1>
        {estado === 'confirmando' && <div className="estado-confirmacao-email"><span className="spinner-simples" /><p>Estamos validando seu link...</p></div>}
        {estado === 'confirmado' && <><div className="alerta sucesso">{mensagem}</div><p className="texto-suave">Sua conta está pronta para uso.</p><Link className="botao botao-link-bloco" to="/entrar">Entrar no ConectaTorres</Link></>}
        {estado !== 'confirmado' && estado !== 'confirmando' && <>
          {mensagem && <div className="alerta informacao">{mensagem}</div>}
          {erro && <div className="alerta erro">{erro}</div>}
          <p className="texto-suave">Não encontrou o e-mail ou o link expirou? Informe o endereço usado no cadastro para receber um novo.</p>
          <form className="formulario" onSubmit={reenviar}>
            <label>E-mail<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
            <button className="botao" disabled={enviando}>{enviando ? 'Enviando...' : 'Reenviar confirmação'}</button>
          </form>
          <p className="texto-suave texto-pequeno">Já confirmou? <Link className="link-destaque" to="/entrar">Voltar para o login</Link></p>
        </>}
      </section>
    </main>
  );
}
