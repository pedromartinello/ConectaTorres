import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao.jsx';
import { ProvedorNotificacoes } from './contextos/ContextoNotificacoes.jsx';
import { Cabecalho } from './componentes/Cabecalho.jsx';
import { RotaProtegida } from './componentes/RotaProtegida.jsx';
import { LayoutPainel } from './componentes/LayoutPainel.jsx';
import { Inicio } from './paginas/Inicio.jsx';
import { Entrar } from './paginas/Entrar.jsx';
import { Cadastro } from './paginas/Cadastro.jsx';
import { Prestadores } from './paginas/Prestadores.jsx';
import { PrestadorDetalhe } from './paginas/PrestadorDetalhe.jsx';
import { PainelInicio } from './paginas/PainelInicio.jsx';
import { MeuPerfil } from './paginas/MeuPerfil.jsx';
import { PerfilProfissional } from './paginas/PerfilProfissional.jsx';
import { MeusServicos } from './paginas/MeusServicos.jsx';
import { MinhaAgenda } from './paginas/MinhaAgenda.jsx';
import { MeusFavoritos } from './paginas/MeusFavoritos.jsx';
import { Avaliacoes } from './paginas/Avaliacoes.jsx';
import { Notificacoes } from './paginas/Notificacoes.jsx';
import { Administracao } from './paginas/Administracao.jsx';
import { NaoEncontrado } from './paginas/NaoEncontrado.jsx';

export default function App() {
  return <BrowserRouter><ProvedorAutenticacao><ProvedorNotificacoes><Cabecalho/><Routes><Route path="/" element={<Inicio/>}/><Route path="/entrar" element={<Entrar/>}/><Route path="/cadastro" element={<Cadastro/>}/><Route path="/prestadores" element={<Prestadores/>}/><Route path="/prestadores/:id" element={<PrestadorDetalhe/>}/><Route path="/painel" element={<RotaProtegida><LayoutPainel/></RotaProtegida>}><Route index element={<PainelInicio/>}/><Route path="perfil" element={<MeuPerfil/>}/><Route path="agenda" element={<RotaProtegida tipos={['cliente','prestador']}><MinhaAgenda/></RotaProtegida>}/><Route path="favoritos" element={<RotaProtegida tipos={['cliente']}><MeusFavoritos/></RotaProtegida>}/><Route path="avaliacoes" element={<RotaProtegida tipos={['cliente','prestador']}><Avaliacoes/></RotaProtegida>}/><Route path="profissional" element={<RotaProtegida tipos={['prestador']}><PerfilProfissional/></RotaProtegida>}/><Route path="servicos" element={<RotaProtegida tipos={['prestador']}><MeusServicos/></RotaProtegida>}/><Route path="notificacoes" element={<Notificacoes/>}/><Route path="admin" element={<RotaProtegida tipos={['admin']}><Administracao/></RotaProtegida>}/></Route><Route path="*" element={<NaoEncontrado/>}/></Routes></ProvedorNotificacoes></ProvedorAutenticacao></BrowserRouter>;
}
