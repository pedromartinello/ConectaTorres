export function executarUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (erro) => {
      if (!erro) return next();
      if (erro.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ mensagem: 'A imagem deve ter no maximo 5 MB.' });
      }
      return res.status(422).json({ mensagem: erro.message || 'Falha ao enviar imagem.' });
    });
  };
}
