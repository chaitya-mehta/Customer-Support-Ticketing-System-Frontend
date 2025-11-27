export const VALIDATION_MESSAGES = {
  EMAIL: {
    INVALID: "Invalid email address",
    VALID: "Please enter a valid email",
    REQUIRED: "Email is required",
  },

  PASSWORD: {
    REQUIRED: "Password is required",
    MIN_LENGTH: "Password must be at least 6 characters",
    MIN_LENGTH_8: "Password must be at least 8 characters",
    UPPERCASE: "Password must contain at least one uppercase letter",
    LOWERCASE: "Password must contain at least one lowercase letter",
    NUMBER: "Password must contain at least one number",
    SPECIAL_CHAR: "Password must contain at least one special character",
  },

  NAME: {
    REQUIRED: "Full Name is required",
    MIN_LENGTH: "Full Name must be at least 3 characters",
  },

  TITLE: {
    REQUIRED: "Title is required",
    MIN_LENGTH: "Title must be at least 5 characters",
    MAX_LENGTH: "Title must not exceed 100 characters",
  },

  DESCRIPTION: {
    REQUIRED: "Description is required",
    MIN_LENGTH: "Description must be at least 10 characters",
    MAX_LENGTH: "Description must not exceed 1000 characters",
  },

  CATEGORY: {
    REQUIRED: "Category is required",
    NAME_REQUIRED: "Category name is required",
    NAME_MIN_LENGTH: "Category name must be at least 3 characters",
  },

  PRIORITY: {
    REQUIRED: "Priority is required",
    INVALID: "Invalid priority level",
  },

  STATUS: {
    REQUIRED: "Status is required",
    INVALID: "Invalid status",
  },

  ROLE: {
    REQUIRED: "Role is required",
  },

  COMMENT: {
    REQUIRED: "Comment is required",
    MIN_LENGTH: "Comment must be at least 3 characters",
    MAX_LENGTH: "Comment must not exceed 500 characters",
  },

  AGENT: {
    REQUIRED: "Agent assignment is required",
    ASSIGN_REQUIRED: "Please assign an agent",
  },
} as const;
