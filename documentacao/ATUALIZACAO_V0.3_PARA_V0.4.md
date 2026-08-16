# Atualizacao da v0.3 para v0.4

A v0.4 foi preparada para ser copiada por cima da v0.3 mantendo a pasta `.git`, o arquivo `backend/.env` e o banco PostgreSQL existente.

## 1. Antes de atualizar

Confirme que o Git esta limpo:

```powershell
git status
```

O esperado e `nothing to commit, working tree clean`.

## 2. Copiar os arquivos

Extraia a v0.4 em uma pasta separada e copie o conteudo para a pasta atual `ConectaTorres`, substituindo os arquivos existentes.

Nao apague:

- `.git/`
- `backend/.env`
- `backend/uploads/`

## 3. Dependencias

A v0.4 nao exige uma nova dependencia externa em relacao a v0.3, mas e seguro sincronizar os pacotes:

```powershell
cd backend
npm install

cd ../frontend
npm install
```

## 4. Banco

Em desenvolvimento, o Sequelize continua usando `sync({ alter: true })`. Ao iniciar o backend, as colunas de token de recuperacao de senha serao adicionadas automaticamente ao banco local.

O Docker nao precisa ser recriado:

```powershell
docker compose up -d banco
```

## 5. Variaveis opcionais novas

O arquivo `.env` antigo continua funcionando porque ha valores padrao. Para deixar explicito, adicione:

```env
RECUPERACAO_SENHA_MINUTOS=30
RECUPERACAO_EXIBIR_LINK=true
```

`RECUPERACAO_EXIBIR_LINK=true` e apenas para demonstracao local. Em producao, use `false` e envie o link por e-mail.

## 6. Testes recomendados

1. Login e cadastro existentes.
2. "Esqueci minha senha" e redefinicao com link temporario.
3. Alteracao de senha autenticada.
4. Troca, preview e remocao da foto de perfil.
5. Busca de prestadores com mais de uma pagina.
6. Cadastro de disponibilidade futura.
7. Tentativa de cadastrar disponibilidade no passado deve falhar.
8. Fluxo cliente -> solicitacao -> prestador aceita -> atendimento -> avaliacao.
9. Painel inicial de cliente e prestador.
10. Admin: filtros, paginacao, ativacao de usuario, denuncias e avaliacoes.

## 7. Commit sugerido

Depois de testar:

```powershell
git add .
git commit -m "feat: estabiliza sistema e aprimora experiencia do usuario"
git push

git tag -a v0.4 -m "ConectaTorres v0.4 - estabilizacao e acabamento"
git push origin v0.4
```
