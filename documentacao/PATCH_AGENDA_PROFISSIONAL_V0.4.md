# Patch v0.4 - Agenda profissional e navegacao automatica

## Objetivo

Substituir o cadastro manual de periodos de disponibilidade por uma configuracao mais pratica:

- agenda semanal recorrente por dia da semana;
- checkbox para marcar dias de atendimento;
- horario inicial e final por dia;
- dias desmarcados exibidos como fechados;
- bloqueios de dia inteiro ou de um intervalo em datas especificas;
- consulta publica da agenda por data;
- validacao automatica do horario antes de o cliente enviar a solicitacao;
- exibicao de intervalos ja ocupados sem expor dados de outros clientes;
- bloqueio de solicitacoes fora do horario, em datas indisponiveis ou em horarios ocupados.

A disponibilidade antiga foi mantida no backend como compatibilidade. Enquanto o prestador ainda nao salvar a nova agenda semanal, os periodos antigos continuam sendo considerados.

## Navegacao automatica incluida

Este patch tambem inclui os ajustes de navegacao da v0.4:

- denunciar perfil/avaliacao rola suavemente ate o formulario de denuncia;
- editar servico rola ate o formulario correspondente;
- solicitar servico no perfil rola ate o formulario de agendamento;
- troca de rota inicia no topo da pagina.

## Banco de dados

Duas tabelas novas sao criadas automaticamente pelo Sequelize em desenvolvimento:

- `horarios_semanais`
- `bloqueios_agenda`

Nao e necessario recriar o banco nem o container Docker.

## Configuracao opcional

O sistema usa `America/Sao_Paulo` como fuso horario padrao. Se desejar explicitar no `.env`:

```env
FUSO_HORARIO=America/Sao_Paulo
```

## Teste sugerido

1. Entre como prestador.
2. Abra **Agenda**.
3. Marque segunda a sexta, defina os horarios e salve.
4. Deixe domingo fechado.
5. Cadastre uma indisponibilidade para uma data futura.
6. Entre como cliente e abra o perfil do prestador.
7. Clique em **Solicitar servico**.
8. Escolha um domingo e confira a mensagem de indisponibilidade.
9. Escolha um dia util dentro do horario e confira a confirmacao verde.
10. Envie uma solicitacao e tente repetir o mesmo horario; o sistema deve informar que ele esta ocupado.
