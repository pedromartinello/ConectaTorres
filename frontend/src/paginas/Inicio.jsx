import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../servicos/api.js';

export function Inicio() {
  const [busca, setBusca] = useState('');
  const [categorias, setCategorias] = useState([]);
  const navegar = useNavigate();
  useEffect(() => { api('/categorias').then((d) => setCategorias(d.categorias.slice(0, 8))).catch(() => {}); }, []);

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
            <span className="rotulo">Serviços locais em Torres e região</span>
            <h1>Encontre o profissional certo para o que você precisa.</h1>
            <p>Pesquise prestadores, compare serviços, consulte disponibilidade, salve favoritos e solicite um horário em um único lugar.</p>
            <form className="barra-busca" onSubmit={pesquisar}><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: eletricista, pintura, informática..." /><button className="botao" type="submit">Buscar</button></form>
            <div className="atalhos-categoria">{categorias.map((c) => <Link key={c.id} to={`/prestadores?categoria=${c.slug}`}>{c.nome}</Link>)}</div>
          </div>
        </div>
      </section>
      <section className="container secao">
        <div className="titulo-secao"><span className="rotulo">Como funciona</span><h2>Organizado para quem procura e para quem presta o serviço.</h2></div>
        <div className="grade-tres">
          <div className="cartao-info"><span className="numero-etapa">01</span><strong>Pesquise</strong><p>Encontre profissionais por categoria, cidade, avaliação, preço e disponibilidade.</p></div>
          <div className="cartao-info"><span className="numero-etapa">02</span><strong>Compare</strong><p>Veja perfil, portfólio, serviços, avaliações, valores e horários cadastrados.</p></div>
          <div className="cartao-info"><span className="numero-etapa">03</span><strong>Solicite</strong><p>Escolha um horário, acompanhe o status e avalie o atendimento depois da conclusão.</p></div>
        </div>
      </section>
      <section className="faixa-cta"><div className="container faixa-cta-conteudo"><div><span className="rotulo">Para profissionais</span><h2>Transforme seu trabalho em uma vitrine digital organizada.</h2><p>Cadastre serviços, portfólio, disponibilidade e receba solicitações de clientes da região.</p></div><Link className="botao" to="/cadastro">Criar conta de prestador</Link></div></section>
    </main>
  );
}
