/**
 * Bot Configuration Dashboard - Type Definitions
 */

// Authentication & User
export interface AuthUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface DiscordGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export interface AuthData extends AuthUser {
  guilds: DiscordGuild[];
}

// Bot Configuration
export interface CustomCommand {
  id: string;
  name: string;
  response: string;
  enabled: boolean;
}

export interface ServerConfig {
  serverId: string;
  prefix: string;
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  modRole: string | null;
  logChannel: string | null;
  autorole: boolean;
  autoroleIds: string[];
  customCommands: CustomCommand[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServerConfigInput
  extends Omit<ServerConfig, 'createdAt' | 'updatedAt'> {}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConfigResponse extends ApiResponse<ServerConfig> {}

export interface GuildsResponse extends ApiResponse<DiscordGuild[]> {}

export interface AuthCheckResponse {
  authenticated: boolean;
}

// WebSocket Types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
}

export interface ConfigUpdatePayload {
  serverId: string;
  config: ServerConfig;
  updatedBy?: string;
  timestamp?: string;
}

export interface BotStatusPayload {
  serverId: string;
  status: 'online' | 'offline' | 'idle';
  uptime: number;
  version: string;
  lastUpdate: string;
}

// Form Types
export interface ConfigFormData extends ServerConfig {}

export interface CustomCommandFormData {
  name: string;
  response: string;
}

// Database Types
export interface BotServerConfigDB extends ServerConfig {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSessionDB {
  _id?: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Error Types
export class BotDashboardError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'BotDashboardError';
  }
}

// Request/Response Helpers
export interface ConfigUpdateRequest {
  serverId: string;
  config: Partial<ServerConfig>;
}

export interface WebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

// Utility Types
export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'ja';

export type BotStatus = 'online' | 'offline' | 'idle';

export type ConfigField = keyof Omit<
  ServerConfig,
  'serverId' | 'createdAt' | 'updatedAt'
>;

// Component Props Types
export interface ServerSelectorProps {
  onSelect: (serverId: string) => void;
  selectedServerId?: string;
}

export interface ServerConfigFormProps {
  serverId: string;
  initialConfig: ServerConfig;
}

export interface CustomCommandsProps {
  commands: CustomCommand[];
  onUpdate: (commands: CustomCommand[]) => void;
  disabled?: boolean;
}

export interface ServerStatusProps {
  serverId: string;
}

export interface DashboardNavProps {
  onLogout?: () => void;
}

// Hook Types
export interface UseWebSocketReturn {
  isConnected: boolean;
  error: string | null;
  send: (type: string, payload: any) => boolean;
  on: (type: string, callback: (data: any) => void) => () => void;
  disconnect: () => void;
  ws: any; // WebSocket instance
}

// Enum Types
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum SuccessCode {
  OK = 'OK',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

// Constants for validation
export const LANGUAGE_OPTIONS: LanguageCode[] = ['en', 'es', 'fr', 'de', 'ja'];

export const DEFAULT_CONFIG: ServerConfig = {
  serverId: '',
  prefix: '!',
  language: 'en',
  modRole: null,
  logChannel: null,
  autorole: false,
  autoroleIds: [],
  customCommands: [],
};

// Validation Schemas (for use with zod/yup)
export const CONFIG_CONSTRAINTS = {
  prefix: {
    min: 1,
    max: 5,
  },
  commandName: {
    min: 1,
    max: 32,
  },
  commandResponse: {
    min: 1,
    max: 2000,
  },
  language: {
    enum: LANGUAGE_OPTIONS,
  },
};

// Type Guards
export function isDiscordGuild(obj: any): obj is DiscordGuild {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.owner === 'boolean'
  );
}

export function isServerConfig(obj: any): obj is ServerConfig {
  return (
    typeof obj === 'object' &&
    typeof obj.serverId === 'string' &&
    typeof obj.prefix === 'string' &&
    typeof obj.language === 'string' &&
    Array.isArray(obj.customCommands)
  );
}

export function isCustomCommand(obj: any): obj is CustomCommand {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.response === 'string' &&
    typeof obj.enabled === 'boolean'
  );
}

export function isBotStatusPayload(obj: any): obj is BotStatusPayload {
  return (
    typeof obj === 'object' &&
    typeof obj.serverId === 'string' &&
    ['online', 'offline', 'idle'].includes(obj.status) &&
    typeof obj.uptime === 'number' &&
    typeof obj.version === 'string'
  );
}
