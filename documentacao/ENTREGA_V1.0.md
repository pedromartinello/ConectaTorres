# ConectaTorres v1.0 — Entrega Final

## Objetivo da versão

A v1.0 encerra o ciclo principal de desenvolvimento do ConectaTorres e consolida a aplicação para apresentação acadêmica e demonstração em produção.

## Estado final

- frontend publicado na Vercel;
- backend publicado no Railway;
- PostgreSQL em produção no Railway;
- uploads persistentes em volume dedicado;
- confirmação e recuperação de e-mail por API HTTPS da Brevo;
- integração com OpenAI ativa;
- migrations versionadas;
- segurança e rate limits revisados;
- fluxo completo de cliente e prestador validado em produção.

## Fluxos validados

1. criação e confirmação de conta;
2. login/logout;
3. criação de perfil de prestador;
4. cadastro de serviços e portfólio;
5. busca tradicional e orientação com IA;
6. solicitação de atendimento;
7. definição de período pelo prestador;
8. envio, revisão, aceite ou recusa de orçamento;
9. notificações internas e por e-mail;
10. conclusão do atendimento;
11. avaliação do prestador;
12. administração, denúncias e moderação.

## Mudanças específicas da v1.0

- atualização de versão para 1.0.0 em frontend e backend;
- identificação 1.0.0 na rota `/api/saude`;
- rota raiz da API com identificação segura da aplicação;
- cookie de autenticação sincronizado com `JWT_EXPIRACAO`;
- validação do formato de `JWT_EXPIRACAO`;
- títulos de página dinâmicos no navegador;
- rodapé final com identificação da versão;
- melhorias de foco/acessibilidade;
- metadata final do frontend;
- README e documentação consolidados para entrega.

## Escopo encerrado

Não são adicionadas novas funcionalidades de grande porte após esta versão. Novas ideias como pagamentos integrados, aplicativo mobile, chat interno ou geolocalização avançada ficam registradas como possíveis evoluções futuras.
