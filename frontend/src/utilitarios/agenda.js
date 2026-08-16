export const DIAS_SEMANA = [
  { valor: 1, nome: 'Segunda-feira', curto: 'Seg' },
  { valor: 2, nome: 'Terça-feira', curto: 'Ter' },
  { valor: 3, nome: 'Quarta-feira', curto: 'Qua' },
  { valor: 4, nome: 'Quinta-feira', curto: 'Qui' },
  { valor: 5, nome: 'Sexta-feira', curto: 'Sex' },
  { valor: 6, nome: 'Sábado', curto: 'Sáb' },
  { valor: 0, nome: 'Domingo', curto: 'Dom' }
];

export function criarAgendaSemanalPadrao() {
  return DIAS_SEMANA.map((dia) => ({
    diaSemana: dia.valor,
    ativo: dia.valor >= 1 && dia.valor <= 5,
    inicio: '08:00',
    fim: '18:00'
  }));
}

export function mesclarAgendaSemanal(registros = []) {
  const base = criarAgendaSemanalPadrao();
  if (!registros.length) return base;
  return base.map((item) => {
    const registro = registros.find((r) => Number(r.diaSemana) === item.diaSemana);
    if (!registro) return { ...item, ativo: false };
    return {
      diaSemana: item.diaSemana,
      ativo: Boolean(registro.ativo),
      inicio: registro.inicio ? String(registro.inicio).slice(0, 5) : item.inicio,
      fim: registro.fim ? String(registro.fim).slice(0, 5) : item.fim
    };
  });
}

export function nomeDiaSemana(numero) {
  return DIAS_SEMANA.find((item) => item.valor === Number(numero))?.nome || 'Dia';
}

export function formatarDataCurta(data) {
  if (!data) return '';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${data}T12:00:00`));
}

export function hojeLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function montarDataHoraLocal(data, hora) {
  if (!data || !hora) return null;
  const valor = new Date(`${data}T${hora}:00`);
  return Number.isNaN(valor.getTime()) ? null : valor;
}
