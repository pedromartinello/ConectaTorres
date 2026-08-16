# Patch v0.4 - horario de referencia e navegacao automatica

Este patch consolida a agenda profissional/navegacao automatica da v0.4 e altera o fluxo de solicitacao para que o cliente nao precise estimar a duracao do servico.

## Alteracoes principais

- O cliente informa apenas a data e o horario em que estara disponivel para receber o prestador.
- O horario informado fica salvo como horario de referencia da solicitacao.
- A solicitacao nasce sem horario final definido.
- O prestador deve definir o periodo previsto (inicio e termino) antes de aceitar.
- O horario originalmente informado pelo cliente e preservado mesmo se o prestador alterar o inicio.
- A API valida se o horario de referencia esta dentro da agenda semanal, fora de bloqueios e sem conflito com compromissos ativos.
- Solicitacoes sem duracao aparecem na agenda do dia como solicitacoes em um horario de referencia.
- Notificacoes de agendamento direcionam para `/painel/agenda#agendamentos`.
- Notificacoes antigas que apontavam apenas para `/painel/agenda` tambem sao redirecionadas para a secao de agendamentos pelo frontend.
- A secao de agendamentos possui ancora e rolagem automatica.
- Ao clicar em "Definir periodo" ou "Ajustar horario", a tela rola ate o formulario correspondente.

## Banco de dados

A tabela `agendamentos` recebe o campo `horario_solicitado` e o campo `fim` passa a aceitar valor nulo enquanto a solicitacao ainda aguarda o prestador definir o periodo.

Em desenvolvimento, o projeto ja usa `sequelize.sync({ alter: true })`, portanto o banco deve ser ajustado ao reiniciar o backend.

## Como aplicar

1. Copie o conteudo deste patch para a raiz do projeto ConectaTorres.
2. Escolha substituir os arquivos no destino.
3. Nao apague `.git`, `backend/.env` ou `backend/uploads`.
4. Nao ha dependencia nova; `npm install` nao e necessario se a v0.4 ja esta instalada.
5. Reinicie o backend para o Sequelize atualizar a estrutura do banco.
6. Atualize o navegador com `Ctrl + F5`.

## Teste recomendado

1. Entre como prestador e configure a agenda semanal.
2. Entre como cliente e abra um prestador.
3. Selecione data e somente o horario em que estara disponivel.
4. Envie a solicitacao.
5. Entre como prestador, abra o sino e clique em "Abrir" na notificacao.
6. Confirme que a pagina rola diretamente para "Agendamentos e solicitacoes".
7. Na solicitacao, clique em "Definir periodo".
8. Informe inicio e termino previstos e salve.
9. Confirme que o cliente recebe notificacao sobre o periodo definido.
10. Aceite a solicitacao e confirme que o horario passa a bloquear conflitos na agenda.
