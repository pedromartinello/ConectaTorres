# Git - fechamento da v0.6

Depois de testar tudo:

```powershell
git status
git add .
git status
git commit -m "feat: adiciona orcamentos, historico comercial e aprimora assistente de IA"
git push
```

Depois marque a versão:

```powershell
git tag -a v0.6 -m "ConectaTorres v0.6 - orcamentos e fluxo comercial"
git push origin v0.6
```

Confirme:

```powershell
git status
git tag
```
