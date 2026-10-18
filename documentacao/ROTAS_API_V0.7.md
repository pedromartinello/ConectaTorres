# Rotas novas/alteradas - v0.7

## Autenticação

### POST `/api/autenticacao/cadastro`

Com SMTP configurado, cria a conta como e-mail pendente de confirmação e envia o link.

Resposta principal:

```json
{
  "requerConfirmacaoEmail": true,
  "email": "usuario@exemplo.com",
  "mensagem": "Conta criada. Enviamos um link de confirmação para o seu e-mail."
}
```

### POST `/api/autenticacao/confirmar-email`

```json
{ "token": "TOKEN_DE_64_CARACTERES" }
```

### POST `/api/autenticacao/reenviar-confirmacao`

```json
{ "email": "usuario@exemplo.com" }
```

A resposta é deliberadamente genérica para evitar revelar se um endereço está cadastrado.

### POST `/api/autenticacao/login`

Para conta ainda não confirmada retorna `403` com:

```json
{
  "mensagem": "Confirme seu e-mail antes de entrar...",
  "codigo": "EMAIL_NAO_CONFIRMADO"
}
```

## Orçamentos

`POST /api/orcamentos` continua criando ou atualizando a proposta vinculada ao agendamento. A partir da v0.7, quando já existe orçamento não aceito, o reenvio incrementa `revisao` e registra `orcamento_revisado` no histórico.
