import { app } from './app.js';
import { ambiente } from './configuracao/ambiente.js';
import { sequelize } from './configuracao/banco.js';
import './modelos/index.js';
import { semearCategorias } from './sementes/categorias.js';
import { semearAdmin } from './sementes/admin.js';

async function iniciar() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: ambiente.nodeEnv === 'development' });
    await semearCategorias();
    await semearAdmin();
    app.listen(ambiente.porta, () => console.log(`ConectaTorres API rodando na porta ${ambiente.porta}`));
  } catch (erro) {
    console.error('Falha ao iniciar o servidor:', erro);
    process.exit(1);
  }
}

iniciar();
