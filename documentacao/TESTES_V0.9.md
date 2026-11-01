# Testes da v0.9

## 1. Inicialização local

```bash
docker compose up -d banco
cd backend
npm run verificar
npm run dev
```

Confirmar que o backend inicia sem erro e aplica a migration somente uma vez.

## 2. Saúde local

Acessar:

```text
http://localhost:3001/api/saude
```

Esperado: versão `0.9.0`.

## 3. Fluxo principal

- cadastrar cliente;
- cadastrar prestador;
- concluir perfis;
- criar serviço;
- solicitar atendimento;
- definir período;
- enviar orçamento;
- aceitar orçamento;
- concluir atendimento;
- avaliar prestador.

## 4. E-mail em produção

Após configurar Brevo no Railway:

- `/api/saude` deve exibir `email: true` e `emailProvedor: brevo`;
- nova conta recebe confirmação;
- login é bloqueado antes da confirmação;
- confirmação libera o login;
- recuperação de senha envia link real;
- eventos importantes continuam enviando e-mails.

## 5. Segurança

- senha nova fraca deve ser rejeitada;
- tentativa repetida de autenticação deve atingir rate limit;
- origem não permitida deve ser rejeitada;
- usuário cliente não acessa funções de admin/prestador;
- upload acima de 5 MB deve ser rejeitado;
- formato de imagem não permitido deve ser rejeitado.

## 6. Persistência

- enviar foto de perfil;
- fazer redeploy do backend no Railway;
- confirmar que a foto continua disponível.

## 7. Produção

Testar em `https://conecta-torres.vercel.app`:

- login e permanência da sessão;
- atualização de página em rota interna;
- IA;
- notificações;
- orçamento;
- agenda;
- admin;
- upload.
