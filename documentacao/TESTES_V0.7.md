# Testes manuais - v0.7

## 1. Confirmação de e-mail

1. Cadastre um novo cliente com um e-mail ao qual você tenha acesso.
2. O sistema deve abrir a tela de confirmação e não entrar automaticamente no painel.
3. Confira a caixa de entrada.
4. Clique em **Confirmar meu e-mail**.
5. A página deve informar que o endereço foi confirmado.
6. Faça login normalmente.

## 2. Link expirado / reenvio

1. Abra `/confirmar-email` sem token ou use o atalho do login.
2. Informe o e-mail de uma conta ainda não confirmada.
3. Clique em **Reenviar confirmação**.
4. Um novo e-mail deve chegar.

## 3. Alteração do e-mail

1. Entre em **Meu perfil**.
2. Altere o e-mail para outro endereço válido.
3. O perfil deve mostrar **Pendente**.
4. O novo endereço deve receber o link de confirmação.
5. Após sair da conta, o login deve ficar bloqueado até a confirmação.

## 4. Solicitação + e-mail automático

1. Como cliente, envie uma nova solicitação.
2. O prestador deve receber notificação interna e e-mail.
3. Abra pelo botão do e-mail e confirme que cai na agenda.

## 5. Período definido

1. Como prestador, defina início e término previstos.
2. O cliente deve receber notificação interna e e-mail.

## 6. Orçamento + revisão

1. Envie um orçamento.
2. O cliente deve receber e-mail e notificação.
3. Recuse o orçamento como cliente.
4. O prestador deve receber e-mail e notificação.
5. Como prestador, clique em **Revisar e reenviar**.
6. Altere valor/condições e envie novamente.
7. O cartão deve exibir **Versão 2**.
8. O histórico deve registrar a revisão.

## 7. Aceite

1. Aceite a versão revisada como cliente.
2. O prestador deve receber e-mail.
3. O atendimento deve ficar aceito quando houver período definido.

## 8. Conclusão

1. Conclua um atendimento aceito após o início.
2. O cliente deve receber notificação e e-mail com atalho para avaliação.

## 9. Admin

1. Entre como administrador.
2. Abra **Usuários**.
3. Confira a coluna **Verificação**.
