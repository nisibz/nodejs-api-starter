export interface IErrorInfo {
  status?: number;
  messages?: string[];
}

class ErrorInfo implements IErrorInfo {
  constructor(
    public status?: number,
    public messages?: string[],
  ) {}
}

export const notFound = (module: string): ErrorInfo => new ErrorInfo(400, [`${module} not found`]);

export const alreadyExists = (module: string): ErrorInfo =>
  new ErrorInfo(400, [`${module} already exists`]);

export const validationError = (error: string[]): ErrorInfo => new ErrorInfo(400, error);

export const invalidCredentials = new ErrorInfo(401, ["Invalid credentials"]);
export const missingAuthToken = new ErrorInfo(401, ["Missing authorization token"]);
export const invalidToken = new ErrorInfo(401, ["Invalid or expired token"]);

export const apiPathNotFound = new ErrorInfo(404, ["API path not found"]);
