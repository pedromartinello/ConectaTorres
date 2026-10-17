# ConectaTorres

Projeto de PDS para conexão entre clientes e prestadores de serviços locais em Torres/RS e região.

Versão atual: **0.6.0 - orçamentos, fluxo comercial, histórico do atendimento e IA consultiva**.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: PostgreSQL
- ORM: Sequelize
- Autenticação: JWT em cookie HTTP-only + bcrypt
- Upload de imagens: Multer
- E-mail: Nodemailer + SMTP
- IA: OpenAI Responses API com saída estruturada
- Banco local recomendado: Docker Compose

## O que está implementado

### Conta e segurança
- Cadastro de cliente e prestador.
- Login e logout.
- Senhas com hash bcrypt.
- JWT em cookie HTTP-only.
- Rate limit, Helmet, CORS e validação de entrada.
- Alteração de dados pessoais e senha.
- Foto de perfil.
- Recuperação de senha com token temporário e envio real por e-mail via SMTP.

### Cliente
- Busca tradicional com filtros e paginação.
- Assistente inteligente em linguagem natural.
- Orientação simples para usuários leigos, indicação de categorias e próximos passos.
- Faixa de valores exibida somente quando há preços de referência reais cadastrados no PostgreSQL.
- Favoritos, agenda, avaliações, denúncias e notificações.
- Recebimento, aceitação e recusa de orçamentos.
- Histórico do atendimento e da negociação.

### Prestador
- Perfil profissional e portfólio.
- Serviços e agenda semanal com bloqueios por data.
- Gestão de solicitações e atendimentos.
- Definição de período previsto antes de confirmar o atendimento.
- Criação, revisão, reenvio e cancelamento de orçamentos.
- Valor, descrição, materiais inclusos, validade e observações no orçamento.
- Sugestão de descrição profissional com IA, sempre sujeita à revisão antes de salvar.

### Administrador
- Gestão de usuários, categorias, denúncias e avaliações.
- Conta administrativa sem cadastro público.

## Fluxo comercial da v0.6

```text
Cliente solicita atendimento
        ↓
Prestador define o período previsto
        ↓
Prestador pode enviar orçamento
        ↓
Cliente recebe notificação
        ↓
Aceita ou recusa a proposta
        ↓
Se aceitar, a solicitação pendente é confirmada
        ↓
Prestador executa e conclui o atendimento
        ↓
Cliente pode avaliar
```

O orçamento é opcional: atendimentos simples podem continuar usando apenas o fluxo de agenda.

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
│   │   ├── servicos/
│   │   └── utilitarios/
│   ├── uploads/              # ignorado pelo Git
│   ├── .env.exemplo
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   ├── contextos/
│   │   ├── estilos/
│   │   ├── paginas/
│   │   ├── servicos/
│   │   └── utilitarios/
│   └── package.json
├── documentacao/
├── docker-compose.yml
└── README.md
```

## Execução local

### Terminal 1 - PostgreSQL

```powershell
docker compose up -d banco
```

### Terminal 2 - Backend

```powershell
cd backend
npm install
npm run dev
```

API: `http://localhost:3001`

Saúde: `http://localhost:3001/api/saude`

### Terminal 3 - Frontend

```powershell
cd frontend
npm install
npm run dev
```

Site: `http://localhost:5173`

## Variáveis de ambiente

Copie `backend/.env.exemplo` para `backend/.env` e mantenha as credenciais reais somente no `.env`.

A configuração de IA recomendada para o projeto é:

```env
IA_HABILITADA=true
OPENAI_API_KEY=sua_chave_real
OPENAI_MODELO=gpt-5.6-terra
```

Nunca envie `OPENAI_API_KEY`, `SMTP_SENHA`, `JWT_SEGREDO`, senha real do administrador ou senha real do banco para o GitHub.

## Como a IA funciona

```text
texto do cliente
  -> backend envia a necessidade + catálogo de categorias
  -> LLM devolve orientação + categorias estruturadas
  -> backend valida as categorias
  -> backend calcula eventual faixa de valores usando somente dados reais cadastrados
  -> busca normal consulta PostgreSQL
  -> frontend exibe prestadores reais
```

A IA não inventa prestadores, avaliações, disponibilidade ou preço de mercado.

## Verificação

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

Nunca envie `.env`, `node_modules` ou `backend/uploads` para o repositório.
