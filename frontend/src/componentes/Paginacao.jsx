export function Paginacao({ paginacao, aoMudar }) {
  if (!paginacao || paginacao.totalPaginas <= 1) return null;

  const atual = paginacao.pagina;
  const total = paginacao.totalPaginas;
  const paginas = [];
  const inicio = Math.max(1, atual - 2);
  const fim = Math.min(total, atual + 2);
  for (let pagina = inicio; pagina <= fim; pagina += 1) paginas.push(pagina);

  return (
    <nav className="paginacao" aria-label="Paginação">
      <button
        type="button"
        className="botao-secundario botao-pequeno"
        disabled={!paginacao.temAnterior}
        onClick={() => aoMudar(atual - 1)}
      >
        ← Anterior
      </button>
      <div className="paginacao-numeros">
        {inicio > 1 && <button type="button" onClick={() => aoMudar(1)}>1</button>}
        {inicio > 2 && <span>...</span>}
        {paginas.map((pagina) => (
          <button
            type="button"
            key={pagina}
            className={pagina === atual ? 'ativo' : ''}
            aria-current={pagina === atual ? 'page' : undefined}
            onClick={() => aoMudar(pagina)}
          >
            {pagina}
          </button>
        ))}
        {fim < total - 1 && <span>...</span>}
        {fim < total && <button type="button" onClick={() => aoMudar(total)}>{total}</button>}
      </div>
      <button
        type="button"
        className="botao-secundario botao-pequeno"
        disabled={!paginacao.temProxima}
        onClick={() => aoMudar(atual + 1)}
      >
        Próxima →
      </button>
    </nav>
  );
}
