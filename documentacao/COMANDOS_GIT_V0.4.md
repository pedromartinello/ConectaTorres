# Comandos Git - v0.4

Depois de copiar a v0.4 por cima da v0.3, iniciar banco, backend e frontend e concluir os testes:

```powershell
git status
git add .
git status
git commit -m "feat: estabiliza sistema e aprimora experiencia do usuario"
git push
```

Depois de confirmar que o GitHub recebeu o commit:

```powershell
git tag -a v0.4 -m "ConectaTorres v0.4 - estabilizacao e acabamento"
git push origin v0.4
```

Verificacao final:

```powershell
git status
git log --oneline --decorate -5
git tag
```
