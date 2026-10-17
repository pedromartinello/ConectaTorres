import OpenAI from 'openai';
import { ambiente } from '../configuracao/ambiente.js';

let cliente = null;

function obterCliente() {
  if (!ambiente.ia.habilitada) {
    const erro = new Error('A busca inteligente está desativada neste ambiente.');
    erro.status = 503;
    throw erro;
  }
  if (!ambiente.ia.configurada) {
    const erro = new Error('A integração com IA ainda não foi configurada. Adicione OPENAI_API_KEY no arquivo .env do backend.');
    erro.status = 503;
    throw erro;
  }
  if (!cliente) cliente = new OpenAI({ apiKey: ambiente.ia.apiKey });
  return cliente;
}

async function executarConsultaIA(funcao) {
  try {
    return await funcao();
  } catch (original) {
    console.error('Falha na integração com IA:', original?.message || original);
    const erro = new Error('Não foi possível consultar a inteligência artificial agora. Tente novamente em alguns instantes.');
    erro.status = 502;
    throw erro;
  }
}

function extrairJson(response) {
  const texto = response.output_text?.trim();
  if (!texto) {
    const erro = new Error('A IA não retornou uma resposta utilizável.');
    erro.status = 502;
    throw erro;
  }
  try {
    return JSON.parse(texto);
  } catch {
    const erro = new Error('A IA retornou uma resposta em formato inesperado.');
    erro.status = 502;
    throw erro;
  }
}

export function iaEstaConfigurada() {
  return ambiente.ia.habilitada && ambiente.ia.configurada;
}

export async function interpretarNecessidadeComIA({ descricao, categorias }) {
  const api = obterCliente();
  const slugs = categorias.map((c) => c.slug);
  const catalogo = categorias.map((c) => `- ${c.nome} (${c.slug})`).join('\n');

  const response = await executarConsultaIA(() => api.responses.create({
    model: ambiente.ia.modelo,
    reasoning: { effort: 'none' },
    instructions: [
      'Você é o assistente de orientação do marketplace local ConectaTorres.',
      'Converse com uma pessoa leiga e explique, em português do Brasil, quais profissionais podem ajudá-la e por quê.',
      'Escolha SOMENTE categorias existentes no catálogo fornecido.',
      'Nunca invente profissionais, preços, avaliações, disponibilidade, diagnóstico técnico definitivo ou informações cadastrais.',
      'Não dê preço de mercado por conta própria. Valores serão calculados posteriormente pelo backend com dados reais cadastrados.',
      'Quando o relato puder indicar risco estrutural, elétrico, gás ou outro risco relevante, recomende avaliação presencial de profissional qualificado sem alarmismo.',
      'Retorne de 0 a 4 categorias realmente relacionadas ao pedido, priorizadas da mais importante para a menos importante.',
      'A orientação deve ter de 2 a 5 frases curtas e úteis. Os passos devem ser objetivos e podem conter no máximo 4 itens.',
      'Se o pedido não se encaixar em nenhuma categoria, retorne categorias vazias e explique que ainda não há categoria compatível na plataforma.'
    ].join(' '),
    input: `Necessidade do cliente:\n${descricao}\n\nCategorias disponíveis:\n${catalogo}`,
    text: {
      format: {
        type: 'json_schema',
        name: 'orientacao_necessidade',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            categorias: {
              type: 'array',
              items: { type: 'string', enum: slugs },
              maxItems: 4
            },
            termos: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 6
            },
            orientacao: { type: 'string', maxLength: 1600 },
            passos: {
              type: 'array',
              items: { type: 'string', maxLength: 240 },
              maxItems: 4
            }
          },
          required: ['categorias', 'termos', 'orientacao', 'passos'],
          additionalProperties: false
        }
      }
    }
  }));

  const resultado = extrairJson(response);
  const permitidas = new Set(slugs);
  resultado.categorias = [...new Set((resultado.categorias || []).filter((slug) => permitidas.has(slug)))].slice(0, 4);
  resultado.termos = [...new Set((resultado.termos || []).map((t) => String(t).trim()).filter(Boolean))].slice(0, 6);
  resultado.passos = (resultado.passos || []).map((t) => String(t).trim()).filter(Boolean).slice(0, 4);
  resultado.orientacao = String(resultado.orientacao || '').trim();
  return resultado;
}

export async function sugerirDescricaoPerfilComIA({ titulo, descricao, servicos = [], cidade, regiaoAtendimento }) {
  const api = obterCliente();
  const listaServicos = servicos.map((s) => s.titulo).filter(Boolean).slice(0, 12).join(', ');

  const response = await executarConsultaIA(() => api.responses.create({
    model: ambiente.ia.modelo,
    reasoning: { effort: 'none' },
    instructions: [
      'Você ajuda prestadores do ConectaTorres a escrever uma descrição profissional curta e objetiva.',
      'Use apenas informações fornecidas pelo prestador. Não invente anos de experiência, certificações, preços, garantias, bairros ou qualificações.',
      'Escreva em português do Brasil, em primeira pessoa ou tom profissional natural, sem exageros publicitários.',
      'A descrição deve ter no máximo 700 caracteres e pode ter de 2 a 4 frases.'
    ].join(' '),
    input: [
      `Título profissional: ${titulo || 'não informado'}`,
      `Descrição atual: ${descricao || 'não informada'}`,
      `Serviços cadastrados: ${listaServicos || 'nenhum informado'}`,
      `Cidade: ${cidade || 'não informada'}`,
      `Região de atendimento: ${regiaoAtendimento || 'não informada'}`
    ].join('\n'),
    text: {
      format: {
        type: 'json_schema',
        name: 'descricao_profissional',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            descricao: { type: 'string', maxLength: 700 }
          },
          required: ['descricao'],
          additionalProperties: false
        }
      }
    }
  }));

  const resultado = extrairJson(response);
  return String(resultado.descricao || '').trim().slice(0, 700);
}
