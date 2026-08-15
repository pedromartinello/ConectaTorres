import { validationResult } from 'express-validator';

export function validarRequisicao(req, res, next) {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(422).json({
      mensagem: 'Dados invalidos.',
      erros: erros.array().map((erro) => ({ campo: erro.path, mensagem: erro.msg }))
    });
  }
  return next();
}
