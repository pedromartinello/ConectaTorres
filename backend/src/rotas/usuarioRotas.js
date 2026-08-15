import { Router } from 'express';
import { body } from 'express-validator';
import { atualizarMeuPerfil, alterarSenha, enviarFotoPerfil, removerFotoPerfil } from '../controladores/usuarioControlador.js';
import { exigirAutenticacao } from '../intermediarios/autenticacao.js';
import { validarRequisicao } from '../intermediarios/validacao.js';
import { executarUpload } from '../intermediarios/upload.js';
import { uploadFotoPerfil } from '../configuracao/upload.js';
import { asyncHandler } from '../utilitarios/asyncHandler.js';

const router = Router();
router.use(exigirAutenticacao);
router.put('/meu-perfil', [
  body('nome').trim().isLength({ min: 3, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  body('telefone').optional({ nullable: true }).isLength({ max: 30 })
], validarRequisicao, asyncHandler(atualizarMeuPerfil));
router.patch('/minha-senha', [
  body('senhaAtual').notEmpty(),
  body('novaSenha').isLength({ min: 8, max: 128 })
    .matches(/[a-z]/).matches(/[A-Z]/).matches(/[0-9]/)
    .withMessage('A nova senha precisa ter 8 caracteres, maiuscula, minuscula e numero.')
], validarRequisicao, asyncHandler(alterarSenha));
router.post('/minha-foto', executarUpload(uploadFotoPerfil), asyncHandler(enviarFotoPerfil));
router.delete('/minha-foto', asyncHandler(removerFotoPerfil));
export default router;
