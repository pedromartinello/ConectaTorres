import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../servicos/api.js';

export function Inicio() {
  const [busca, setBusca] = useState('');
  const [necessidade, setNecessidade] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [iaConfigurada, setIaConfigurada] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [erroIA, setErroIA] = useState('');
  const navegar = useNavigate();

  useEffect(() => {
    api('/categorias').then((d) => setCategorias(d.categorias.slice(0, 8))).catch(() => {});
    api('/ia/status').then((d) => setIaConfigurada(Boolean(d.configurada))).catch(() => setIaConfigurada(false));
  }, []);

  function pesquisar(evento) {
    evento.preventDefault();
    const query = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : '';
    navegar(`/prestadores${query}`);
  }

  async function pesquisarComIA(evento) {
    evento.preventDefault();
    setErroIA('');
    const texto = necessidade.trim();
    if (texto.length < 10) return setErroIA('Descreva um pouco melhor o que você precisa.');

    setProcessandoIA(true);
    try {
      const dados = await api('/ia/interpretar-necessidade', {
        method: 'POST',
        body: JSON.stringify({ descricao: texto })
      });
      const categoriasIA = dados.interpretacao?.categorias || [];
      if (!categoriasIA.length) {
        setErroIA(dados.interpretacao?.mensagem || 'Não foi possível relacionar o pedido às categorias atuais da plataforma.');
        return;
      }
      const params = new URLSearchParams({
        categorias: categoriasIA.map((categoria) => categoria.slug).join(','),
        ia: '1'
      });
      navegar(`/prestadores?${params.toString()}`, {
        state: {
          buscaIA: {
            descricao: texto,
            mensagem: dados.interpretacao.mensagem,
            categorias: categoriasIA
          }
        }
      });
    } catch (e) {
      setErroIA(e.message);
    } finally {
      setProcessandoIA(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="container hero-conteudo">
          <div className="hero-texto">
            <span className="rotulo">Serviços locais em Torres e região</span>
            <h1>Encontre o profissional certo para o que você precisa.</h1>
            <p>Pesquise prestadores, compare serviços, consulte disponibilidade, salve favoritos e solicite um horário em um único lugar.</p>
            <form className="barra-busca" onSubmit={pesquisar}>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: eletricista, pintura, informática..." />
              <button className="botao" type="submit">Buscar</button>
            </form>
            <div className="atalhos-categoria">{categorias.map((c) => <Link key={c.id} to={`/prestadores?categoria=${c.slug}`}>{c.nome}</Link>)}</div>
          </div>
        </div>
      </section>

      <section className="container secao secao-ia">
        <div className="busca-ia-cartao">
          <div className="busca-ia-apresentacao">
            <span className="rotulo">Busca inteligente</span>
            <h2>Não sabe qual profissional procurar?</h2>
            <p>Explique o problema com suas próprias palavras. A IA identifica as categorias compatíveis e o ConectaTorres busca somente prestadores realmente cadastrados.</p>
            <div className="selo-ia">✦ IA apenas interpreta sua necessidade; dados de profissionais vêm da plataforma.</div>
          </div>
          <form className="formulario busca-ia-formulario" onSubmit={pesquisarComIA}>
            <label htmlFor="necessidade-ia">
              O que você precisa fazer?
              <textarea
                id="necessidade-ia"
                rows="5"
                maxLength="800"
                value={necessidade}
                onChange={(e) => setNecessidade(e.target.value)}
                placeholder="Ex.: Preciso reformar o banheiro, trocar a pia e instalar um chuveiro novo."
              />
            </label>
            <div className="contador-caracteres">{necessidade.length}/800</div>
            {iaConfigurada === false && <div className="alerta informacao">A busca inteligente está pronta no sistema, mas falta configurar a chave da API de IA no backend.</div>}
            {erroIA && <div className="alerta erro">{erroIA}</div>}
            <button className="botao largura-botao" disabled={processandoIA || iaConfigurada === false}>
              {processandoIA ? 'Interpretando necessidade...' : 'Encontrar com IA'}
            </button>
          </form>
        </div>
      </section>

      <section className="container secao">
        <div className="titulo-secao"><span className="rotulo">Como funciona</span><h2>Organizado para quem procura e para quem presta o serviço.</h2></div>
        <div className="grade-tres">
          <div className="cartao-info"><span className="numero-etapa">01</span><strong>Pesquise</strong><p>Encontre profissionais por categoria, cidade, avaliação, preço e disponibilidade.</p></div>
          <div className="cartao-info"><span className="numero-etapa">02</span><strong>Compare</strong><p>Veja perfil, portfólio, serviços, avaliações, valores e horários cadastrados.</p></div>
          <div className="cartao-info"><span className="numero-etapa">03</span><strong>Solicite</strong><p>Informe quando estará disponível, acompanhe o status e avalie o atendimento depois da conclusão.</p></div>
        </div>
      </section>
      <section className="faixa-cta"><div className="container faixa-cta-conteudo"><div><span className="rotulo">Para profissionais</span><h2>Transforme seu trabalho em uma vitrine digital organizada.</h2><p>Cadastre serviços, portfólio, disponibilidade e receba solicitações de clientes da região.</p></div><Link className="botao" to="/cadastro">Criar conta de prestador</Link></div></section>
    </main>
  );
}
