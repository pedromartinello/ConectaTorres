import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Inicio() {
  const [busca, setBusca] = useState('');
  const navegar = useNavigate();

  function pesquisar(evento) {
    evento.preventDefault();
    const query = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : '';
    navegar(`/prestadores${query}`);
  }

  return (
    <main>
      <section className="hero">
        <div className="container hero-conteudo">
          <div className="hero-texto">
            <span className="rotulo">Servicos locais em Torres e regiao</span>
            <h1>Encontre o profissional certo para o que voce precisa.</h1>
            <p>Pesquise prestadores, compare servicos, consulte disponibilidade e solicite um horario em um unico lugar.</p>
            <form className="barra-busca" onSubmit={pesquisar}>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Ex.: eletricista, pintura, informatica..."
              />
              <button className="botao" type="submit">Buscar</button>
            </form>
          </div>
        </div>
      </section>

      <section className="container secao">
        <div className="titulo-secao">
          <span className="rotulo">Como funciona</span>
          <h2>Simples para quem procura e para quem presta o servico.</h2>
        </div>
        <div className="grade-tres">
          <div className="cartao-info"><strong>1. Pesquise</strong><p>Encontre profissionais por categoria, cidade e tipo de servico.</p></div>
          <div className="cartao-info"><strong>2. Compare</strong><p>Veja perfil, servicos, avaliacoes, valores de referencia e disponibilidade.</p></div>
          <div className="cartao-info"><strong>3. Solicite</strong><p>Escolha um horario disponivel e envie a solicitacao ao prestador.</p></div>
        </div>
      </section>
    </main>
  );
}
