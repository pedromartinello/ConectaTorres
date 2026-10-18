# Deploy v0.8 — Vercel + Railway

Arquitetura sugerida:

```text
Internet
  ↓
Frontend React/Vite — Vercel
  ↓ HTTPS
Backend Node/Express — Railway
  ↓ rede privada
PostgreSQL — Railway

Backend → OpenAI API
Backend → Gmail SMTP
Backend → Volume persistente para uploads
```

## 1. Antes de publicar

Confirme localmente:

```powershell
cd backend
npm run verificar
```

```powershell
cd frontend
npm run build
```

Confirme também que `backend/.env` não aparece em `git status`.

## 2. PostgreSQL no Railway

Crie um projeto no Railway e adicione um serviço PostgreSQL.

Mantenha o banco privado dentro do projeto. O backend deve usar a variável de conexão do próprio serviço PostgreSQL.

No backend, configure:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
BANCO_SSL=false
```

O nome `Postgres` na referência precisa corresponder ao nome do serviço criado no Railway.

## 3. Backend no Railway

Adicione um serviço a partir do repositório GitHub `ConectaTorres`.

Nas configurações do serviço:

```text
Root Directory: /backend
Start Command: npm start
Healthcheck Path: /api/saude
```

O Railway fornece `PORT` automaticamente. Não é necessário definir `PORTA` em produção.

### Variáveis do backend

Exemplo de produção:

```env
NODE_ENV=production
FRONTEND_URL=https://SEU-FRONTEND.vercel.app
FUSO_HORARIO=America/Sao_Paulo

DATABASE_URL=${{Postgres.DATABASE_URL}}
BANCO_SSL=false

JWT_SEGREDO=UMA_CHAVE_REAL_FORTE
JWT_EXPIRACAO=8h
COOKIE_SAMESITE=none
COOKIE_DOMINIO=

UPLOAD_DIRETORIO=/dados/uploads

ADMIN_NOME=Administrador ConectaTorres
ADMIN_EMAIL=SEU_EMAIL_ADMIN
ADMIN_SENHA=UMA_SENHA_REAL_FORTE

RECUPERACAO_SENHA_MINUTOS=30
RECUPERACAO_EXIBIR_LINK=false
CONFIRMACAO_EMAIL_HORAS=24

SMTP_HOST=smtp.gmail.com
SMTP_PORTA=465
SMTP_SEGURO=true
SMTP_USUARIO=conectatorresadm@gmail.com
SMTP_SENHA=SENHA_DE_APP_DO_GOOGLE
EMAIL_REMETENTE_NOME=ConectaTorres
EMAIL_REMETENTE=conectatorresadm@gmail.com

IA_HABILITADA=true
OPENAI_API_KEY=SUA_CHAVE_REAL
OPENAI_MODELO=gpt-5.6-terra
```

Nunca coloque esses valores reais no GitHub.

## 4. Uploads persistentes

O filesystem comum do container não deve ser tratado como armazenamento permanente.

Crie um Volume no serviço do backend e monte em:

```text
/dados
```

Depois mantenha:

```env
UPLOAD_DIRETORIO=/dados/uploads
```

Assim fotos de perfil e portfólio sobrevivem aos redeploys do backend.

## 5. Gere o domínio do backend

No serviço do backend, abra Networking e gere um domínio público.

Teste:

```text
https://SEU-BACKEND.up.railway.app/api/saude
```

A resposta deve indicar `versao: 0.8.0` e `ambiente: production`.

## 6. Frontend na Vercel

Importe o mesmo repositório do GitHub na Vercel.

Configure:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Cadastre a variável:

```env
VITE_API_URL=https://SEU-BACKEND.up.railway.app/api
```

Depois faça o deploy.

O arquivo `frontend/vercel.json` já contém o fallback necessário para rotas do React Router. Assim URLs como `/painel/agenda` continuam abrindo mesmo após atualizar a página.

## 7. Volte ao Railway e configure a URL final do frontend

Depois que a Vercel gerar a URL de produção, atualize no backend:

```env
FRONTEND_URL=https://SEU-FRONTEND.vercel.app
```

Se precisar autorizar outra URL exata, por exemplo uma URL de teste:

```env
FRONTEND_URLS_ADICIONAIS=https://outra-url.vercel.app
```

Faça novo deploy do backend após alterar as variáveis.

## 8. Cookies entre Vercel e Railway

Enquanto frontend e backend estiverem em domínios diferentes (`vercel.app` e `railway.app`), mantenha:

```env
COOKIE_SAMESITE=none
```

Em produção o cookie é automaticamente marcado como `Secure`.

Se futuramente usar domínios próprios no mesmo site, por exemplo:

```text
https://conectatorres.com.br
https://api.conectatorres.com.br
```

pode ser usado `COOKIE_SAMESITE=lax`.

## 9. Teste de produção

Teste na ordem:

1. Página inicial abre.
2. Cadastro envia confirmação de e-mail.
3. Confirmação abre a URL publicada, não localhost.
4. Login mantém a sessão após atualizar a página.
5. Upload de foto funciona.
6. Foto continua existindo após redeploy do backend.
7. Busca e filtros funcionam.
8. IA responde.
9. Agenda e bloqueios funcionam.
10. Solicitação e orçamento funcionam.
11. E-mails de eventos apontam para a URL publicada.
12. Recuperação de senha funciona sem exibir link local.
13. Admin consegue entrar e acessar moderação.

## 10. Desenvolvimento local continua independente

O `.env` local continua usando Docker/PostgreSQL local. As variáveis de produção ficam cadastradas no Railway e na Vercel, e não precisam ser copiadas para o arquivo local.
