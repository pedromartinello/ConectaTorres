import { useEffect, useState } from 'react';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { CampoSenha } from '../componentes/CampoSenha.jsx';
import { Avatar } from '../componentes/Avatar.jsx';

export function MeuPerfil() {
  const { usuario, recarregarUsuario } = useAutenticacao();
  const [form, setForm] = useState({ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '' });
  const [senha, setSenha] = useState({ senhaAtual: '', novaSenha: '', confirmar: '' });
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [previewFoto, setPreviewFoto] = useState('');

  useEffect(() => setForm({ nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '' }), [usuario]);
  useEffect(() => () => { if (previewFoto) URL.revokeObjectURL(previewFoto); }, [previewFoto]);

  function limparAvisos() { setErro(''); setMensagem(''); }

  async function salvar(e) {
    e.preventDefault();
    limparAvisos();
    setSalvandoDados(true);
    try {
      await api('/usuarios/meu-perfil', { method: 'PUT', body: JSON.stringify(form) });
      await recarregarUsuario();
      setMensagem('Dados pessoais atualizados.');
    } catch (x) {
      setErro(x.message);
    } finally {
      setSalvandoDados(false);
    }
  }

  async function alterarSenha(e) {
    e.preventDefault();
    limparAvisos();
    if (senha.novaSenha !== senha.confirmar) return setErro('A confirmação da nova senha não confere.');
    setSalvandoSenha(true);
    try {
      await api('/usuarios/minha-senha', { method: 'PATCH', body: JSON.stringify({ senhaAtual: senha.senhaAtual, novaSenha: senha.novaSenha }) });
      setSenha({ senhaAtual: '', novaSenha: '', confirmar: '' });
      setMensagem('Senha alterada com sucesso.');
    } catch (x) {
      setErro(x.message);
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function enviarFoto(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    limparAvisos();
    if (arquivo.size > 5 * 1024 * 1024) {
      e.target.value = '';
      return setErro('A imagem deve ter no máximo 5 MB.');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type)) {
      e.target.value = '';
      return setErro('Use uma imagem JPG, PNG ou WEBP.');
    }
    if (previewFoto) URL.revokeObjectURL(previewFoto);
    setPreviewFoto(URL.createObjectURL(arquivo));
    setEnviandoFoto(true);
    const dados = new FormData();
    dados.append('foto', arquivo);
    try {
      await api('/usuarios/minha-foto', { method: 'POST', body: dados });
      await recarregarUsuario();
      setMensagem('Foto de perfil atualizada.');
    } catch (x) {
      setErro(x.message);
    } finally {
      setEnviandoFoto(false);
      e.target.value = '';
      setPreviewFoto('');
    }
  }

  async function removerFoto() {
    if (!confirm('Remover sua foto de perfil atual?')) return;
    limparAvisos();
    try {
      await api('/usuarios/minha-foto', { method: 'DELETE' });
      await recarregarUsuario();
      setMensagem('Foto removida.');
    } catch (x) {
      setErro(x.message);
    }
  }

  return (
    <div>
      <div className="titulo-secao"><span className="rotulo">Conta</span><h1>Meu perfil</h1><p className="texto-suave">Gerencie seus dados, foto e segurança da conta.</p></div>
      {mensagem && <div className="alerta sucesso">{mensagem}</div>}
      {erro && <div className="alerta erro">{erro}</div>}

      <section className="formulario-cartao">
        <h2>Foto de perfil</h2>
        <div className="upload-perfil">
          {previewFoto ? <img className="avatar avatar-extra preview-avatar" src={previewFoto} alt="Pré-visualização da nova foto" /> : <Avatar nome={usuario.nome} fotoUrl={usuario.fotoUrl} tamanho="extra" />}
          <div className="upload-controles">
            <label className="botao-secundario arquivo-botao">{enviandoFoto ? 'Enviando...' : 'Escolher imagem'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={enviarFoto} disabled={enviandoFoto} /></label>
            <p className="ajuda-campo">Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo: 5 MB.</p>
            {usuario.fotoUrl && <button type="button" className="link-perigo" onClick={removerFoto}>Remover foto</button>}
          </div>
        </div>
      </section>

      <section className="formulario-cartao secao-interna">
        <h2>Dados pessoais</h2>
        <form className="formulario" onSubmit={salvar}>
          <div className="grade-dois">
            <label>Nome<input required minLength="3" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></label>
            <label>E-mail<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          </div>
          <label>Telefone<input maxLength="30" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(51) 99999-9999" /></label>
          <button className="botao largura-botao" disabled={salvandoDados}>{salvandoDados ? 'Salvando...' : 'Salvar dados'}</button>
        </form>
      </section>

      <section className="formulario-cartao secao-interna">
        <h2>Alterar senha</h2>
        <form className="formulario largura-media" onSubmit={alterarSenha}>
          <CampoSenha id="senha-atual" rotulo="Senha atual" valor={senha.senhaAtual} aoAlterar={(e) => setSenha({ ...senha, senhaAtual: e.target.value })} autoComplete="current-password" />
          <CampoSenha id="nova-senha" rotulo="Nova senha" valor={senha.novaSenha} aoAlterar={(e) => setSenha({ ...senha, novaSenha: e.target.value })} tamanhoMinimo={8} autoComplete="new-password" />
          <p className="ajuda-campo">Use 8 ou mais caracteres com letra maiúscula, minúscula e número.</p>
          <CampoSenha id="confirmar-nova" rotulo="Confirmar nova senha" valor={senha.confirmar} aoAlterar={(e) => setSenha({ ...senha, confirmar: e.target.value })} tamanhoMinimo={8} autoComplete="new-password" />
          <button className="botao largura-botao" disabled={salvandoSenha}>{salvandoSenha ? 'Alterando...' : 'Alterar senha'}</button>
        </form>
      </section>
    </div>
  );
}
