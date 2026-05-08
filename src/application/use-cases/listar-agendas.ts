import { Medico } from '../../domain/entities/medico.js';
import { IMedicoRepository } from '../../domain/repositories/medico-repository.js';
import { IAgendamentoRepository } from '../../domain/repositories/agendamento-repository.js';
import { Logger } from '../../infrastructure/logger/logger.js';

interface MedicoComHorariosDisponiveis {
  readonly id: number;
  readonly nome: string;
  readonly especialidade: string;
  readonly horarios_disponiveis: string[];
}

interface ListarAgendasOutput {
  readonly medicos: MedicoComHorariosDisponiveis[];
}

export class ListarAgendasUseCase {
  constructor(
    private readonly medicoRepository: IMedicoRepository,
    private readonly agendamentoRepository: IAgendamentoRepository,
    private readonly logger: Logger,
  ) {}

  execute(): ListarAgendasOutput {
    this.logger.info('buscando agendamentos');
    const medicos = this.medicoRepository.listarTodos();

    const medicosComDisponibilidade = medicos.map((medico) =>
      this.filtrarHorariosOcupados(medico),
    );

    return { medicos: medicosComDisponibilidade };
  }

  private filtrarHorariosOcupados(medico: Medico): MedicoComHorariosDisponiveis {
    const agendamentos = this.agendamentoRepository.listarPorMedico(medico.id);
    const horariosOcupados = new Set(agendamentos.map((a) => a.data_horario));

    return {
      id: medico.id,
      nome: medico.nome,
      especialidade: medico.especialidade,
      horarios_disponiveis: medico.horarios_disponiveis.filter((h) => !horariosOcupados.has(h)),
    };
  }
}
