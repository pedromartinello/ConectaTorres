import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../servicos/api.js';
import { useAutenticacao } from '../contextos/ContextoAutenticacao.jsx';
import { useNotificacoes } from '../contextos/ContextoNotificacoes.jsx';

export function PainelInicio() {
  const { usuario } = useAutenticacao(); const { naoLidas } = useNotificacoes();
  const [agendamentos, setAgendamentos] = useState([]); const [favoritos, setFavoritos] = useState([]); const [servicos, setServicos] = useState([]);
  useEffect(() => {
    if (usuario.tipo !== 'admin') api('/agendamentos').then((d) => setAgendamentos(d.agendamentos)).catch(() => {});
    if (usuario.tipo === 'cliente') api('/favoritos').then((d) => setFavoritos(d.favoritos)).catch(() => {});
    if (usuario.tipo === 'prestador') api('/servicos/meus').then((d) => setServicos(d.servicos)).catch(() => {});
  }, [usuario.tipo]);
  const ativos = agendamentos.filter((a) => ['pendente', 'aceito'].includes(a.status) && !a.concluidoEm).length;
  return <div><div className="titulo-secao"><span className="rotulo">Area autenticada</span><h1>Ola, {usuario.nome.split(' ')[0]}</h1><p className="texto-suave">Aqui esta um resumo da sua conta.</p></div><div className="grade-metricas"><div className="metrica"><span>Agendamentos ativos</span><strong>{ativos}</strong><Link to="/painel/agenda">Ver agenda</Link></div>{usuario.tipo === 'cliente' && <div className="metrica"><span>Favoritos</span><strong>{favoritos.length}</strong><Link to="/painel/favoritos">Ver favoritos</Link></div>}{usuario.tipo === 'prestador' && <div className="metrica"><span>Servicos cadastrados</span><strong>{servicos.length}</strong><Link to="/painel/servicos">Gerenciar</Link></div>}<div className="metrica"><span>Notificacoes nao lidas</span><strong>{naoLidas}</strong><Link to="/painel/notificacoes">Abrir notificacoes</Link></div></div><section className="secao-interna"><h2>Proximos passos</h2><div className="grade-dois">{usuario.tipo === 'prestador' && <><div className="cartao-info"><h3>Complete seu perfil</h3><p>Adicione titulo, descricao, cidade, WhatsApp, valor de referencia e portfolio.</p><Link className="link-destaque" to="/painel/profissional">Editar perfil →</Link></div><div className="cartao-info"><h3>Mantenha sua agenda atualizada</h3><p>Cadastre os periodos em que voce realmente pode atender.</p><Link className="link-destaque" to="/painel/agenda">Gerenciar agenda →</Link></div></>}{usuario.tipo === 'cliente' && <><div className="cartao-info"><h3>Encontre profissionais</h3><p>Use filtros de categoria, cidade, preco, avaliacao e disponibilidade.</p><Link className="link-destaque" to="/prestadores">Pesquisar →</Link></div><div className="cartao-info"><h3>Acompanhe seus atendimentos</h3><p>Veja solicitacoes pendentes, aceitas e atendimentos concluidos.</p><Link className="link-destaque" to="/painel/agenda">Ver agenda →</Link></div></>}{usuario.tipo === 'admin' && <div className="cartao-info"><h3>Administracao da plataforma</h3><p>Gerencie usuarios, categorias, denuncias e moderacao de avaliacoes.</p><Link className="link-destaque" to="/painel/admin">Abrir administracao →</Link></div>}</div></section></div>;
}
