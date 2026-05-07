import { Medico } from '../entities/medico.js';

export interface IMedicoRepository {
  listarTodos(): Medico[];
  buscarPorId(id: number): Medico | undefined;
}
