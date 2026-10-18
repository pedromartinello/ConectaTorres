# Atualização v0.6 -> v0.7

## Objetivo

A v0.7 melhora comunicação, confiança e acompanhamento do fluxo comercial sem alterar o núcleo do ConectaTorres.

## Novidades

- Verificação de e-mail em novos cadastros.
- Reenvio de link de confirmação.
- Alteração do e-mail exige nova confirmação.
- E-mails automáticos para eventos importantes de agenda e orçamento.
- Orçamentos passam a ter número de versão/revisão.
- Orçamento recusado, cancelado ou expirado pode ser revisado e reenviado.
- Linha do tempo recebe destaque visual por tipo de evento.
- Admin visualiza se o e-mail do usuário está confirmado.

## Banco de dados

A tabela `usuarios` recebe:

- `email_verificado`
- `token_confirmacao_email`
- `token_confirmacao_expira_em`

A tabela `orcamentos` recebe:

- `revisao`

Em desenvolvimento o Sequelize aplica essas alterações com `sync({ alter: true })`.

## Variável opcional

Adicionar ao `.env` somente se quiser alterar o padrão de 24 horas:

```env
CONFIRMACAO_EMAIL_HORAS=24
```

## Observação para contas antigas

Contas existentes antes da v0.7 permanecem consideradas verificadas por padrão para não interromper o ambiente de desenvolvimento atual. Novas contas criadas com SMTP configurado precisam confirmar o e-mail.
