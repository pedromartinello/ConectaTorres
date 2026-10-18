# Git — fechamento da v0.8

Somente depois de validar localmente e fazer o primeiro deploy:

```powershell
git status
git add .
git status
git commit -m "feat: prepara aplicacao para deploy e ambiente de producao"
git push
```

Tag:

```powershell
git tag -a v0.8 -m "ConectaTorres v0.8 - deploy e preparacao para producao"
git push origin v0.8
```

Validação:

```powershell
git status
git tag
```
