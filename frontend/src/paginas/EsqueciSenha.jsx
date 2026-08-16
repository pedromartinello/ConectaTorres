import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api.js';

export function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [link, setLink] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    setLink('');
    setEnviando(true);
    try {
      const dados = await api('/autenticacao/esqueci-senha', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setMensagem(dados.mensagem);
      setLink(dados.linkRedefinicao || '');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="container pagina-formulario">
      <form className="formulario-cartao" onSubmit={enviar}>
        <span className="rotulo">Segurança</span>
        <h1>Recuperar senha</h1>
        <p className="texto-suave">Informe o e-mail da sua conta para iniciar a redefinição de senha.</p>
        <label htmlFor="email-recuperacao">
          E-mail
          <input
            id="email-recuperacao"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        {mensagem && <div className="alerta sucesso">{mensagem}</div>}
        {erro && <div className="alerta erro">{erro}</div>}
        {link && (
          <div className="alerta informacao">
            <strong>Ambiente de desenvolvimento:</strong>
            <p>O envio por e-mail ainda não faz parte do protótipo. Use o link abaixo para testar o fluxo completo.</p>
            <a className="link-destaque quebra-link" href={link}>Abrir redefinição de senha →</a>
          </div>
        )}
        <button className="botao" disabled={enviando}>{enviando ? 'Processando...' : 'Continuar'}</button>
        <p className="texto-suave"><Link className="link-destaque" to="/entrar">← Voltar para o login</Link></p>
      </form>
    </main>
  );
}
