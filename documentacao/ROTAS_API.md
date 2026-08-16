# Rotas principais da API

Base: `/api`

## Sistema
- `GET /saude`

## Autenticacao
- `POST /autenticacao/cadastro`
- `POST /autenticacao/login`
- `POST /autenticacao/logout`
- `GET /autenticacao/eu`

## Usuario autenticado
- `PUT /usuarios/meu-perfil`
- `PATCH /usuarios/minha-senha`
- `POST /usuarios/minha-foto`
- `DELETE /usuarios/minha-foto`

## Prestadores
- `GET /prestadores`
- `GET /prestadores/:id`
- `PUT /prestadores/meu-perfil`
- `GET /prestadores/meu-portfolio`
- `POST /prestadores/meu-portfolio`
- `PATCH /prestadores/meu-portfolio/:id`
- `DELETE /prestadores/meu-portfolio/:id`

## Servicos
- `GET /servicos`
- `GET /servicos/meus`
- `GET /servicos/:id`
- `POST /servicos`
- `PUT /servicos/:id`
- `DELETE /servicos/:id`

## Disponibilidade
- `GET /disponibilidades/minhas`
- `GET /disponibilidades/prestador/:prestadorId`
- `POST /disponibilidades`
- `DELETE /disponibilidades/:id`

## Agendamentos
- `GET /agendamentos`
- `POST /agendamentos`
- `PATCH /agendamentos/:id/status`
- `PATCH /agendamentos/:id/horario`
- `PATCH /agendamentos/:id/concluir`

## Avaliacoes
- `GET /avaliacoes/prestador/:prestadorId`
- `GET /avaliacoes/minhas`
- `POST /avaliacoes`

## Favoritos
- `GET /favoritos`
- `POST /favoritos/:prestadorId`
- `DELETE /favoritos/:prestadorId`

## Notificacoes
- `GET /notificacoes`
- `PATCH /notificacoes/ler-todas`
- `PATCH /notificacoes/:id/ler`

## Denuncias
- `GET /denuncias/minhas`
- `POST /denuncias`

## Administracao
- `GET /admin/resumo`
- `GET /admin/usuarios`
- `PATCH /admin/usuarios/:id/ativo`
- `GET /admin/categorias`
- `POST /admin/categorias`
- `PATCH /admin/categorias/:id`
- `GET /admin/denuncias`
- `PATCH /admin/denuncias/:id`
- `GET /admin/avaliacoes`
- `PATCH /admin/avaliacoes/:id/visibilidade`

## Novidades da v0.4

### Autenticacao

```text
POST /api/autenticacao/esqueci-senha
POST /api/autenticacao/redefinir-senha
```

`POST /esqueci-senha` sempre retorna mensagem generica. Em ambiente de desenvolvimento, quando configurado, pode retornar `linkRedefinicao` apenas para facilitar o teste academico.

### Painel

```text
GET /api/painel/resumo
```

Retorna metricas adequadas ao tipo autenticado e, para cliente/prestador, os proximos agendamentos ativos.

### Paginacao

A busca de prestadores aceita:

```text
pagina=1
limite=12
```

As rotas administrativas de usuarios, denuncias e avaliacoes tambem aceitam `pagina` e `limite`, alem dos filtros correspondentes.
