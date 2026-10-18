# Próximos passos após a v0.7

## v0.8 - primeiro deploy e ambiente de produção

- Publicar frontend, backend e PostgreSQL em ambiente de teste.
- Configurar URLs reais de frontend/backend e CORS.
- Configurar variáveis de ambiente na hospedagem.
- Definir persistência de uploads fora do disco efêmero.
- Testar SMTP e OpenAI no ambiente publicado.
- Corrigir diferenças entre localhost e produção.

## v0.9 - endurecimento técnico

- Trocar `sequelize.sync({ alter: true })` por migrations.
- Revisar cookies seguros/HTTPS.
- Adicionar logs e tratamento de erros de produção.
- Rever política de uploads.
- Preparar dados de demonstração.
- Revisar testes funcionais e documentação.

## v1.0 - entrega

- Revisão responsiva final.
- README e documentação de implantação.
- Testes completos de cliente, prestador e administrador.
- Tag e release final.
