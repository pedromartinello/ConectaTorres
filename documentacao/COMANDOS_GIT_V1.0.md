# Comandos Git — v1.0

Após concluir os testes:

```bash
git status
git add .
git status
git commit -m "release: finaliza ConectaTorres v1.0"
git push
git tag -a v1.0 -m "ConectaTorres v1.0 - versao final do projeto"
git push origin v1.0
git status
git tag
```

Resultado esperado: working tree clean e a tag `v1.0` listada junto às versões anteriores.
