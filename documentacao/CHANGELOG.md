# Changelog

## v0.5.0

- Busca inteligente em linguagem natural integrada à OpenAI Responses API.
- Structured Outputs para restringir a interpretação às categorias cadastradas.
- Resultados continuam vindo do banco PostgreSQL, sem profissionais inventados pela IA.
- Sugestão de descrição profissional com IA, sujeita à revisão do prestador.
- Recuperação de senha por e-mail real via SMTP/Nodemailer.
- Fallback de desenvolvimento quando SMTP não estiver configurado.
- Status das integrações no endpoint `/api/saude`.
- Rate limit dedicado às chamadas de IA.

## v0.4.0

### Adicionado
- Recuperacao de senha com token temporario e expiracao.
- Paginas "Esqueci minha senha" e "Redefinir senha".
- Paginacao de prestadores.
- Paginacao e filtros administrativos.
- Endpoint de resumo do painel autenticado.
- Metricas e proximos agendamentos no dashboard.
- Preview local de foto antes do envio.

### Melhorado
- Validacoes de datas e horarios.
- Mensagens e estados de carregamento.
- Confirmacoes antes de acoes administrativas destrutivas.
- Responsividade da paginacao e filtros.
- Documentacao de atualizacao e testes.

### Mantido fora do escopo
- Integracao com LLM.
- Envio real de e-mail. No ambiente academico local, a API pode exibir o link de recuperacao para permitir demonstracao do fluxo.

## v0.3.0
- Perfis completos, portfolio, agenda, notificacoes, avaliacoes, favoritos, denuncias e painel administrativo.

## v0.2.0
- Base funcional com autenticacao, cadastro, login, busca e estrutura inicial da aplicacao.