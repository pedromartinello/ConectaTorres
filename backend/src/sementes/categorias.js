import { Categoria } from '../modelos/index.js';

const categoriasPadrao = [
  ['Eletricista', 'eletricista'],
  ['Encanador', 'encanador'],
  ['Pintor', 'pintor'],
  ['Diarista', 'diarista'],
  ['Jardineiro', 'jardineiro'],
  ['Pedreiro', 'pedreiro'],
  ['Marceneiro', 'marceneiro'],
  ['Montador de móveis', 'montador-de-moveis'],
  ['Técnico de informática', 'tecnico-de-informatica'],
  ['Ar-condicionado', 'ar-condicionado'],
  ['Manutenção residencial', 'manutencao-residencial'],
  ['Limpeza', 'limpeza']
];

export async function semearCategorias() {
  for (const [nome, slug] of categoriasPadrao) {
    const [categoria, criada] = await Categoria.findOrCreate({
      where: { slug },
      defaults: { nome, ativa: true }
    });

    // Atualiza apenas o texto exibido sem alterar o slug usado nas rotas e filtros.
    if (!criada && categoria.nome !== nome) {
      await categoria.update({ nome });
    }
  }
}
