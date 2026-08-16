# Configuração da IA e do e-mail - v0.5

## 1. Inteligência artificial

No arquivo real `backend/.env`, adicione:

```env
IA_HABILITADA=true
OPENAI_API_KEY=COLOQUE_SUA_CHAVE_REAL_AQUI
OPENAI_MODELO=gpt-5.6-luna
```

A chave fica exclusivamente no backend. Nunca use `VITE_OPENAI_API_KEY` e nunca coloque a chave no frontend.

A integração usa a Responses API e saída estruturada para limitar a resposta a categorias existentes no ConectaTorres.

Se `OPENAI_API_KEY` não estiver configurada, o restante do sistema continua funcionando normalmente e os recursos de IA aparecem como indisponíveis.

## 2. E-mail por SMTP

No `backend/.env`, configure:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORTA=465
SMTP_SEGURO=true
SMTP_USUARIO=seu_email@gmail.com
SMTP_SENHA=SENHA_DE_APP_DO_GOOGLE
EMAIL_REMETENTE_NOME=ConectaTorres
EMAIL_REMETENTE=seu_email@gmail.com
```

Para Gmail, use uma senha de app quando disponível. Não coloque a senha normal da conta Google no projeto.

Para outro provedor SMTP, altere host, porta, segurança, usuário e senha conforme o provedor.

## 3. Desenvolvimento sem SMTP

Pode manter:

```env
RECUPERACAO_SENHA_MINUTOS=30
RECUPERACAO_EXIBIR_LINK=true
```

Nesse modo, se SMTP não estiver configurado, o backend mostra o link de redefinição apenas no ambiente de desenvolvimento.

Para produção:

```env
RECUPERACAO_EXIBIR_LINK=false
```

## 4. Conferência

Após reiniciar o backend, abra:

```text
http://localhost:3001/api/saude
```

Exemplo quando tudo está configurado:

```json
{
  "status": "ok",
  "aplicacao": "ConectaTorres API",
  "versao": "0.5.0",
  "integracoes": {
    "ia": true,
    "email": true
  }
}
```
