import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../configuracao/banco.js';

export class PerfilPrestador extends Model {}

PerfilPrestador.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    usuarioId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'usuario_id' },
    titulo: { type: DataTypes.STRING(150), allowNull: true },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    whatsapp: { type: DataTypes.STRING(30), allowNull: true },
    cidade: { type: DataTypes.STRING(100), allowNull: true },
    estado: { type: DataTypes.STRING(2), allowNull: true, defaultValue: 'RS' },
    regiaoAtendimento: { type: DataTypes.STRING(255), allowNull: true, field: 'regiao_atendimento' },
    modalidadeOrcamento: {
      type: DataTypes.ENUM('orcamento', 'hora', 'servico'),
      allowNull: false,
      defaultValue: 'orcamento',
      field: 'modalidade_orcamento'
    },
    valorReferencia: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'valor_referencia' },
    fotoUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'foto_url' }
  },
  { sequelize, modelName: 'PerfilPrestador', tableName: 'perfis_prestador' }
);
