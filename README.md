# ConectaTorres

Projeto de PDS para conexão entre clientes e prestadores de serviços locais em Torres/RS e região.

Versão atual: **0.7.0 - comunicação, confiança, verificação de e-mail e refinamento do fluxo comercial**.

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
- Confirmação do e-mail por link temporário.
- Reenvio de confirmação quando o link expira.
- Login bloqueado para novas contas com e-mail ainda não confirmado.
- Senhas com hash bcrypt.
- JWT em cookie HTTP-only.
- Rate limit, Helmet, CORS e validação de entrada.
- Alteração de dados pessoais e senha.
- Se o e-mail da conta for alterado, o novo endereço precisa ser confirmado.
- Foto de perfil.
- Recuperação de senha com token temporário e envio real por e-mail via SMTP.

### Cliente
- Busca tradicional com filtros e paginação.
- Assistente inteligente em linguagem natural.
- Orientação simples para usuários leigos, indicação de categorias e próximos passos.
- Faixa de valores exibida somente quando há preços reais cadastrados no PostgreSQL.
- Favoritos, agenda, avaliações, denúncias e notificações.
- Recebimento, aceitação e recusa de orçamentos.
- Histórico cronológico do atendimento e da negociação.
- E-mails automáticos em eventos relevantes.

### Prestador
- Perfil profissional e portfólio.
- Serviços e agenda semanal com bloqueios por data.
- Gestão de solicitações e atendimentos.
- Definição de período previsto antes de confirmar o atendimento.
- Criação, revisão, reenvio e cancelamento de orçamentos.
- Versionamento simples de orçamento: cada reenvio incrementa a versão da proposta.
- Valor, descrição, materiais inclusos, validade e observações.
- E-mails automáticos quando recebe solicitações ou quando o cliente responde um orçamento.
- Sugestão de descrição profissional com IA, sempre sujeita à revisão antes de salvar.

### Administrador
- Gestão de usuários, categorias, denúncias e avaliações.
- Visualização do estado de verificação de e-mail dos usuários.
- Conta administrativa sem cadastro público.

## Fluxo comercial da v0.7

```text
Cliente solicita atendimento
        ↓
Prestador recebe notificação + e-mail
        ↓
Prestador define o período previsto
        ↓
Cliente recebe notificação + e-mail
        ↓
Prestador envia orçamento
        ↓
Cliente recebe notificação + e-mail
        ↓
Aceita ou recusa a proposta
        ↓
Prestador recebe notificação + e-mail
        ↓
Se necessário, prestador revisa e reenvia uma nova versão
        ↓
Atendimento é confirmado
        ↓
Prestador conclui
        ↓
Cliente recebe aviso e pode avaliar
```

O orçamento continua opcional: atendimentos simples podem usar somente o fluxo de agenda.

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

A v0.7 acrescenta a configuração opcional:

```env
CONFIRMACAO_EMAIL_HORAS=24
```

Se ela não for definida, o sistema usa 24 horas por padrão.

Configuração da IA:

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
