# Fluxo de orçamentos - v0.6

## Prestador

1. Recebe a solicitação.
2. Define o período previsto na Agenda.
3. Abre **Orçamentos**.
4. Informa valor, descrição, materiais, validade e observações.
5. Envia a proposta.
6. Recebe notificação quando o cliente aceitar ou recusar.
7. Pode revisar e reenviar propostas recusadas, expiradas ou canceladas.

## Cliente

1. Recebe notificação de novo orçamento.
2. Abre **Orçamentos**.
3. Analisa valor e condições.
4. Aceita ou recusa.
5. Ao aceitar, uma solicitação que ainda estava pendente é confirmada quando já possui período definido.

## Histórico

Os principais eventos ficam vinculados ao atendimento:

- solicitação enviada;
- período definido/ajustado;
- atendimento aceito, recusado ou cancelado;
- orçamento enviado;
- orçamento aceito, recusado ou cancelado;
- atendimento concluído.
