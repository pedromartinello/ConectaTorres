export function rolarParaElemento(id, { foco = true, comportamento = 'smooth' } = {}) {
  const executar = (tentativa = 0) => {
    const elemento = document.getElementById(id);
    if (!elemento) {
      if (tentativa < 4) requestAnimationFrame(() => executar(tentativa + 1));
      return;
    }

    elemento.scrollIntoView({ behavior: comportamento, block: 'start' });
    if (foco) {
      window.setTimeout(() => elemento.focus({ preventScroll: true }), comportamento === 'smooth' ? 350 : 0);
    }
  };

  requestAnimationFrame(() => executar());
}
