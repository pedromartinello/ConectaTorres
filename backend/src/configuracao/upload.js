import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

export const pastaUploads = fileURLToPath(new URL('../../uploads/', import.meta.url));
const pastaPerfis = path.join(pastaUploads, 'perfis');
const pastaPortfolio = path.join(pastaUploads, 'portfolio');

for (const pasta of [pastaUploads, pastaPerfis, pastaPortfolio]) {
  fs.mkdirSync(pasta, { recursive: true });
}

const extensoesPorMime = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

function criarUpload(pastaDestino) {
  return multer({
    storage: multer.diskStorage({
      destination: pastaDestino,
      filename: (req, arquivo, cb) => {
        const extensao = extensoesPorMime[arquivo.mimetype];
        cb(null, `${Date.now()}-${crypto.randomUUID()}${extensao}`);
      }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, arquivo, cb) => {
      if (!extensoesPorMime[arquivo.mimetype]) {
        return cb(new Error('Formato de imagem invalido. Use JPG, PNG ou WEBP.'));
      }
      return cb(null, true);
    }
  });
}

export const uploadFotoPerfil = criarUpload(pastaPerfis).single('foto');
export const uploadPortfolio = criarUpload(pastaPortfolio).single('imagem');

export function removerArquivoPorUrl(url) {
  if (!url || !url.startsWith('/uploads/')) return;
  const relativo = url.replace('/uploads/', '');
  const caminho = path.resolve(pastaUploads, relativo);
  if (!caminho.startsWith(path.resolve(pastaUploads))) return;
  if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
}
