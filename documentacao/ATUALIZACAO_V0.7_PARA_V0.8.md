# Atualização v0.7 → v0.8

A v0.8 prepara o ConectaTorres para sair do ambiente local e rodar em produção.

## Principais alterações

- Backend aceita `DATABASE_URL`, facilitando o PostgreSQL em nuvem.
- Backend usa automaticamente a variável `PORT` fornecida pela hospedagem, mantendo `PORTA` para desenvolvimento local.
- CORS aceita uma URL principal e origens adicionais configuradas por ambiente.
- Cookie de autenticação possui `SameSite` configurável e fica `Secure` em produção.
- Uploads podem ser gravados em um diretório persistente configurado por `UPLOAD_DIRETORIO`.
- Encerramento gracioso do servidor em reinicializações/deploys.
- Pool de conexões do PostgreSQL ajustado para produção.
- Frontend recebe `vercel.json` para suportar React Router em URLs acessadas diretamente.
- Mensagem de falha da API deixa de mencionar uma porta local em produção.
- Novas variáveis de produção documentadas sem expor segredos.

## Compatibilidade local

Nada muda no fluxo diário local. O projeto continua funcionando com:

```powershell
docker compose up -d banco
```

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

O `.env` atual pode continuar usando `BANCO_HOST`, `BANCO_PORTA`, `BANCO_NOME`, `BANCO_USUARIO` e `BANCO_SENHA`.

## Importante

Não substitua o seu `backend/.env` pelo `.env.exemplo`. O arquivo de exemplo existe apenas para documentar as variáveis disponíveis.
