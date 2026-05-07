export abstract class BusinessError extends Error {
  abstract readonly statusCode: number;
  abstract readonly erro: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
