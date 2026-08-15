# ConectaTorres

Projeto de PDS para conexao entre clientes e prestadores de servicos locais em Torres/RS e regiao.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco de dados: PostgreSQL
- ORM: Sequelize
- Autenticacao: JWT em cookie HTTP-only + bcrypt

## Estrutura

```text
ConectaTorres/
├── backend/
│   ├── src/
│   │   ├── configuracao/
│   │   ├── controladores/
│   │   ├── intermediarios/
│   │   ├── modelos/
│   │   ├── rotas/
│   │   ├── sementes/
│   │   └── utilitarios/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   ├── contextos/
│   │   ├── estilos/
│   │   ├── paginas/
│   │   └── servicos/
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Primeira execucao

### 1. Banco PostgreSQL

Opcao simples com Docker:

```bash
docker compose up -d banco
```

Se voce ja possui PostgreSQL instalado, crie um banco chamado `conectatorres` e ajuste o arquivo `.env`.

### 2. Backend

```bash
cd backend
cp .env.exemplo .env
npm install
npm run dev
```

Por padrao, a API roda em `http://localhost:3001`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
cp .env.exemplo .env
npm install
npm run dev
```

Por padrao, o frontend roda em `http://localhost:5173`.

## Rotas principais da API

### Sistema
- `GET /api/saude`

### Autenticacao
- `POST /api/autenticacao/cadastro`
- `POST /api/autenticacao/login`
- `POST /api/autenticacao/logout`
- `GET /api/autenticacao/eu`

### Prestadores
- `GET /api/prestadores`
- `GET /api/prestadores/:id`
- `PUT /api/prestadores/meu-perfil`

### Categorias
- `GET /api/categorias`
- `POST /api/categorias` (admin)

### Servicos
- `GET /api/servicos`
- `GET /api/servicos/:id`
- `POST /api/servicos` (prestador)
- `PUT /api/servicos/:id` (prestador dono)
- `DELETE /api/servicos/:id` (prestador dono)

### Disponibilidade
- `GET /api/disponibilidades/prestador/:prestadorId`
- `POST /api/disponibilidades` (prestador)
- `DELETE /api/disponibilidades/:id` (prestador dono)

### Agendamentos
- `GET /api/agendamentos` (autenticado)
- `POST /api/agendamentos` (cliente)
- `PATCH /api/agendamentos/:id/status` (cliente/prestador, conforme regra)

### Avaliacoes
- `GET /api/avaliacoes/prestador/:prestadorId`
- `POST /api/avaliacoes` (cliente)

### Favoritos
- `GET /api/favoritos` (cliente)
- `POST /api/favoritos/:prestadorId` (cliente)
- `DELETE /api/favoritos/:prestadorId` (cliente)

### Administracao
- `GET /api/admin/usuarios` (admin)
- `PATCH /api/admin/usuarios/:id/ativo` (admin)

## Seguranca implementada na base

- Senhas armazenadas somente como hash bcrypt.
- JWT salvo em cookie HTTP-only.
- Rate limit nas rotas de autenticacao.
- Helmet para cabecalhos HTTP de seguranca.
- CORS restrito ao frontend configurado.
- Validacao de entrada com `express-validator`.
- Controle de acesso por perfil: `cliente`, `prestador` e `admin`.
- Usuario nao pode se cadastrar como administrador pela rota publica.
- Regras de propriedade para servicos, disponibilidades e agendamentos.

## Sobre a LLM

A integracao com IA foi deixada para uma etapa posterior. A estrutura foi preparada para adicionar um modulo de integracao sem misturar IA com as regras centrais da aplicacao.

Sugestao de futura pasta:

```text
backend/src/integracoes/llm/
```

O fluxo recomendado e: texto do usuario -> LLM interpreta categorias/filtros -> backend valida -> PostgreSQL retorna prestadores reais.

## Git

Depois de revisar os arquivos:

```bash
git init
git add .
git commit -m "chore: estrutura inicial do ConectaTorres"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Nunca envie os arquivos `.env` para o repositorio.
