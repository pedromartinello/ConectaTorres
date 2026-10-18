import { app } from './app.js';
import { ambiente } from './configuracao/ambiente.js';
import { sequelize } from './configuracao/banco.js';
import './modelos/index.js';
import { semearCategorias } from './sementes/categorias.js';
import { semearAdmin } from './sementes/admin.js';

let servidor;
let encerrando = false;

async function encerrar(sinal) {
  if (encerrando) return;
  encerrando = true;
  console.log(`Recebido ${sinal}. Encerrando ConectaTorres com segurança...`);

  const finalizar = async () => {
    try {
      await sequelize.close();
    } catch (erro) {
      console.error('Falha ao encerrar conexão com o banco:', erro.message);
    } finally {
      process.exit(0);
    }
  };

  if (servidor) servidor.close(finalizar);
  else await finalizar();

  setTimeout(() => process.exit(1), 10000).unref();
}

async function iniciar() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: ambiente.nodeEnv === 'development' });
    await semearCategorias();
    await semearAdmin();

    servidor = app.listen(ambiente.porta, '0.0.0.0', () => {
      console.log(`ConectaTorres API rodando na porta ${ambiente.porta} (${ambiente.nodeEnv})`);
    });
  } catch (erro) {
    console.error('Falha ao iniciar o servidor:', erro);
    process.exit(1);
  }
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));

iniciar();
