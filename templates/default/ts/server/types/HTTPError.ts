export class HTTPError extends Error {
  code: number;

  message: string;

  constructor(code: number, message: string) {
    super();
    this.code = code;
    this.message = message;
  }
}
