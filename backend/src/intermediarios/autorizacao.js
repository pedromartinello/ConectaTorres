export function permitirTipos(...tipos) {
  return (req, res, next) => {
    if (!req.usuario || !tipos.includes(req.usuario.tipo)) {
      return res.status(403).json({ mensagem: 'Voce nao possui permissao para esta operacao.' });
    }
    return next();
  };
}
