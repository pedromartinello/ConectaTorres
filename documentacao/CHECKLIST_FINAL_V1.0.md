# Checklist Final — ConectaTorres v1.0

## Local

- [ ] `docker compose up -d banco`
- [ ] backend inicia sem erro
- [ ] `npm run verificar` passa no backend
- [ ] frontend inicia sem erro
- [ ] login e logout funcionam
- [ ] cliente e prestador conseguem acessar seus painéis

## Produção

- [ ] `/api/saude` retorna `versao: 1.0.0`
- [ ] `ia: true`
- [ ] `email: true`
- [ ] `emailProvedor: brevo`
- [ ] cadastro envia confirmação de e-mail
- [ ] recuperação de senha envia e-mail
- [ ] upload de foto persiste após redeploy
- [ ] cliente consegue solicitar serviço
- [ ] prestador consegue enviar orçamento
- [ ] cliente consegue aceitar/recusar orçamento
- [ ] prestador consegue concluir atendimento
- [ ] cliente consegue avaliar
- [ ] notificações funcionam
- [ ] painel administrativo abre com a conta de admin

## Segurança e configuração

- [ ] `.env` não está no Git
- [ ] `JWT_SEGREDO` de produção possui 48+ caracteres
- [ ] senha administrativa de produção é exclusiva e forte
- [ ] `FRONTEND_URL` usa HTTPS
- [ ] `COOKIE_SAMESITE=none` no cenário Vercel + Railway
- [ ] `DATABASE_URL` é variável de referência do PostgreSQL
- [ ] `UPLOAD_DIRETORIO=/dados/uploads`
- [ ] chaves OpenAI/Brevo estão somente nas Variables do Railway
- [ ] credenciais expostas em testes anteriores foram rotacionadas

## Git

- [ ] `git status` revisado
- [ ] commit final criado
- [ ] `git push` concluído
- [ ] deploy automático Vercel/Railway concluído
- [ ] tag `v1.0` criada e enviada
