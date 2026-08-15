export const asyncHandler = (funcao) => (req, res, next) => {
  Promise.resolve(funcao(req, res, next)).catch(next);
};
