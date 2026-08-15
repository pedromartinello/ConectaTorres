import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', tipo: 'cliente' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { cadastrar } = useAutenticacao();
  const navegar = useNavigate();

  function alterar(campo, valor) {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await cadastrar(form);
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
        <span className="rotulo">Cadastro</span>
        <h1>Criar conta</h1>
        <label>Nome completo<input value={form.nome} onChange={(e) => alterar('nome', e.target.value)} required minLength="3" /></label>
        <label>E-mail<input type="email" value={form.email} onChange={(e) => alterar('email', e.target.value)} required /></label>
        <label>Senha<input type="password" value={form.senha} onChange={(e) => alterar('senha', e.target.value)} required minLength="8" /></label>
        <label>Tipo de conta
          <select value={form.tipo} onChange={(e) => alterar('tipo', e.target.value)}>
            <option value="cliente">Quero contratar servicos</option>
            <option value="prestador">Quero oferecer meus servicos</option>
          </select>
        </label>
        {erro && <div className="alerta erro">{erro}</div>}
        <button className="botao" disabled={enviando}>{enviando ? 'Criando...' : 'Criar conta'}</button>
      </form>
    </main>
  );
}
