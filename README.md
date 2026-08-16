# ConectaTorres

Projeto de PDS para conexao entre clientes e prestadores de servicos locais em Torres/RS e regiao.

Versao atual: **0.4.0 - estabilizacao, acabamento funcional e seguranca sem LLM**.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: PostgreSQL
- ORM: Sequelize
- Autenticacao: JWT em cookie HTTP-only + bcrypt
- Upload de imagens: Multer + armazenamento local no ambiente de desenvolvimento
- Banco local recomendado: Docker Compose

## O que esta implementado

### Conta e seguranca
- Cadastro de cliente e prestador.
- Login e logout.
- Senha com hash bcrypt.
- JWT em cookie HTTP-only.
- Rate limit nas rotas de autenticacao.
- Helmet, CORS e validacao de entrada.
- Alteracao de nome, e-mail e telefone.
- Alteracao de senha exigindo a senha atual.
- Botao para mostrar/ocultar senhas no frontend.
- Foto de perfil para clientes, prestadores e administradores.
- Pre-visualizacao e remocao de foto de perfil.
- Recuperacao e redefinicao de senha com token temporario.
- Fluxo de recuperacao demonstravel no ambiente local, sem depender de provedor de e-mail.

### Cliente
- Busca de prestadores.
- Filtros por categoria, cidade, preco maximo, avaliacao minima e disponibilidade por data.
- Ordenacao por avaliacao, preco e nome.
- Paginacao da listagem de prestadores.
- Perfil detalhado do prestador.
- Favoritos.
- Solicitacao de horario.
- Acompanhamento e cancelamento de agendamentos.
- Avaliacao somente de atendimento concluido.
- Denuncia de perfil ou avaliacao.
- Central de notificacoes.
- Acesso externo ao WhatsApp do prestador.

### Prestador
- Perfil profissional.
- Cidade, regiao atendida, WhatsApp, descricao e valor de referencia.
- Cadastro, edicao, ativacao e remocao de servicos.
- Portfolio com ate 12 imagens.
- Cadastro e remocao de periodos de disponibilidade.
- Aceite, recusa e cancelamento de solicitacoes.
- Ajuste de horario.
- Conclusao de atendimento.
- Visualizacao de avaliacoes recebidas.
- Central de notificacoes.

### Administrador
- Conta administrativa de desenvolvimento sem cadastro publico.
- Resumo da plataforma.
- Paginacao e filtros na gestao de usuarios, denuncias e avaliacoes.
- Ativacao/desativacao de usuarios.
- Criacao e ativacao/desativacao de categorias.
- Analise de denuncias.
- Moderacao de avaliacoes.

### Notificacoes
As notificacoes ficam persistidas no PostgreSQL. O frontend consulta periodicamente novas notificacoes e mostra a quantidade nao lida no cabecalho.

Eventos atuais:
- nova solicitacao de horario;
- aceite, recusa ou cancelamento;
- ajuste de horario;
- conclusao de atendimento;
- nova avaliacao.

## Estrutura

```text
ConectaTorres/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── configuracao/
│   │   ├── controladores/
│   │   ├── intermediarios/
│   │   ├── modelos/
│   │   ├── rotas/
│   │   ├── sementes/
│   │   └── utilitarios/
│   ├── uploads/              # criado automaticamente, ignorado pelo Git
│   ├── .env.exemplo
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   ├── contextos/
│   │   ├── estilos/
│   │   ├── paginas/
│   │   └── servicos/
│   ├── .env.exemplo
│   └── package.json
├── documentacao/
├── docker-compose.yml
└── README.md
```

## Primeira execucao com Docker

### 1. PostgreSQL

Na raiz do projeto:

```powershell
docker compose up -d banco
```

Confira:

```powershell
docker ps
```

### 2. Backend

```powershell
cd backend
Copy-Item .env.exemplo .env
npm install
npm run dev
```

API:

```text
http://localhost:3001
```

Teste:

```text
http://localhost:3001/api/saude
```

### 3. Frontend

Em outro terminal:

```powershell
cd frontend
Copy-Item .env.exemplo .env
npm install
npm run dev
```

Site:

```text
http://localhost:5173
```

## Melhorias especificas da v0.4

- Dashboard com metricas e proximos agendamentos por tipo de usuario.
- Validacoes extras para impedir disponibilidade e agendamentos com datas invalidas ou passadas.
- Conclusao de atendimento bloqueada antes do horario de inicio.
- Confirmacoes antes de acoes administrativas destrutivas.
- Estados de carregamento e botoes desabilitados durante envios importantes.
- Melhorias responsivas na paginacao e filtros administrativos.
- API de saude atualizada para `0.4.0`.

## Atualizacao a partir da versao anterior

O backend usa `sequelize.sync({ alter: true })` somente em `development`. Assim, ao iniciar esta versao, as novas colunas e tabelas sao aplicadas ao banco de desenvolvimento existente.

Antes de atualizar, e recomendavel manter uma copia do projeto anterior. Em ambiente de producao, devem ser usadas migrations em vez de `sync({ alter: true })`.

## Administrador de desenvolvimento

O arquivo `.env.exemplo` possui:

```text
ADMIN_EMAIL=admin@conectatorres.local
ADMIN_SENHA=Admin12345
```

Ao iniciar o backend, essa conta e criada automaticamente se ainda nao existir. Altere os dados no `.env` antes de qualquer demonstracao publica ou deploy.

### Recuperacao de senha em desenvolvimento

Na v0.4, a recuperacao de senha funciona integralmente com token temporario. Como o projeto academico ainda nao possui servico de e-mail configurado, o backend pode retornar o link de redefinicao apenas em `development`. Esse comportamento e controlado por `RECUPERACAO_EXIBIR_LINK=true`. Em producao, o link nao deve ser retornado pela API; deve ser enviado por um provedor de e-mail.

## Uploads

Fotos e portfolio ficam em `backend/uploads/` durante o desenvolvimento. Essa pasta nao vai para o Git.

Em um deploy real, o recomendado e migrar os arquivos para armazenamento de objetos, mantendo no PostgreSQL apenas a URL.

## Verificacao

Backend:

```powershell
cd backend
npm run verificar
```

Frontend:

```powershell
cd frontend
npm run build
```

## Git

```powershell
git init
git add .
git commit -m "feat: fluxo principal do ConectaTorres"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

Nunca envie `.env`, `node_modules` ou `backend/uploads` para o repositorio.

## LLM

A LLM permanece propositalmente fora desta versao. O fluxo principal da plataforma funciona sem IA.

Quando a aplicacao estiver validada, a integracao deve entrar em:

```text
backend/src/integracoes/llm/
```

Fluxo planejado:

```text
texto do cliente -> LLM interpreta necessidade -> categorias/filtros estruturados -> backend valida -> PostgreSQL retorna prestadores reais
```

A LLM nao deve inventar prestadores, precos, agenda ou avaliacoes.
