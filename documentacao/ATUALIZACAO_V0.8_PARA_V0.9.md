# Atualização v0.8 → v0.9

## Objetivo

A v0.9 fecha os principais pontos técnicos antes da v1.0:

- e-mail real em produção por API HTTPS;
- revisão de segurança;
- migrations versionadas;
- melhorias de observabilidade do endpoint de saúde;
- documentação de produção e testes finais.

## Como aplicar

1. Pare backend e frontend locais com `Ctrl + C`.
2. Extraia o patch v0.9.
3. Copie o conteúdo sobre a raiz do projeto ConectaTorres.
4. Não substitua o seu arquivo `backend/.env` real por `.env.exemplo`.
5. Inicie banco, backend e frontend normalmente.

Não há nova dependência npm obrigatória nesta versão; a integração Brevo usa `fetch`, disponível no Node 22+ já exigido pelo projeto.

## Banco

A v0.9 cria a tabela interna `migracoes_conectatorres` e registra migrations já aplicadas.

A primeira migration adiciona índices aos tokens de confirmação de e-mail e recuperação de senha. Ela usa `CREATE INDEX IF NOT EXISTS`, portanto pode ser executada com segurança no banco atual.

Na primeira inicialização após o patch, o log pode mostrar:

```text
Migração aplicada: 20261101_01_indices_tokens_usuarios
```

Isso é esperado.

## Produção

No Railway, configure a Brevo conforme `EMAIL_BREVO_RAILWAY_V0.9.md` e faça um redeploy do backend.
