import { Request, Response, NextFunction } from "express";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { validationError } from "@/utils/error";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validate = (schema: object) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validate = ajv.compile(schema);
      const valid = validate(req.body);

      if (!valid) {
        const errors = validate.errors?.map((error) => {
          const field = error.instancePath.replace("/", "") || error.params?.missingProperty;
          return `${field}: ${error.message}`;
        });
        throw validationError(errors || []);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
