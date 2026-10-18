import { Sequelize } from 'sequelize';
import { ambiente } from './ambiente.js';

const opcoes = {
  dialect: 'postgres',
  logging: ambiente.nodeEnv === 'development' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true
  },
  pool: {
    max: ambiente.producao ? 10 : 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

if (ambiente.banco.ssl) {
  opcoes.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

export const sequelize = ambiente.banco.usaUrl
  ? new Sequelize(ambiente.banco.url, opcoes)
  : new Sequelize(
      ambiente.banco.nome,
      ambiente.banco.usuario,
      ambiente.banco.senha,
      {
        ...opcoes,
        host: ambiente.banco.host,
        port: ambiente.banco.porta
      }
    );
