export const TOAST_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Login successful!",
    REGISTER_SUCCESS: "Registration successful!",
    LOGOUT_SUCCESS: "Logged out successfully!",
  },

  CATEGORY: {
    CREATED: "Category Added successfully!",
    UPDATED: "Category Updated successfully!",
    ACTIVATED: "Category Activated Successfully!",
    DEACTIVATED: "Category Deactivated Successfully!",
  },

  USER: {
    CREATED: "New User Added successfully!",
    UPDATED: "User Updated successfully!",
    ACTIVATED: "User has been activated successfully",
    DEACTIVATED: "User has been deactivated successfully",
  },

  TICKET: {
    CREATED: "Ticket created successfully!",
    UPDATED: "Ticket updated successfully!",
    COMMENT_ADDED: "Comment added successfully!",
  },

  ERROR: {
    GENERIC: "An error occurred while processing your request",
    LOAD_FAILED: "Failed to load data",
    ADMIN_DATA_FAILED: "Failed to load admin data",
    UPDATE_FAILED: "Failed to update",
    CREATE_FAILED: "Failed to create",
  },
} as const;
