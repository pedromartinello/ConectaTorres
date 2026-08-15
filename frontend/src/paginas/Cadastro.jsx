import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CampoSenha } from '../componentes/CampoSenha.jsx';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

export function Cadastro() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', tipo: 'cliente' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { cadastrar } = useAutenticacao();
  const navegar = useNavigate();
  function alterar(campo, valor) { setForm((a) => ({ ...a, [campo]: valor })); }

  async function enviar(evento) {
    evento.preventDefault(); setErro('');
    if (form.senha !== form.confirmarSenha) return setErro('As senhas nao conferem.');
    if (!/[a-z]/.test(form.senha) || !/[A-Z]/.test(form.senha) || !/[0-9]/.test(form.senha)) return setErro('A senha deve ter letra maiuscula, minuscula e numero.');
    setEnviando(true);
    try { await cadastrar({ nome: form.nome, email: form.email, senha: form.senha, tipo: form.tipo }); navegar('/painel'); } catch (e) { setErro(e.message); } finally { setEnviando(false); }
  }

  return <main className="container pagina-formulario"><form className="formulario-cartao" onSubmit={enviar}><span className="rotulo">Cadastro</span><h1>Criar conta</h1><p className="texto-suave">Escolha como deseja usar a plataforma.</p><label>Nome completo<input value={form.nome} onChange={(e) => alterar('nome', e.target.value)} required minLength="3" autoComplete="name" /></label><label>E-mail<input type="email" value={form.email} onChange={(e) => alterar('email', e.target.value)} required autoComplete="email" /></label><CampoSenha id="senha-cadastro" nome="senha" rotulo="Senha" valor={form.senha} aoAlterar={(e) => alterar('senha', e.target.value)} tamanhoMinimo={8} autoComplete="new-password" /><p className="ajuda-campo">Minimo de 8 caracteres, com maiuscula, minuscula e numero.</p><CampoSenha id="confirmar-senha" nome="confirmarSenha" rotulo="Confirmar senha" valor={form.confirmarSenha} aoAlterar={(e) => alterar('confirmarSenha', e.target.value)} tamanhoMinimo={8} autoComplete="new-password" /><label>Tipo de conta<select value={form.tipo} onChange={(e) => alterar('tipo', e.target.value)}><option value="cliente">Quero contratar servicos</option><option value="prestador">Quero oferecer meus servicos</option></select></label>{erro && <div className="alerta erro">{erro}</div>}<button className="botao" disabled={enviando}>{enviando ? 'Criando...' : 'Criar conta'}</button><p className="texto-suave">Ja possui conta? <Link className="link-destaque" to="/entrar">Entrar</Link></p></form></main>;
}
