# Git — fechamento da v0.9

Somente depois de testar local e produção:

```bash
git status
git add .
git status
git commit -m "feat: finaliza v0.9 com email em producao, seguranca e migrations"
git push
git tag -a v0.9 -m "ConectaTorres v0.9 - email, seguranca e preparacao final"
git push origin v0.9
git status
git tag
```

Antes do `git add .`, confirme que `.env`, `node_modules` e uploads não aparecem no `git status`.
