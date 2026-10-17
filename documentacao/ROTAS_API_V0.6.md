# Rotas principais adicionadas na v0.6

Todas as rotas abaixo exigem autenticação.

## Orçamentos

### GET `/api/orcamentos`
Lista os orçamentos do cliente ou prestador autenticado.

### POST `/api/orcamentos`
Prestador cria ou reenvia orçamento.

Corpo:

```json
{
  "agendamentoId": "uuid",
  "valor": 850,
  "descricao": "Correção e pintura das paredes.",
  "materiaisInclusos": false,
  "validade": "2026-11-15",
  "observacoes": "Valor sujeito a revisão se houver infiltração."
}
```

### PATCH `/api/orcamentos/:id/responder`
Cliente responde:

```json
{ "resposta": "aceitar" }
```

ou:

```json
{ "resposta": "recusar" }
```

### PATCH `/api/orcamentos/:id/cancelar`
Prestador cancela orçamento ainda aguardando resposta.

## Histórico

### GET `/api/agendamentos/:id/historico`
Retorna a linha do tempo do atendimento para cliente ou prestador vinculado.
