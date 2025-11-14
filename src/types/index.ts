// Types for the application
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "customer";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  filename: string;
  path: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AgentComment {
  agentId: string;
  commentText: string;
  commentedAt: string;
}

export interface Ticket {
  _id: string;
  name: string;
  description: string;
  category: Category | string;
  priority: "low" | "medium" | "high";
  status: "open" | "in progress" | "resolved" | "closed";
  customer: User | string;
  assignedAgent?: User | string;
  attachments: Attachment[];
  agentComments: AgentComment[];
  createdBy: User | string;
  createdAt: string;
  updatedAt: string;
  commentText?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
// src/constants/roles.ts
export enum ROLES {
  ADMIN = "admin",
  AGENT = "agent",
  CUSTOMER = "customer",
}
