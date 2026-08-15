const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function api(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(opcoes.headers || {})
    },
    ...opcoes
  });

  if (resposta.status === 204) return null;

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) {
    const erro = new Error(dados.mensagem || 'Erro na comunicacao com o servidor.');
    erro.status = resposta.status;
    erro.dados = dados;
    throw erro;
  }

  return dados;
}
