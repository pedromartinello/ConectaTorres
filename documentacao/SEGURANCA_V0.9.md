# Revisão de segurança — v0.9

## Controles mantidos

- bcrypt com custo 12 para senhas;
- JWT em cookie HTTP-only;
- cookie `secure` em produção;
- SameSite configurável para Vercel + Railway;
- Helmet;
- CORS com lista explícita de origens;
- validação de entrada com `express-validator`;
- autorização por perfil e propriedade dos dados;
- limite de 1 MB para JSON/formulários;
- uploads limitados a 5 MB e somente JPG/PNG/WEBP;
- tokens de recuperação e confirmação persistidos somente como SHA-256;
- respostas genéricas em recuperação de senha para reduzir enumeração de contas;
- chave OpenAI somente no backend.

## Mudanças da v0.9

### JWT em produção

`JWT_SEGREDO` passa a exigir pelo menos 48 caracteres quando `NODE_ENV=production`.

### Senha administrativa

Se `ADMIN_SENHA` estiver definida em produção, deve possuir pelo menos 12 caracteres.

### HTTPS obrigatório no frontend de produção

`FRONTEND_URL` precisa começar com `https://` em produção.

### Rate limiting

- limite geral da API: 500 requisições por 15 minutos por IP;
- autenticação: 20 por 15 minutos;
- confirmação e recuperação: 6 por 15 minutos;
- IA continua com limite dedicado.

### CORS

Origem não autorizada passa a responder como 403, sem executar a rota de negócio.

### Migrations

A aplicação agora mantém `migracoes_conectatorres` para mudanças incrementais de banco. A primeira migration cria índices para busca dos tokens de segurança.

## Antes da v1.0

- manter todos os segredos somente em Railway/Vercel;
- rotacionar qualquer chave que tenha sido exibida em print, chat ou commit;
- conferir `.gitignore` antes do push;
- manter `RECUPERACAO_EXIBIR_LINK=false` em produção;
- manter `COOKIE_SAMESITE=none` enquanto Vercel e Railway estiverem em domínios diferentes;
- usar domínio próprio e autenticação de domínio de e-mail quando disponível.
