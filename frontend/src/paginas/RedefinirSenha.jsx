import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CampoSenha } from '../componentes/CampoSenha.jsx';
import { api } from '../servicos/api.js';

export function RedefinirSenha() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [form, setForm] = useState({ novaSenha: '', confirmar: '' });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setMensagem('');
    if (!token) return setErro('O link de recuperação não possui um token válido.');
    if (form.novaSenha !== form.confirmar) return setErro('A confirmação da nova senha não confere.');
    setEnviando(true);
    try {
      const dados = await api('/autenticacao/redefinir-senha', {
        method: 'POST',
        body: JSON.stringify({ token, novaSenha: form.novaSenha })
      });
      setMensagem(dados.mensagem);
      setForm({ novaSenha: '', confirmar: '' });
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
        <h1>Definir nova senha</h1>
        <p className="texto-suave">Escolha uma senha nova para sua conta.</p>
        <CampoSenha
          id="nova-senha-recuperacao"
          rotulo="Nova senha"
          valor={form.novaSenha}
          aoAlterar={(e) => setForm({ ...form, novaSenha: e.target.value })}
          tamanhoMinimo={8}
          autoComplete="new-password"
        />
        <p className="ajuda-campo">Use 8 ou mais caracteres com letra maiúscula, minúscula e número.</p>
        <CampoSenha
          id="confirmar-senha-recuperacao"
          rotulo="Confirmar nova senha"
          valor={form.confirmar}
          aoAlterar={(e) => setForm({ ...form, confirmar: e.target.value })}
          tamanhoMinimo={8}
          autoComplete="new-password"
        />
        {mensagem && <div className="alerta sucesso">{mensagem} <Link className="link-destaque" to="/entrar">Entrar agora →</Link></div>}
        {erro && <div className="alerta erro">{erro}</div>}
        <button className="botao" disabled={enviando || !token}>{enviando ? 'Salvando...' : 'Redefinir senha'}</button>
        {!token && <p className="texto-suave"><Link className="link-destaque" to="/esqueci-senha">Solicitar um novo link</Link></p>}
      </form>
    </main>
  );
}
