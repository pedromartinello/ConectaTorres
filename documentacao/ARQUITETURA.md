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
