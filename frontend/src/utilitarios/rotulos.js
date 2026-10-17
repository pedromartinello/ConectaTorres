export function rotuloStatusAgendamento(status) {
  const rotulos = {
    pendente: 'Pendente',
    aceito: 'Aceito',
    recusado: 'Recusado',
    cancelado: 'Cancelado'
  };
  return rotulos[status] || status;
}

export function rotuloStatusDenuncia(status) {
  const rotulos = {
    aberta: 'Aberta',
    em_analise: 'Em análise',
    resolvida: 'Resolvida',
    arquivada: 'Arquivada'
  };
  return rotulos[status] || status;
}

export function rotuloTipoUsuario(tipo) {
  const rotulos = {
    cliente: 'Cliente',
    prestador: 'Prestador',
    admin: 'Administrador'
  };
  return rotulos[tipo] || tipo;
}


export function rotuloStatusOrcamento(status) {
  const rotulos = {
    enviado: 'Aguardando resposta',
    aceito: 'Aceito',
    recusado: 'Recusado',
    cancelado: 'Cancelado',
    expirado: 'Expirado'
  };
  return rotulos[status] || status;
}
