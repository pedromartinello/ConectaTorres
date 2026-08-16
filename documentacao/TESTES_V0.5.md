# Testes manuais da v0.5

## IA - busca inteligente

1. Configurar `OPENAI_API_KEY`.
2. Reiniciar backend e frontend.
3. Confirmar `/api/saude` com `integracoes.ia = true`.
4. Na página inicial, escrever: `Preciso trocar o chuveiro e revisar duas tomadas`.
5. Confirmar que a IA identifica categoria compatível, sem criar nomes de profissionais.
6. Confirmar que os resultados exibidos são somente cadastros existentes.
7. Testar texto fora das categorias atuais e confirmar tratamento amigável.
8. Remover temporariamente a chave e confirmar que o restante do site continua funcionando.

## IA - perfil do prestador

1. Entrar como prestador.
2. Abrir Perfil profissional.
3. Preencher título, cidade, região e uma descrição simples.
4. Clicar em `Melhorar descrição com IA`.
5. Confirmar que a sugestão entra no textarea, mas não é salva automaticamente.
6. Editar a sugestão e salvar o perfil manualmente.

## Recuperação de senha por e-mail

1. Configurar SMTP.
2. Confirmar `/api/saude` com `integracoes.email = true`.
3. Na tela de login, abrir `Esqueci minha senha`.
4. Informar e-mail de uma conta existente.
5. Confirmar recebimento da mensagem.
6. Abrir o link e definir nova senha.
7. Confirmar que o link não funciona novamente após uso.
8. Confirmar login com a nova senha.
9. Informar um e-mail inexistente e confirmar que a mensagem da tela continua genérica.
