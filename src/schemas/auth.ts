export const registerSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 3,
      maxLength: 50,
    },
    password: {
      type: "string",
      minLength: 6,
      maxLength: 100,
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};

export const loginSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      format: "email",
      minLength: 1,
    },
    password: {
      type: "string",
      minLength: 1,
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
};
