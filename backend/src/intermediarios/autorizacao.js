export function permitirTipos(...tipos) {
  return (req, res, next) => {
    if (!req.usuario || !tipos.includes(req.usuario.tipo)) {
      return res.status(403).json({ mensagem: 'Você não possui permissão para esta operação.' });
    }
    return next();
  };
}
