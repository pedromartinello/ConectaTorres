import { useEffect, useState } from 'react';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';

function formatar(valor) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor));
}

export function Painel() {
  const { usuario, recarregarUsuario } = useAutenticacao();
  const [agendamentos, setAgendamentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [perfil, setPerfil] = useState(usuario?.perfilPrestador || {});
  const [servico, setServico] = useState({ categoriaId: '', titulo: '', descricao: '', precoBase: '' });
  const [disponibilidade, setDisponibilidade] = useState({ inicio: '', fim: '', observacao: '' });

  async function carregarAgendamentos() {
    try {
      const dados = await api('/agendamentos');
      setAgendamentos(dados.agendamentos);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarAgendamentos();
    if (usuario.tipo === 'prestador') {
      api('/categorias').then((d) => setCategorias(d.categorias)).catch(() => {});
    }
  }, [usuario.tipo]);

  async function salvarPerfil(evento) {
    evento.preventDefault();
    setErro(''); setMensagem('');
    try {
      await api('/prestadores/meu-perfil', { method: 'PUT', body: JSON.stringify(perfil) });
      await recarregarUsuario();
      setMensagem('Perfil atualizado.');
    } catch (e) { setErro(e.message); }
  }

  async function criarServico(evento) {
    evento.preventDefault();
    setErro(''); setMensagem('');
    try {
      await api('/servicos', {
        method: 'POST',
        body: JSON.stringify({ ...servico, precoBase: servico.precoBase || null })
      });
      setServico({ categoriaId: '', titulo: '', descricao: '', precoBase: '' });
      setMensagem('Servico cadastrado.');
    } catch (e) { setErro(e.message); }
  }

  async function criarDisponibilidade(evento) {
    evento.preventDefault();
    setErro(''); setMensagem('');
    try {
      await api('/disponibilidades', {
        method: 'POST',
        body: JSON.stringify({
          ...disponibilidade,
          inicio: new Date(disponibilidade.inicio).toISOString(),
          fim: new Date(disponibilidade.fim).toISOString()
        })
      });
      setDisponibilidade({ inicio: '', fim: '', observacao: '' });
      setMensagem('Disponibilidade cadastrada.');
    } catch (e) { setErro(e.message); }
  }

  async function mudarStatus(id, status) {
    try {
      await api(`/agendamentos/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
      await carregarAgendamentos();
    } catch (e) { setErro(e.message); }
  }

  return (
    <main className="container secao">
      <div className="titulo-secao">
        <span className="rotulo">Area autenticada</span>
        <h1>Ola, {usuario.nome}</h1>
        <p className="texto-suave">Tipo de conta: {usuario.tipo}</p>
      </div>

      {mensagem && <div className="alerta sucesso">{mensagem}</div>}
      {erro && <div className="alerta erro">{erro}</div>}

      {usuario.tipo === 'prestador' && (
        <>
          <section className="secao-interna formulario-cartao">
            <h2>Meu perfil profissional</h2>
            <form className="formulario" onSubmit={salvarPerfil}>
              <div className="grade-dois">
                <label>Titulo profissional<input value={perfil.titulo || ''} onChange={(e) => setPerfil({ ...perfil, titulo: e.target.value })} placeholder="Ex.: Eletricista residencial" /></label>
                <label>WhatsApp<input value={perfil.whatsapp || ''} onChange={(e) => setPerfil({ ...perfil, whatsapp: e.target.value })} placeholder="5551999999999" /></label>
                <label>Cidade<input value={perfil.cidade || ''} onChange={(e) => setPerfil({ ...perfil, cidade: e.target.value })} placeholder="Torres" /></label>
                <label>Estado<input maxLength="2" value={perfil.estado || 'RS'} onChange={(e) => setPerfil({ ...perfil, estado: e.target.value.toUpperCase() })} /></label>
              </div>
              <label>Regiao de atendimento<input value={perfil.regiaoAtendimento || ''} onChange={(e) => setPerfil({ ...perfil, regiaoAtendimento: e.target.value })} placeholder="Torres, Passo de Torres e regiao" /></label>
              <label>Descricao<textarea rows="5" value={perfil.descricao || ''} onChange={(e) => setPerfil({ ...perfil, descricao: e.target.value })} /></label>
              <div className="grade-dois">
                <label>Forma de orcamento
                  <select value={perfil.modalidadeOrcamento || 'orcamento'} onChange={(e) => setPerfil({ ...perfil, modalidadeOrcamento: e.target.value })}>
                    <option value="orcamento">Sob orcamento</option>
                    <option value="hora">Por hora</option>
                    <option value="servico">Por servico</option>
                  </select>
                </label>
                <label>Valor de referencia<input type="number" min="0" step="0.01" value={perfil.valorReferencia || ''} onChange={(e) => setPerfil({ ...perfil, valorReferencia: e.target.value })} /></label>
              </div>
              <button className="botao">Salvar perfil</button>
            </form>
          </section>

          <div className="grade-dois secao-interna">
            <section className="formulario-cartao">
              <h2>Novo servico</h2>
              <form className="formulario" onSubmit={criarServico}>
                <label>Categoria<select required value={servico.categoriaId} onChange={(e) => setServico({ ...servico, categoriaId: e.target.value })}><option value="">Selecione</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></label>
                <label>Titulo<input required minLength="3" value={servico.titulo} onChange={(e) => setServico({ ...servico, titulo: e.target.value })} /></label>
                <label>Descricao<textarea rows="3" value={servico.descricao} onChange={(e) => setServico({ ...servico, descricao: e.target.value })} /></label>
                <label>Preco base<input type="number" min="0" step="0.01" value={servico.precoBase} onChange={(e) => setServico({ ...servico, precoBase: e.target.value })} /></label>
                <button className="botao">Cadastrar servico</button>
              </form>
            </section>

            <section className="formulario-cartao">
              <h2>Nova disponibilidade</h2>
              <form className="formulario" onSubmit={criarDisponibilidade}>
                <label>Inicio<input type="datetime-local" required value={disponibilidade.inicio} onChange={(e) => setDisponibilidade({ ...disponibilidade, inicio: e.target.value })} /></label>
                <label>Fim<input type="datetime-local" required value={disponibilidade.fim} onChange={(e) => setDisponibilidade({ ...disponibilidade, fim: e.target.value })} /></label>
                <label>Observacao<input value={disponibilidade.observacao} onChange={(e) => setDisponibilidade({ ...disponibilidade, observacao: e.target.value })} /></label>
                <button className="botao">Cadastrar horario</button>
              </form>
            </section>
          </div>
        </>
      )}

      <section className="secao-interna">
        <h2>{usuario.tipo === 'prestador' ? 'Solicitacoes e agendamentos' : 'Meus agendamentos'}</h2>
        <div className="lista-simples">
          {agendamentos.map((a) => (
            <article className="linha-agendamento" key={a.id}>
              <div>
                <strong>{a.servico?.titulo || 'Servico nao especificado'}</strong>
                <p>{formatar(a.inicio)} ate {formatar(a.fim)}</p>
                <span className={`status status-${a.status}`}>{a.status}</span>
              </div>
              <div className="acoes">
                {usuario.tipo === 'prestador' && a.status === 'pendente' && <><button className="botao botao-pequeno" onClick={() => mudarStatus(a.id, 'aceito')}>Aceitar</button><button className="botao-secundario botao-pequeno" onClick={() => mudarStatus(a.id, 'recusado')}>Recusar</button></>}
                {usuario.tipo === 'cliente' && ['pendente', 'aceito'].includes(a.status) && <button className="botao-secundario botao-pequeno" onClick={() => mudarStatus(a.id, 'cancelado')}>Cancelar</button>}
              </div>
            </article>
          ))}
          {!agendamentos.length && <div className="vazio">Nenhum agendamento por enquanto.</div>}
        </div>
      </section>
    </main>
  );
}
