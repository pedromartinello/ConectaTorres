import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Notificacao extends Model {}

Notificacao.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
    tipo: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'geral' },
    titulo: { type: DataTypes.STRING(140), allowNull: false },
    mensagem: { type: DataTypes.STRING(500), allowNull: false },
    link: { type: DataTypes.STRING(300), allowNull: true },
    lidaEm: { type: DataTypes.DATE, allowNull: true, field: 'lida_em' }
  },
  { sequelize, modelName: 'Notificacao', tableName: 'notificacoes' }
);
