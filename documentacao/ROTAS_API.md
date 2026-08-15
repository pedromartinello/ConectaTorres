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
