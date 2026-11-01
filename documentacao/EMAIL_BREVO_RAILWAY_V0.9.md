# E-mail em produção — Brevo + Railway

## Por que mudar

O Railway Free/Trial/Hobby bloqueia SMTP externo. A v0.9 passa a aceitar uma API HTTPS de e-mail em produção, mantendo SMTP apenas como fallback local/Pro.

## 1. Criar conta na Brevo

Crie uma conta na Brevo e conclua a validação da conta.

## 2. Verificar o remetente

Cadastre como remetente o endereço usado pelo ConectaTorres, por exemplo:

```text
ConectaTorres <conectatorresadm@gmail.com>
```

A Brevo enviará um e-mail para confirmar que o endereço pertence a você. Conclua essa verificação antes de testar o sistema.

Para uma futura v1.0 com domínio próprio, o recomendado é autenticar o domínio e usar algo como `notificacoes@conectatorres.com.br`.

## 3. Criar uma API Key

No painel da Brevo, crie uma chave de API para o ConectaTorres.

Nunca coloque a chave no GitHub, `.env.exemplo`, frontend ou chat. Ela deve existir somente no `.env` local quando necessário e nas Variables do Railway.

## 4. Variables no Railway

No serviço `ConectaTorres` adicione:

```env
BREVO_API_KEY=SUA_CHAVE_REAL_DA_BREVO
EMAIL_REMETENTE_NOME=ConectaTorres
EMAIL_REMETENTE=conectatorresadm@gmail.com
EMAIL_REPLY_TO=conectatorresadm@gmail.com
```

As variáveis SMTP podem ser removidas do Railway. Se permanecerem, a v0.9 prioriza Brevo quando `BREVO_API_KEY` estiver válida.

## 5. Redeploy

Após salvar as variáveis, faça um redeploy do backend.

Abra:

```text
https://SEU-BACKEND.up.railway.app/api/saude
```

O esperado é:

```json
{
  "status": "ok",
  "versao": "0.9.0",
  "integracoes": {
    "ia": true,
    "email": true,
    "emailProvedor": "brevo"
  }
}
```

## 6. Testes

Teste nesta ordem:

1. criar uma conta nova;
2. receber e abrir a confirmação de e-mail;
3. confirmar e fazer login;
4. usar "Esqueci minha senha";
5. receber e abrir o link de redefinição;
6. gerar um evento de atendimento/orçamento e verificar a notificação por e-mail.

## Fallback local

O SMTP/Nodemailer continua disponível. Se não existir `BREVO_API_KEY`, o backend usa SMTP quando `SMTP_HOST`, `SMTP_USUARIO` e `SMTP_SENHA` estiverem configurados.
