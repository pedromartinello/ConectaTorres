export function rotaNaoEncontrada(req, res) {
  return res.status(404).json({ mensagem: 'Rota nao encontrada.' });
}

export function tratarErros(erro, req, res, next) {
  console.error(erro);
  if (erro.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ mensagem: 'Ja existe um registro com estes dados.' });
  }
  if (erro.name === 'SequelizeValidationError') {
    return res.status(422).json({ mensagem: erro.errors?.[0]?.message || 'Dados invalidos.' });
  }
  if (erro.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ mensagem: 'Este registro esta vinculado a outros dados e nao pode ser removido.' });
  }
  return res.status(erro.status || 500).json({ mensagem: erro.status ? erro.message : 'Erro interno do servidor.' });
}
