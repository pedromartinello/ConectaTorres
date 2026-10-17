# Testes manuais - v0.6

## Preparação

- PostgreSQL rodando no Docker.
- Backend rodando na porta 3001.
- Frontend rodando na porta 5173.
- Conta de cliente e conta de prestador disponíveis.

## Orçamento

1. Cliente cria uma solicitação futura.
2. Prestador abre a Agenda e define início/término.
3. Na Agenda, clicar em **Enviar orçamento** deve abrir a página de Orçamentos já posicionada no formulário correto.
4. Prestador envia proposta com valor, descrição, materiais e validade.
5. Cliente deve receber notificação.
6. Cliente abre o orçamento pelo sininho.
7. Testar **Aceitar orçamento**.
8. Confirmar que o prestador recebe notificação e, se a solicitação estava pendente, passa para aceita.
9. Em outra solicitação, testar **Recusar orçamento**.
10. Prestador deve conseguir revisar e reenviar a proposta recusada.
11. Testar cancelamento de orçamento ainda aguardando resposta.
12. Testar orçamento com validade no passado: backend deve rejeitar.

## Histórico

- Abrir **Ver histórico** em um orçamento.
- Confirmar ordem cronológica dos eventos.
- Confirmar que um agendamento antigo ainda mostra o evento inicial sintético.

## IA

Testar:

`As paredes do quarto estão rachando e a tinta está descascando. Quero reformar, mas não sei qual profissional chamar.`

Esperado:

- orientação em linguagem simples;
- categorias existentes na plataforma;
- próximos passos;
- faixa de valores somente se houver preços de referência cadastrados;
- resultados contendo apenas prestadores reais do banco.

## Regressão

Revalidar:

- login cliente/prestador/admin;
- recuperação por e-mail;
- upload de foto;
- agenda semanal e bloqueios;
- notificações;
- avaliações e denúncias;
- favoritos;
- administração.
