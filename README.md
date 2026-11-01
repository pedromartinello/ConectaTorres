# ConectaTorres

Plataforma web para conexão entre clientes e prestadores de serviços locais em Torres/RS e região.

## Versão atual

**v0.9.0 — fechamento de produção, e-mail por API HTTPS, segurança e migrations**

O projeto está preparado para funcionar em dois ambientes:

- desenvolvimento local com React/Vite, Node/Express e PostgreSQL via Docker;
- produção com frontend na Vercel, backend e PostgreSQL no Railway e uploads em volume persistente.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: PostgreSQL + Sequelize
- Autenticação: JWT em cookie HTTP-only + bcrypt
- IA: OpenAI API
- E-mail em produção: Brevo API HTTPS
- E-mail local opcional: SMTP/Nodemailer
- Hospedagem: Vercel + Railway

## Funcionalidades principais

- cadastro e autenticação de clientes e prestadores;
- confirmação de e-mail e recuperação de senha;
- perfis, foto e portfólio;
- serviços, categorias, busca e favoritos;
- agenda semanal, bloqueios e solicitações;
- orçamentos com revisão, aceite e recusa;
- histórico do atendimento;
- notificações internas e por e-mail;
- conclusão de serviços e avaliações;
- denúncias e painel administrativo;
- assistente de IA para interpretar necessidades e melhorar descrição profissional;
- deploy em produção com banco e uploads persistentes.

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

### Banco

```bash
docker compose up -d banco
```

### Backend

```bash
cd backend
npm install
npm run dev
```

API local: `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local: `http://localhost:5173`

## Produção

Arquitetura utilizada:

```text
Vercel (React/Vite)
        ↓ HTTPS
Railway (Node/Express)
        ↓
Railway PostgreSQL
        ↓
Volume persistente /dados/uploads
```

E-mails em produção são enviados por API HTTPS da Brevo, evitando dependência de SMTP no Railway Free/Trial/Hobby.

Consulte:

- `documentacao/EMAIL_BREVO_RAILWAY_V0.9.md`
- `documentacao/SEGURANCA_V0.9.md`
- `documentacao/TESTES_V0.9.md`

## Segurança

A aplicação utiliza:

- senhas com bcrypt;
- JWT em cookie HTTP-only e `secure` em produção;
- CORS restrito às URLs configuradas;
- Helmet;
- rate limit global e limites mais restritos para autenticação, recuperação e IA;
- validação de entrada com `express-validator`;
- limite de tamanho de JSON e uploads;
- tokens de confirmação e recuperação armazenados somente como hash;
- controle de acesso por perfil;
- segredos apenas por variáveis de ambiente;
- JWT com tamanho mínimo obrigatório em produção;
- migrations versionadas para alterações de banco.

## Git

Nunca envie `.env`, chaves de API, senhas, `node_modules` ou uploads para o repositório.

Após validar a v0.9:

```bash
git add .
git commit -m "feat: finaliza v0.9 com email em producao, seguranca e migrations"
git push
git tag -a v0.9 -m "ConectaTorres v0.9 - email, seguranca e preparacao final"
git push origin v0.9
```
