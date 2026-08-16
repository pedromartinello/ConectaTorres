import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { rolarParaElemento } from '../utilitarios/navegacao.js';

export function RolagemAutomatica() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      rolarParaElemento(hash.slice(1), { foco: false });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search, hash]);

  return null;
}
