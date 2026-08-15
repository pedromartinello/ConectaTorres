import { Usuario } from '../modelos/index.js';
import { ambiente } from '../configuracao/ambiente.js';

export async function semearAdmin() {
  const { nome, email, senha } = ambiente.admin;
  if (!nome || !email || !senha) return;
  const emailNormalizado = email.trim().toLowerCase();
  const existente = await Usuario.findOne({ where: { email: emailNormalizado } });
  if (existente) return;
  await Usuario.create({ nome: nome.trim(), email: emailNormalizado, senhaHash: senha, tipo: 'admin' });
  console.log(`Administrador de desenvolvimento criado: ${emailNormalizado}`);
}
