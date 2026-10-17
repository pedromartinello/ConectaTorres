import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class Orcamento extends Model {}

Orcamento.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    agendamentoId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'agendamento_id' },
    prestadorId: { type: DataTypes.UUID, allowNull: false, field: 'prestador_id' },
    clienteId: { type: DataTypes.UUID, allowNull: false, field: 'cliente_id' },
    valor: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    materiaisInclusos: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'materiais_inclusos' },
    observacoes: { type: DataTypes.TEXT, allowNull: true },
    validade: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM('enviado', 'aceito', 'recusado', 'cancelado', 'expirado'),
      allowNull: false,
      defaultValue: 'enviado'
    },
    respondidoEm: { type: DataTypes.DATE, allowNull: true, field: 'respondido_em' }
  },
  { sequelize, modelName: 'Orcamento', tableName: 'orcamentos' }
);
