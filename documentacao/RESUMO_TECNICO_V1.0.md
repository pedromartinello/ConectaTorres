# Resumo Técnico — ConectaTorres v1.0

## Produto

Marketplace web local que conecta clientes a prestadores de serviços de Torres/RS e região, centralizando descoberta, perfil profissional, agenda, solicitação, orçamento, acompanhamento e avaliação.

## Frontend

- React 19
- Vite 7
- React Router
- SPA hospedada na Vercel
- consumo da API REST por HTTPS
- interface responsiva em português brasileiro

## Backend

- Node.js
- Express 5
- API REST
- autenticação JWT em cookie HTTP-only
- bcrypt para senhas
- Helmet, CORS, rate limiting e validação de entradas
- Multer para imagens
- OpenAI API para IA
- Brevo API HTTPS para e-mails de produção

## Dados

- PostgreSQL
- Sequelize ORM
- migrations versionadas
- volume persistente para fotos de perfil e portfólio

## Perfis

- cliente;
- prestador;
- administrador.

## Principais módulos

- autenticação e confirmação de e-mail;
- recuperação de senha;
- perfis e portfólio;
- serviços/categorias;
- busca e favoritos;
- agenda e disponibilidade;
- solicitações e agendamentos;
- orçamentos;
- histórico do atendimento;
- notificações;
- avaliações;
- denúncias/moderação;
- painel administrativo;
- inteligência artificial.

## Inteligência artificial

A IA interpreta necessidades em linguagem natural e auxilia na descrição profissional. Ela não é a fonte dos dados objetivos do marketplace. Profissionais, avaliações, serviços, disponibilidade e faixas de valores exibidas são derivados dos registros reais da plataforma.

## Infraestrutura

```text
Vercel → frontend React/Vite
Railway → backend Node/Express
Railway → PostgreSQL
Railway Volume → uploads
OpenAI → IA
Brevo → e-mails transacionais
```

## URLs de produção

- `https://conecta-torres.vercel.app`
- `https://conectatorres-production.up.railway.app/api/saude`
