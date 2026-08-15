import { Categoria } from '../modelos/index.js';

const categoriasPadrao = [
  ['Eletricista', 'eletricista'],
  ['Encanador', 'encanador'],
  ['Pintor', 'pintor'],
  ['Pedreiro', 'pedreiro'],
  ['Diarista', 'diarista'],
  ['Jardineiro', 'jardineiro'],
  ['Montador de moveis', 'montador-de-moveis'],
  ['Tecnico de informatica', 'tecnico-de-informatica']
];

export async function semearCategorias() {
  for (const [nome, slug] of categoriasPadrao) {
    await Categoria.findOrCreate({ where: { slug }, defaults: { nome, slug } });
  }
}
