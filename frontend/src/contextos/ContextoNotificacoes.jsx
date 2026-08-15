import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../servicos/api.js';
import { useAutenticacao } from './ContextoAutenticacao.jsx';

const ContextoNotificacoes = createContext(null);

export function ProvedorNotificacoes({ children }) {
  const { usuario } = useAutenticacao();
  const [naoLidas, setNaoLidas] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);

  const recarregar = useCallback(async () => {
    if (!usuario) {
      setNaoLidas(0);
      setNotificacoes([]);
      return;
    }
    try {
      const dados = await api('/notificacoes');
      setNaoLidas(dados.naoLidas);
      setNotificacoes(dados.notificacoes);
    } catch {
      // A notificacao nao deve derrubar o restante da interface.
    }
  }, [usuario]);

  useEffect(() => {
    recarregar();
    if (!usuario) return undefined;
    const intervalo = setInterval(recarregar, 30000);
    return () => clearInterval(intervalo);
  }, [usuario, recarregar]);

  const valor = useMemo(() => ({ naoLidas, notificacoes, recarregar, setNaoLidas }), [naoLidas, notificacoes, recarregar]);
  return <ContextoNotificacoes.Provider value={valor}>{children}</ContextoNotificacoes.Provider>;
}

export function useNotificacoes() {
  return useContext(ContextoNotificacoes);
}
