import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../configuracao/banco.js';

export class Usuario extends Model {
  async verificarSenha(senha) {
    return bcrypt.compare(senha, this.senhaHash);
  }

  toJSON() {
    const valores = { ...this.get() };
    delete valores.senhaHash;
    return valores;
  }
}

Usuario.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(180), allowNull: false, unique: true, validate: { isEmail: true } },
    telefone: { type: DataTypes.STRING(30), allowNull: true },
    fotoUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'foto_url' },
    senhaHash: { type: DataTypes.STRING, allowNull: false, field: 'senha_hash' },
    tipo: {
      type: DataTypes.ENUM('cliente', 'prestador', 'admin'),
      allowNull: false,
      defaultValue: 'cliente'
    },
    ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  },
  { sequelize, modelName: 'Usuario', tableName: 'usuarios' }
);

Usuario.beforeCreate(async (usuario) => {
  usuario.senhaHash = await bcrypt.hash(usuario.senhaHash, 12);
});

Usuario.beforeUpdate(async (usuario) => {
  if (usuario.changed('senhaHash')) {
    usuario.senhaHash = await bcrypt.hash(usuario.senhaHash, 12);
  }
});
