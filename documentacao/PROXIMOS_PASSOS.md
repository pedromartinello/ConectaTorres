# Proximos passos

A versao 0.4 fecha a etapa de estabilizacao do fluxo principal do ConectaTorres.

## v0.5 - Integracao com LLM

A proxima etapa planejada e adicionar a busca assistida por linguagem natural sem permitir que a IA controle dados factuais da plataforma.

Fluxo esperado:

```text
texto do cliente
  -> API do backend
  -> LLM interpreta necessidade
  -> resposta estruturada com categorias/criterios
  -> backend valida categorias e filtros
  -> PostgreSQL consulta prestadores reais
  -> frontend exibe resultados reais
```

A LLM nao devera inventar:

- prestadores;
- valores;
- avaliacoes;
- disponibilidade;
- cidade/regiao;
- formas de contato.

## Antes da v0.5

Executar o roteiro de testes da v0.4 e corrigir qualquer comportamento observado no ambiente local.

## Evolucoes futuras, fora do prototipo inicial

- envio real de e-mail para recuperacao de senha;
- armazenamento externo de imagens;
- migrations de banco para producao;
- testes automatizados de integracao e interface;
- deploy do frontend, backend e PostgreSQL;
- geracao de imagens de reforma, caso seja retomada como evolucao futura.
