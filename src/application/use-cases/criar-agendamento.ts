import { Agendamento } from '../../domain/entities/agendamento.js';
import { HorarioIndisponivelError } from '../../domain/errors/horario-indisponivel-error.js';
import { NaoEncontradoError } from '../../domain/errors/nao-encontrado-error.js';
import { ValidationError } from '../../domain/errors/validation-error.js';
import { IAgendamentoRepository } from '../../domain/repositories/agendamento-repository.js';
import { IMedicoRepository } from '../../domain/repositories/medico-repository.js';
import { v4 as uuidv4 } from 'uuid';

export interface CriarAgendamentoInput {
  readonly medico_id: number;
  readonly paciente: string;
  readonly data_horario: string;
}

interface CriarAgendamentoOutput {
  readonly mensagem: string;
  readonly agendamento: Agendamento;
}

export class CriarAgendamentoUseCase {
  constructor(
    private readonly medicoRepository: IMedicoRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
  ) {}

  execute(input: CriarAgendamentoInput): CriarAgendamentoOutput {
    const medico = this.medicoRepository.buscarPorId(input.medico_id);

    if (!medico) {
      throw new NaoEncontradoError(`Médico com id ${input.medico_id} não encontrado.`);
    }

    if (!medico.horarios_disponiveis.includes(input.data_horario)) {
      throw new ValidationError(
        `O horário ${input.data_horario} não faz parte da agenda do médico ${medico.nome}.`,
      );
    }

    if (this.agendamentoRepository.existeConflito(input.medico_id, input.data_horario)) {
      throw new HorarioIndisponivelError();
    }

    const agendamento: Agendamento = {
      id: uuidv4(),
      medico_id: medico.id,
      medico: medico.nome,
      paciente: input.paciente,
      data_horario: input.data_horario,
    };

    this.agendamentoRepository.criar(agendamento);

    return {
      mensagem: 'Agendamento realizado com sucesso',
      agendamento,
    };
  }
}
