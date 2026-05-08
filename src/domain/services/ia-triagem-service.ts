export interface TriagemSugestao {
  readonly especialidade: string;
  readonly justificativa: string;
}

export interface IIaTriagemService {
  sugerirEspecialidade(sintomas: string): Promise<TriagemSugestao>;
}
