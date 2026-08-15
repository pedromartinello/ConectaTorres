import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao.jsx';
import { Cabecalho } from './componentes/Cabecalho.jsx';
import { RotaProtegida } from './componentes/RotaProtegida.jsx';
import { Inicio } from './paginas/Inicio.jsx';
import { Entrar } from './paginas/Entrar.jsx';
import { Cadastro } from './paginas/Cadastro.jsx';
import { Prestadores } from './paginas/Prestadores.jsx';
import { PrestadorDetalhe } from './paginas/PrestadorDetalhe.jsx';
import { Painel } from './paginas/Painel.jsx';
import { NaoEncontrado } from './paginas/NaoEncontrado.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ProvedorAutenticacao>
        <Cabecalho />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/prestadores" element={<Prestadores />} />
          <Route path="/prestadores/:id" element={<PrestadorDetalhe />} />
          <Route path="/painel" element={<RotaProtegida><Painel /></RotaProtegida>} />
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </ProvedorAutenticacao>
    </BrowserRouter>
  );
}
