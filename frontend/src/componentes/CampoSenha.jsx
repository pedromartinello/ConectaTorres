import { useState } from 'react';

export function CampoSenha({ id, nome, valor, aoAlterar, rotulo = 'Senha', obrigatorio = true, tamanhoMinimo, autoComplete = 'current-password', placeholder = '' }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  return (
    <label htmlFor={id}>{rotulo}
      <div className="campo-senha">
        <input id={id} name={nome} type={mostrarSenha ? 'text' : 'password'} value={valor} onChange={aoAlterar} required={obrigatorio} minLength={tamanhoMinimo} autoComplete={autoComplete} placeholder={placeholder} />
        <button type="button" className="botao-senha" onClick={() => setMostrarSenha((v) => !v)} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'} title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
          {mostrarSenha ? '◉' : '◎'}
        </button>
      </div>
    </label>
  );
}
