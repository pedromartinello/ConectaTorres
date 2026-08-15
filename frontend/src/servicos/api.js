const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const SERVIDOR_URL = API_URL.replace(/\/api\/?$/, '');

export function urlMidia(caminho) {
  if (!caminho) return null;
  if (/^https?:\/\//i.test(caminho)) return caminho;
  return `${SERVIDOR_URL}${caminho}`;
}

export async function api(caminho, opcoes = {}) {
  let resposta;
  const ehFormData = opcoes.body instanceof FormData;
  const headers = { ...(opcoes.headers || {}) };
  if (!ehFormData && opcoes.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      credentials: 'include',
      ...opcoes,
      headers
    });
  } catch {
    throw new Error('Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando na porta 3001.');
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const detalhes = dados.erros?.length ? ` ${dados.erros.map((e) => e.mensagem).join(' ')}` : '';
    const erro = new Error(`${dados.mensagem || 'Erro na comunicacao com o servidor.'}${detalhes}`.trim());
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }
  return dados;
}
