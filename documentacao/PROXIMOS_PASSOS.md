# Proximos passos

O fluxo principal do ConectaTorres esta implementado. A proxima grande etapa funcional fica propositalmente reservada para a LLM.

## Antes da LLM

- Executar o roteiro de testes manuais.
- Inserir dados reais ou dados de demonstracao.
- Revisar textos e identidade visual final.
- Criar o repositorio Git e registrar commits por etapa.
- Fazer uma rodada de testes de usabilidade.

## Etapa final: LLM

Criar `backend/src/integracoes/llm/` com responsabilidades separadas:

- cliente da API de LLM;
- prompts;
- interpretacao da necessidade;
- validacao do retorno estruturado;
- conversao em filtros da busca.

A IA deve interpretar a solicitacao, mas os prestadores, precos, disponibilidade e avaliacoes devem continuar vindo do PostgreSQL.
