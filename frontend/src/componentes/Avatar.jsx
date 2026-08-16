import { urlMidia } from '../servicos/api.js';

export function Avatar({ nome = '', fotoUrl, tamanho = 'medio' }) {
  const iniciais = nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
  const src = urlMidia(fotoUrl);
  return (
    <span className={`avatar avatar-${tamanho}`} aria-label={`Foto de ${nome || 'usuário'}`}>
      {src ? <img src={src} alt={`Foto de ${nome}`} /> : <span>{iniciais}</span>}
    </span>
  );
}
