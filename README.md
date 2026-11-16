# ConectaTorres

Plataforma web para conexão entre clientes e prestadores de serviços locais em Torres/RS e região.

## Versão final

**v1.0.0 — versão final do Projeto Tecnológico / PDS**

A aplicação está publicada e validada em produção, com frontend, API, banco de dados, armazenamento persistente, inteligência artificial e envio de e-mails transacionais.

### Ambiente publicado

- Frontend: `https://conecta-torres.vercel.app`
- API: `https://conectatorres-production.up.railway.app`
- Saúde da API: `https://conectatorres-production.up.railway.app/api/saude`

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: PostgreSQL + Sequelize
- Autenticação: JWT em cookie HTTP-only + bcrypt
- IA: OpenAI API
- E-mail em produção: Brevo API HTTPS
- E-mail local opcional: SMTP/Nodemailer
- Hospedagem: Vercel + Railway
- Armazenamento de imagens: volume persistente no Railway

## Funcionalidades principais

- cadastro e autenticação de clientes e prestadores;
- confirmação de e-mail e recuperação de senha;
- perfis, foto e portfólio;
- serviços, categorias, busca e favoritos;
- agenda semanal, bloqueios e solicitações;
- orçamentos com revisão, aceite e recusa;
- histórico cronológico do atendimento;
- notificações internas e por e-mail;
- conclusão de serviços e avaliações;
- denúncias e painel administrativo;
- assistente de IA para interpretar necessidades e auxiliar o prestador na descrição profissional;
- deploy em produção com PostgreSQL e uploads persistentes.

## Arquitetura de produção

```text
Usuário
   ↓ HTTPS
Vercel — React/Vite
   ↓ HTTPS / API REST
Railway — Node.js/Express
   ├── PostgreSQL
   ├── Volume /dados/uploads
   ├── OpenAI API
   └── Brevo API HTTPS
```

A IA é utilizada para interpretação e orientação. Dados objetivos como profissionais, avaliações, agenda, serviços e valores cadastrados são obtidos do PostgreSQL da própria plataforma.

## Estrutura

```text
ConectaTorres/
├── backend/
│   ├── src/
│   │   ├── configuracao/
│   │   ├── controladores/
│   │   ├── intermediarios/
│   │   ├── migracoes/
│   │   ├── modelos/
│   │   ├── rotas/
│   │   ├── sementes/
│   │   ├── servicos/
│   │   └── utilitarios/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── documentacao/
├── docker-compose.yml
└── README.md
```

## Execução local

### 1. Banco

```bash
docker compose up -d banco
```

### 2. Backend

Copie `backend/.env.exemplo` para `backend/.env` e configure apenas os valores locais e segredos necessários.

```bash
cd backend
npm install
npm run verificar
npm run dev
```

API local: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`

## Produção

### Vercel

- Root Directory: `frontend`
- Framework: Vite
- variável principal: `VITE_API_URL=https://conectatorres-production.up.railway.app/api`

### Railway

- Root Directory: `/backend`
- PostgreSQL por `DATABASE_URL`;
- volume montado em `/dados`;
- `UPLOAD_DIRETORIO=/dados/uploads`;
- `FRONTEND_URL=https://conecta-torres.vercel.app`;
- segredos configurados somente nas Variables do serviço.

## Segurança

A versão final utiliza:

- senhas com bcrypt;
- JWT em cookie HTTP-only e `secure` em produção;
- validade do cookie sincronizada com `JWT_EXPIRACAO`;
- CORS restrito às URLs configuradas;
- Helmet;
- rate limit geral e limites específicos para autenticação, recuperação e IA;
- validação de entrada com `express-validator`;
- limite de tamanho de JSON e uploads;
- tokens de confirmação e recuperação armazenados como hash;
- controle de acesso por perfil;
- segredos apenas por variáveis de ambiente;
- JWT com tamanho mínimo obrigatório em produção;
- migrations versionadas para alterações de banco.

## Documentação final

Consulte principalmente:

- `documentacao/ENTREGA_V1.0.md`
- `documentacao/CHECKLIST_FINAL_V1.0.md`
- `documentacao/RESUMO_TECNICO_V1.0.md`
- `documentacao/COMANDOS_GIT_V1.0.md`
- `documentacao/CHANGELOG.md`

## Git — fechamento da v1.0

Após validar localmente e em produção:

```bash
git status
git add .
git commit -m "release: finaliza ConectaTorres v1.0"
git push
git tag -a v1.0 -m "ConectaTorres v1.0 - versao final do projeto"
git push origin v1.0
```

Nunca envie `.env`, chaves de API, senhas, `node_modules` ou uploads de usuários ao repositório.
