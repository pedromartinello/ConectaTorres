# Changelog

## v0.6.0

- Adiciona módulo de orçamentos vinculado às solicitações.
- Cliente pode aceitar ou recusar propostas.
- Prestador pode criar, revisar, reenviar e cancelar orçamento.
- Adiciona histórico cronológico do atendimento e da negociação.
- Adiciona notificações e métricas de orçamento no painel.
- Integra Agenda e Orçamentos com navegação direta.
- Amplia o assistente de IA com orientação em linguagem simples e próximos passos.
- Faixa de valores da IA passa a vir apenas de preços de referência reais cadastrados no PostgreSQL.
- Modelo de exemplo da IA atualizado para `gpt-5.6-terra`.

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
## v0.7.0

- Confirmação de e-mail para novas contas.
- Reenvio de link de confirmação.
- Nova confirmação ao alterar o endereço de e-mail.
- Login bloqueado para novas contas pendentes de confirmação.
- E-mails automáticos para solicitação, definição/alteração de período, atualização do agendamento, orçamento, resposta de orçamento e conclusão.
- Versionamento de revisões de orçamento.
- Melhorias visuais na linha do tempo do atendimento.
- Admin passa a visualizar o estado de verificação do e-mail.
