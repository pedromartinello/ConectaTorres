# Atualização v0.5 → v0.6

## O que muda

A v0.6 adiciona:

- orçamentos vinculados às solicitações;
- aceite, recusa, reenvio e cancelamento de orçamento;
- histórico do atendimento/negociação;
- notificações específicas de orçamento;
- indicadores de orçamento no painel;
- atalhos entre Agenda e Orçamentos;
- assistente de IA mais explicativo;
- faixa de valores baseada exclusivamente nos preços de referência cadastrados no banco;
- modelo padrão da IA alterado para `gpt-5.6-terra` no arquivo de exemplo.

## Como aplicar

1. Faça backup/commit da v0.5 antes de substituir arquivos.
2. Copie o conteúdo da v0.6 por cima do projeto atual.
3. Preserve:
   - `.git`
   - `backend/.env`
   - `backend/uploads`
4. Não é necessária nenhuma biblioteca nova em relação à v0.5.
5. Reinicie o backend para o Sequelize criar as tabelas novas no ambiente de desenvolvimento.

```powershell
# banco
docker compose up -d banco

# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

## Novas tabelas

- `orcamentos`
- `historicos_atendimento`

Em desenvolvimento, `sequelize.sync({ alter: true })` cria/ajusta essas estruturas automaticamente.
