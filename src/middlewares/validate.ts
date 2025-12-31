import { Request, Response, NextFunction } from "express";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { structuredValidationError, ValidationError } from "@/utils/error";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Map Ajv errors to structured format
const mapAjvError = (error: any): ValidationError => {
  let field = error.instancePath.replace("/", "") || error.params?.missingProperty || "";
  const keyword = error.keyword;

  const errorMapping: Record<string, { message: string; code: string }> = {
    required: { message: "This field is required", code: "REQUIRED" },
    format: { message: "Invalid format", code: "INVALID_FORMAT" },
    minLength: { message: `Must be at least ${error.params.limit} characters`, code: "MIN_LENGTH" },
    maxLength: { message: `Must be no more than ${error.params.limit} characters`, code: "MAX_LENGTH" },
    minimum: { message: `Must be at least ${error.params.limit}`, code: "MIN_VALUE" },
    maximum: { message: `Must be at most ${error.params.limit}`, code: "MAX_VALUE" },
    pattern: { message: "Invalid format", code: "PATTERN_MISMATCH" },
    additionalProperties: { message: "Unexpected field", code: "UNEXPECTED_FIELD" },
    enum: {
      message: (() => {
        const allowedValues = error.params?.allowedValues || error.parentSchema?.enum;
        return allowedValues
          ? `Must be one of: ${allowedValues.join(', ')}`
          : "Invalid value";
      })(),
      code: "INVALID_ENUM",
    },
  };

  const mapped = errorMapping[keyword] || {
    message: "Invalid value",
    code: "INVALID_VALUE",
  };

  // Special handling for email format
  if (keyword === "format" && error.params?.format === "email") {
    return { field, message: "Must be a valid email address", code: "INVALID_EMAIL" };
  }

  return { field, message: mapped.message, code: mapped.code };
};

export const validate = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Handle empty/undefined request body
      const isEmptyBody = !req.body || Object.keys(req.body).length === 0;

      if (isEmptyBody && schema.required?.length) {
        const validationErrors: ValidationError[] = schema.required.map((field: string) => ({
          field,
          message: "This field is required",
          code: "REQUIRED",
        }));
        throw structuredValidationError(validationErrors, "Validation failed");
      }

      const validate = ajv.compile(schema);
      const valid = validate(req.body);

      if (!valid) {
        const validationErrors: ValidationError[] = validate.errors!.map(mapAjvError);
        throw structuredValidationError(validationErrors, "Validation failed");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
