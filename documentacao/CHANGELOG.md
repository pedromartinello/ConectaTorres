# Changelog

## v0.9.0

- Adiciona envio de e-mail em produção pela API HTTPS da Brevo.
- Mantém SMTP/Nodemailer como fallback local ou para ambientes que liberem SMTP.
- Endpoint `/api/saude` informa o provedor de e-mail ativo.
- Exige JWT mais forte e HTTPS no frontend em produção.
- Reforça requisito mínimo da senha administrativa em produção.
- Adiciona rate limit geral da API e reduz limites de rotas sensíveis.
- Melhora resposta para origens bloqueadas pelo CORS.
- Adiciona mecanismo versionado de migrations.
- Adiciona índices para tokens de confirmação e recuperação.
- Atualiza documentação de produção e testes finais.

## v0.8.0

- Suporte a `DATABASE_URL` para PostgreSQL em nuvem.
- Suporte automático à variável `PORT` do provedor.
- CORS com múltiplas origens configuráveis.
- Cookies ajustáveis para hospedagem em domínios diferentes.
- Diretório configurável para uploads persistentes.
- Encerramento gracioso do servidor.
- Pool de conexões do Sequelize para produção.
- Configuração Vercel para SPA/React Router.
- Deploy validado em Vercel + Railway.

## v0.7.0

- Verificação de e-mail no cadastro.
- Reenvio de confirmação.
- E-mails automáticos para eventos importantes.
- Revisões/versionamento de orçamento.
- Histórico de atendimento aprimorado.

## v0.6.0

- Adiciona módulo de orçamentos vinculado às solicitações.
- Cliente pode aceitar ou recusar propostas.
- Prestador pode criar, revisar, reenviar e cancelar orçamento.
- Adiciona histórico cronológico do atendimento e da negociação.
- Adiciona notificações e métricas de orçamento no painel.
- Amplia o assistente de IA com orientação em linguagem simples.

## v0.5.0

- Busca inteligente integrada à OpenAI Responses API.
- Structured Outputs para restringir a interpretação às categorias cadastradas.
- Sugestão de descrição profissional com IA.
- Recuperação de senha por e-mail real via SMTP/Nodemailer.
- Status das integrações no endpoint `/api/saude`.

## v0.4.0

- Agenda profissional semanal e bloqueios.
- Horário de referência do cliente e período estimado do prestador.
- Recuperação de senha por token.
- Paginação e melhorias de UX/navegação.

## v0.3.0

- Perfis completos, portfólio, agenda, notificações, avaliações, favoritos, denúncias e painel administrativo.

## v0.2.0

- Base funcional com autenticação, cadastro, login, busca e estrutura inicial.
