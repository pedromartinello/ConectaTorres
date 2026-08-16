# ConectaTorres

Projeto de PDS para conexão entre clientes e prestadores de serviços locais em Torres/RS e região.

Versão atual: **0.5.0 - busca inteligente com LLM + recuperação de senha por e-mail**.

## Tecnologias

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: PostgreSQL
- ORM: Sequelize
- Autenticação: JWT em cookie HTTP-only + bcrypt
- Upload de imagens: Multer
- E-mail: Nodemailer + SMTP
- IA: OpenAI Responses API com saída estruturada
- Banco local recomendado: Docker Compose

## O que está implementado

### Conta e segurança
- Cadastro de cliente e prestador.
- Login e logout.
- Senhas com hash bcrypt.
- JWT em cookie HTTP-only.
- Rate limit nas rotas de autenticação e IA.
- Helmet, CORS e validação de entrada.
- Alteração de dados pessoais e senha.
- Foto de perfil.
- Recuperação de senha com token temporário e expiração.
- Envio real do link de redefinição por SMTP quando configurado.
- Fallback de desenvolvimento por link local quando o SMTP não estiver configurado.

### Cliente
- Busca tradicional com filtros e paginação.
- **Busca inteligente em linguagem natural com IA.**
- A IA interpreta a necessidade e seleciona apenas categorias cadastradas.
- Os resultados continuam vindo exclusivamente do PostgreSQL.
- Favoritos, agenda, avaliações, denúncias e notificações.

### Prestador
- Perfil profissional e portfólio.
- Serviços e agenda semanal com bloqueios por data.
- Gestão de solicitações e atendimentos.
- **Sugestão de descrição profissional com IA**, sempre sujeita à revisão do prestador antes de salvar.

### Administrador
- Gestão de usuários, categorias, denúncias e avaliações.
- Conta administrativa sem cadastro público.

## Estrutura

```text
ConectaTorres/
├── backend/
│   ├── scripts/
│   ├── src/
│   │   ├── configuracao/
│   │   ├── controladores/
│   │   ├── intermediarios/
│   │   ├── modelos/
│   │   ├── rotas/
│   │   ├── sementes/
│   │   ├── servicos/
│   │   └── utilitarios/
│   ├── uploads/              # ignorado pelo Git
│   ├── .env.exemplo
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── componentes/
│   │   ├── contextos/
│   │   ├── estilos/
│   │   ├── paginas/
│   │   ├── servicos/
│   │   └── utilitarios/
│   └── package.json
├── documentacao/
├── docker-compose.yml
└── README.md
```

## Execução local

### 1. Banco

```powershell
docker compose up -d banco
```

### 2. Backend

```powershell
cd backend
npm install
npm run dev
```

API: `http://localhost:3001`

Saúde da API: `http://localhost:3001/api/saude`

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Site: `http://localhost:5173`

## Configurações da v0.5

A v0.5 adiciona novas variáveis ao `backend/.env`. Consulte:

```text
documentacao/CONFIGURAR_IA_EMAIL.md
```

Nunca coloque chaves de API, senha de SMTP, JWT ou outras credenciais reais no `.env.exemplo` ou no GitHub.

## Como a IA funciona

```text
texto do cliente
  -> backend envia somente a necessidade + catálogo de categorias para a LLM
  -> LLM retorna categorias estruturadas
  -> backend valida os slugs recebidos
  -> busca normal consulta PostgreSQL
  -> frontend mostra prestadores reais
```

A IA **não fornece nem inventa** profissionais, preços, avaliações, agenda ou contato.

No perfil profissional, a IA também pode sugerir uma descrição a partir das informações já fornecidas pelo próprio prestador. A sugestão é inserida no campo de texto e só é publicada se o usuário clicar em **Salvar perfil**.

## Recuperação de senha

Quando SMTP está configurado:

```text
usuário informa e-mail
  -> backend gera token aleatório
  -> banco armazena somente o hash do token
  -> link temporário é enviado por e-mail
  -> usuário redefine a senha
  -> token é invalidado
```

Em desenvolvimento, `RECUPERACAO_EXIBIR_LINK=true` permite testar o fluxo mesmo sem SMTP.

## Verificação

Backend:

```powershell
cd backend
npm run verificar
```

Frontend:

```powershell
cd frontend
npm run build
```

## Git

Nunca envie `.env`, `node_modules` ou `backend/uploads` para o repositório.
