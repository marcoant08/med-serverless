export interface Agendamento {
  readonly id: string;
  readonly medico_id: number;
  readonly medico: string;
  readonly paciente: string;
  readonly data_horario: string;
}
