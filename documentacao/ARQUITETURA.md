# Arquitetura do ConectaTorres

## Camadas

### Frontend
React + Vite. Responsavel pela interface, navegacao, formularios, filtros, paineis por perfil e consumo da API.

### Backend
Node.js + Express. Centraliza autenticacao, autorizacao, validacao, regras de negocio, agenda, moderacao, notificacoes e upload de imagens.

### Banco
PostgreSQL com Sequelize. Mantem os dados objetivos da plataforma.

### Uploads
No desenvolvimento, imagens ficam em `backend/uploads`. O banco armazena apenas o caminho da imagem.

### Integracoes externas
- WhatsApp: redirecionamento externo.
- LLM: futura, isolada do fluxo principal.

## Perfis

- `cliente`: pesquisa, filtra, favorita, solicita horarios, acompanha atendimentos, avalia e denuncia conteudo.
- `prestador`: mantem perfil, portfolio, servicos e disponibilidade; responde solicitacoes e conclui atendimentos.
- `admin`: gerencia usuarios, categorias, denuncias e moderacao de avaliacoes.

## Entidades

- Usuario
- PerfilPrestador
- Categoria
- Servico
- Disponibilidade
- Agendamento
- Avaliacao
- Favorito
- PortfolioImagem
- Notificacao
- Denuncia

## Convencoes

- Nomes de pastas, arquivos, rotas e variaveis em portugues sem acentos.
- API REST no prefixo `/api`.
- JSON em camelCase.
- Banco em snake_case.
- IDs UUID.
- Regra de negocio no backend.
- Senha nunca retornada pela API.
- Uploads validam formato e tamanho.

## Integrações externas da v0.5

### LLM

A chave da API existe somente no backend. O frontend envia a descrição para uma rota do ConectaTorres; o backend fornece à LLM apenas a necessidade e o catálogo de categorias ativas. A resposta estruturada é validada antes de virar filtro da busca normal.

```text
Frontend -> API ConectaTorres -> OpenAI Responses API
                              -> categorias estruturadas
Frontend <- filtros validados <- backend
Frontend -> GET /prestadores -> PostgreSQL
```

A LLM não recebe controle sobre preço, avaliação, agenda ou cadastro de profissionais.

### E-mail

A recuperação de senha usa SMTP via Nodemailer. O token bruto é enviado apenas no link do e-mail; no PostgreSQL permanece somente o hash SHA-256 e a data de expiração.
