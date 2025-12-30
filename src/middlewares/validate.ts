import { Request, Response, NextFunction } from "express";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { validationError } from "@/utils/error";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validate = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validate = ajv.compile(schema);
      const valid = validate(req.body);

      if (!valid) {
        const requiredFields = schema.required as string[] | undefined;
        const errors = validate.errors?.map((error) => {
          let field = error.instancePath.replace("/", "") || error.params?.missingProperty;
          const message = error.message || "is invalid";

          // If field is still undefined/empty, it's likely the entire body is missing
          if (!field) {
            if (message === "must be object" && requiredFields?.length) {
              return `Request body is required. Required fields: ${requiredFields.join(", ")}`;
            }
            return message;
          }

          return `${field}: ${message}`;
        });
        throw validationError(errors || []);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
