export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  GET_CURRENT_USER: "/auth/getCurrentUser",
};

export const TICKET_ENDPOINTS = {
  CREATE: "/tickets",
  GET_ALL: "/tickets",
  GET_BY_USER: "/tickets/user",
  GET_BY_ID: (id: string) => `/tickets/${id}`,
  UPDATE: (id: string) => `/tickets/${id}`,
  ADD_COMMENT: (id: string) => `/tickets/${id}/agent-comment`,
};

export const CATEGORY_ENDPOINTS = {
  CREATE: "/category",
  UPDATE: (id: string) => `/category/${id}`,
  GET_BY_ID: (id: string) => `/category/${id}`,
  GET_ALL: "/category",
  TOGGLE_STATUS: (id: string) => `/category/${id}/status`,
  GET_ACTIVE: "/category/active/list",
};

export const USER_ENDPOINTS = {
  GET_ALL: "/user",
  GET_BY_ID: (id: string) => `/user/${id}`,
  UPDATE: (id: string) => `/user/${id}`,
};
