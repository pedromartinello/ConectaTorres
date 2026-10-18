# Git - fechamento da v0.7

Somente depois dos testes:

```powershell
git status
git add .
git status
git commit -m "feat: adiciona verificacao de email e comunicacoes automaticas"
git push
git tag -a v0.7 -m "ConectaTorres v0.7 - comunicacao, confianca e verificacao de email"
git push origin v0.7
```

Confirme no final:

```powershell
git status
git tag
```
