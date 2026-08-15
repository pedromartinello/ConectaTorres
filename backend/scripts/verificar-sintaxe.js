import { readdir } from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

async function listar(pasta) {
  const entradas = await readdir(pasta, { withFileTypes: true });
  const arquivos = [];
  for (const entrada of entradas) {
    const caminho = path.join(pasta, entrada.name);
    if (entrada.isDirectory()) arquivos.push(...await listar(caminho));
    else if (entrada.name.endsWith('.js')) arquivos.push(caminho);
  }
  return arquivos;
}

const arquivos = await listar(raiz);
for (const arquivo of arquivos) {
  const resultado = spawnSync(process.execPath, ['--check', arquivo], { stdio: 'inherit' });
  if (resultado.status !== 0) process.exit(resultado.status || 1);
}
console.log(`Sintaxe verificada em ${arquivos.length} arquivo(s).`);
