# Checklist de produção — v0.8

## Segurança

- [ ] `NODE_ENV=production`.
- [ ] `JWT_SEGREDO` forte e exclusivo da produção.
- [ ] Senha administrativa forte.
- [ ] `RECUPERACAO_EXIBIR_LINK=false`.
- [ ] Chave da OpenAI somente no backend.
- [ ] Senha de app do Gmail somente no backend.
- [ ] `.env` não versionado.
- [ ] CORS liberado somente para URLs conhecidas.

## Banco

- [ ] PostgreSQL criado no Railway.
- [ ] `DATABASE_URL` referenciando o serviço PostgreSQL.
- [ ] Banco não exposto publicamente sem necessidade.

## Uploads

- [ ] Volume persistente montado no backend.
- [ ] `UPLOAD_DIRETORIO=/dados/uploads`.
- [ ] Foto permanece após reiniciar/redeployar o serviço.

## Frontend

- [ ] Root Directory `frontend` na Vercel.
- [ ] `VITE_API_URL` aponta para o backend publicado.
- [ ] Atualização direta de rotas não gera 404.

## Backend

- [ ] Root Directory `/backend` no Railway.
- [ ] `/api/saude` retorna HTTP 200.
- [ ] E-mails usam a URL pública do frontend.
- [ ] Cookies persistem após recarregar o navegador.

## Fluxos críticos

- [ ] cadastro + confirmação de e-mail;
- [ ] login/logout;
- [ ] esqueci minha senha;
- [ ] cliente/prestador/admin;
- [ ] foto de perfil e portfólio;
- [ ] agenda semanal e bloqueios;
- [ ] solicitação;
- [ ] orçamento e revisão;
- [ ] notificações e e-mails;
- [ ] avaliações e denúncias;
- [ ] IA.
