import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../servicos/api.js';

const ContextoAutenticacao = createContext(null);

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api('/autenticacao/eu')
      .then((dados) => setUsuario(dados.usuario))
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(email, senha) {
    const dados = await api('/autenticacao/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  async function cadastrar(dadosCadastro) {
    const dados = await api('/autenticacao/cadastro', { method: 'POST', body: JSON.stringify(dadosCadastro) });
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  async function sair() {
    await api('/autenticacao/logout', { method: 'POST' });
    setUsuario(null);
  }

  async function recarregarUsuario() {
    const dados = await api('/autenticacao/eu');
    setUsuario(dados.usuario);
    return dados.usuario;
  }

  const valor = useMemo(() => ({ usuario, carregando, entrar, cadastrar, sair, recarregarUsuario }), [usuario, carregando]);
  return <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>;
}

export function useAutenticacao() {
  return useContext(ContextoAutenticacao);
}
