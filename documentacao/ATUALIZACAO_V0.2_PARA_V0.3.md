# Atualizacao da v0.2 para v0.3

## Recomendacao

Use a v0.3 como nova pasta de projeto. O banco Docker existente pode continuar sendo utilizado.

## Passos

1. Pare frontend e backend antigos com `Ctrl + C`.
2. Mantenha o container PostgreSQL rodando.
3. Copie seu arquivo `backend/.env` da v0.2 para `backend/.env` da v0.3.
4. Adicione ao `.env`:

```text
ADMIN_NOME=Administrador ConectaTorres
ADMIN_EMAIL=admin@conectatorres.local
ADMIN_SENHA=Admin12345
```

5. No backend da v0.3:

```powershell
npm install
npm run dev
```

6. No frontend da v0.3:

```powershell
npm install
npm run dev
```

7. Abra `http://localhost:5173`.

Em desenvolvimento, o Sequelize usa `sync({ alter: true })` para incluir as novas tabelas e colunas no banco existente.

Se o banco de desenvolvimento ainda nao tiver dados importantes e ocorrer algum problema de estrutura, o reset completo pode ser feito com:

```powershell
docker compose down -v
docker compose up -d banco
```

Esse comando apaga os dados do PostgreSQL local, portanto use somente se puder perder os cadastros de teste.
