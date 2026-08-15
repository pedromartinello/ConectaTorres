import { Sequelize } from 'sequelize';
import { ambiente } from './ambiente.js';

export const sequelize = new Sequelize(
  ambiente.banco.nome,
  ambiente.banco.usuario,
  ambiente.banco.senha,
  {
    host: ambiente.banco.host,
    port: ambiente.banco.porta,
    dialect: 'postgres',
    logging: ambiente.nodeEnv === 'development' ? console.log : false,
    define: {
      underscored: true,
      freezeTableName: true
    }
  }
);
