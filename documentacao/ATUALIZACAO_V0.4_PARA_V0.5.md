# Atualização v0.4 -> v0.5

## O que entrou

- Integração com LLM para interpretar necessidades em linguagem natural.
- Saída estruturada limitada às categorias cadastradas.
- Busca resultante continua consultando prestadores reais do PostgreSQL.
- Sugestão de descrição profissional com IA para prestadores.
- Envio de recuperação de senha por SMTP com Nodemailer.
- Indicador de status de IA e e-mail em `/api/saude`.
- Rate limit específico nas rotas de IA.

## Aplicação do patch

Copie o conteúdo do patch para a raiz do projeto v0.4 e substitua os arquivos existentes.

Depois execute obrigatoriamente:

```powershell
cd backend
npm install
```

Há duas dependências novas: `openai` e `nodemailer`.

O frontend não ganhou nova dependência, mas `npm install` pode ser executado normalmente.

## Arquivo .env

Não substitua seu `backend/.env` pelo `.env.exemplo`.

Adicione manualmente as novas variáveis seguindo `CONFIGURAR_IA_EMAIL.md`.
