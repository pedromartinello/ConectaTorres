import { Categoria } from '../modelos/index.js';

const categoriasPadrao = [
  ['Eletricista', 'eletricista'],
  ['Encanador', 'encanador'],
  ['Pintor', 'pintor'],
  ['Diarista', 'diarista'],
  ['Jardineiro', 'jardineiro'],
  ['Pedreiro', 'pedreiro'],
  ['Marceneiro', 'marceneiro'],
  ['Montador de moveis', 'montador-de-moveis'],
  ['Tecnico de informatica', 'tecnico-de-informatica'],
  ['Ar condicionado', 'ar-condicionado'],
  ['Manutencao residencial', 'manutencao-residencial'],
  ['Limpeza', 'limpeza']
];

export async function semearCategorias() {
  for (const [nome, slug] of categoriasPadrao) {
    await Categoria.findOrCreate({ where: { slug }, defaults: { nome, ativa: true } });
  }
}
