import { QueryTypes } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

const migracoes = [
  {
    nome: '20261101_01_indices_tokens_usuarios',
    async executar({ transaction }) {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_token_redefinicao
        ON usuarios (token_redefinicao_senha)
        WHERE token_redefinicao_senha IS NOT NULL;
      `, { transaction });

      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_usuarios_token_confirmacao
        ON usuarios (token_confirmacao_email)
        WHERE token_confirmacao_email IS NOT NULL;
      `, { transaction });
    }
  }
];

export async function executarMigracoes() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS migracoes_conectatorres (
      nome VARCHAR(180) PRIMARY KEY,
      executada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const executadas = await sequelize.query(
    'SELECT nome FROM migracoes_conectatorres;',
    { type: QueryTypes.SELECT }
  );
  const nomesExecutados = new Set(executadas.map((item) => item.nome));

  for (const migracao of migracoes) {
    if (nomesExecutados.has(migracao.nome)) continue;

    await sequelize.transaction(async (transaction) => {
      await migracao.executar({ transaction });
      await sequelize.query(
        'INSERT INTO migracoes_conectatorres (nome) VALUES (:nome);',
        { replacements: { nome: migracao.nome }, transaction }
      );
    });

    console.log(`Migração aplicada: ${migracao.nome}`);
  }
}
