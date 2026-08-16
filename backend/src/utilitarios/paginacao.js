export function obterPaginacao(query, padrao = 12, maximo = 50) {
  const pagina = Math.max(1, Number.parseInt(query.pagina || '1', 10) || 1);
  const limite = Math.min(maximo, Math.max(1, Number.parseInt(query.limite || String(padrao), 10) || padrao));
  return { pagina, limite };
}

export function montarPaginacao(total, pagina, limite) {
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  return {
    pagina,
    limite,
    total,
    totalPaginas,
    temAnterior: pagina > 1,
    temProxima: pagina < totalPaginas
  };
}
