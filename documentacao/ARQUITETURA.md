# Arquitetura do ConectaTorres

## Camadas

### Frontend
Responsavel pela interface, navegacao, formularios, experiencia do usuario e consumo da API.

### Backend / API
Responsavel por autenticacao, autorizacao, regras de negocio, validacoes, agenda, busca, avaliacoes e acesso ao banco.

### Banco de dados
PostgreSQL gerenciado por Sequelize. Os dados objetivos da plataforma ficam aqui.

### Integracoes externas
A integracao com WhatsApp e apenas um redirecionamento. A futura integracao com LLM deve ficar isolada em uma pasta propria e nunca ser fonte de dados cadastrais.

## Perfis

- `cliente`: pesquisa, agenda, favorita e avalia.
- `prestador`: mantem perfil, servicos e disponibilidade; responde solicitacoes.
- `admin`: manutencao e moderacao basica.

## Entidades iniciais

- Usuario
- PerfilPrestador
- Categoria
- Servico
- Disponibilidade
- Agendamento
- Avaliacao
- Favorito

## Convencoes

- Nomes de pastas, arquivos, rotas e variaveis em portugues sem acentos.
- API REST sob o prefixo `/api`.
- JSON em camelCase.
- Banco com nomes em snake_case.
- IDs UUID.
- Regra de negocio fica no backend, nunca apenas no frontend.
