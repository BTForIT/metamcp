var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/logger.ts
import { createWriteStream } from "fs";
import { format } from "util";
var LOG_LEVEL, validLogLevels, getValidLogLevel, Logger, logger, logger_default;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    "use strict";
    ({ LOG_LEVEL } = process.env);
    validLogLevels = ["all", "info", "errors-only", "none"];
    getValidLogLevel = /* @__PURE__ */ __name((level) => {
      if (!level) return "errors-only";
      if (validLogLevels.includes(level)) {
        return level;
      }
      return "errors-only";
    }, "getValidLogLevel");
    Logger = class _Logger {
      static {
        __name(this, "Logger");
      }
      static defaultLogFilePath = "app.log";
      static defaultErrorFilePath = "error.log";
      logFile;
      errorFile;
      consoleMode;
      constructor(options = {}) {
        const {
          logFilePath = _Logger.defaultLogFilePath,
          errorFilePath = _Logger.defaultErrorFilePath,
          shouldConsoleLog = "all"
        } = options;
        this.logFile = createWriteStream(logFilePath, { flags: "a" });
        this.errorFile = createWriteStream(errorFilePath, { flags: "a" });
        this.consoleMode = typeof shouldConsoleLog === "boolean" ? shouldConsoleLog ? "all" : "none" : shouldConsoleLog;
      }
      formatDate(date) {
        const pad = /* @__PURE__ */ __name((n) => n.toString().padStart(2, "0"), "pad");
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} - ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      }
      customLog(outputStream, level, ...args) {
        const logMessage = format(...args);
        const formattedMessage = `[${level}] ${this.formatDate(/* @__PURE__ */ new Date())} | ${logMessage}
`;
        outputStream.write(formattedMessage);
        if (this.consoleMode !== "none") {
          const shouldMirror = this.consoleMode === "all" || this.consoleMode === "info" && level === "INFO" || this.consoleMode === "errors-only" && (level === "WARN" || level === "ERROR");
          if (shouldMirror) {
            const trimmed = formattedMessage.trim();
            if (level === "INFO") {
              console.info(trimmed);
            } else if (level === "ERROR") {
              console.error(trimmed);
            } else if (level === "WARN") {
              console.warn(trimmed);
            } else {
              console.log(trimmed);
            }
          }
        }
      }
      debug = /* @__PURE__ */ __name((...args) => this.customLog(this.logFile, "DEBUG", ...args), "debug");
      info = /* @__PURE__ */ __name((...args) => this.customLog(this.logFile, "INFO", ...args), "info");
      warn = /* @__PURE__ */ __name((...args) => this.customLog(this.logFile, "WARN", ...args), "warn");
      error = /* @__PURE__ */ __name((...args) => this.customLog(this.errorFile, "ERROR", ...args), "error");
      close() {
        this.logFile.end();
        this.errorFile.end();
      }
    };
    logger = new Logger({
      shouldConsoleLog: getValidLogLevel(LOG_LEVEL)
    });
    logger_default = logger;
  }
});

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accountsTable: () => accountsTable,
  apiKeysTable: () => apiKeysTable,
  configTable: () => configTable,
  endpointsTable: () => endpointsTable,
  mcpServerErrorStatusEnum: () => mcpServerErrorStatusEnum,
  mcpServerStatusEnum: () => mcpServerStatusEnum,
  mcpServerTypeEnum: () => mcpServerTypeEnum,
  mcpServersTable: () => mcpServersTable,
  namespaceServerMappingsTable: () => namespaceServerMappingsTable,
  namespaceToolMappingsTable: () => namespaceToolMappingsTable,
  namespacesTable: () => namespacesTable,
  oauthAccessTokensTable: () => oauthAccessTokensTable,
  oauthAuthorizationCodesTable: () => oauthAuthorizationCodesTable,
  oauthClientsTable: () => oauthClientsTable,
  oauthSessionsTable: () => oauthSessionsTable,
  sessionsTable: () => sessionsTable,
  toolsTable: () => toolsTable,
  usersTable: () => usersTable,
  verificationsTable: () => verificationsTable
});
import {
  McpServerErrorStatusEnum,
  McpServerStatusEnum,
  McpServerTypeEnum
} from "@repo/zod-types";
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid
} from "drizzle-orm/pg-core";
var mcpServerTypeEnum, mcpServerStatusEnum, mcpServerErrorStatusEnum, mcpServersTable, oauthSessionsTable, toolsTable, usersTable, sessionsTable, accountsTable, verificationsTable, namespacesTable, endpointsTable, namespaceServerMappingsTable, namespaceToolMappingsTable, apiKeysTable, configTable, oauthClientsTable, oauthAuthorizationCodesTable, oauthAccessTokensTable;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    mcpServerTypeEnum = pgEnum(
      "mcp_server_type",
      McpServerTypeEnum.options
    );
    mcpServerStatusEnum = pgEnum(
      "mcp_server_status",
      McpServerStatusEnum.options
    );
    mcpServerErrorStatusEnum = pgEnum(
      "mcp_server_error_status",
      McpServerErrorStatusEnum.options
    );
    mcpServersTable = pgTable(
      "mcp_servers",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        description: text("description"),
        type: mcpServerTypeEnum("type").notNull().default(McpServerTypeEnum.Enum.STDIO),
        command: text("command"),
        args: text("args").array().notNull().default(sql`'{}'::text[]`),
        env: jsonb("env").$type().notNull().default(sql`'{}'::jsonb`),
        url: text("url"),
        error_status: mcpServerErrorStatusEnum("error_status").notNull().default(McpServerErrorStatusEnum.Enum.NONE),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        bearerToken: text("bearer_token"),
        headers: jsonb("headers").$type().notNull().default(sql`'{}'::jsonb`),
        user_id: text("user_id").references(() => usersTable.id, {
          onDelete: "cascade"
        })
      },
      (table) => [
        index("mcp_servers_type_idx").on(table.type),
        index("mcp_servers_user_id_idx").on(table.user_id),
        index("mcp_servers_error_status_idx").on(table.error_status),
        // Allow same name for different users, but unique within user scope (including public)
        unique("mcp_servers_name_user_unique_idx").on(table.name, table.user_id),
        sql`CONSTRAINT mcp_servers_name_regex_check CHECK (
        name ~ '^[a-zA-Z0-9_-]+$'
      )`,
        sql`CONSTRAINT mcp_servers_url_check CHECK (
        (type = 'SSE' AND url IS NOT NULL AND command IS NULL AND url ~ '^https?://[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:[0-9]+)?(/[a-zA-Z0-9-._~:/?#\[\]@!$&''()*+,;=]*)?$') OR
        (type = 'STDIO' AND url IS NULL AND command IS NOT NULL) OR
        (type = 'STREAMABLE_HTTP' AND url IS NOT NULL AND command IS NULL AND url ~ '^https?://[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(:[0-9]+)?(/[a-zA-Z0-9-._~:/?#\[\]@!$&''()*+,;=]*)?$')
      )`
      ]
    );
    oauthSessionsTable = pgTable(
      "oauth_sessions",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        mcp_server_uuid: uuid("mcp_server_uuid").notNull().references(() => mcpServersTable.uuid, { onDelete: "cascade" }),
        client_information: jsonb("client_information").$type().notNull().default(sql`'{}'::jsonb`),
        tokens: jsonb("tokens").$type(),
        code_verifier: text("code_verifier"),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        index("oauth_sessions_mcp_server_uuid_idx").on(table.mcp_server_uuid),
        unique("oauth_sessions_unique_per_server_idx").on(table.mcp_server_uuid)
      ]
    );
    toolsTable = pgTable(
      "tools",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        description: text("description"),
        toolSchema: jsonb("tool_schema").$type().notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
        mcp_server_uuid: uuid("mcp_server_uuid").notNull().references(() => mcpServersTable.uuid, { onDelete: "cascade" })
      },
      (table) => [
        index("tools_mcp_server_uuid_idx").on(table.mcp_server_uuid),
        unique("tools_unique_tool_name_per_server_idx").on(
          table.mcp_server_uuid,
          table.name
        )
      ]
    );
    usersTable = pgTable("users", {
      id: text("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      emailVerified: boolean("email_verified").notNull().default(false),
      image: text("image"),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    sessionsTable = pgTable("sessions", {
      id: text("id").primaryKey(),
      expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
      token: text("token").notNull().unique(),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" })
    });
    accountsTable = pgTable("accounts", {
      id: text("id").primaryKey(),
      accountId: text("account_id").notNull(),
      providerId: text("provider_id").notNull(),
      userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
      accessToken: text("access_token"),
      refreshToken: text("refresh_token"),
      idToken: text("id_token"),
      accessTokenExpiresAt: timestamp("access_token_expires_at", {
        withTimezone: true
      }),
      refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
        withTimezone: true
      }),
      scope: text("scope"),
      password: text("password"),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    verificationsTable = pgTable("verifications", {
      id: text("id").primaryKey(),
      identifier: text("identifier").notNull(),
      value: text("value").notNull(),
      expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
      createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    namespacesTable = pgTable(
      "namespaces",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        description: text("description"),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
        user_id: text("user_id").references(() => usersTable.id, {
          onDelete: "cascade"
        })
      },
      (table) => [
        index("namespaces_user_id_idx").on(table.user_id),
        // Allow same name for different users, but unique within user scope (including public)
        unique("namespaces_name_user_unique_idx").on(table.name, table.user_id),
        sql`CONSTRAINT namespaces_name_regex_check CHECK (
        name ~ '^[a-zA-Z0-9_-]+$'
      )`
      ]
    );
    endpointsTable = pgTable(
      "endpoints",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        description: text("description"),
        namespace_uuid: uuid("namespace_uuid").notNull().references(() => namespacesTable.uuid, { onDelete: "cascade" }),
        enable_api_key_auth: boolean("enable_api_key_auth").notNull().default(true),
        enable_oauth: boolean("enable_oauth").notNull().default(false),
        enable_max_rate: boolean("enable_max_rate").notNull().default(false),
        enable_client_max_rate: boolean("enable_client_max_rate").notNull().default(false),
        max_rate: integer("max_rate"),
        max_rate_seconds: integer("max_rate_seconds"),
        client_max_rate: integer("client_max_rate"),
        client_max_rate_seconds: integer("client_max_rate_seconds"),
        client_max_rate_strategy: text("client_max_rate_strategy"),
        client_max_rate_strategy_key: text("client_max_rate_strategy_key"),
        use_query_param_auth: boolean("use_query_param_auth").notNull().default(false),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
        user_id: text("user_id").references(() => usersTable.id, {
          onDelete: "cascade"
        })
      },
      (table) => [
        index("endpoints_namespace_uuid_idx").on(table.namespace_uuid),
        index("endpoints_user_id_idx").on(table.user_id),
        // Endpoints must be globally unique because they're used in URLs like /metamcp/[name]/sse
        unique("endpoints_name_unique").on(table.name),
        sql`CONSTRAINT endpoints_name_url_compatible_check CHECK (
        name ~ '^[a-zA-Z0-9_-]+$'
      )`
      ]
    );
    namespaceServerMappingsTable = pgTable(
      "namespace_server_mappings",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        namespace_uuid: uuid("namespace_uuid").notNull().references(() => namespacesTable.uuid, { onDelete: "cascade" }),
        mcp_server_uuid: uuid("mcp_server_uuid").notNull().references(() => mcpServersTable.uuid, { onDelete: "cascade" }),
        status: mcpServerStatusEnum("status").notNull().default(McpServerStatusEnum.Enum.ACTIVE),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        index("namespace_server_mappings_namespace_uuid_idx").on(
          table.namespace_uuid
        ),
        index("namespace_server_mappings_mcp_server_uuid_idx").on(
          table.mcp_server_uuid
        ),
        index("namespace_server_mappings_status_idx").on(table.status),
        unique("namespace_server_mappings_unique_idx").on(
          table.namespace_uuid,
          table.mcp_server_uuid
        )
      ]
    );
    namespaceToolMappingsTable = pgTable(
      "namespace_tool_mappings",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        namespace_uuid: uuid("namespace_uuid").notNull().references(() => namespacesTable.uuid, { onDelete: "cascade" }),
        tool_uuid: uuid("tool_uuid").notNull().references(() => toolsTable.uuid, { onDelete: "cascade" }),
        mcp_server_uuid: uuid("mcp_server_uuid").notNull().references(() => mcpServersTable.uuid, { onDelete: "cascade" }),
        status: mcpServerStatusEnum("status").notNull().default(McpServerStatusEnum.Enum.ACTIVE),
        override_name: text("override_name"),
        override_title: text("override_title"),
        override_description: text("override_description"),
        override_annotations: jsonb("override_annotations").$type().default(sql`NULL`),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        index("namespace_tool_mappings_namespace_uuid_idx").on(
          table.namespace_uuid
        ),
        index("namespace_tool_mappings_tool_uuid_idx").on(table.tool_uuid),
        index("namespace_tool_mappings_mcp_server_uuid_idx").on(
          table.mcp_server_uuid
        ),
        index("namespace_tool_mappings_status_idx").on(table.status),
        unique("namespace_tool_mappings_unique_idx").on(
          table.namespace_uuid,
          table.tool_uuid
        )
      ]
    );
    apiKeysTable = pgTable(
      "api_keys",
      {
        uuid: uuid("uuid").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        key: text("key").notNull().unique(),
        user_id: text("user_id").references(() => usersTable.id, {
          onDelete: "cascade"
        }),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        is_active: boolean("is_active").notNull().default(true)
      },
      (table) => [
        index("api_keys_user_id_idx").on(table.user_id),
        index("api_keys_key_idx").on(table.key),
        index("api_keys_is_active_idx").on(table.is_active),
        unique("api_keys_name_per_user_idx").on(table.user_id, table.name)
      ]
    );
    configTable = pgTable("config", {
      id: text("id").primaryKey(),
      value: text("value").notNull(),
      description: text("description"),
      created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    oauthClientsTable = pgTable("oauth_clients", {
      client_id: text("client_id").primaryKey(),
      client_secret: text("client_secret"),
      client_name: text("client_name").notNull(),
      redirect_uris: text("redirect_uris").array().notNull().default(sql`'{}'::text[]`),
      grant_types: text("grant_types").array().notNull().default(sql`'{"authorization_code","refresh_token"}'::text[]`),
      response_types: text("response_types").array().notNull().default(sql`'{"code"}'::text[]`),
      token_endpoint_auth_method: text("token_endpoint_auth_method").notNull().default("none"),
      scope: text("scope").default("admin"),
      client_uri: text("client_uri"),
      logo_uri: text("logo_uri"),
      contacts: text("contacts").array(),
      tos_uri: text("tos_uri"),
      policy_uri: text("policy_uri"),
      software_id: text("software_id"),
      software_version: text("software_version"),
      created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
      updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
    });
    oauthAuthorizationCodesTable = pgTable(
      "oauth_authorization_codes",
      {
        code: text("code").primaryKey(),
        client_id: text("client_id").notNull().references(() => oauthClientsTable.client_id, { onDelete: "cascade" }),
        redirect_uri: text("redirect_uri").notNull(),
        scope: text("scope").notNull().default("admin"),
        user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
        code_challenge: text("code_challenge"),
        code_challenge_method: text("code_challenge_method"),
        expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        index("oauth_authorization_codes_client_id_idx").on(table.client_id),
        index("oauth_authorization_codes_user_id_idx").on(table.user_id),
        index("oauth_authorization_codes_expires_at_idx").on(table.expires_at)
      ]
    );
    oauthAccessTokensTable = pgTable(
      "oauth_access_tokens",
      {
        access_token: text("access_token").primaryKey(),
        client_id: text("client_id").notNull().references(() => oauthClientsTable.client_id, { onDelete: "cascade" }),
        user_id: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
        scope: text("scope").notNull().default("admin"),
        expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
        created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
      },
      (table) => [
        index("oauth_access_tokens_client_id_idx").on(table.client_id),
        index("oauth_access_tokens_user_id_idx").on(table.user_id),
        index("oauth_access_tokens_expires_at_idx").on(table.expires_at)
      ]
    );
  }
});

// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var DATABASE_URL, POSTGRES_CA_CERT, pool, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_logger();
    init_schema();
    ({ DATABASE_URL, POSTGRES_CA_CERT } = process.env);
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString: DATABASE_URL,
      ...POSTGRES_CA_CERT && {
        ssl: {
          ca: POSTGRES_CA_CERT,
          rejectUnauthorized: true
        }
      }
    });
    pool.on("error", (err) => {
      logger_default.error("PostgreSQL pool error (ignored):", err);
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// src/db/repositories/config.repo.ts
import { eq } from "drizzle-orm";
var configRepo;
var init_config_repo = __esm({
  "src/db/repositories/config.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    configRepo = {
      async getConfig(id) {
        const result = await db.select().from(configTable).where(eq(configTable.id, id));
        return result[0];
      },
      async setConfig(id, value, description) {
        await db.insert(configTable).values({
          id,
          value,
          description
        }).onConflictDoUpdate({
          target: configTable.id,
          set: {
            value,
            description,
            updated_at: /* @__PURE__ */ new Date()
          }
        });
      },
      async getAllConfigs() {
        return await db.select().from(configTable);
      },
      async deleteConfig(id) {
        await db.delete(configTable).where(eq(configTable.id, id));
      }
    };
  }
});

// src/lib/config.service.ts
import { ConfigKeyEnum } from "@repo/zod-types";
var configService;
var init_config_service = __esm({
  "src/lib/config.service.ts"() {
    "use strict";
    init_config_repo();
    configService = {
      async isSignupDisabled() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.DISABLE_SIGNUP
        );
        return config?.value === "true";
      },
      async setSignupDisabled(disabled) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.DISABLE_SIGNUP,
          disabled.toString(),
          "Whether new user signup is disabled"
        );
      },
      async isSsoSignupDisabled() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.DISABLE_SSO_SIGNUP
        );
        return config?.value === "true";
      },
      async setSsoSignupDisabled(disabled) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.DISABLE_SSO_SIGNUP,
          disabled.toString(),
          "Whether new user signup via SSO/OAuth is disabled"
        );
      },
      async isBasicAuthDisabled() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.DISABLE_BASIC_AUTH
        );
        return config?.value === "true";
      },
      async setBasicAuthDisabled(disabled) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.DISABLE_BASIC_AUTH,
          disabled.toString(),
          "Whether basic email/password authentication is disabled"
        );
      },
      async getMcpResetTimeoutOnProgress() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.MCP_RESET_TIMEOUT_ON_PROGRESS
        );
        return config?.value === "true" || true;
      },
      async setMcpResetTimeoutOnProgress(enabled) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.MCP_RESET_TIMEOUT_ON_PROGRESS,
          enabled.toString(),
          "Whether to reset timeout on progress for MCP requests"
        );
      },
      async getMcpTimeout() {
        const config = await configRepo.getConfig(ConfigKeyEnum.Enum.MCP_TIMEOUT);
        return config?.value ? parseInt(config.value, 10) : 6e4;
      },
      async setMcpTimeout(timeout) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.MCP_TIMEOUT,
          timeout.toString(),
          "MCP request timeout in milliseconds"
        );
      },
      async getMcpMaxTotalTimeout() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.MCP_MAX_TOTAL_TIMEOUT
        );
        return config?.value ? parseInt(config.value, 10) : 6e4;
      },
      async setMcpMaxTotalTimeout(timeout) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.MCP_MAX_TOTAL_TIMEOUT,
          timeout.toString(),
          "MCP maximum total timeout in milliseconds"
        );
      },
      async getMcpMaxAttempts() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.MCP_MAX_ATTEMPTS
        );
        return config?.value ? parseInt(config.value, 10) : 3;
      },
      async setMcpMaxAttempts(maxAttempts) {
        await configRepo.setConfig(
          ConfigKeyEnum.Enum.MCP_MAX_ATTEMPTS,
          maxAttempts.toString(),
          "Maximum number of crash attempts before marking MCP server as ERROR"
        );
      },
      async getSessionLifetime() {
        const config = await configRepo.getConfig(
          ConfigKeyEnum.Enum.SESSION_LIFETIME
        );
        if (!config?.value) {
          return null;
        }
        const lifetime = parseInt(config.value, 10);
        return isNaN(lifetime) ? null : lifetime;
      },
      async setSessionLifetime(lifetime) {
        if (lifetime === null || lifetime === void 0) {
          await configRepo.deleteConfig(ConfigKeyEnum.Enum.SESSION_LIFETIME);
        } else {
          await configRepo.setConfig(
            ConfigKeyEnum.Enum.SESSION_LIFETIME,
            lifetime.toString(),
            "Session lifetime in milliseconds before automatic cleanup"
          );
        }
      },
      async getConfig(key) {
        const config = await configRepo.getConfig(key);
        return config?.value;
      },
      async setConfig(key, value, description) {
        await configRepo.setConfig(key, value, description);
      },
      async getAllConfigs() {
        return await configRepo.getAllConfigs();
      },
      async getAuthProviders() {
        const providers = [];
        const isOidcEnabled = !!(process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET && process.env.OIDC_DISCOVERY_URL);
        if (isOidcEnabled) {
          providers.push({
            id: "oidc",
            name: "OIDC",
            enabled: true
          });
        }
        return providers;
      }
    };
  }
});

// src/db/repositories/namespace-mappings.repo.ts
import { and, eq as eq2, sql as sql2 } from "drizzle-orm";
var NamespaceMappingsRepository, namespaceMappingsRepository;
var init_namespace_mappings_repo = __esm({
  "src/db/repositories/namespace-mappings.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    NamespaceMappingsRepository = class {
      static {
        __name(this, "NamespaceMappingsRepository");
      }
      async updateServerStatus(input) {
        const [updatedMapping] = await db.update(namespaceServerMappingsTable).set({
          status: input.status
        }).where(
          and(
            eq2(namespaceServerMappingsTable.namespace_uuid, input.namespaceUuid),
            eq2(namespaceServerMappingsTable.mcp_server_uuid, input.serverUuid)
          )
        ).returning();
        return updatedMapping;
      }
      async updateToolStatus(input) {
        const [updatedMapping] = await db.update(namespaceToolMappingsTable).set({
          status: input.status
        }).where(
          and(
            eq2(namespaceToolMappingsTable.namespace_uuid, input.namespaceUuid),
            eq2(namespaceToolMappingsTable.tool_uuid, input.toolUuid),
            eq2(namespaceToolMappingsTable.mcp_server_uuid, input.serverUuid)
          )
        ).returning();
        return updatedMapping;
      }
      async updateToolOverrides(input) {
        const [updatedMapping] = await db.update(namespaceToolMappingsTable).set({
          override_name: input.overrideName,
          override_title: input.overrideTitle,
          override_description: input.overrideDescription,
          override_annotations: input.overrideAnnotations
        }).where(
          and(
            eq2(namespaceToolMappingsTable.namespace_uuid, input.namespaceUuid),
            eq2(namespaceToolMappingsTable.tool_uuid, input.toolUuid),
            eq2(namespaceToolMappingsTable.mcp_server_uuid, input.serverUuid)
          )
        ).returning();
        return updatedMapping;
      }
      async findServerMapping(namespaceUuid, serverUuid) {
        const [mapping] = await db.select().from(namespaceServerMappingsTable).where(
          and(
            eq2(namespaceServerMappingsTable.namespace_uuid, namespaceUuid),
            eq2(namespaceServerMappingsTable.mcp_server_uuid, serverUuid)
          )
        );
        return mapping;
      }
      /**
       * Find all namespace UUIDs that use a specific MCP server
       */
      async findNamespacesByServerUuid(serverUuid) {
        const mappings = await db.select({
          namespace_uuid: namespaceServerMappingsTable.namespace_uuid
        }).from(namespaceServerMappingsTable).where(eq2(namespaceServerMappingsTable.mcp_server_uuid, serverUuid));
        return mappings.map((mapping) => mapping.namespace_uuid);
      }
      /**
       * Get all existing tool mappings for a namespace
       */
      async findToolMappingsByNamespace(namespaceUuid) {
        const mappings = await db.select().from(namespaceToolMappingsTable).where(eq2(namespaceToolMappingsTable.namespace_uuid, namespaceUuid));
        return mappings;
      }
      async findToolMapping(namespaceUuid, toolUuid, serverUuid) {
        const [mapping] = await db.select().from(namespaceToolMappingsTable).where(
          and(
            eq2(namespaceToolMappingsTable.namespace_uuid, namespaceUuid),
            eq2(namespaceToolMappingsTable.tool_uuid, toolUuid),
            eq2(namespaceToolMappingsTable.mcp_server_uuid, serverUuid)
          )
        );
        return mapping;
      }
      /**
       * Bulk upsert namespace tool mappings for a namespace
       * Used when refreshing tools from MetaMCP connection
       */
      async bulkUpsertNamespaceToolMappings(input) {
        if (!input.toolMappings || input.toolMappings.length === 0) {
          return [];
        }
        const mappingsToInsert = input.toolMappings.map((mapping) => ({
          namespace_uuid: input.namespaceUuid,
          tool_uuid: mapping.toolUuid,
          mcp_server_uuid: mapping.serverUuid,
          status: mapping.status || "ACTIVE"
        }));
        return await db.insert(namespaceToolMappingsTable).values(mappingsToInsert).onConflictDoUpdate({
          target: [
            namespaceToolMappingsTable.namespace_uuid,
            namespaceToolMappingsTable.tool_uuid
          ],
          set: {
            status: sql2`excluded.status`,
            mcp_server_uuid: sql2`excluded.mcp_server_uuid`
          }
        }).returning();
      }
    };
    namespaceMappingsRepository = new NamespaceMappingsRepository();
  }
});

// src/db/repositories/namespaces.repo.ts
import { and as and2, desc, eq as eq3, inArray, isNull, or } from "drizzle-orm";
var NamespacesRepository, namespacesRepository;
var init_namespaces_repo = __esm({
  "src/db/repositories/namespaces.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_namespace_mappings_repo();
    NamespacesRepository = class {
      static {
        __name(this, "NamespacesRepository");
      }
      async create(input) {
        return await db.transaction(async (tx) => {
          const [createdNamespace] = await tx.insert(namespacesTable).values({
            name: input.name,
            description: input.description,
            user_id: input.user_id
          }).returning();
          if (!createdNamespace) {
            throw new Error("Failed to create namespace");
          }
          if (input.mcpServerUuids && input.mcpServerUuids.length > 0) {
            const mappings = input.mcpServerUuids.map((serverUuid) => ({
              namespace_uuid: createdNamespace.uuid,
              mcp_server_uuid: serverUuid,
              status: "ACTIVE"
            }));
            await tx.insert(namespaceServerMappingsTable).values(mappings);
            const serverTools = await tx.select({
              uuid: toolsTable.uuid,
              mcp_server_uuid: toolsTable.mcp_server_uuid
            }).from(toolsTable).where(inArray(toolsTable.mcp_server_uuid, input.mcpServerUuids));
            if (serverTools.length > 0) {
              const toolMappings = serverTools.map((tool) => ({
                namespace_uuid: createdNamespace.uuid,
                tool_uuid: tool.uuid,
                mcp_server_uuid: tool.mcp_server_uuid,
                status: "ACTIVE"
              }));
              await tx.insert(namespaceToolMappingsTable).values(toolMappings);
            }
          }
          return createdNamespace;
        });
      }
      async findAll() {
        return await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).orderBy(desc(namespacesTable.created_at));
      }
      // Find namespaces accessible to a specific user (public + user's own namespaces)
      async findAllAccessibleToUser(userId) {
        return await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).where(
          or(
            isNull(namespacesTable.user_id),
            // Public namespaces
            eq3(namespacesTable.user_id, userId)
            // User's own namespaces
          )
        ).orderBy(desc(namespacesTable.created_at));
      }
      // Find only public namespaces (no user ownership)
      async findPublicNamespaces() {
        return await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).where(isNull(namespacesTable.user_id)).orderBy(desc(namespacesTable.created_at));
      }
      // Find namespaces owned by a specific user
      async findByUserId(userId) {
        return await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).where(eq3(namespacesTable.user_id, userId)).orderBy(desc(namespacesTable.created_at));
      }
      async findByUuid(uuid2) {
        const [namespace] = await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).where(eq3(namespacesTable.uuid, uuid2));
        return namespace;
      }
      // Find namespace by name within user scope (for uniqueness checks)
      async findByNameAndUserId(name, userId) {
        const [namespace] = await db.select({
          uuid: namespacesTable.uuid,
          name: namespacesTable.name,
          description: namespacesTable.description,
          created_at: namespacesTable.created_at,
          updated_at: namespacesTable.updated_at,
          user_id: namespacesTable.user_id
        }).from(namespacesTable).where(
          and2(
            eq3(namespacesTable.name, name),
            userId ? eq3(namespacesTable.user_id, userId) : isNull(namespacesTable.user_id)
          )
        ).limit(1);
        return namespace;
      }
      async findByUuidWithServers(uuid2) {
        const namespace = await this.findByUuid(uuid2);
        if (!namespace) {
          return null;
        }
        const serversData = await db.select({
          uuid: mcpServersTable.uuid,
          name: mcpServersTable.name,
          description: mcpServersTable.description,
          type: mcpServersTable.type,
          command: mcpServersTable.command,
          args: mcpServersTable.args,
          url: mcpServersTable.url,
          env: mcpServersTable.env,
          bearerToken: mcpServersTable.bearerToken,
          headers: mcpServersTable.headers,
          error_status: mcpServersTable.error_status,
          created_at: mcpServersTable.created_at,
          user_id: mcpServersTable.user_id,
          status: namespaceServerMappingsTable.status
        }).from(mcpServersTable).innerJoin(
          namespaceServerMappingsTable,
          eq3(mcpServersTable.uuid, namespaceServerMappingsTable.mcp_server_uuid)
        ).where(eq3(namespaceServerMappingsTable.namespace_uuid, uuid2));
        const servers = serversData.map((server) => ({
          uuid: server.uuid,
          name: server.name,
          description: server.description,
          type: server.type,
          command: server.command,
          args: server.args || [],
          url: server.url,
          env: server.env || {},
          bearerToken: server.bearerToken,
          headers: server.headers || {},
          error_status: server.error_status,
          created_at: server.created_at,
          user_id: server.user_id,
          status: server.status
        }));
        return {
          ...namespace,
          servers
        };
      }
      async findToolsByNamespaceUuid(namespaceUuid) {
        const toolsData = await db.select({
          // Tool fields
          uuid: toolsTable.uuid,
          name: toolsTable.name,
          description: toolsTable.description,
          toolSchema: toolsTable.toolSchema,
          created_at: toolsTable.created_at,
          updated_at: toolsTable.updated_at,
          mcp_server_uuid: toolsTable.mcp_server_uuid,
          // Server fields
          serverName: mcpServersTable.name,
          serverUuid: mcpServersTable.uuid,
          // Namespace mapping fields
          status: namespaceToolMappingsTable.status,
          overrideName: namespaceToolMappingsTable.override_name,
          overrideTitle: namespaceToolMappingsTable.override_title,
          overrideDescription: namespaceToolMappingsTable.override_description,
          overrideAnnotations: namespaceToolMappingsTable.override_annotations
        }).from(toolsTable).innerJoin(
          namespaceToolMappingsTable,
          eq3(toolsTable.uuid, namespaceToolMappingsTable.tool_uuid)
        ).innerJoin(
          mcpServersTable,
          eq3(toolsTable.mcp_server_uuid, mcpServersTable.uuid)
        ).where(eq3(namespaceToolMappingsTable.namespace_uuid, namespaceUuid)).orderBy(desc(toolsTable.created_at));
        return toolsData;
      }
      async deleteByUuid(uuid2) {
        const [deletedNamespace] = await db.delete(namespacesTable).where(eq3(namespacesTable.uuid, uuid2)).returning();
        return deletedNamespace;
      }
      async update(input) {
        return await db.transaction(async (tx) => {
          const [updatedNamespace] = await tx.update(namespacesTable).set({
            name: input.name,
            description: input.description,
            user_id: input.user_id,
            updated_at: /* @__PURE__ */ new Date()
          }).where(eq3(namespacesTable.uuid, input.uuid)).returning();
          if (!updatedNamespace) {
            throw new Error("Namespace not found");
          }
          if (input.mcpServerUuids) {
            const existingToolMappings = await namespaceMappingsRepository.findToolMappingsByNamespace(
              input.uuid
            );
            const existingToolStatusMap = /* @__PURE__ */ new Map();
            existingToolMappings.forEach((mapping) => {
              existingToolStatusMap.set(mapping.tool_uuid, mapping.status);
            });
            await tx.delete(namespaceServerMappingsTable).where(eq3(namespaceServerMappingsTable.namespace_uuid, input.uuid));
            await tx.delete(namespaceToolMappingsTable).where(eq3(namespaceToolMappingsTable.namespace_uuid, input.uuid));
            if (input.mcpServerUuids.length > 0) {
              const serverMappings = input.mcpServerUuids.map((serverUuid) => ({
                namespace_uuid: input.uuid,
                mcp_server_uuid: serverUuid,
                status: "ACTIVE"
              }));
              await tx.insert(namespaceServerMappingsTable).values(serverMappings);
              const serverTools = await tx.select({
                uuid: toolsTable.uuid,
                mcp_server_uuid: toolsTable.mcp_server_uuid
              }).from(toolsTable).where(inArray(toolsTable.mcp_server_uuid, input.mcpServerUuids));
              if (serverTools.length > 0) {
                const toolMappings = serverTools.map((tool) => ({
                  namespace_uuid: input.uuid,
                  tool_uuid: tool.uuid,
                  mcp_server_uuid: tool.mcp_server_uuid,
                  // Preserve existing status if tool was previously mapped, otherwise default to ACTIVE
                  status: existingToolStatusMap.get(tool.uuid) || "ACTIVE"
                }));
                await tx.insert(namespaceToolMappingsTable).values(toolMappings);
              }
            }
          }
          return updatedNamespace;
        });
      }
    };
    namespacesRepository = new NamespacesRepository();
  }
});

// src/db/repositories/endpoints.repo.ts
import { and as and3, desc as desc2, eq as eq4, isNull as isNull2, or as or2 } from "drizzle-orm";
var EndpointsRepository, endpointsRepository;
var init_endpoints_repo = __esm({
  "src/db/repositories/endpoints.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    EndpointsRepository = class {
      static {
        __name(this, "EndpointsRepository");
      }
      async create(input) {
        const [createdEndpoint] = await db.insert(endpointsTable).values({
          name: input.name,
          description: input.description,
          namespace_uuid: input.namespace_uuid,
          enable_api_key_auth: input.enable_api_key_auth ?? true,
          enable_max_rate: input.enable_max_rate ?? false,
          enable_client_max_rate: input.enable_client_max_rate ?? false,
          max_rate: input.max_rate,
          client_max_rate: input.client_max_rate,
          max_rate_seconds: input.max_rate_seconds,
          client_max_rate_seconds: input.client_max_rate_seconds,
          client_max_rate_strategy: input.client_max_rate_strategy,
          client_max_rate_strategy_key: input.client_max_rate_strategy_key,
          enable_oauth: input.enable_oauth ?? false,
          use_query_param_auth: input.use_query_param_auth ?? false,
          user_id: input.user_id
        }).returning();
        if (!createdEndpoint) {
          throw new Error("Failed to create endpoint");
        }
        return createdEndpoint;
      }
      async findAll() {
        return await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).orderBy(desc2(endpointsTable.created_at));
      }
      // Find endpoints accessible to a specific user (public + user's own endpoints)
      async findAllAccessibleToUser(userId) {
        return await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(
          or2(
            isNull2(endpointsTable.user_id),
            // Public endpoints
            eq4(endpointsTable.user_id, userId)
            // User's own endpoints
          )
        ).orderBy(desc2(endpointsTable.created_at));
      }
      // Find endpoints accessible to a specific user with namespace data (public + user's own endpoints)
      async findAllAccessibleToUserWithNamespaces(userId) {
        const endpointsData = await db.select({
          // Endpoint fields
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id,
          // Namespace fields
          namespace: {
            uuid: namespacesTable.uuid,
            name: namespacesTable.name,
            description: namespacesTable.description,
            created_at: namespacesTable.created_at,
            updated_at: namespacesTable.updated_at,
            user_id: namespacesTable.user_id
          }
        }).from(endpointsTable).innerJoin(
          namespacesTable,
          eq4(endpointsTable.namespace_uuid, namespacesTable.uuid)
        ).where(
          or2(
            isNull2(endpointsTable.user_id),
            // Public endpoints
            eq4(endpointsTable.user_id, userId)
            // User's own endpoints
          )
        ).orderBy(desc2(endpointsTable.created_at));
        return endpointsData;
      }
      // Find only public endpoints (no user ownership)
      async findPublicEndpoints() {
        return await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(isNull2(endpointsTable.user_id)).orderBy(desc2(endpointsTable.created_at));
      }
      // Find endpoints owned by a specific user
      async findByUserId(userId) {
        return await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(eq4(endpointsTable.user_id, userId)).orderBy(desc2(endpointsTable.created_at));
      }
      async findAllWithNamespaces() {
        const endpointsData = await db.select({
          // Endpoint fields
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id,
          // Namespace fields
          namespace: {
            uuid: namespacesTable.uuid,
            name: namespacesTable.name,
            description: namespacesTable.description,
            created_at: namespacesTable.created_at,
            updated_at: namespacesTable.updated_at,
            user_id: namespacesTable.user_id
          }
        }).from(endpointsTable).innerJoin(
          namespacesTable,
          eq4(endpointsTable.namespace_uuid, namespacesTable.uuid)
        ).orderBy(desc2(endpointsTable.created_at));
        return endpointsData;
      }
      async findByUuid(uuid2) {
        const [endpoint] = await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(eq4(endpointsTable.uuid, uuid2));
        return endpoint;
      }
      async findByUuidWithNamespace(uuid2) {
        const [endpointData] = await db.select({
          // Endpoint fields
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id,
          // Namespace fields
          namespace: {
            uuid: namespacesTable.uuid,
            name: namespacesTable.name,
            description: namespacesTable.description,
            created_at: namespacesTable.created_at,
            updated_at: namespacesTable.updated_at,
            user_id: namespacesTable.user_id
          }
        }).from(endpointsTable).innerJoin(
          namespacesTable,
          eq4(endpointsTable.namespace_uuid, namespacesTable.uuid)
        ).where(eq4(endpointsTable.uuid, uuid2));
        return endpointData;
      }
      async findByName(name) {
        const [endpoint] = await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(eq4(endpointsTable.name, name));
        return endpoint;
      }
      // Find endpoint by name within user scope (for uniqueness checks)
      async findByNameAndUserId(name, userId) {
        const [endpoint] = await db.select({
          uuid: endpointsTable.uuid,
          name: endpointsTable.name,
          description: endpointsTable.description,
          namespace_uuid: endpointsTable.namespace_uuid,
          enable_api_key_auth: endpointsTable.enable_api_key_auth,
          enable_oauth: endpointsTable.enable_oauth,
          enable_max_rate: endpointsTable.enable_max_rate,
          enable_client_max_rate: endpointsTable.enable_client_max_rate,
          max_rate: endpointsTable.max_rate,
          client_max_rate: endpointsTable.client_max_rate,
          max_rate_seconds: endpointsTable.max_rate_seconds,
          client_max_rate_seconds: endpointsTable.client_max_rate_seconds,
          client_max_rate_strategy: endpointsTable.client_max_rate_strategy,
          client_max_rate_strategy_key: endpointsTable.client_max_rate_strategy_key,
          use_query_param_auth: endpointsTable.use_query_param_auth,
          created_at: endpointsTable.created_at,
          updated_at: endpointsTable.updated_at,
          user_id: endpointsTable.user_id
        }).from(endpointsTable).where(
          and3(
            eq4(endpointsTable.name, name),
            userId ? eq4(endpointsTable.user_id, userId) : isNull2(endpointsTable.user_id)
          )
        ).limit(1);
        return endpoint;
      }
      async deleteByUuid(uuid2) {
        const [deletedEndpoint] = await db.delete(endpointsTable).where(eq4(endpointsTable.uuid, uuid2)).returning();
        return deletedEndpoint;
      }
      async update(input) {
        const [updatedEndpoint] = await db.update(endpointsTable).set({
          name: input.name,
          description: input.description,
          namespace_uuid: input.namespace_uuid,
          enable_api_key_auth: input.enable_api_key_auth,
          enable_oauth: input.enable_oauth,
          enable_max_rate: input.enable_max_rate,
          enable_client_max_rate: input.enable_client_max_rate,
          max_rate: input.max_rate,
          client_max_rate: input.client_max_rate,
          max_rate_seconds: input.max_rate_seconds,
          client_max_rate_seconds: input.client_max_rate_seconds,
          client_max_rate_strategy: input.client_max_rate_strategy,
          client_max_rate_strategy_key: input.client_max_rate_strategy_key,
          use_query_param_auth: input.use_query_param_auth,
          user_id: input.user_id,
          updated_at: /* @__PURE__ */ new Date()
        }).where(eq4(endpointsTable.uuid, input.uuid)).returning();
        if (!updatedEndpoint) {
          throw new Error("Failed to update endpoint");
        }
        return updatedEndpoint;
      }
    };
    endpointsRepository = new EndpointsRepository();
  }
});

// src/db/repositories/mcp-servers.repo.ts
import {
  McpServerErrorStatusEnum as McpServerErrorStatusEnum2
} from "@repo/zod-types";
import { and as and4, desc as desc3, eq as eq5, isNull as isNull3, or as or3 } from "drizzle-orm";
import { DatabaseError } from "pg";
function handleDatabaseError(error, operation, serverName) {
  logger_default.error(`Database error in ${operation}:`, error);
  let pgError;
  if (error instanceof Error && "cause" in error && error.cause instanceof DatabaseError) {
    pgError = error.cause;
  } else if (error instanceof DatabaseError) {
    pgError = error;
  }
  if (pgError) {
    if (pgError.code === "23505" && pgError.constraint === "mcp_servers_name_user_unique_idx") {
      throw new Error(
        `Server name "${serverName}" already exists. Server names must be unique within your scope.`
      );
    }
    if (pgError.code === "23514" && pgError.constraint === "mcp_servers_name_regex_check") {
      throw new Error(
        `Server name "${serverName}" is invalid. Server names must only contain letters, numbers, underscores, and hyphens.`
      );
    }
  }
  throw new Error(
    `Failed to ${operation} MCP server. Please check your input and try again.`
  );
}
var McpServersRepository, mcpServersRepository;
var init_mcp_servers_repo = __esm({
  "src/db/repositories/mcp-servers.repo.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    __name(handleDatabaseError, "handleDatabaseError");
    McpServersRepository = class {
      static {
        __name(this, "McpServersRepository");
      }
      async create(input) {
        try {
          const [createdServer] = await db.insert(mcpServersTable).values(input).returning();
          return createdServer;
        } catch (error) {
          handleDatabaseError(error, "create", input.name);
        }
      }
      async findAll() {
        return await db.select().from(mcpServersTable).orderBy(desc3(mcpServersTable.created_at));
      }
      // Find servers accessible to a specific user (public + user's own servers)
      async findAllAccessibleToUser(userId) {
        return await db.select().from(mcpServersTable).where(
          or3(
            isNull3(mcpServersTable.user_id),
            // Public servers
            eq5(mcpServersTable.user_id, userId)
            // User's own servers
          )
        ).orderBy(desc3(mcpServersTable.created_at));
      }
      // Find only public servers (no user ownership)
      async findPublicServers() {
        return await db.select().from(mcpServersTable).where(isNull3(mcpServersTable.user_id)).orderBy(desc3(mcpServersTable.created_at));
      }
      // Find servers owned by a specific user
      async findByUserId(userId) {
        return await db.select().from(mcpServersTable).where(eq5(mcpServersTable.user_id, userId)).orderBy(desc3(mcpServersTable.created_at));
      }
      async findByUuid(uuid2) {
        const [server] = await db.select().from(mcpServersTable).where(eq5(mcpServersTable.uuid, uuid2)).limit(1);
        return server;
      }
      async findByName(name) {
        const [server] = await db.select().from(mcpServersTable).where(eq5(mcpServersTable.name, name)).limit(1);
        return server;
      }
      // Find server by name within user scope (for uniqueness checks)
      async findByNameAndUserId(name, userId) {
        const [server] = await db.select().from(mcpServersTable).where(
          and4(
            eq5(mcpServersTable.name, name),
            userId ? eq5(mcpServersTable.user_id, userId) : isNull3(mcpServersTable.user_id)
          )
        ).limit(1);
        return server;
      }
      async deleteByUuid(uuid2) {
        const [deletedServer] = await db.delete(mcpServersTable).where(eq5(mcpServersTable.uuid, uuid2)).returning();
        return deletedServer;
      }
      async update(input) {
        const { uuid: uuid2, ...updateData } = input;
        try {
          const [updatedServer] = await db.update(mcpServersTable).set(updateData).where(eq5(mcpServersTable.uuid, uuid2)).returning();
          return updatedServer;
        } catch (error) {
          handleDatabaseError(error, "update", input.name);
        }
      }
      async bulkCreate(servers) {
        try {
          return await db.insert(mcpServersTable).values(servers).returning();
        } catch (error) {
          let pgError;
          if (error instanceof Error && "cause" in error && error.cause instanceof DatabaseError) {
            pgError = error.cause;
          } else if (error instanceof DatabaseError) {
            pgError = error;
          }
          if (pgError) {
            if (pgError.code === "23505" && pgError.constraint === "mcp_servers_name_user_unique_idx") {
              throw new Error(
                "One or more server names already exist. Server names must be unique within your scope."
              );
            }
            if (pgError.code === "23514" && pgError.constraint === "mcp_servers_name_regex_check") {
              throw new Error(
                "One or more server names are invalid. Server names must only contain letters, numbers, underscores, and hyphens."
              );
            }
          }
          logger_default.error("Database error in bulk create:", error);
          throw new Error(
            "Failed to bulk create MCP servers. Please check your input and try again."
          );
        }
      }
      async updateServerErrorStatus(input) {
        const [updatedServer] = await db.update(mcpServersTable).set({
          error_status: input.errorStatus
        }).where(eq5(mcpServersTable.uuid, input.serverUuid)).returning();
        return updatedServer;
      }
      /**
       * Reset error_status to NONE for all servers that are currently in ERROR state.
       * Used on startup to give servers a fresh chance.
       */
      async resetAllErrorStatuses() {
        const updated = await db.update(mcpServersTable).set({
          error_status: McpServerErrorStatusEnum2.Enum.NONE
        }).where(eq5(mcpServersTable.error_status, McpServerErrorStatusEnum2.Enum.ERROR)).returning();
        return updated.length;
      }
    };
    mcpServersRepository = new McpServersRepository();
  }
});

// src/db/repositories/tools.repo.ts
import { and as and5, eq as eq6, notInArray, sql as sql3 } from "drizzle-orm";
var ToolsRepository, toolsRepository;
var init_tools_repo = __esm({
  "src/db/repositories/tools.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    ToolsRepository = class {
      static {
        __name(this, "ToolsRepository");
      }
      async findByMcpServerUuid(mcpServerUuid) {
        return await db.select().from(toolsTable).where(eq6(toolsTable.mcp_server_uuid, mcpServerUuid)).orderBy(toolsTable.name);
      }
      async create(input) {
        const [createdTool] = await db.insert(toolsTable).values(input).returning();
        return createdTool;
      }
      async bulkUpsert(input) {
        if (!input.tools || input.tools.length === 0) {
          return [];
        }
        const toolsToInsert = input.tools.map((tool) => ({
          name: tool.name,
          description: tool.description || "",
          toolSchema: {
            type: "object",
            ...tool.inputSchema
          },
          mcp_server_uuid: input.mcpServerUuid
        }));
        const result = await db.insert(toolsTable).values(toolsToInsert).onConflictDoUpdate({
          target: [toolsTable.mcp_server_uuid, toolsTable.name],
          set: {
            description: sql3`excluded.description`,
            toolSchema: sql3`excluded.tool_schema`,
            updated_at: /* @__PURE__ */ new Date()
          }
        }).returning();
        return result;
      }
      async findByUuid(uuid2) {
        const [tool] = await db.select().from(toolsTable).where(eq6(toolsTable.uuid, uuid2)).limit(1);
        return tool;
      }
      async deleteByUuid(uuid2) {
        const [deletedTool] = await db.delete(toolsTable).where(eq6(toolsTable.uuid, uuid2)).returning();
        return deletedTool;
      }
      /**
       * Delete tools that are no longer present in the current tool list
       * @param mcpServerUuid - UUID of the MCP server
       * @param currentToolNames - Array of tool names that currently exist in the MCP server
       * @returns Array of deleted tools
       */
      async deleteObsoleteTools(mcpServerUuid, currentToolNames) {
        if (currentToolNames.length === 0) {
          return await db.delete(toolsTable).where(eq6(toolsTable.mcp_server_uuid, mcpServerUuid)).returning();
        }
        return await db.delete(toolsTable).where(
          and5(
            eq6(toolsTable.mcp_server_uuid, mcpServerUuid),
            notInArray(toolsTable.name, currentToolNames)
          )
        ).returning();
      }
      /**
       * Sync tools for a server: upsert current tools and delete obsolete ones
       * @param input - Tool upsert input containing tools and server UUID
       * @returns Object with upserted and deleted tools
       */
      async syncTools(input) {
        const currentToolNames = input.tools.map((tool) => tool.name);
        const deleted = await this.deleteObsoleteTools(
          input.mcpServerUuid,
          currentToolNames
        );
        let upserted = [];
        if (input.tools.length > 0) {
          upserted = await this.bulkUpsert(input);
        }
        return { upserted, deleted };
      }
    };
    toolsRepository = new ToolsRepository();
  }
});

// src/db/repositories/oauth-sessions.repo.ts
import { eq as eq7, sql as sql4 } from "drizzle-orm";
var OAuthSessionsRepository, oauthSessionsRepository;
var init_oauth_sessions_repo = __esm({
  "src/db/repositories/oauth-sessions.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    OAuthSessionsRepository = class {
      static {
        __name(this, "OAuthSessionsRepository");
      }
      async findByMcpServerUuid(mcpServerUuid) {
        const [session] = await db.select().from(oauthSessionsTable).where(eq7(oauthSessionsTable.mcp_server_uuid, mcpServerUuid)).limit(1);
        return session;
      }
      async create(input) {
        const [createdSession] = await db.insert(oauthSessionsTable).values({
          mcp_server_uuid: input.mcp_server_uuid,
          ...input.client_information && {
            client_information: input.client_information
          },
          ...input.tokens && { tokens: input.tokens },
          ...input.code_verifier && { code_verifier: input.code_verifier }
        }).returning();
        return createdSession;
      }
      async update(input) {
        const [updatedSession] = await db.update(oauthSessionsTable).set({
          ...input.client_information && {
            client_information: input.client_information
          },
          ...input.tokens && { tokens: input.tokens },
          ...input.code_verifier && { code_verifier: input.code_verifier },
          updated_at: sql4`NOW()`
        }).where(eq7(oauthSessionsTable.mcp_server_uuid, input.mcp_server_uuid)).returning();
        return updatedSession;
      }
      async upsert(input) {
        const existingSession = await this.findByMcpServerUuid(
          input.mcp_server_uuid
        );
        if (existingSession) {
          const updatedSession = await this.update(input);
          if (!updatedSession) {
            throw new Error("Failed to update OAuth session");
          }
          return updatedSession;
        } else {
          return await this.create(input);
        }
      }
      async deleteByMcpServerUuid(mcpServerUuid) {
        const [deletedSession] = await db.delete(oauthSessionsTable).where(eq7(oauthSessionsTable.mcp_server_uuid, mcpServerUuid)).returning();
        return deletedSession;
      }
    };
    oauthSessionsRepository = new OAuthSessionsRepository();
  }
});

// src/db/repositories/oauth.repo.ts
import { eq as eq8, lt } from "drizzle-orm";
var OAuthRepository, oauthRepository;
var init_oauth_repo = __esm({
  "src/db/repositories/oauth.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    OAuthRepository = class {
      static {
        __name(this, "OAuthRepository");
      }
      // ===== Registered Clients =====
      async getClient(clientId) {
        const result = await db.select().from(oauthClientsTable).where(eq8(oauthClientsTable.client_id, clientId)).limit(1);
        return result[0] || null;
      }
      async upsertClient(clientData) {
        await db.insert(oauthClientsTable).values(clientData).onConflictDoUpdate({
          target: oauthClientsTable.client_id,
          set: {
            redirect_uris: clientData.redirect_uris,
            updated_at: /* @__PURE__ */ new Date()
          }
        });
      }
      // ===== Authorization Codes =====
      async getAuthCode(code) {
        const result = await db.select().from(oauthAuthorizationCodesTable).where(eq8(oauthAuthorizationCodesTable.code, code)).limit(1);
        return result[0] || null;
      }
      async setAuthCode(code, data) {
        await db.insert(oauthAuthorizationCodesTable).values({
          code,
          client_id: data.client_id,
          redirect_uri: data.redirect_uri,
          scope: data.scope,
          user_id: data.user_id,
          code_challenge: data.code_challenge,
          code_challenge_method: data.code_challenge_method,
          expires_at: new Date(data.expires_at)
        });
      }
      async deleteAuthCode(code) {
        await db.delete(oauthAuthorizationCodesTable).where(eq8(oauthAuthorizationCodesTable.code, code));
      }
      // ===== Access Tokens =====
      async getAccessToken(token) {
        const result = await db.select().from(oauthAccessTokensTable).where(eq8(oauthAccessTokensTable.access_token, token)).limit(1);
        return result[0] || null;
      }
      async setAccessToken(token, data) {
        await db.insert(oauthAccessTokensTable).values({
          access_token: token,
          client_id: data.client_id,
          user_id: data.user_id,
          scope: data.scope,
          expires_at: new Date(data.expires_at)
        });
      }
      async deleteAccessToken(token) {
        await db.delete(oauthAccessTokensTable).where(eq8(oauthAccessTokensTable.access_token, token));
      }
      // ===== Cleanup =====
      async cleanupExpired() {
        const now = /* @__PURE__ */ new Date();
        await Promise.all([
          db.delete(oauthAuthorizationCodesTable).where(lt(oauthAuthorizationCodesTable.expires_at, now)),
          db.delete(oauthAccessTokensTable).where(lt(oauthAccessTokensTable.expires_at, now))
        ]);
      }
    };
    oauthRepository = new OAuthRepository();
  }
});

// src/db/repositories/api-keys.repo.ts
import { and as and6, desc as desc4, eq as eq9, isNull as isNull4, or as or4 } from "drizzle-orm";
import { customAlphabet } from "nanoid";
var nanoid, ApiKeysRepository;
var init_api_keys_repo = __esm({
  "src/db/repositories/api-keys.repo.ts"() {
    "use strict";
    init_db();
    init_schema();
    nanoid = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      64
    );
    ApiKeysRepository = class {
      static {
        __name(this, "ApiKeysRepository");
      }
      /**
       * Generate a new API key with the specified format: sk_mt_{64-char-nanoid}
       */
      generateApiKey() {
        const keyPart = nanoid();
        const key = `sk_mt_${keyPart}`;
        return key;
      }
      async create(input) {
        const key = this.generateApiKey();
        const [createdApiKey] = await db.insert(apiKeysTable).values({
          name: input.name,
          key,
          user_id: input.user_id,
          is_active: input.is_active ?? true
        }).returning({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          user_id: apiKeysTable.user_id,
          created_at: apiKeysTable.created_at
        });
        if (!createdApiKey) {
          throw new Error("Failed to create API key");
        }
        return {
          ...createdApiKey,
          key
          // Return the actual key
        };
      }
      async findByUserId(userId) {
        return await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active
        }).from(apiKeysTable).where(eq9(apiKeysTable.user_id, userId)).orderBy(desc4(apiKeysTable.created_at));
      }
      // Find all API keys (both public and user-owned)
      async findAll() {
        return await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active,
          user_id: apiKeysTable.user_id
        }).from(apiKeysTable).orderBy(desc4(apiKeysTable.created_at));
      }
      // Find public API keys (no user ownership)
      async findPublicApiKeys() {
        return await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active,
          user_id: apiKeysTable.user_id
        }).from(apiKeysTable).where(isNull4(apiKeysTable.user_id)).orderBy(desc4(apiKeysTable.created_at));
      }
      // Find API keys accessible to a specific user (public + user's own keys)
      async findAccessibleToUser(userId) {
        return await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active,
          user_id: apiKeysTable.user_id
        }).from(apiKeysTable).where(
          or4(
            isNull4(apiKeysTable.user_id),
            // Public API keys
            eq9(apiKeysTable.user_id, userId)
            // User's own API keys
          )
        ).orderBy(desc4(apiKeysTable.created_at));
      }
      async findByUuid(uuid2, userId) {
        const [apiKey] = await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active,
          user_id: apiKeysTable.user_id
        }).from(apiKeysTable).where(
          and6(eq9(apiKeysTable.uuid, uuid2), eq9(apiKeysTable.user_id, userId))
        );
        return apiKey;
      }
      // Find API key by UUID with access control (user can access their own keys + public keys)
      async findByUuidWithAccess(uuid2, userId) {
        const [apiKey] = await db.select({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active,
          user_id: apiKeysTable.user_id
        }).from(apiKeysTable).where(
          and6(
            eq9(apiKeysTable.uuid, uuid2),
            userId ? or4(
              isNull4(apiKeysTable.user_id),
              // Public API keys
              eq9(apiKeysTable.user_id, userId)
              // User's own API keys
            ) : isNull4(apiKeysTable.user_id)
            // Only public if no user context
          )
        );
        return apiKey;
      }
      async validateApiKey(key) {
        const [apiKey] = await db.select({
          uuid: apiKeysTable.uuid,
          user_id: apiKeysTable.user_id,
          is_active: apiKeysTable.is_active
        }).from(apiKeysTable).where(eq9(apiKeysTable.key, key));
        if (!apiKey) {
          return { valid: false };
        }
        if (!apiKey.is_active) {
          return { valid: false };
        }
        return {
          valid: true,
          user_id: apiKey.user_id,
          key_uuid: apiKey.uuid
        };
      }
      async update(uuid2, userId, input) {
        const [updatedApiKey] = await db.update(apiKeysTable).set({
          ...input.name && { name: input.name },
          ...input.is_active !== void 0 && { is_active: input.is_active }
        }).where(
          and6(
            eq9(apiKeysTable.uuid, uuid2),
            or4(eq9(apiKeysTable.user_id, userId), isNull4(apiKeysTable.user_id))
          )
        ).returning({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          created_at: apiKeysTable.created_at,
          is_active: apiKeysTable.is_active
        });
        if (!updatedApiKey) {
          throw new Error("Failed to update API key or API key not found");
        }
        return updatedApiKey;
      }
      async delete(uuid2, userId) {
        const [deletedApiKey] = await db.delete(apiKeysTable).where(
          and6(
            eq9(apiKeysTable.uuid, uuid2),
            or4(eq9(apiKeysTable.user_id, userId), isNull4(apiKeysTable.user_id))
          )
        ).returning({
          uuid: apiKeysTable.uuid,
          name: apiKeysTable.name
        });
        if (!deletedApiKey) {
          throw new Error("Failed to delete API key or API key not found");
        }
        return deletedApiKey;
      }
    };
  }
});

// src/db/repositories/index.ts
var init_repositories = __esm({
  "src/db/repositories/index.ts"() {
    "use strict";
    init_namespaces_repo();
    init_namespace_mappings_repo();
    init_endpoints_repo();
    init_mcp_servers_repo();
    init_tools_repo();
    init_oauth_sessions_repo();
    init_oauth_repo();
    init_api_keys_repo();
    init_config_repo();
  }
});

// src/lib/stdio-transport/shared.ts
import {
  JSONRPCMessageSchema
} from "@modelcontextprotocol/sdk/types.js";
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}
var ReadBuffer;
var init_shared = __esm({
  "src/lib/stdio-transport/shared.ts"() {
    "use strict";
    ReadBuffer = class {
      static {
        __name(this, "ReadBuffer");
      }
      _buffer;
      append(chunk) {
        this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
      }
      readMessage() {
        if (!this._buffer) {
          return null;
        }
        const index2 = this._buffer.indexOf("\n");
        if (index2 === -1) {
          return null;
        }
        const line = this._buffer.toString("utf8", 0, index2).replace(/\r$/, "");
        this._buffer = this._buffer.subarray(index2 + 1);
        return deserializeMessage(line);
      }
      clear() {
        this._buffer = void 0;
      }
    };
    __name(deserializeMessage, "deserializeMessage");
    __name(serializeMessage, "serializeMessage");
  }
});

// src/lib/stdio-transport/process-managed-transport.ts
import process2 from "process";
import { PassThrough } from "stream";
import spawn from "cross-spawn";
function getDefaultEnvironment() {
  const env = {};
  for (const key of DEFAULT_INHERITED_ENV_VARS) {
    const value = process2.env[key];
    if (value === void 0) {
      continue;
    }
    if (value.startsWith("()")) {
      continue;
    }
    env[key] = value;
  }
  return env;
}
function isElectron() {
  return "type" in process2;
}
var DEFAULT_INHERITED_ENV_VARS, ProcessManagedStdioTransport;
var init_process_managed_transport = __esm({
  "src/lib/stdio-transport/process-managed-transport.ts"() {
    "use strict";
    init_logger();
    init_shared();
    DEFAULT_INHERITED_ENV_VARS = process2.platform === "win32" ? [
      "APPDATA",
      "HOMEDRIVE",
      "HOMEPATH",
      "LOCALAPPDATA",
      "PATH",
      "PROCESSOR_ARCHITECTURE",
      "SYSTEMDRIVE",
      "SYSTEMROOT",
      "TEMP",
      "USERNAME",
      "USERPROFILE",
      "PROGRAMFILES"
    ] : (
      /* list inspired by the default env inheritance of sudo */
      [
        "HOME",
        "LOGNAME",
        "PATH",
        "SHELL",
        "TERM",
        "USER",
        // SSL/Certificate variables for corporate proxies and custom CA certificates
        "NODE_EXTRA_CA_CERTS",
        "NODE_TLS_REJECT_UNAUTHORIZED",
        "SSL_CERT_FILE",
        "CERT_FILE",
        "REQUESTS_CA_BUNDLE",
        "REQUESTS_CERT_FILE",
        "CURL_CA_BUNDLE",
        "PIP_CERT",
        "UV_CERT",
        "PYTHONHTTPSVERIFY",
        // Proxy variables
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "NO_PROXY",
        "http_proxy",
        "https_proxy",
        "no_proxy"
      ]
    );
    __name(getDefaultEnvironment, "getDefaultEnvironment");
    ProcessManagedStdioTransport = class {
      static {
        __name(this, "ProcessManagedStdioTransport");
      }
      _process;
      _abortController = new AbortController();
      _readBuffer = new ReadBuffer();
      _serverParams;
      _stderrStream = null;
      _isCleanup = false;
      onclose;
      onerror;
      onmessage;
      onprocesscrash;
      constructor(server) {
        this._serverParams = server;
        if (server.stderr === "pipe" || server.stderr === "overlapped") {
          this._stderrStream = new PassThrough();
        }
      }
      /**
       * Starts the server process and prepares to communicate with it.
       */
      async start() {
        if (this._process) {
          throw new Error(
            "StdioClientTransport already started! If using Client class, note that connect() calls start() automatically."
          );
        }
        return new Promise((resolve, reject) => {
          this._process = spawn(
            this._serverParams.command,
            this._serverParams.args ?? [],
            {
              // merge default env with server env because mcp server needs some env vars
              env: {
                ...getDefaultEnvironment(),
                ...this._serverParams.env
              },
              stdio: ["pipe", "pipe", this._serverParams.stderr ?? "inherit"],
              shell: false,
              signal: this._abortController.signal,
              windowsHide: process2.platform === "win32" && isElectron(),
              cwd: this._serverParams.cwd,
              detached: true
            }
          );
          this._process.unref();
          this._process.on("error", (error) => {
            if (error.name === "AbortError") {
              this.onclose?.();
              return;
            }
            reject(error);
            this.onerror?.(error);
          });
          this._process.on("spawn", () => {
            resolve();
          });
          this._process.on("close", (code, signal) => {
            if (!this._isCleanup) {
              logger_default.warn(`Process exited with code: ${code}, signal: ${signal}`);
              logger_default.info(
                `Calling onprocesscrash handler: ${this.onprocesscrash ? "handler exists" : "no handler"}`
              );
              this.onprocesscrash?.(code, signal);
            }
            this._process = void 0;
            this.onclose?.();
          });
          this._process.stdin?.on("error", (error) => {
            this.onerror?.(error);
          });
          this._process.stdout?.on("data", (chunk) => {
            this._readBuffer.append(chunk);
            this.processReadBuffer();
          });
          this._process.stdout?.on("error", (error) => {
            this.onerror?.(error);
          });
          if (this._stderrStream && this._process.stderr) {
            this._process.stderr.pipe(this._stderrStream);
          }
        });
      }
      /**
       * The stderr stream of the child process, if `StdioServerParameters.stderr` was set to "pipe" or "overlapped".
       *
       * If stderr piping was requested, a PassThrough stream is returned _immediately_, allowing callers to
       * attach listeners before the start method is invoked. This prevents loss of any early
       * error output emitted by the child process.
       */
      get stderr() {
        if (this._stderrStream) {
          return this._stderrStream;
        }
        return this._process?.stderr ?? null;
      }
      /**
       * The child process pid spawned by this transport.
       *
       * This is only available after the transport has been started.
       */
      get pid() {
        return this._process?.pid ?? null;
      }
      processReadBuffer() {
        while (true) {
          try {
            const message = this._readBuffer.readMessage();
            if (message === null) {
              break;
            }
            this.onmessage?.(message);
          } catch (error) {
            this.onerror?.(error);
          }
        }
      }
      async close() {
        this._isCleanup = true;
        this._abortController.abort();
        if (this._process?.pid) {
          try {
            process2.kill(-this._process.pid, "SIGTERM");
          } catch (error) {
            logger_default.warn("Failed to kill process group:", error);
          }
        }
        this._process = void 0;
        this._readBuffer.clear();
      }
      send(message) {
        return new Promise((resolve) => {
          if (!this._process?.stdin) {
            throw new Error("Not connected");
          }
          const json = serializeMessage(message);
          if (this._process.stdin.write(json)) {
            resolve();
          } else {
            this._process.stdin.once("drain", resolve);
          }
        });
      }
    };
    __name(isElectron, "isElectron");
  }
});

// src/lib/metamcp/log-store.ts
var MetaMcpLogStore, metamcpLogStore;
var init_log_store = __esm({
  "src/lib/metamcp/log-store.ts"() {
    "use strict";
    init_logger();
    MetaMcpLogStore = class {
      static {
        __name(this, "MetaMcpLogStore");
      }
      logs = [];
      maxLogs = 1e3;
      // Keep only the last 1000 logs
      listeners = /* @__PURE__ */ new Set();
      addLog(serverName, level, message, error) {
        const logEntry = {
          id: crypto.randomUUID(),
          timestamp: /* @__PURE__ */ new Date(),
          serverName,
          level,
          message,
          error: error ? error instanceof Error ? error.message : String(error) : void 0
        };
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogs) {
          this.logs = this.logs.slice(-this.maxLogs);
        }
        const fullMessage = `[MetaMCP][${serverName}] ${message}`;
        switch (level) {
          case "error":
            logger_default.error(fullMessage, error || "");
            break;
          case "warn":
            logger_default.warn(fullMessage, error || "");
            break;
          case "info":
            logger_default.info(fullMessage, error || "");
            break;
        }
        this.listeners.forEach((listener) => {
          try {
            listener(logEntry);
          } catch (err) {
            logger_default.error("Error notifying log listener:", err);
          }
        });
      }
      getLogs(limit) {
        const logsToReturn = limit ? this.logs.slice(-limit) : this.logs;
        return [...logsToReturn].reverse();
      }
      clearLogs() {
        this.logs = [];
      }
      addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      }
      getLogCount() {
        return this.logs.length;
      }
    };
    metamcpLogStore = new MetaMcpLogStore();
  }
});

// src/lib/metamcp/server-error-tracker.ts
import { McpServerErrorStatusEnum as McpServerErrorStatusEnum3 } from "@repo/zod-types";
var ServerErrorTracker, serverErrorTracker;
var init_server_error_tracker = __esm({
  "src/lib/metamcp/server-error-tracker.ts"() {
    "use strict";
    init_logger();
    init_repositories();
    init_config_service();
    ServerErrorTracker = class _ServerErrorTracker {
      static {
        __name(this, "ServerErrorTracker");
      }
      static instance = null;
      // Track crash attempts per server
      crashAttempts = /* @__PURE__ */ new Map();
      // Default max attempts before marking as ERROR (fallback if config is not available)
      fallbackMaxAttempts = 3;
      // Server-specific max attempts (can be configured per server)
      serverMaxAttempts = /* @__PURE__ */ new Map();
      constructor() {
      }
      static getInstance() {
        if (!_ServerErrorTracker.instance) {
          _ServerErrorTracker.instance = new _ServerErrorTracker();
        }
        return _ServerErrorTracker.instance;
      }
      /**
       * Set max attempts for a specific server
       */
      setServerMaxAttempts(serverUuid, maxAttempts) {
        this.serverMaxAttempts.set(serverUuid, maxAttempts);
      }
      /**
       * Get max attempts for a specific server
       */
      async getServerMaxAttempts(serverUuid) {
        const serverSpecific = this.serverMaxAttempts.get(serverUuid);
        if (serverSpecific !== void 0) {
          return serverSpecific;
        }
        try {
          return await configService.getMcpMaxAttempts();
        } catch (error) {
          logger_default.warn(
            "Failed to get MCP max attempts from config, using fallback:",
            error
          );
          return this.fallbackMaxAttempts;
        }
      }
      /**
       * Record a server crash and check if it should be marked as ERROR
       */
      async recordServerCrash(serverUuid, exitCode, signal) {
        logger_default.info(`recordServerCrash called for server ${serverUuid}`);
        const currentAttempts = this.crashAttempts.get(serverUuid) || 0;
        const newAttempts = currentAttempts + 1;
        this.crashAttempts.set(serverUuid, newAttempts);
        const maxAttempts = await this.getServerMaxAttempts(serverUuid);
        logger_default.info(
          `Server ${serverUuid} crashed. Attempt ${newAttempts}/${maxAttempts}`
        );
        if (newAttempts >= maxAttempts) {
          logger_default.warn(
            `Server ${serverUuid} has crashed ${newAttempts} times. Marking as ERROR.`
          );
          try {
            await this.markServerAsError(serverUuid);
            const crashInfo = {
              serverUuid,
              exitCode,
              signal,
              timestamp: /* @__PURE__ */ new Date()
            };
            logger_default.error(
              "Server marked as ERROR due to repeated crashes:",
              crashInfo
            );
          } catch (error) {
            logger_default.error(`Failed to mark server ${serverUuid} as ERROR:`, error);
          }
        }
      }
      /**
       * Mark a server as ERROR
       */
      async markServerAsError(serverUuid) {
        try {
          await mcpServersRepository.updateServerErrorStatus({
            serverUuid,
            errorStatus: McpServerErrorStatusEnum3.Enum.ERROR
          });
          logger_default.error(`Server ${serverUuid} marked as ERROR at server level`);
        } catch (error) {
          logger_default.error(`Error marking server ${serverUuid} as ERROR:`, error);
        }
      }
      /**
       * Reset crash attempts for a server (e.g., after successful recovery)
       */
      resetServerAttempts(serverUuid) {
        this.crashAttempts.delete(serverUuid);
      }
      /**
       * Reset all crash attempts (e.g., on startup for a clean slate)
       */
      resetAllAttempts() {
        this.crashAttempts.clear();
      }
      /**
       * Get current crash attempts for a server
       */
      getServerAttempts(serverUuid) {
        return this.crashAttempts.get(serverUuid) || 0;
      }
      /**
       * Check if a server is in ERROR state
       */
      async isServerInErrorState(serverUuid) {
        try {
          const server = await mcpServersRepository.findByUuid(serverUuid);
          return server?.error_status === McpServerErrorStatusEnum3.Enum.ERROR;
        } catch (error) {
          logger_default.error(
            `Error checking server error state for ${serverUuid}:`,
            error
          );
          return false;
        }
      }
      /**
       * Reset error state for a server (e.g., after manual recovery)
       */
      async resetServerErrorState(serverUuid) {
        try {
          this.resetServerAttempts(serverUuid);
          await mcpServersRepository.updateServerErrorStatus({
            serverUuid,
            errorStatus: McpServerErrorStatusEnum3.Enum.NONE
          });
          logger_default.info(`Reset error state for server ${serverUuid}`);
        } catch (error) {
          logger_default.error(
            `Error resetting error state for server ${serverUuid}:`,
            error
          );
        }
      }
    };
    serverErrorTracker = ServerErrorTracker.getInstance();
  }
});

// src/lib/metamcp/utils.ts
function getDefaultEnvironment2() {
  const env = {};
  for (const key of DEFAULT_INHERITED_ENV_VARS2) {
    const value = process.env[key];
    if (value === void 0) {
      continue;
    }
    if (value.startsWith("()")) {
      continue;
    }
    env[key] = value;
  }
  return env;
}
function sanitizeName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "");
}
async function convertDbServerToParams(server) {
  try {
    const oauthSession = await oauthSessionsRepository.findByMcpServerUuid(
      server.uuid
    );
    let oauthTokens = null;
    if (oauthSession && oauthSession.tokens) {
      oauthTokens = {
        access_token: oauthSession.tokens.access_token,
        token_type: oauthSession.tokens.token_type,
        expires_in: oauthSession.tokens.expires_in,
        scope: oauthSession.tokens.scope,
        refresh_token: oauthSession.tokens.refresh_token
      };
    }
    const params = {
      uuid: server.uuid,
      name: server.name,
      description: server.description || "",
      type: server.type || "STDIO",
      command: server.command,
      args: server.args || [],
      env: server.env || {},
      url: server.url,
      created_at: server.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
      status: "active",
      // Default status for non-namespace servers
      stderr: "inherit",
      oauth_tokens: oauthTokens,
      bearerToken: server.bearerToken,
      headers: server.headers || {}
    };
    if (params.type === "STDIO") {
      if ("args" in params && !params.args) {
        params.args = void 0;
      }
      params.env = {
        ...getDefaultEnvironment2(),
        ...params.env || {}
      };
    } else if (params.type === "SSE" || params.type === "STREAMABLE_HTTP") {
      if (!params.url) {
        logger_default.warn(
          `${params.type} server ${params.uuid} is missing url field, skipping`
        );
        return null;
      }
    }
    return params;
  } catch (error) {
    logger_default.error(
      `Error converting server ${server.uuid} to parameters:`,
      error
    );
    return null;
  }
}
function resolveEnvVariables(envObject) {
  const resolved = {};
  for (const [key, value] of Object.entries(envObject)) {
    if (typeof value === "string" && value.startsWith("${") && value.endsWith("}")) {
      const varName = value.slice(2, -1);
      if (process.env[varName]) {
        resolved[key] = process.env[varName];
        logger_default.info(
          `Resolved environment variable: ${key}=${value} -> ${varName}=[REDACTED]`
        );
      } else {
        resolved[key] = value;
        logger_default.warn(
          `Environment variable not found: ${varName}, keeping original value: ${value}`
        );
      }
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}
var DEFAULT_INHERITED_ENV_VARS2;
var init_utils = __esm({
  "src/lib/metamcp/utils.ts"() {
    "use strict";
    init_logger();
    init_oauth_sessions_repo();
    DEFAULT_INHERITED_ENV_VARS2 = process.platform === "win32" ? [
      "APPDATA",
      "HOMEDRIVE",
      "HOMEPATH",
      "LOCALAPPDATA",
      "PATH",
      "PROCESSOR_ARCHITECTURE",
      "SYSTEMDRIVE",
      "SYSTEMROOT",
      "TEMP",
      "USERNAME",
      "USERPROFILE"
    ] : (
      /* list inspired by the default env inheritance of sudo */
      [
        "HOME",
        "LOGNAME",
        "PATH",
        "SHELL",
        "TERM",
        "USER",
        // SSL/Certificate variables for corporate proxies and custom CA certificates
        "NODE_EXTRA_CA_CERTS",
        "NODE_TLS_REJECT_UNAUTHORIZED",
        "SSL_CERT_FILE",
        "CERT_FILE",
        "REQUESTS_CA_BUNDLE",
        "REQUESTS_CERT_FILE",
        "CURL_CA_BUNDLE",
        "PIP_CERT",
        "UV_CERT",
        "PYTHONHTTPSVERIFY",
        // Proxy variables
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "NO_PROXY",
        "http_proxy",
        "https_proxy",
        "no_proxy"
      ]
    );
    __name(getDefaultEnvironment2, "getDefaultEnvironment");
    __name(sanitizeName, "sanitizeName");
    __name(convertDbServerToParams, "convertDbServerToParams");
    __name(resolveEnvVariables, "resolveEnvVariables");
  }
});

// src/lib/metamcp/client.ts
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
var sleep, transformDockerUrl, createMetaMcpClient, connectMetaMcpClient;
var init_client = __esm({
  "src/lib/metamcp/client.ts"() {
    "use strict";
    init_logger();
    init_process_managed_transport();
    init_log_store();
    init_server_error_tracker();
    init_utils();
    sleep = /* @__PURE__ */ __name((time) => new Promise((resolve) => setTimeout(() => resolve(), time)), "sleep");
    transformDockerUrl = /* @__PURE__ */ __name((url) => {
      if (process.env.TRANSFORM_LOCALHOST_TO_DOCKER_INTERNAL === "true") {
        const transformed = url.replace(
          /localhost|127\.0\.0\.1/g,
          "host.docker.internal"
        );
        return transformed;
      }
      return url;
    }, "transformDockerUrl");
    createMetaMcpClient = /* @__PURE__ */ __name((serverParams) => {
      let transport;
      if (!serverParams.type || serverParams.type === "STDIO") {
        const resolvedEnv = serverParams.env ? resolveEnvVariables(serverParams.env) : void 0;
        const stdioParams = {
          command: serverParams.command || "",
          args: serverParams.args || void 0,
          env: resolvedEnv,
          stderr: "pipe"
        };
        transport = new ProcessManagedStdioTransport(stdioParams);
        if (transport.stderr) {
          const stderrStream = transport.stderr;
          stderrStream?.on("data", (chunk) => {
            metamcpLogStore.addLog(
              serverParams.name,
              "error",
              chunk.toString().trim()
            );
          });
          stderrStream?.on("error", (error) => {
            metamcpLogStore.addLog(
              serverParams.name,
              "error",
              "stderr error",
              error
            );
          });
        }
      } else if (serverParams.type === "SSE" && serverParams.url) {
        const transformedUrl = transformDockerUrl(serverParams.url);
        const headers = {
          ...serverParams.headers || {}
        };
        const authToken = serverParams.oauth_tokens?.access_token || serverParams.bearerToken;
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
        const hasHeaders = Object.keys(headers).length > 0;
        if (!hasHeaders) {
          transport = new SSEClientTransport(new URL(transformedUrl));
        } else {
          transport = new SSEClientTransport(new URL(transformedUrl), {
            requestInit: {
              headers
            },
            eventSourceInit: {
              fetch: /* @__PURE__ */ __name((url, init) => fetch(url, { ...init, headers }), "fetch")
            }
          });
        }
      } else if (serverParams.type === "STREAMABLE_HTTP" && serverParams.url) {
        const transformedUrl = transformDockerUrl(serverParams.url);
        const headers = {
          ...serverParams.headers || {}
        };
        const authToken = serverParams.oauth_tokens?.access_token || serverParams.bearerToken;
        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }
        const hasHeaders = Object.keys(headers).length > 0;
        if (!hasHeaders) {
          transport = new StreamableHTTPClientTransport(new URL(transformedUrl));
        } else {
          transport = new StreamableHTTPClientTransport(new URL(transformedUrl), {
            requestInit: {
              headers
            }
          });
        }
      } else {
        metamcpLogStore.addLog(
          serverParams.name,
          "error",
          `Unsupported server type: ${serverParams.type}`
        );
        return { client: void 0, transport: void 0 };
      }
      const client = new Client(
        {
          name: "metamcp-client",
          version: "2.0.0"
        },
        {
          capabilities: {
            prompts: {},
            resources: { subscribe: true },
            tools: {}
          }
        }
      );
      return { client, transport };
    }, "createMetaMcpClient");
    connectMetaMcpClient = /* @__PURE__ */ __name(async (serverParams, onProcessCrash) => {
      const waitFor = 5e3;
      const maxAttempts = await serverErrorTracker.getServerMaxAttempts(
        serverParams.uuid
      );
      let count = 0;
      let retry = true;
      logger_default.info(
        `Connecting to server ${serverParams.name} (${serverParams.uuid}) with max attempts: ${maxAttempts}`
      );
      while (retry) {
        let transport;
        let client;
        try {
          const isInErrorState = await serverErrorTracker.isServerInErrorState(
            serverParams.uuid
          );
          if (isInErrorState) {
            logger_default.info(
              `Server ${serverParams.name} (${serverParams.uuid}) is already in ERROR state, skipping connection attempt`
            );
            return void 0;
          }
          const result = createMetaMcpClient(serverParams);
          client = result.client;
          transport = result.transport;
          if (!client || !transport) {
            return void 0;
          }
          if (transport instanceof ProcessManagedStdioTransport) {
            logger_default.info(
              `Setting up crash handler for server ${serverParams.name} (${serverParams.uuid})`
            );
            transport.onprocesscrash = (exitCode, signal) => {
              logger_default.info(
                `Process crashed for server ${serverParams.name} (${serverParams.uuid}): code=${exitCode}, signal=${signal}`
              );
              if (onProcessCrash) {
                logger_default.info(
                  `Calling onProcessCrash callback for server ${serverParams.name} (${serverParams.uuid})`
                );
                onProcessCrash(exitCode, signal);
              } else {
                logger_default.info(
                  `No onProcessCrash callback provided for server ${serverParams.name} (${serverParams.uuid})`
                );
              }
            };
          }
          await client.connect(transport);
          return {
            client,
            cleanup: /* @__PURE__ */ __name(async () => {
              await transport.close();
              await client.close();
            }, "cleanup"),
            onProcessCrash: /* @__PURE__ */ __name((exitCode, signal) => {
              logger_default.warn(
                `Process crash detected for server ${serverParams.name} (${serverParams.uuid}): code=${exitCode}, signal=${signal}`
              );
              if (onProcessCrash) {
                onProcessCrash(exitCode, signal);
              }
            }, "onProcessCrash")
          };
        } catch (error) {
          metamcpLogStore.addLog(
            "client",
            "error",
            `Error connecting to MetaMCP client (attempt ${count + 1}/${maxAttempts})`,
            error
          );
          if (transport) {
            try {
              await transport.close();
              console.log(
                `Cleaned up transport for failed connection to ${serverParams.name} (${serverParams.uuid})`
              );
            } catch (cleanupError) {
              console.error(
                `Error cleaning up transport for ${serverParams.name} (${serverParams.uuid}):`,
                cleanupError
              );
            }
          }
          if (client) {
            try {
              await client.close();
            } catch (cleanupError) {
            }
          }
          count++;
          retry = count < maxAttempts;
          if (retry) {
            await sleep(waitFor);
          }
        }
      }
      return void 0;
    }, "connectMetaMcpClient");
  }
});

// src/lib/metamcp/fetch-metamcp.ts
import {
  McpServerErrorStatusEnum as McpServerErrorStatusEnum4,
  McpServerStatusEnum as McpServerStatusEnum2
} from "@repo/zod-types";
import { and as and8, eq as eq11 } from "drizzle-orm";
async function getMcpServers(namespaceUuid, includeInactiveServers = false) {
  try {
    const whereConditions = [
      eq11(namespaceServerMappingsTable.namespace_uuid, namespaceUuid)
    ];
    if (!includeInactiveServers) {
      whereConditions.push(
        eq11(
          namespaceServerMappingsTable.status,
          McpServerStatusEnum2.Enum.ACTIVE
        )
      );
    }
    whereConditions.push(
      eq11(mcpServersTable.error_status, McpServerErrorStatusEnum4.Enum.NONE)
    );
    const servers = await db.select({
      uuid: mcpServersTable.uuid,
      name: mcpServersTable.name,
      description: mcpServersTable.description,
      type: mcpServersTable.type,
      command: mcpServersTable.command,
      args: mcpServersTable.args,
      env: mcpServersTable.env,
      url: mcpServersTable.url,
      created_at: mcpServersTable.created_at,
      bearerToken: mcpServersTable.bearerToken,
      headers: mcpServersTable.headers,
      status: namespaceServerMappingsTable.status,
      error_status: mcpServersTable.error_status
    }).from(mcpServersTable).innerJoin(
      namespaceServerMappingsTable,
      eq11(mcpServersTable.uuid, namespaceServerMappingsTable.mcp_server_uuid)
    ).where(and8(...whereConditions));
    const serverDict = {};
    for (const server of servers) {
      const oauthSession = await oauthSessionsRepository.findByMcpServerUuid(
        server.uuid
      );
      let oauthTokens = null;
      if (oauthSession && oauthSession.tokens) {
        oauthTokens = {
          access_token: oauthSession.tokens.access_token,
          token_type: oauthSession.tokens.token_type,
          expires_in: oauthSession.tokens.expires_in,
          scope: oauthSession.tokens.scope,
          refresh_token: oauthSession.tokens.refresh_token
        };
      }
      const params = {
        uuid: server.uuid,
        name: server.name,
        description: server.description || "",
        type: server.type || "STDIO",
        command: server.command,
        args: server.args || [],
        env: server.env || {},
        url: server.url,
        headers: server.headers || {},
        created_at: server.created_at?.toISOString() || (/* @__PURE__ */ new Date()).toISOString(),
        status: server.status.toLowerCase(),
        error_status: server.error_status?.toLowerCase(),
        stderr: "inherit",
        oauth_tokens: oauthTokens,
        bearerToken: server.bearerToken
      };
      if (params.type === "STDIO") {
        if ("args" in params && !params.args) {
          params.args = void 0;
        }
        params.env = {
          ...getDefaultEnvironment2(),
          ...params.env || {}
        };
      } else if (params.type === "SSE" || params.type === "STREAMABLE_HTTP") {
        if (!params.url) {
          logger_default.warn(
            `${params.type} server ${params.uuid} is missing url field, skipping`
          );
          continue;
        }
      }
      serverDict[server.uuid] = params;
    }
    return serverDict;
  } catch (error) {
    logger_default.error("Error fetching active MCP servers from database:", error);
    return {};
  }
}
var init_fetch_metamcp = __esm({
  "src/lib/metamcp/fetch-metamcp.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_repositories();
    init_schema();
    init_utils();
    __name(getMcpServers, "getMcpServers");
  }
});

// src/db/serializers/endpoints.serializer.ts
var EndpointsSerializer;
var init_endpoints_serializer = __esm({
  "src/db/serializers/endpoints.serializer.ts"() {
    "use strict";
    EndpointsSerializer = class {
      static {
        __name(this, "EndpointsSerializer");
      }
      static serializeEndpoint(dbEndpoint) {
        return {
          uuid: dbEndpoint.uuid,
          name: dbEndpoint.name,
          description: dbEndpoint.description,
          namespace_uuid: dbEndpoint.namespace_uuid,
          enable_api_key_auth: dbEndpoint.enable_api_key_auth,
          enableClientMaxRate: dbEndpoint.enable_client_max_rate,
          enableMaxRate: dbEndpoint.enable_max_rate,
          maxRateSeconds: dbEndpoint.max_rate_seconds === null ? void 0 : dbEndpoint.max_rate_seconds,
          maxRate: dbEndpoint.max_rate === null ? void 0 : dbEndpoint.max_rate,
          clientMaxRate: dbEndpoint.client_max_rate === null ? void 0 : dbEndpoint.client_max_rate,
          clientMaxRateSeconds: dbEndpoint.client_max_rate_seconds === null ? void 0 : dbEndpoint.client_max_rate_seconds,
          clientMaxRateStrategy: dbEndpoint.client_max_rate_strategy === null ? void 0 : dbEndpoint.client_max_rate_strategy,
          clientMaxRateStrategyKey: dbEndpoint.client_max_rate_strategy_key === null ? void 0 : dbEndpoint.client_max_rate_strategy_key,
          enable_oauth: dbEndpoint.enable_oauth,
          use_query_param_auth: dbEndpoint.use_query_param_auth,
          created_at: dbEndpoint.created_at.toISOString(),
          updated_at: dbEndpoint.updated_at.toISOString(),
          user_id: dbEndpoint.user_id
        };
      }
      static serializeEndpointList(dbEndpoints) {
        return dbEndpoints.map(this.serializeEndpoint);
      }
      static serializeEndpointWithNamespace(dbEndpoint) {
        return {
          uuid: dbEndpoint.uuid,
          name: dbEndpoint.name,
          description: dbEndpoint.description,
          namespace_uuid: dbEndpoint.namespace_uuid,
          enable_api_key_auth: dbEndpoint.enable_api_key_auth,
          enableClientMaxRate: dbEndpoint.enable_client_max_rate,
          enableMaxRate: dbEndpoint.enable_max_rate,
          maxRateSeconds: dbEndpoint.max_rate_seconds === null ? void 0 : dbEndpoint.max_rate_seconds,
          maxRate: dbEndpoint.max_rate === null ? void 0 : dbEndpoint.max_rate,
          clientMaxRate: dbEndpoint.client_max_rate === null ? void 0 : dbEndpoint.client_max_rate,
          clientMaxRateSeconds: dbEndpoint.client_max_rate_seconds === null ? void 0 : dbEndpoint.client_max_rate_seconds,
          clientMaxRateStrategy: dbEndpoint.client_max_rate_strategy === null ? void 0 : dbEndpoint.client_max_rate_strategy,
          clientMaxRateStrategyKey: dbEndpoint.client_max_rate_strategy_key === null ? void 0 : dbEndpoint.client_max_rate_strategy_key,
          enable_oauth: dbEndpoint.enable_oauth,
          use_query_param_auth: dbEndpoint.use_query_param_auth,
          created_at: dbEndpoint.created_at.toISOString(),
          updated_at: dbEndpoint.updated_at.toISOString(),
          user_id: dbEndpoint.user_id,
          namespace: {
            uuid: dbEndpoint.namespace.uuid,
            name: dbEndpoint.namespace.name,
            description: dbEndpoint.namespace.description,
            created_at: dbEndpoint.namespace.created_at.toISOString(),
            updated_at: dbEndpoint.namespace.updated_at.toISOString(),
            user_id: dbEndpoint.namespace.user_id
          }
        };
      }
      static serializeEndpointWithNamespaceList(dbEndpoints) {
        return dbEndpoints.map(this.serializeEndpointWithNamespace);
      }
    };
  }
});

// src/db/serializers/mcp-servers.serializer.ts
var McpServersSerializer;
var init_mcp_servers_serializer = __esm({
  "src/db/serializers/mcp-servers.serializer.ts"() {
    "use strict";
    McpServersSerializer = class {
      static {
        __name(this, "McpServersSerializer");
      }
      static serializeMcpServer(dbServer) {
        return {
          uuid: dbServer.uuid,
          name: dbServer.name,
          description: dbServer.description,
          type: dbServer.type,
          command: dbServer.command,
          args: dbServer.args,
          env: dbServer.env,
          url: dbServer.url,
          error_status: dbServer.error_status,
          created_at: dbServer.created_at.toISOString(),
          bearerToken: dbServer.bearerToken,
          headers: dbServer.headers,
          user_id: dbServer.user_id
        };
      }
      static serializeMcpServerList(dbServers) {
        return dbServers.map(this.serializeMcpServer);
      }
    };
  }
});

// src/db/serializers/namespaces.serializer.ts
var NamespacesSerializer;
var init_namespaces_serializer = __esm({
  "src/db/serializers/namespaces.serializer.ts"() {
    "use strict";
    NamespacesSerializer = class {
      static {
        __name(this, "NamespacesSerializer");
      }
      static serializeNamespace(dbNamespace) {
        return {
          uuid: dbNamespace.uuid,
          name: dbNamespace.name,
          description: dbNamespace.description,
          created_at: dbNamespace.created_at.toISOString(),
          updated_at: dbNamespace.updated_at.toISOString(),
          user_id: dbNamespace.user_id
        };
      }
      static serializeNamespaceList(dbNamespaces) {
        return dbNamespaces.map(this.serializeNamespace);
      }
      static serializeNamespaceWithServers(dbNamespace) {
        return {
          uuid: dbNamespace.uuid,
          name: dbNamespace.name,
          description: dbNamespace.description,
          created_at: dbNamespace.created_at.toISOString(),
          updated_at: dbNamespace.updated_at.toISOString(),
          user_id: dbNamespace.user_id,
          servers: dbNamespace.servers.map((server) => ({
            uuid: server.uuid,
            name: server.name,
            description: server.description,
            type: server.type,
            command: server.command,
            args: server.args || [],
            url: server.url,
            env: server.env || {},
            bearerToken: server.bearerToken,
            headers: server.headers || {},
            error_status: server.error_status,
            created_at: server.created_at.toISOString(),
            user_id: server.user_id,
            status: server.status
          }))
        };
      }
      static serializeNamespaceTool(dbTool) {
        return {
          uuid: dbTool.uuid,
          name: dbTool.name,
          description: dbTool.description,
          toolSchema: dbTool.toolSchema,
          created_at: dbTool.created_at.toISOString(),
          updated_at: dbTool.updated_at.toISOString(),
          mcp_server_uuid: dbTool.mcp_server_uuid,
          status: dbTool.status,
          serverName: dbTool.serverName,
          serverUuid: dbTool.serverUuid,
          overrideName: dbTool.overrideName,
          overrideTitle: dbTool.overrideTitle,
          overrideDescription: dbTool.overrideDescription,
          overrideAnnotations: dbTool.overrideAnnotations
        };
      }
      static serializeNamespaceTools(dbTools) {
        return dbTools.map(this.serializeNamespaceTool);
      }
    };
  }
});

// src/db/serializers/oauth-sessions.serializer.ts
var OAuthSessionsSerializer;
var init_oauth_sessions_serializer = __esm({
  "src/db/serializers/oauth-sessions.serializer.ts"() {
    "use strict";
    OAuthSessionsSerializer = class {
      static {
        __name(this, "OAuthSessionsSerializer");
      }
      static serializeOAuthSession(dbSession) {
        return {
          uuid: dbSession.uuid,
          mcp_server_uuid: dbSession.mcp_server_uuid,
          client_information: dbSession.client_information,
          tokens: dbSession.tokens,
          code_verifier: dbSession.code_verifier,
          created_at: dbSession.created_at.toISOString(),
          updated_at: dbSession.updated_at.toISOString()
        };
      }
    };
  }
});

// src/db/serializers/tools.serializer.ts
var ToolsSerializer;
var init_tools_serializer = __esm({
  "src/db/serializers/tools.serializer.ts"() {
    "use strict";
    ToolsSerializer = class {
      static {
        __name(this, "ToolsSerializer");
      }
      static serializeTool(dbTool) {
        return {
          uuid: dbTool.uuid,
          name: dbTool.name,
          description: dbTool.description,
          toolSchema: dbTool.toolSchema,
          created_at: dbTool.created_at.toISOString(),
          updated_at: dbTool.updated_at.toISOString(),
          mcp_server_uuid: dbTool.mcp_server_uuid
        };
      }
      static serializeToolList(dbTools) {
        return dbTools.map(this.serializeTool);
      }
    };
  }
});

// src/db/serializers/api-keys.serializer.ts
var ApiKeysSerializer;
var init_api_keys_serializer = __esm({
  "src/db/serializers/api-keys.serializer.ts"() {
    "use strict";
    ApiKeysSerializer = class {
      static {
        __name(this, "ApiKeysSerializer");
      }
      static serializeApiKey(dbApiKey) {
        return {
          uuid: dbApiKey.uuid,
          name: dbApiKey.name,
          key: dbApiKey.key,
          created_at: dbApiKey.created_at,
          is_active: dbApiKey.is_active
        };
      }
      static serializeApiKeyList(dbApiKeys) {
        return dbApiKeys.map((apiKey) => ({
          uuid: apiKey.uuid,
          name: apiKey.name,
          key: apiKey.key,
          created_at: apiKey.created_at,
          is_active: apiKey.is_active,
          user_id: apiKey.user_id
        }));
      }
      static serializeCreateApiKeyResponse(dbApiKey) {
        return {
          uuid: dbApiKey.uuid,
          name: dbApiKey.name,
          key: dbApiKey.key,
          created_at: dbApiKey.created_at
        };
      }
    };
  }
});

// src/db/serializers/index.ts
var init_serializers = __esm({
  "src/db/serializers/index.ts"() {
    "use strict";
    init_endpoints_serializer();
    init_mcp_servers_serializer();
    init_namespaces_serializer();
    init_oauth_sessions_serializer();
    init_tools_serializer();
    init_api_keys_serializer();
  }
});

// src/lib/metamcp/tools-sync-cache.ts
import crypto3 from "crypto";
var ToolsSyncCache, toolsSyncCache;
var init_tools_sync_cache = __esm({
  "src/lib/metamcp/tools-sync-cache.ts"() {
    "use strict";
    ToolsSyncCache = class {
      static {
        __name(this, "ToolsSyncCache");
      }
      cache = /* @__PURE__ */ new Map();
      /**
       * Generate a hash from tool names
       * Only tool names are used since they uniquely identify tools per server
       */
      hashTools(toolNames) {
        const sorted = [...toolNames].sort();
        const joined = sorted.join("|");
        return crypto3.createHash("sha256").update(joined).digest("hex");
      }
      /**
       * Check if tools have changed since last sync
       * @returns true if tools changed or no cache exists, false if unchanged
       */
      hasChanged(mcpServerUuid, toolNames) {
        const currentHash = this.hashTools(toolNames);
        const cachedHash = this.cache.get(mcpServerUuid);
        return cachedHash !== currentHash;
      }
      /**
       * Update the cache with current tool state
       */
      update(mcpServerUuid, toolNames) {
        const hash = this.hashTools(toolNames);
        this.cache.set(mcpServerUuid, hash);
      }
      /**
       * Check if sync is needed and update cache if it is
       * @returns true if sync needed, false if cache hit
       */
      shouldSync(mcpServerUuid, toolNames) {
        const needsSync = this.hasChanged(mcpServerUuid, toolNames);
        if (needsSync) {
          this.update(mcpServerUuid, toolNames);
        }
        return needsSync;
      }
      /**
       * Clear cache for specific server or entire cache
       */
      clear(mcpServerUuid) {
        if (mcpServerUuid) {
          this.cache.delete(mcpServerUuid);
        } else {
          this.cache.clear();
        }
      }
      /**
       * Get cache statistics
       */
      getStats() {
        return {
          size: this.cache.size,
          servers: Array.from(this.cache.keys())
        };
      }
    };
    toolsSyncCache = new ToolsSyncCache();
  }
});

// src/trpc/tools.impl.ts
var toolsImplementations;
var init_tools_impl = __esm({
  "src/trpc/tools.impl.ts"() {
    "use strict";
    init_logger();
    init_repositories();
    init_serializers();
    init_tools_sync_cache();
    toolsImplementations = {
      getByMcpServerUuid: /* @__PURE__ */ __name(async (input) => {
        try {
          const tools = await toolsRepository.findByMcpServerUuid(
            input.mcpServerUuid
          );
          return {
            success: true,
            data: ToolsSerializer.serializeToolList(tools),
            message: "Tools retrieved successfully"
          };
        } catch (error) {
          logger_default.error("Error fetching tools by MCP server UUID:", error);
          return {
            success: false,
            data: [],
            message: "Failed to fetch tools"
          };
        }
      }, "getByMcpServerUuid"),
      create: /* @__PURE__ */ __name(async (input) => {
        try {
          if (!input.tools || input.tools.length === 0) {
            return {
              success: true,
              count: 0,
              message: "No tools to save"
            };
          }
          const results = await toolsRepository.bulkUpsert({
            tools: input.tools,
            mcpServerUuid: input.mcpServerUuid
          });
          return {
            success: true,
            count: results.length,
            message: `Successfully saved ${results.length} tools`
          };
        } catch (error) {
          logger_default.error("Error saving tools to database:", error);
          return {
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : "Internal server error"
          };
        }
      }, "create"),
      /**
       * Smart sync with hash-check and cleanup
       * Only syncs if tools have actually changed (performance optimized)
       */
      sync: /* @__PURE__ */ __name(async (input) => {
        try {
          if (!input.tools || input.tools.length === 0) {
            return {
              success: true,
              count: 0,
              message: "No tools to sync"
            };
          }
          const toolNames = input.tools.map((tool) => tool.name);
          const hasChanged = toolsSyncCache.hasChanged(
            input.mcpServerUuid,
            toolNames
          );
          if (hasChanged) {
            toolsSyncCache.update(input.mcpServerUuid, toolNames);
            const { upserted, deleted } = await toolsRepository.syncTools({
              tools: input.tools,
              mcpServerUuid: input.mcpServerUuid
            });
            const message = deleted.length > 0 ? `Successfully synced ${upserted.length} tools (removed ${deleted.length} obsolete)` : `Successfully synced ${upserted.length} tools`;
            return {
              success: true,
              count: upserted.length,
              message
            };
          } else {
            return {
              success: true,
              count: input.tools.length,
              message: "Tools unchanged, skipped sync"
            };
          }
        } catch (error) {
          console.error("Error syncing tools to database:", error);
          return {
            success: false,
            count: 0,
            error: error instanceof Error ? error.message : "Internal server error"
          };
        }
      }, "sync")
    };
  }
});

// src/lib/metamcp/mcp-server-pool.ts
var McpServerPool, mcpServerPool;
var init_mcp_server_pool = __esm({
  "src/lib/metamcp/mcp-server-pool.ts"() {
    "use strict";
    init_logger();
    init_config_service();
    init_client();
    init_server_error_tracker();
    McpServerPool = class _McpServerPool {
      static {
        __name(this, "McpServerPool");
      }
      // Singleton instance
      static instance = null;
      // Idle sessions: serverUuid -> ConnectedClient (no sessionId assigned yet)
      idleSessions = {};
      // Active sessions: sessionId -> Record<serverUuid, ConnectedClient>
      activeSessions = {};
      // Mapping: sessionId -> Set<serverUuid> for cleanup tracking
      sessionToServers = {};
      // Session creation timestamps: sessionId -> timestamp
      sessionTimestamps = {};
      // Server parameters cache: serverUuid -> ServerParameters
      serverParamsCache = {};
      // Track ongoing idle session creation to prevent duplicates
      creatingIdleSessions = /* @__PURE__ */ new Set();
      // Session cleanup timer
      cleanupTimer = null;
      // Health check timer for idle sessions
      healthCheckTimer = null;
      // Background idle sessions by namespace: namespaceUuid -> any
      backgroundIdleSessionsByNamespace = /* @__PURE__ */ new Map();
      // Default number of idle sessions per server UUID
      defaultIdleCount;
      // Maximum total connections (idle + active) to prevent runaway process spawning
      maxTotalConnections;
      // Maximum connections per individual server UUID (prevents per-server process explosion)
      maxConnectionsPerServer;
      constructor(defaultIdleCount = 1, maxTotalConnections = Infinity, maxConnectionsPerServer = Infinity) {
        this.defaultIdleCount = defaultIdleCount;
        this.maxTotalConnections = maxTotalConnections;
        this.maxConnectionsPerServer = maxConnectionsPerServer;
        this.startCleanupTimer();
        this.startHealthCheckTimer();
      }
      /**
       * Get the singleton instance
       */
      static getInstance(defaultIdleCount = 1, maxConnectionsPerServer = Infinity) {
        if (!_McpServerPool.instance) {
          _McpServerPool.instance = new _McpServerPool(
            defaultIdleCount,
            Infinity,
            maxConnectionsPerServer
          );
        }
        return _McpServerPool.instance;
      }
      /**
       * Count all connections (idle + active + pending) for a specific server UUID
       */
      countConnectionsForServer(serverUuid) {
        let count = 0;
        if (this.idleSessions[serverUuid]) {
          count += 1;
        }
        for (const sessionServers of Object.values(this.activeSessions)) {
          if (sessionServers[serverUuid]) {
            count += 1;
          }
        }
        if (this.creatingIdleSessions.has(serverUuid)) {
          count += 1;
        }
        return count;
      }
      /**
       * Check if we can create another connection for a specific server
       */
      canCreateConnectionForServer(serverUuid) {
        const count = this.countConnectionsForServer(serverUuid);
        if (count >= this.maxConnectionsPerServer) {
          logger_default.warn(
            `Per-server connection limit reached for ${serverUuid}: ${count}/${this.maxConnectionsPerServer}`
          );
          return false;
        }
        return true;
      }
      /**
       * Find the oldest active connection for a server UUID (for reuse when at cap)
       */
      findOldestActiveConnectionForServer(serverUuid) {
        let oldestSessionId;
        let oldestTimestamp = Infinity;
        for (const [sessionId, sessionServers] of Object.entries(
          this.activeSessions
        )) {
          if (sessionServers[serverUuid]) {
            const timestamp2 = this.sessionTimestamps[sessionId] || Infinity;
            if (timestamp2 < oldestTimestamp) {
              oldestTimestamp = timestamp2;
              oldestSessionId = sessionId;
            }
          }
        }
        if (oldestSessionId) {
          return this.activeSessions[oldestSessionId]?.[serverUuid];
        }
        return void 0;
      }
      /**
       * Get or create a session for a specific MCP server
       */
      async getSession(sessionId, serverUuid, params, namespaceUuid) {
        this.serverParamsCache[serverUuid] = params;
        if (this.activeSessions[sessionId]?.[serverUuid]) {
          this.sessionTimestamps[sessionId] = Date.now();
          return this.activeSessions[sessionId][serverUuid];
        }
        if (!this.activeSessions[sessionId]) {
          this.activeSessions[sessionId] = {};
          this.sessionToServers[sessionId] = /* @__PURE__ */ new Set();
          this.sessionTimestamps[sessionId] = Date.now();
        }
        const idleClient = this.idleSessions[serverUuid];
        if (idleClient) {
          delete this.idleSessions[serverUuid];
          this.activeSessions[sessionId][serverUuid] = idleClient;
          this.sessionToServers[sessionId].add(serverUuid);
          logger_default.info(
            `Converted idle session to active for server ${serverUuid}, session ${sessionId}`
          );
          this.createIdleSessionAsync(serverUuid, params, namespaceUuid);
          return idleClient;
        }
        if (!this.canCreateConnectionForServer(serverUuid)) {
          const reusable = this.findOldestActiveConnectionForServer(serverUuid);
          if (reusable) {
            logger_default.info(
              `Reusing existing connection for server ${serverUuid} (at per-server cap ${this.maxConnectionsPerServer})`
            );
            this.activeSessions[sessionId][serverUuid] = reusable;
            this.sessionToServers[sessionId].add(serverUuid);
            return reusable;
          }
        }
        const newClient = await this.createNewConnection(params, namespaceUuid);
        if (!newClient) {
          return void 0;
        }
        this.activeSessions[sessionId][serverUuid] = newClient;
        this.sessionToServers[sessionId].add(serverUuid);
        logger_default.info(
          `Created new active session for server ${serverUuid}, session ${sessionId}`
        );
        this.createIdleSessionAsync(serverUuid, params, namespaceUuid);
        return newClient;
      }
      /**
       * Create a new connection for a server
       */
      async createNewConnection(params, namespaceUuid) {
        if (!this.canCreateConnection()) {
          logger_default.warn(
            `Skipping connection for server ${params.name} (${params.uuid}) - connection limit reached`
          );
          return void 0;
        }
        logger_default.info(
          `Creating new connection for server ${params.name} (${params.uuid}) with namespace: ${namespaceUuid || "none"}`
        );
        const connectedClient = await connectMetaMcpClient(
          params,
          (exitCode, signal) => {
            logger_default.info(
              `Crash handler callback called for server ${params.name} (${params.uuid}) with namespace: ${namespaceUuid || "none"}`
            );
            if (namespaceUuid) {
              this.handleServerCrash(
                params.uuid,
                namespaceUuid,
                exitCode,
                signal
              ).catch((error) => {
                logger_default.error(
                  `Error handling server crash for ${params.uuid} in ${namespaceUuid}:`,
                  error
                );
              });
            } else {
              this.handleServerCrashWithoutNamespace(
                params.uuid,
                exitCode,
                signal
              ).catch((error) => {
                logger_default.error(
                  `Error handling server crash for ${params.uuid} (no namespace):`,
                  error
                );
              });
            }
          }
        );
        if (!connectedClient) {
          return void 0;
        }
        return connectedClient;
      }
      /**
       * Create an idle session for a server (blocking version for initial setup)
       */
      async createIdleSession(serverUuid, params, namespaceUuid) {
        if (this.idleSessions[serverUuid]) {
          return;
        }
        if (!this.canCreateConnectionForServer(serverUuid)) {
          return;
        }
        const newClient = await this.createNewConnection(params, namespaceUuid);
        if (newClient) {
          this.idleSessions[serverUuid] = newClient;
          logger_default.info(`Created idle session for server ${serverUuid}`);
        }
      }
      /**
       * Create an idle session for a server asynchronously (non-blocking)
       */
      createIdleSessionAsync(serverUuid, params, namespaceUuid) {
        if (this.idleSessions[serverUuid] || this.creatingIdleSessions.has(serverUuid)) {
          return;
        }
        if (!this.canCreateConnectionForServer(serverUuid)) {
          return;
        }
        this.creatingIdleSessions.add(serverUuid);
        this.createNewConnection(params, namespaceUuid).then((newClient) => {
          if (newClient && !this.idleSessions[serverUuid]) {
            this.idleSessions[serverUuid] = newClient;
            logger_default.info(
              `Created background idle session for server [${params.name}] ${serverUuid}`
            );
            if (namespaceUuid) {
              this.setBackgroundIdleSessionsByNamespace(
                namespaceUuid,
                (/* @__PURE__ */ new Map()).set("status", "created")
              );
            }
          } else if (newClient) {
            newClient.cleanup().catch((error) => {
              logger_default.error(
                `Error cleaning up extra idle session for ${serverUuid}:`,
                error
              );
            });
          }
        }).catch((error) => {
          logger_default.error(
            `Error creating background idle session for ${serverUuid}:`,
            error
          );
        }).finally(() => {
          this.creatingIdleSessions.delete(serverUuid);
        });
      }
      /**
       * Ensure idle sessions exist for all servers
       */
      async ensureIdleSessions(serverParams, namespaceUuid) {
        const promises = Object.entries(serverParams).map(
          async ([uuid2, params]) => {
            if (!this.idleSessions[uuid2]) {
              await this.createIdleSession(uuid2, params, namespaceUuid);
            }
          }
        );
        await Promise.allSettled(promises);
      }
      /**
       * Cleanup a session by sessionId.
       * Recycles healthy connections back to the idle pool instead of destroying them.
       */
      async cleanupSession(sessionId) {
        const activeSession = this.activeSessions[sessionId];
        if (!activeSession) {
          return;
        }
        let recycled = 0;
        let destroyed = 0;
        for (const [serverUuid, client] of Object.entries(activeSession)) {
          if (!this.idleSessions[serverUuid]) {
            this.idleSessions[serverUuid] = client;
            recycled++;
            logger_default.info(
              `Recycled active connection for server ${serverUuid} to idle pool (session ${sessionId})`
            );
          } else {
            try {
              await client.cleanup();
            } catch (error) {
              logger_default.error(
                `Error cleaning up extra connection for server ${serverUuid}:`,
                error
              );
            }
            destroyed++;
          }
        }
        delete this.activeSessions[sessionId];
        delete this.sessionTimestamps[sessionId];
        delete this.sessionToServers[sessionId];
        logger_default.info(
          `Cleaned up session ${sessionId} (recycled: ${recycled}, destroyed: ${destroyed})`
        );
      }
      /**
       * Cleanup all sessions
       */
      async cleanupAll() {
        const activeSessionIds = Object.keys(this.activeSessions);
        await Promise.allSettled(
          activeSessionIds.map((sessionId) => this.cleanupSession(sessionId))
        );
        await Promise.allSettled(
          Object.entries(this.idleSessions).map(async ([_uuid, client]) => {
            await client.cleanup();
          })
        );
        this.idleSessions = {};
        this.activeSessions = {};
        this.sessionToServers = {};
        this.sessionTimestamps = {};
        this.serverParamsCache = {};
        this.creatingIdleSessions.clear();
        if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
          this.cleanupTimer = null;
        }
        if (this.healthCheckTimer) {
          clearInterval(this.healthCheckTimer);
          this.healthCheckTimer = null;
        }
        logger_default.info("Cleaned up all MCP server pool sessions");
      }
      /**
       * Get pool status for monitoring
       */
      getPoolStatus() {
        const idle = Object.keys(this.idleSessions).length;
        const active = Object.keys(this.activeSessions).reduce(
          (total, sessionId) => total + Object.keys(this.activeSessions[sessionId]).length,
          0
        );
        const perServerCounts = {};
        for (const serverUuid of Object.keys(this.serverParamsCache)) {
          perServerCounts[serverUuid] = this.countConnectionsForServer(serverUuid);
        }
        return {
          idle,
          active,
          activeSessionIds: Object.keys(this.activeSessions),
          idleServerUuids: Object.keys(this.idleSessions),
          perServerCounts,
          maxConnectionsPerServer: this.maxConnectionsPerServer
        };
      }
      /**
       * Get total connection count (idle + active + pending)
       */
      getTotalConnectionCount() {
        const idle = Object.keys(this.idleSessions).length;
        const active = Object.keys(this.activeSessions).reduce(
          (total, sessionId) => total + Object.keys(this.activeSessions[sessionId]).length,
          0
        );
        const pending = this.creatingIdleSessions.size;
        return idle + active + pending;
      }
      /**
       * Check if we can create a new connection (respects maxTotalConnections limit)
       */
      canCreateConnection() {
        const total = this.getTotalConnectionCount();
        if (total >= this.maxTotalConnections) {
          logger_default.warn(
            `Connection limit reached: ${total}/${this.maxTotalConnections}. Refusing to create new connection.`
          );
          return false;
        }
        return true;
      }
      /**
       * Get active session connections for a specific session (for debugging/monitoring)
       */
      getSessionConnections(sessionId) {
        return this.activeSessions[sessionId];
      }
      /**
       * Get all active session IDs (for debugging/monitoring)
       */
      getActiveSessionIds() {
        return Object.keys(this.activeSessions);
      }
      /**
       * Get background idle sessions by namespace
       */
      getBackgroundIdleSessionsByNamespace() {
        return this.backgroundIdleSessionsByNamespace;
      }
      /**
       * Set background idle sessions by namespace
       */
      setBackgroundIdleSessionsByNamespace(namespaceUuid, options) {
        this.backgroundIdleSessionsByNamespace.set(namespaceUuid, options);
      }
      /**
       * Invalidate and refresh idle session for a specific server
       * This should be called when a server's parameters (command, args, etc.) change
       */
      async invalidateIdleSession(serverUuid, params, namespaceUuid) {
        logger_default.info(`Invalidating idle session for server ${serverUuid}`);
        this.serverParamsCache[serverUuid] = params;
        const existingIdleSession = this.idleSessions[serverUuid];
        if (existingIdleSession) {
          try {
            await existingIdleSession.cleanup();
            logger_default.info(
              `Cleaned up existing idle session for server ${serverUuid}`
            );
          } catch (error) {
            logger_default.error(
              `Error cleaning up existing idle session for server ${serverUuid}:`,
              error
            );
          }
          delete this.idleSessions[serverUuid];
        }
        this.creatingIdleSessions.delete(serverUuid);
        await this.createIdleSession(serverUuid, params, namespaceUuid);
      }
      /**
       * Invalidate and refresh idle sessions for multiple servers
       */
      async invalidateIdleSessions(serverParams, namespaceUuid) {
        const promises = Object.entries(serverParams).map(
          ([serverUuid, params]) => this.invalidateIdleSession(serverUuid, params, namespaceUuid)
        );
        await Promise.allSettled(promises);
      }
      /**
       * Clean up idle session for a specific server without creating a new one
       * This should be called when a server is being deleted
       */
      async cleanupIdleSession(serverUuid) {
        logger_default.info(`Cleaning up idle session for server ${serverUuid}`);
        const existingIdleSession = this.idleSessions[serverUuid];
        if (existingIdleSession) {
          try {
            await existingIdleSession.cleanup();
            logger_default.info(`Cleaned up idle session for server ${serverUuid}`);
          } catch (error) {
            logger_default.error(
              `Error cleaning up idle session for server ${serverUuid}:`,
              error
            );
          }
          delete this.idleSessions[serverUuid];
        }
        this.creatingIdleSessions.delete(serverUuid);
        delete this.serverParamsCache[serverUuid];
      }
      /**
       * Ensure idle session exists for a newly created server
       * This should be called when a new server is created
       */
      async ensureIdleSessionForNewServer(serverUuid, params, namespaceUuid) {
        logger_default.info(`Ensuring idle session exists for new server ${serverUuid}`);
        this.serverParamsCache[serverUuid] = params;
        if (!this.idleSessions[serverUuid] && !this.creatingIdleSessions.has(serverUuid)) {
          await this.createIdleSession(serverUuid, params, namespaceUuid);
        }
      }
      /**
       * Handle server process crash
       */
      async handleServerCrash(serverUuid, namespaceUuid, exitCode, signal) {
        logger_default.warn(
          `Handling server crash for ${serverUuid} in namespace ${namespaceUuid}`
        );
        await serverErrorTracker.recordServerCrash(serverUuid, exitCode, signal);
        await this.cleanupServerSessions(serverUuid);
      }
      /**
       * Handle server process crash without namespace context
       * This is used when servers are created without a specific namespace
       */
      async handleServerCrashWithoutNamespace(serverUuid, exitCode, signal) {
        logger_default.warn(
          `Handling server crash for ${serverUuid} (no namespace context)`
        );
        logger_default.info(`Recording crash for server ${serverUuid}`);
        await serverErrorTracker.recordServerCrash(serverUuid, exitCode, signal);
        await this.cleanupServerSessions(serverUuid);
      }
      /**
       * Clean up all sessions for a specific server
       */
      async cleanupServerSessions(serverUuid) {
        const idleSession = this.idleSessions[serverUuid];
        if (idleSession) {
          try {
            await idleSession.cleanup();
            logger_default.info(`Cleaned up idle session for crashed server ${serverUuid}`);
          } catch (error) {
            logger_default.error(
              `Error cleaning up idle session for crashed server ${serverUuid}:`,
              error
            );
          }
          delete this.idleSessions[serverUuid];
        }
        for (const [sessionId, sessionServers] of Object.entries(
          this.activeSessions
        )) {
          if (sessionServers[serverUuid]) {
            try {
              await sessionServers[serverUuid].cleanup();
              logger_default.info(
                `Cleaned up active session ${sessionId} for crashed server ${serverUuid}`
              );
            } catch (error) {
              logger_default.error(
                `Error cleaning up active session ${sessionId} for crashed server ${serverUuid}:`,
                error
              );
            }
            delete sessionServers[serverUuid];
            this.sessionToServers[sessionId]?.delete(serverUuid);
          }
        }
        this.creatingIdleSessions.delete(serverUuid);
      }
      /**
       * Check if a server is in error state
       */
      async isServerInErrorState(serverUuid) {
        return await serverErrorTracker.isServerInErrorState(serverUuid);
      }
      /**
       * Reset error state for a server (e.g., after manual recovery)
       */
      async resetServerErrorState(serverUuid) {
        await serverErrorTracker.resetServerErrorState(serverUuid);
        logger_default.info(`Reset error state for server ${serverUuid}`);
      }
      /**
       * Start the automatic cleanup timer for expired sessions
       */
      startCleanupTimer() {
        this.cleanupTimer = setInterval(
          async () => {
            await this.cleanupExpiredSessions();
          },
          5 * 60 * 1e3
        );
      }
      /**
       * Clean up expired sessions based on session lifetime setting
       */
      async cleanupExpiredSessions() {
        try {
          const sessionLifetime = await configService.getSessionLifetime();
          if (sessionLifetime === null) {
            return;
          }
          const now = Date.now();
          const expiredSessionIds = [];
          for (const [sessionId, timestamp2] of Object.entries(
            this.sessionTimestamps
          )) {
            if (now - timestamp2 > sessionLifetime) {
              expiredSessionIds.push(sessionId);
            }
          }
          if (expiredSessionIds.length > 0) {
            logger_default.info(
              `Cleaning up ${expiredSessionIds.length} expired MCP server pool sessions: ${expiredSessionIds.join(", ")}`
            );
            await Promise.allSettled(
              expiredSessionIds.map((sessionId) => this.cleanupSession(sessionId))
            );
          }
        } catch (error) {
          logger_default.error("Error during automatic session cleanup:", error);
        }
      }
      /**
       * Start the health check timer for idle sessions
       */
      startHealthCheckTimer() {
        this.healthCheckTimer = setInterval(
          async () => {
            await this.checkIdleSessionHealth();
          },
          60 * 1e3
        );
      }
      /**
       * Check health of idle sessions by pinging them.
       * Dead sessions are cleaned up and recreated.
       * Servers in ERROR state whose crash counters have been reset are retried.
       */
      async checkIdleSessionHealth() {
        const serverUuids = Object.keys(this.idleSessions);
        if (serverUuids.length === 0) {
          return;
        }
        for (const serverUuid of serverUuids) {
          const client = this.idleSessions[serverUuid];
          if (!client) continue;
          try {
            await client.client.ping({ timeout: 5e3 });
          } catch {
            logger_default.warn(
              `Idle session health check failed for server ${serverUuid}, recreating...`
            );
            try {
              await client.cleanup();
            } catch {
            }
            delete this.idleSessions[serverUuid];
            await serverErrorTracker.resetServerErrorState(serverUuid);
            const params = this.serverParamsCache[serverUuid];
            if (params) {
              this.createIdleSessionAsync(serverUuid, params);
            }
          }
        }
        for (const [serverUuid, params] of Object.entries(this.serverParamsCache)) {
          if (!this.idleSessions[serverUuid] && !this.creatingIdleSessions.has(serverUuid)) {
            const isError = await serverErrorTracker.isServerInErrorState(
              serverUuid
            );
            if (!isError) {
              this.createIdleSessionAsync(serverUuid, params);
            }
          }
        }
      }
      /**
       * Get session age in milliseconds
       */
      getSessionAge(sessionId) {
        const timestamp2 = this.sessionTimestamps[sessionId];
        return timestamp2 ? Date.now() - timestamp2 : void 0;
      }
      /**
       * Check if a session is expired
       */
      async isSessionExpired(sessionId) {
        const age = this.getSessionAge(sessionId);
        if (age === void 0) return false;
        const sessionLifetime = await configService.getSessionLifetime();
        if (sessionLifetime === null) return false;
        return age > sessionLifetime;
      }
    };
    mcpServerPool = McpServerPool.getInstance();
  }
});

// src/lib/metamcp/tool-name-parser.ts
function parseToolName(toolName) {
  const firstDoubleUnderscoreIndex = toolName.indexOf("__");
  if (firstDoubleUnderscoreIndex === -1) {
    return null;
  }
  const serverName = toolName.substring(0, firstDoubleUnderscoreIndex);
  const originalToolName = toolName.substring(firstDoubleUnderscoreIndex + 2);
  return {
    serverName,
    originalToolName
  };
}
var init_tool_name_parser = __esm({
  "src/lib/metamcp/tool-name-parser.ts"() {
    "use strict";
    __name(parseToolName, "parseToolName");
  }
});

// src/lib/metamcp/metamcp-middleware/filter-tools.functional.ts
import { and as and9, eq as eq12 } from "drizzle-orm";
async function getToolStatus(namespaceUuid, toolName, serverUuid, useCache = true) {
  if (useCache) {
    const cached = toolStatusCache.get(namespaceUuid, toolName, serverUuid);
    if (cached !== null) {
      return cached;
    }
  }
  try {
    const [toolMapping] = await db.select({
      status: namespaceToolMappingsTable.status
    }).from(namespaceToolMappingsTable).innerJoin(
      toolsTable,
      eq12(toolsTable.uuid, namespaceToolMappingsTable.tool_uuid)
    ).where(
      and9(
        eq12(namespaceToolMappingsTable.namespace_uuid, namespaceUuid),
        eq12(toolsTable.name, toolName),
        eq12(namespaceToolMappingsTable.mcp_server_uuid, serverUuid)
      )
    );
    const status = toolMapping?.status || null;
    if (status && useCache) {
      toolStatusCache.set(namespaceUuid, toolName, serverUuid, status);
    }
    return status;
  } catch (error) {
    logger_default.error(
      `Error fetching tool status for ${toolName} in namespace ${namespaceUuid}:`,
      error
    );
    return null;
  }
}
async function getServerUuidByName(serverName) {
  try {
    const [server] = await db.select({ uuid: mcpServersTable.uuid }).from(mcpServersTable).where(eq12(mcpServersTable.name, serverName));
    return server?.uuid || null;
  } catch (error) {
    logger_default.error(`Error fetching server UUID for ${serverName}:`, error);
    return null;
  }
}
async function filterActiveTools(tools, namespaceUuid, useCache = true) {
  if (!tools || tools.length === 0) {
    return tools;
  }
  const activeTools = [];
  await Promise.allSettled(
    tools.map(async (tool) => {
      try {
        const parsed = parseToolName(tool.name);
        if (!parsed) {
          activeTools.push(tool);
          return;
        }
        const serverUuid = await getServerUuidByName(parsed.serverName);
        if (!serverUuid) {
          activeTools.push(tool);
          return;
        }
        const status = await getToolStatus(
          namespaceUuid,
          parsed.originalToolName,
          serverUuid,
          useCache
        );
        if (status === null || status === "ACTIVE") {
          activeTools.push(tool);
        }
      } catch (error) {
        logger_default.error(`Error checking tool status for ${tool.name}:`, error);
        activeTools.push(tool);
      }
    })
  );
  return activeTools;
}
async function isToolAllowed(toolName, namespaceUuid, serverUuid, useCache = true) {
  try {
    const parsed = parseToolName(toolName);
    if (!parsed) {
      return { allowed: true };
    }
    const status = await getToolStatus(
      namespaceUuid,
      parsed.originalToolName,
      serverUuid,
      useCache
    );
    if (status === null || status === "ACTIVE") {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "Tool has been marked as inactive in this namespace"
    };
  } catch (error) {
    logger_default.error(
      `Error checking if tool ${toolName} is allowed in namespace ${namespaceUuid}:`,
      error
    );
    return { allowed: true };
  }
}
function createFilterListToolsMiddleware(config = {}) {
  const useCache = config.cacheEnabled ?? true;
  return (handler) => {
    return async (request, context) => {
      const response = await handler(request, context);
      if (response.tools) {
        const filteredTools = await filterActiveTools(
          response.tools,
          context.namespaceUuid,
          useCache
        );
        return {
          ...response,
          tools: filteredTools
        };
      }
      return response;
    };
  };
}
function createFilterCallToolMiddleware(config = {}) {
  const useCache = config.cacheEnabled ?? true;
  const customErrorMessage = config.customErrorMessage ?? ((toolName, reason) => `Tool "${toolName}" is currently inactive and disallowed in this namespace: ${reason}`);
  return (handler) => {
    return async (request, context) => {
      const toolName = request.params.name;
      const parsed = parseToolName(toolName);
      if (parsed) {
        const serverUuid = await getServerUuidByName(parsed.serverName);
        if (serverUuid) {
          const { allowed, reason } = await isToolAllowed(
            toolName,
            context.namespaceUuid,
            serverUuid,
            useCache
          );
          if (!allowed) {
            return {
              content: [
                {
                  type: "text",
                  text: customErrorMessage(
                    toolName,
                    reason || "Unknown reason"
                  )
                }
              ],
              isError: true
            };
          }
        }
      }
      return handler(request, context);
    };
  };
}
var ToolStatusCache, toolStatusCache;
var init_filter_tools_functional = __esm({
  "src/lib/metamcp/metamcp-middleware/filter-tools.functional.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    init_tool_name_parser();
    ToolStatusCache = class {
      static {
        __name(this, "ToolStatusCache");
      }
      cache = /* @__PURE__ */ new Map();
      expiry = /* @__PURE__ */ new Map();
      ttl;
      constructor(ttl = 1e3) {
        this.ttl = ttl;
      }
      getCacheKey(namespaceUuid, toolName, serverUuid) {
        return `${namespaceUuid}:${serverUuid}:${toolName}`;
      }
      get(namespaceUuid, toolName, serverUuid) {
        const key = this.getCacheKey(namespaceUuid, toolName, serverUuid);
        const expiry = this.expiry.get(key);
        if (!expiry || Date.now() > expiry) {
          this.cache.delete(key);
          this.expiry.delete(key);
          return null;
        }
        return this.cache.get(key) || null;
      }
      set(namespaceUuid, toolName, serverUuid, status) {
        const key = this.getCacheKey(namespaceUuid, toolName, serverUuid);
        this.cache.set(key, status);
        this.expiry.set(key, Date.now() + this.ttl);
      }
      clear(namespaceUuid) {
        if (namespaceUuid) {
          for (const key of this.cache.keys()) {
            if (key.startsWith(`${namespaceUuid}:`)) {
              this.cache.delete(key);
              this.expiry.delete(key);
            }
          }
        } else {
          this.cache.clear();
          this.expiry.clear();
        }
      }
    };
    toolStatusCache = new ToolStatusCache();
    __name(getToolStatus, "getToolStatus");
    __name(getServerUuidByName, "getServerUuidByName");
    __name(filterActiveTools, "filterActiveTools");
    __name(isToolAllowed, "isToolAllowed");
    __name(createFilterListToolsMiddleware, "createFilterListToolsMiddleware");
    __name(createFilterCallToolMiddleware, "createFilterCallToolMiddleware");
  }
});

// src/lib/metamcp/metamcp-middleware/functional-middleware.ts
function compose(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight(
      (wrapped, middleware) => middleware(wrapped),
      handler
    );
  };
}
var init_functional_middleware = __esm({
  "src/lib/metamcp/metamcp-middleware/functional-middleware.ts"() {
    "use strict";
    __name(compose, "compose");
  }
});

// src/lib/metamcp/metamcp-middleware/tool-overrides.functional.ts
import { and as and10, eq as eq13 } from "drizzle-orm";
function mergeAnnotations(original, namespaceOverrides) {
  if (!namespaceOverrides || Object.keys(namespaceOverrides).length === 0) {
    return original;
  }
  const baseAnnotations = original ? { ...original } : {};
  for (const [key, value] of Object.entries(namespaceOverrides)) {
    baseAnnotations[key] = value;
  }
  return baseAnnotations;
}
async function getToolOverrides(namespaceUuid, serverName, toolName, useCache = true, isPersistent = false) {
  if (useCache) {
    const cached = toolOverridesCache.get(namespaceUuid, serverName, toolName);
    if (cached !== null) {
      return cached;
    }
  }
  try {
    const [server] = await db.select({ uuid: mcpServersTable.uuid }).from(mcpServersTable).where(eq13(mcpServersTable.name, serverName));
    if (!server) {
      return null;
    }
    const [toolMapping] = await db.select({
      overrideName: namespaceToolMappingsTable.override_name,
      overrideTitle: namespaceToolMappingsTable.override_title,
      overrideDescription: namespaceToolMappingsTable.override_description,
      overrideAnnotations: namespaceToolMappingsTable.override_annotations
    }).from(namespaceToolMappingsTable).innerJoin(
      toolsTable,
      eq13(toolsTable.uuid, namespaceToolMappingsTable.tool_uuid)
    ).where(
      and10(
        eq13(namespaceToolMappingsTable.namespace_uuid, namespaceUuid),
        eq13(toolsTable.name, toolName),
        eq13(namespaceToolMappingsTable.mcp_server_uuid, server.uuid)
      )
    );
    const override = {
      overrideName: toolMapping?.overrideName || null,
      overrideTitle: typeof toolMapping?.overrideTitle !== "undefined" ? toolMapping.overrideTitle : void 0,
      overrideDescription: toolMapping?.overrideDescription || null,
      overrideAnnotations: toolMapping?.overrideAnnotations || null
    };
    if (toolMapping && useCache) {
      toolOverridesCache.set(
        namespaceUuid,
        serverName,
        toolName,
        override,
        isPersistent
      );
    }
    return override;
  } catch (error) {
    logger_default.error(
      `Error fetching tool overrides for ${toolName} in namespace ${namespaceUuid}:`,
      error
    );
    return null;
  }
}
async function applyToolOverrides(tools, namespaceUuid, useCache = true, isPersistent = false) {
  if (!tools || tools.length === 0) {
    return tools;
  }
  const overriddenTools = [];
  await Promise.allSettled(
    tools.map(async (tool) => {
      try {
        const parsed = parseToolName(tool.name);
        if (!parsed) {
          overriddenTools.push(tool);
          return;
        }
        const override = await getToolOverrides(
          namespaceUuid,
          parsed.serverName,
          parsed.originalToolName,
          useCache,
          isPersistent
        );
        if (!override) {
          overriddenTools.push(tool);
          return;
        }
        const overriddenName = override.overrideName && override.overrideName.trim() !== "" ? `${parsed.serverName}__${override.overrideName}` : tool.name;
        const overriddenDescription = override.overrideDescription !== null ? override.overrideDescription : tool.description;
        let overriddenTitle = tool.title;
        if (typeof override.overrideTitle !== "undefined") {
          overriddenTitle = override.overrideTitle === null ? void 0 : override.overrideTitle;
        }
        let overriddenAnnotations = tool.annotations && Object.keys(tool.annotations).length > 0 ? { ...tool.annotations } : void 0;
        if (overriddenAnnotations && "title" in overriddenAnnotations) {
          const { title: _removed, ...rest } = overriddenAnnotations;
          overriddenAnnotations = Object.keys(rest).length > 0 ? rest : void 0;
        }
        overriddenAnnotations = mergeAnnotations(
          overriddenAnnotations,
          override.overrideAnnotations
        );
        const overriddenTool = {
          ...tool,
          name: overriddenName,
          title: overriddenTitle,
          description: overriddenDescription,
          annotations: overriddenAnnotations
        };
        if (override.overrideName && useCache) {
          toolOverridesCache.setOriginalName(
            namespaceUuid,
            override.overrideName,
            tool.name
          );
        }
        overriddenTools.push(overriddenTool);
      } catch (error) {
        logger_default.error(`Error applying overrides for tool ${tool.name}:`, error);
        overriddenTools.push(tool);
      }
    })
  );
  return overriddenTools;
}
async function mapOverrideNameToOriginal(toolName, namespaceUuid, useCache = true) {
  const parsed = parseToolName(toolName);
  if (!parsed) {
    return toolName;
  }
  if (useCache) {
    const originalName = toolOverridesCache.getOriginalName(
      namespaceUuid,
      parsed.originalToolName
    );
    if (originalName) {
      return originalName;
    }
  }
  try {
    const [toolMapping] = await db.select({
      originalName: toolsTable.name,
      serverName: mcpServersTable.name
    }).from(namespaceToolMappingsTable).innerJoin(
      toolsTable,
      eq13(toolsTable.uuid, namespaceToolMappingsTable.tool_uuid)
    ).innerJoin(
      mcpServersTable,
      eq13(mcpServersTable.uuid, namespaceToolMappingsTable.mcp_server_uuid)
    ).where(
      and10(
        eq13(namespaceToolMappingsTable.namespace_uuid, namespaceUuid),
        eq13(namespaceToolMappingsTable.override_name, parsed.originalToolName),
        eq13(mcpServersTable.name, parsed.serverName)
      )
    );
    if (toolMapping) {
      const originalFullName = `${toolMapping.serverName}__${toolMapping.originalName}`;
      if (useCache) {
        toolOverridesCache.setOriginalName(
          namespaceUuid,
          parsed.originalToolName,
          originalFullName
        );
      }
      return originalFullName;
    }
  } catch (error) {
    logger_default.error(
      `Error mapping override name ${toolName} to original in namespace ${namespaceUuid}:`,
      error
    );
  }
  return toolName;
}
function createToolOverridesListToolsMiddleware(config = {}) {
  const useCache = config.cacheEnabled ?? true;
  const isPersistent = config.persistentCacheOnListTools ?? false;
  return (handler) => {
    return async (request, context) => {
      const response = await handler(request, context);
      if (response.tools) {
        const overriddenTools = await applyToolOverrides(
          response.tools,
          context.namespaceUuid,
          useCache,
          isPersistent
        );
        return {
          ...response,
          tools: overriddenTools
        };
      }
      return response;
    };
  };
}
function createToolOverridesCallToolMiddleware(config = {}) {
  const useCache = config.cacheEnabled ?? true;
  return (handler) => {
    return async (request, context) => {
      const originalToolName = await mapOverrideNameToOriginal(
        request.params.name,
        context.namespaceUuid,
        useCache
      );
      const modifiedRequest = {
        ...request,
        params: {
          ...request.params,
          name: originalToolName
        }
      };
      return handler(modifiedRequest, context);
    };
  };
}
function clearOverrideCache(namespaceUuid) {
  toolOverridesCache.clear(namespaceUuid);
}
var ToolOverridesCache, toolOverridesCache;
var init_tool_overrides_functional = __esm({
  "src/lib/metamcp/metamcp-middleware/tool-overrides.functional.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    init_tool_name_parser();
    __name(mergeAnnotations, "mergeAnnotations");
    ToolOverridesCache = class {
      static {
        __name(this, "ToolOverridesCache");
      }
      overrideCache = /* @__PURE__ */ new Map();
      reverseNameCache = /* @__PURE__ */ new Map();
      // overrideName -> originalName
      expiry = /* @__PURE__ */ new Map();
      persistentKeys = /* @__PURE__ */ new Set();
      // keys that never expire
      ttl;
      constructor(ttl = 1e3) {
        this.ttl = ttl;
      }
      getCacheKey(namespaceUuid, serverName, toolName) {
        return `${namespaceUuid}:${serverName}:${toolName}`;
      }
      getReverseKey(namespaceUuid, overrideName) {
        return `${namespaceUuid}:${overrideName}`;
      }
      get(namespaceUuid, serverName, toolName) {
        const key = this.getCacheKey(namespaceUuid, serverName, toolName);
        if (this.persistentKeys.has(key)) {
          return this.overrideCache.get(key) || null;
        }
        const expiry = this.expiry.get(key);
        if (!expiry || Date.now() > expiry) {
          this.overrideCache.delete(key);
          this.expiry.delete(key);
          return null;
        }
        return this.overrideCache.get(key) || null;
      }
      set(namespaceUuid, serverName, toolName, override, isPersistent = false) {
        const key = this.getCacheKey(namespaceUuid, serverName, toolName);
        this.overrideCache.set(key, override);
        if (isPersistent) {
          this.persistentKeys.add(key);
        } else {
          this.expiry.set(key, Date.now() + this.ttl);
        }
        if (override.overrideName) {
          const reverseKey = this.getReverseKey(
            namespaceUuid,
            override.overrideName
          );
          this.reverseNameCache.set(reverseKey, `${serverName}__${toolName}`);
        }
      }
      getOriginalName(namespaceUuid, overrideName) {
        const reverseKey = this.getReverseKey(namespaceUuid, overrideName);
        return this.reverseNameCache.get(reverseKey) || null;
      }
      setOriginalName(namespaceUuid, overrideName, originalName) {
        const reverseKey = this.getReverseKey(namespaceUuid, overrideName);
        this.reverseNameCache.set(reverseKey, originalName);
      }
      clear(namespaceUuid) {
        if (namespaceUuid) {
          for (const key of this.overrideCache.keys()) {
            if (key.startsWith(`${namespaceUuid}:`)) {
              this.overrideCache.delete(key);
              this.expiry.delete(key);
              this.persistentKeys.delete(key);
            }
          }
          for (const key of this.reverseNameCache.keys()) {
            if (key.startsWith(`${namespaceUuid}:`)) {
              this.reverseNameCache.delete(key);
            }
          }
        } else {
          this.overrideCache.clear();
          this.reverseNameCache.clear();
          this.expiry.clear();
          this.persistentKeys.clear();
        }
      }
    };
    toolOverridesCache = new ToolOverridesCache();
    __name(getToolOverrides, "getToolOverrides");
    __name(applyToolOverrides, "applyToolOverrides");
    __name(mapOverrideNameToOriginal, "mapOverrideNameToOriginal");
    __name(createToolOverridesListToolsMiddleware, "createToolOverridesListToolsMiddleware");
    __name(createToolOverridesCallToolMiddleware, "createToolOverridesCallToolMiddleware");
    __name(clearOverrideCache, "clearOverrideCache");
  }
});

// src/lib/metamcp/metamcp-proxy.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  CompatibilityCallToolResultSchema,
  GetPromptRequestSchema,
  GetPromptResultSchema,
  ListPromptsRequestSchema,
  ListPromptsResultSchema,
  ListResourcesRequestSchema,
  ListResourcesResultSchema,
  ListResourceTemplatesRequestSchema,
  ListResourceTemplatesResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
  ReadResourceRequestSchema,
  ReadResourceResultSchema
} from "@modelcontextprotocol/sdk/types.js";
async function filterOutOverrideTools(tools, namespaceUuid, serverName) {
  if (!tools || tools.length === 0) {
    return tools;
  }
  const filteredTools = [];
  await Promise.allSettled(
    tools.map(async (tool) => {
      try {
        const fullToolName = `${sanitizeName(serverName)}__${tool.name}`;
        const originalName = await mapOverrideNameToOriginal(
          fullToolName,
          namespaceUuid,
          true
          // use cache
        );
        if (originalName !== fullToolName) {
          return;
        }
        filteredTools.push(tool);
      } catch (error) {
        logger_default.error(
          `Error checking if tool ${tool.name} is an override:`,
          error
        );
        filteredTools.push(tool);
      }
    })
  );
  return filteredTools;
}
var createServer;
var init_metamcp_proxy = __esm({
  "src/lib/metamcp/metamcp-proxy.ts"() {
    "use strict";
    init_logger();
    init_tools_impl();
    init_config_service();
    init_fetch_metamcp();
    init_mcp_server_pool();
    init_filter_tools_functional();
    init_functional_middleware();
    init_tool_overrides_functional();
    init_tool_name_parser();
    init_tools_sync_cache();
    init_utils();
    __name(filterOutOverrideTools, "filterOutOverrideTools");
    createServer = /* @__PURE__ */ __name(async (namespaceUuid, sessionId, includeInactiveServers = false) => {
      const toolToClient = {};
      const toolToServerUuid = {};
      const promptToClient = {};
      const resourceToClient = {};
      const isSameServerInstance = /* @__PURE__ */ __name((params, _serverUuid) => {
        if (params.name === `metamcp-unified-${namespaceUuid}`) {
          return true;
        }
        return false;
      }, "isSameServerInstance");
      const server = new Server(
        {
          name: `metamcp-unified-${namespaceUuid}`,
          version: "1.0.0"
        },
        {
          capabilities: {
            prompts: {},
            resources: {},
            tools: {}
          }
        }
      );
      const handlerContext = {
        namespaceUuid,
        sessionId
      };
      const originalListToolsHandler = /* @__PURE__ */ __name(async (request, context) => {
        console.log(
          "[DEBUG-TOOLS] \u{1F50D} tools/list called for namespace:",
          namespaceUuid
        );
        const startTime = performance.now();
        const serverParams = await getMcpServers(
          context.namespaceUuid,
          includeInactiveServers
        );
        const allTools = [];
        const visitedServers = /* @__PURE__ */ new Set();
        const allServerEntries = Object.entries(serverParams);
        console.log(
          `[DEBUG-TOOLS] \u{1F4CB} Processing ${allServerEntries.length} servers`
        );
        const poolStatus = mcpServerPool.getPoolStatus();
        if (poolStatus.idle === 0 && poolStatus.active === 0 && allServerEntries.length > 0) {
          console.log(
            `[DEBUG-TOOLS] \u26A0\uFE0F Cold start: 0 idle, 0 active sessions but ${allServerEntries.length} servers registered. Warming up...`
          );
          for (const [uuid2] of allServerEntries) {
            await mcpServerPool.resetServerErrorState(uuid2);
          }
          await mcpServerPool.ensureIdleSessions(serverParams, namespaceUuid);
          const afterStatus = mcpServerPool.getPoolStatus();
          console.log(
            `[DEBUG-TOOLS] \u2705 Pool warmup complete: ${afterStatus.idle} idle, ${afterStatus.active} active`
          );
        }
        await Promise.allSettled(
          allServerEntries.map(async ([mcpServerUuid, params]) => {
            console.log(`[DEBUG-TOOLS] \u{1F527} Server: ${params.name || mcpServerUuid}`);
            if (visitedServers.has(mcpServerUuid)) {
              console.log(
                `[DEBUG-TOOLS] \u23ED\uFE0F  Skipping already visited: ${params.name}`
              );
              return;
            }
            const session = await mcpServerPool.getSession(
              context.sessionId,
              mcpServerUuid,
              params,
              namespaceUuid
            );
            if (!session) {
              console.log(`[DEBUG-TOOLS] \u274C No session for: ${params.name}`);
              return;
            }
            const serverVersion = session.client.getServerVersion();
            const actualServerName = serverVersion?.name || params.name || "";
            const ourServerName = `metamcp-unified-${namespaceUuid}`;
            if (actualServerName === ourServerName) {
              logger_default.info(
                `Skipping self-referencing MetaMCP server: "${actualServerName}"`
              );
              return;
            }
            if (isSameServerInstance(params, mcpServerUuid)) {
              return;
            }
            visitedServers.add(mcpServerUuid);
            const capabilities = session.client.getServerCapabilities();
            if (!capabilities?.tools) return;
            const serverName = params.name || session.client.getServerVersion()?.name || "";
            try {
              const allServerTools = [];
              let cursor = void 0;
              let hasMore = true;
              const toolFetchStart = performance.now();
              while (hasMore) {
                const result = await session.client.request(
                  {
                    method: "tools/list",
                    params: {
                      cursor,
                      _meta: request.params?._meta
                    }
                  },
                  ListToolsResultSchema
                );
                if (result.tools && result.tools.length > 0) {
                  allServerTools.push(...result.tools);
                }
                cursor = result.nextCursor;
                hasMore = !!result.nextCursor;
              }
              console.log(
                `[DEBUG-TOOLS] \u23F1\uFE0F  Fetched ${allServerTools.length} tools from ${serverName} in ${(performance.now() - toolFetchStart).toFixed(2)}ms`
              );
              try {
                const toolNames = allServerTools.map((tool) => tool.name);
                const hasChanged = toolsSyncCache.hasChanged(
                  mcpServerUuid,
                  toolNames
                );
                console.log(
                  `[DEBUG-TOOLS] \u{1F50D} Hash check for ${serverName}: ${hasChanged ? "CHANGED" : "UNCHANGED"}`
                );
                if (hasChanged) {
                  const toolsToSave = await filterOutOverrideTools(
                    allServerTools,
                    namespaceUuid,
                    serverName
                  );
                  if (toolsToSave.length > 0) {
                    toolsSyncCache.update(mcpServerUuid, toolNames);
                    await toolsImplementations.sync({
                      tools: toolsToSave,
                      mcpServerUuid
                    });
                  }
                }
              } catch (dbError) {
                logger_default.error(
                  `Error syncing tools to database for server ${serverName}:`,
                  dbError
                );
              }
              const toolsWithSource = allServerTools.map((tool) => {
                const toolName = `${sanitizeName(serverName)}__${tool.name}`;
                toolToClient[toolName] = session;
                toolToServerUuid[toolName] = mcpServerUuid;
                return {
                  ...tool,
                  name: toolName,
                  description: tool.description
                };
              });
              allTools.push(...toolsWithSource);
            } catch (error) {
              logger_default.error(`Error fetching tools from: ${serverName}`, error);
            }
          })
        );
        const totalTime = performance.now() - startTime;
        console.log(
          `[DEBUG-TOOLS] \u2705 tools/list completed in ${totalTime.toFixed(2)}ms, returning ${allTools.length} tools`
        );
        return { tools: allTools };
      }, "originalListToolsHandler");
      const originalCallToolHandler = /* @__PURE__ */ __name(async (request, _context) => {
        const { name, arguments: args } = request.params;
        const parsed = parseToolName(name);
        if (!parsed) {
          throw new Error(`Invalid tool name format: ${name}`);
        }
        const { serverName: serverPrefix, originalToolName } = parsed;
        let clientForTool = toolToClient[name];
        let serverUuid = toolToServerUuid[name];
        if (!clientForTool || !serverUuid) {
          try {
            const serverParams = await getMcpServers(
              namespaceUuid,
              includeInactiveServers
            );
            for (const [mcpServerUuid, params] of Object.entries(serverParams)) {
              const session = await mcpServerPool.getSession(
                sessionId,
                mcpServerUuid,
                params,
                namespaceUuid
              );
              if (session) {
                const capabilities = session.client.getServerCapabilities();
                if (!capabilities?.tools) continue;
                const serverName = params.name || session.client.getServerVersion()?.name || "";
                if (sanitizeName(serverName) === serverPrefix) {
                  try {
                    let foundTool = false;
                    let cursor = void 0;
                    let hasMore = true;
                    while (hasMore && !foundTool) {
                      const result = await session.client.request(
                        {
                          method: "tools/list",
                          params: { cursor }
                        },
                        ListToolsResultSchema
                      );
                      if (result.tools?.some(
                        (tool) => tool.name === originalToolName
                      )) {
                        foundTool = true;
                        clientForTool = session;
                        serverUuid = mcpServerUuid;
                        toolToClient[name] = session;
                        toolToServerUuid[name] = mcpServerUuid;
                        break;
                      }
                      cursor = result.nextCursor;
                      hasMore = !!result.nextCursor;
                    }
                    if (foundTool) {
                      break;
                    }
                  } catch (error) {
                    logger_default.error(
                      `Error checking tools for server ${serverName}:`,
                      error
                    );
                    continue;
                  }
                }
              }
            }
          } catch (error) {
            logger_default.error(`Error dynamically finding tool ${name}:`, error);
          }
        }
        if (!clientForTool) {
          throw new Error(`Unknown tool: ${name}`);
        }
        if (!serverUuid) {
          throw new Error(`Server UUID not found for tool: ${name}`);
        }
        try {
          const abortController = new AbortController();
          const resetTimeoutOnProgress = await configService.getMcpResetTimeoutOnProgress();
          const timeout = await configService.getMcpTimeout();
          const maxTotalTimeout = await configService.getMcpMaxTotalTimeout();
          const mcpRequestOptions = {
            signal: abortController.signal,
            resetTimeoutOnProgress,
            timeout,
            maxTotalTimeout
          };
          const result = await clientForTool.client.request(
            {
              method: "tools/call",
              params: {
                name: originalToolName,
                arguments: args || {},
                _meta: request.params._meta
              }
            },
            CompatibilityCallToolResultSchema,
            mcpRequestOptions
          );
          return result;
        } catch (error) {
          logger_default.error(
            `Error calling tool "${name}" through ${clientForTool.client.getServerVersion()?.name || "unknown"}:`,
            error
          );
          throw error;
        }
      }, "originalCallToolHandler");
      const listToolsWithMiddleware = compose(
        createToolOverridesListToolsMiddleware({
          cacheEnabled: true,
          persistentCacheOnListTools: true
        }),
        createFilterListToolsMiddleware({ cacheEnabled: true })
        // Add more middleware here as needed
        // createLoggingMiddleware(),
        // createRateLimitingMiddleware(),
      )(originalListToolsHandler);
      const callToolWithMiddleware = compose(
        createFilterCallToolMiddleware({
          cacheEnabled: true,
          customErrorMessage: /* @__PURE__ */ __name((toolName, reason) => `Access denied to tool "${toolName}": ${reason}`, "customErrorMessage")
        }),
        createToolOverridesCallToolMiddleware({ cacheEnabled: true })
        // Add more middleware here as needed
        // createAuditingMiddleware(),
        // createAuthorizationMiddleware(),
      )(originalCallToolHandler);
      server.setRequestHandler(ListToolsRequestSchema, async (request) => {
        return await listToolsWithMiddleware(request, handlerContext);
      });
      server.setRequestHandler(CallToolRequestSchema, async (request) => {
        return await callToolWithMiddleware(request, handlerContext);
      });
      server.setRequestHandler(GetPromptRequestSchema, async (request) => {
        const { name } = request.params;
        const clientForPrompt = promptToClient[name];
        if (!clientForPrompt) {
          throw new Error(`Unknown prompt: ${name}`);
        }
        try {
          const parsed = parseToolName(name);
          if (!parsed) {
            throw new Error(`Invalid prompt name format: ${name}`);
          }
          const promptName = parsed.originalToolName;
          const response = await clientForPrompt.client.request(
            {
              method: "prompts/get",
              params: {
                name: promptName,
                arguments: request.params.arguments || {},
                _meta: request.params._meta
              }
            },
            GetPromptResultSchema
          );
          return response;
        } catch (error) {
          logger_default.error(
            `Error getting prompt through ${clientForPrompt.client.getServerVersion()?.name}:`,
            error
          );
          throw error;
        }
      });
      server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
        const serverParams = await getMcpServers(
          namespaceUuid,
          includeInactiveServers
        );
        const allPrompts = [];
        const visitedServers = /* @__PURE__ */ new Set();
        const validPromptServers = Object.entries(serverParams).filter(
          ([uuid2, params]) => {
            if (visitedServers.has(uuid2)) {
              logger_default.info(
                `Skipping already visited server in prompts: ${params.name || uuid2}`
              );
              return false;
            }
            if (isSameServerInstance(params, uuid2)) {
              logger_default.info(
                `Skipping self-referencing server in prompts: ${params.name || uuid2}`
              );
              return false;
            }
            visitedServers.add(uuid2);
            return true;
          }
        );
        await Promise.allSettled(
          validPromptServers.map(async ([uuid2, params]) => {
            const session = await mcpServerPool.getSession(
              sessionId,
              uuid2,
              params,
              namespaceUuid
            );
            if (!session) return;
            const serverVersion = session.client.getServerVersion();
            const actualServerName = serverVersion?.name || params.name || "";
            const ourServerName = `metamcp-unified-${namespaceUuid}`;
            if (actualServerName === ourServerName) {
              logger_default.info(
                `Skipping self-referencing MetaMCP server in prompts: "${actualServerName}"`
              );
              return;
            }
            const capabilities = session.client.getServerCapabilities();
            if (!capabilities?.prompts) return;
            const serverName = params.name || session.client.getServerVersion()?.name || "";
            try {
              const result = await session.client.request(
                {
                  method: "prompts/list",
                  params: {
                    cursor: request.params?.cursor,
                    _meta: request.params?._meta
                  }
                },
                ListPromptsResultSchema
              );
              if (result.prompts) {
                const promptsWithSource = result.prompts.map((prompt) => {
                  const promptName = `${sanitizeName(serverName)}__${prompt.name}`;
                  promptToClient[promptName] = session;
                  return {
                    ...prompt,
                    name: promptName,
                    description: prompt.description || ""
                  };
                });
                allPrompts.push(...promptsWithSource);
              }
            } catch (error) {
              logger_default.error(`Error fetching prompts from: ${serverName}`, error);
            }
          })
        );
        return {
          prompts: allPrompts,
          nextCursor: request.params?.cursor
        };
      });
      server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
        const serverParams = await getMcpServers(
          namespaceUuid,
          includeInactiveServers
        );
        const allResources = [];
        const visitedServers = /* @__PURE__ */ new Set();
        const validResourceServers = Object.entries(serverParams).filter(
          ([uuid2, params]) => {
            if (visitedServers.has(uuid2)) {
              logger_default.info(
                `Skipping already visited server in resources: ${params.name || uuid2}`
              );
              return false;
            }
            if (isSameServerInstance(params, uuid2)) {
              logger_default.info(
                `Skipping self-referencing server in resources: ${params.name || uuid2}`
              );
              return false;
            }
            visitedServers.add(uuid2);
            return true;
          }
        );
        await Promise.allSettled(
          validResourceServers.map(async ([uuid2, params]) => {
            const session = await mcpServerPool.getSession(
              sessionId,
              uuid2,
              params,
              namespaceUuid
            );
            if (!session) return;
            const serverVersion = session.client.getServerVersion();
            const actualServerName = serverVersion?.name || params.name || "";
            const ourServerName = `metamcp-unified-${namespaceUuid}`;
            if (actualServerName === ourServerName) {
              logger_default.info(
                `Skipping self-referencing MetaMCP server in resources: "${actualServerName}"`
              );
              return;
            }
            const capabilities = session.client.getServerCapabilities();
            if (!capabilities?.resources) return;
            const serverName = params.name || session.client.getServerVersion()?.name || "";
            try {
              const result = await session.client.request(
                {
                  method: "resources/list",
                  params: {
                    cursor: request.params?.cursor,
                    _meta: request.params?._meta
                  }
                },
                ListResourcesResultSchema
              );
              if (result.resources) {
                const resourcesWithSource = result.resources.map((resource) => {
                  resourceToClient[resource.uri] = session;
                  return {
                    ...resource,
                    name: resource.name || ""
                  };
                });
                allResources.push(...resourcesWithSource);
              }
            } catch (error) {
              logger_default.error(`Error fetching resources from: ${serverName}`, error);
            }
          })
        );
        return {
          resources: allResources,
          nextCursor: request.params?.cursor
        };
      });
      server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        const clientForResource = resourceToClient[uri];
        if (!clientForResource) {
          throw new Error(`Unknown resource: ${uri}`);
        }
        try {
          return await clientForResource.client.request(
            {
              method: "resources/read",
              params: {
                uri,
                _meta: request.params._meta
              }
            },
            ReadResourceResultSchema
          );
        } catch (error) {
          logger_default.error(
            `Error reading resource through ${clientForResource.client.getServerVersion()?.name}:`,
            error
          );
          throw error;
        }
      });
      server.setRequestHandler(
        ListResourceTemplatesRequestSchema,
        async (request) => {
          const serverParams = await getMcpServers(
            namespaceUuid,
            includeInactiveServers
          );
          const allTemplates = [];
          const visitedServers = /* @__PURE__ */ new Set();
          const validTemplateServers = Object.entries(serverParams).filter(
            ([uuid2, params]) => {
              if (visitedServers.has(uuid2)) {
                logger_default.info(
                  `Skipping already visited server in resource templates: ${params.name || uuid2}`
                );
                return false;
              }
              if (isSameServerInstance(params, uuid2)) {
                logger_default.info(
                  `Skipping self-referencing server in resource templates: ${params.name || uuid2}`
                );
                return false;
              }
              visitedServers.add(uuid2);
              return true;
            }
          );
          await Promise.allSettled(
            validTemplateServers.map(async ([uuid2, params]) => {
              const session = await mcpServerPool.getSession(
                sessionId,
                uuid2,
                params,
                namespaceUuid
              );
              if (!session) return;
              const serverVersion = session.client.getServerVersion();
              const actualServerName = serverVersion?.name || params.name || "";
              const ourServerName = `metamcp-unified-${namespaceUuid}`;
              if (actualServerName === ourServerName) {
                logger_default.info(
                  `Skipping self-referencing MetaMCP server in resource templates: "${actualServerName}"`
                );
                return;
              }
              const capabilities = session.client.getServerCapabilities();
              if (!capabilities?.resources) return;
              const serverName = params.name || session.client.getServerVersion()?.name || "";
              try {
                const result = await session.client.request(
                  {
                    method: "resources/templates/list",
                    params: {
                      cursor: request.params?.cursor,
                      _meta: request.params?._meta
                    }
                  },
                  ListResourceTemplatesResultSchema
                );
                if (result.resourceTemplates) {
                  const templatesWithSource = result.resourceTemplates.map(
                    (template) => ({
                      ...template,
                      name: template.name || ""
                    })
                  );
                  allTemplates.push(...templatesWithSource);
                }
              } catch (error) {
                logger_default.error(
                  `Error fetching resource templates from: ${serverName}`,
                  error
                );
                return;
              }
            })
          );
          return {
            resourceTemplates: allTemplates,
            nextCursor: request.params?.cursor
          };
        }
      );
      const cleanup = /* @__PURE__ */ __name(async () => {
        await mcpServerPool.cleanupSession(sessionId);
      }, "cleanup");
      return { server, cleanup };
    }, "createServer");
  }
});

// src/lib/metamcp/metamcp-server-pool.ts
var metamcp_server_pool_exports = {};
__export(metamcp_server_pool_exports, {
  MetaMcpServerPool: () => MetaMcpServerPool,
  metaMcpServerPool: () => metaMcpServerPool
});
var MetaMcpServerPool, metaMcpServerPool;
var init_metamcp_server_pool = __esm({
  "src/lib/metamcp/metamcp-server-pool.ts"() {
    "use strict";
    init_logger();
    init_config_service();
    init_mcp_server_pool();
    init_metamcp_proxy();
    MetaMcpServerPool = class _MetaMcpServerPool {
      static {
        __name(this, "MetaMcpServerPool");
      }
      // Singleton instance
      static instance = null;
      // Idle MetaMCP servers: namespaceUuid -> MetaMcpServerInstance (no sessionId assigned yet)
      idleServers = {};
      // Active MetaMCP servers: sessionId -> MetaMcpServerInstance
      activeServers = {};
      // Mapping: sessionId -> namespaceUuid for cleanup tracking
      sessionToNamespace = {};
      // Session creation timestamps: sessionId -> timestamp
      sessionTimestamps = {};
      // Track ongoing idle server creation to prevent duplicates
      creatingIdleServers = /* @__PURE__ */ new Set();
      // Session cleanup timer
      cleanupTimer = null;
      // Default number of idle servers per namespace UUID
      defaultIdleCount;
      constructor(defaultIdleCount = 1) {
        this.defaultIdleCount = defaultIdleCount;
        this.startCleanupTimer();
      }
      /**
       * Get the singleton instance
       */
      static getInstance(defaultIdleCount = 1) {
        if (!_MetaMcpServerPool.instance) {
          _MetaMcpServerPool.instance = new _MetaMcpServerPool(defaultIdleCount);
        }
        return _MetaMcpServerPool.instance;
      }
      /**
       * Get or create a MetaMCP server for a namespace
       */
      async getServer(sessionId, namespaceUuid, includeInactiveServers = false) {
        if (this.activeServers[sessionId]) {
          return this.activeServers[sessionId];
        }
        const idleServer = this.idleServers[namespaceUuid];
        if (idleServer) {
          delete this.idleServers[namespaceUuid];
          this.activeServers[sessionId] = idleServer;
          this.sessionToNamespace[sessionId] = namespaceUuid;
          this.sessionTimestamps[sessionId] = Date.now();
          logger_default.info(
            `Converted idle MetaMCP server to active for namespace ${namespaceUuid}, session ${sessionId}`
          );
          this.createIdleServerAsync(namespaceUuid, includeInactiveServers);
          return idleServer;
        }
        const newServer = await this.createNewServer(
          sessionId,
          namespaceUuid,
          includeInactiveServers
        );
        if (!newServer) {
          return void 0;
        }
        this.activeServers[sessionId] = newServer;
        this.sessionToNamespace[sessionId] = namespaceUuid;
        this.sessionTimestamps[sessionId] = Date.now();
        logger_default.info(
          `Created new active MetaMCP server for namespace ${namespaceUuid}, session ${sessionId}`
        );
        this.createIdleServerAsync(namespaceUuid, includeInactiveServers);
        return newServer;
      }
      /**
       * Create a new MetaMCP server instance
       */
      async createNewServer(sessionId, namespaceUuid, includeInactiveServers = false) {
        try {
          const serverInstance = await createServer(
            namespaceUuid,
            sessionId,
            includeInactiveServers
          );
          return serverInstance;
        } catch (error) {
          logger_default.error(
            `Error creating MetaMCP server for namespace ${namespaceUuid}:`,
            error
          );
          return void 0;
        }
      }
      /**
       * Create an idle MetaMCP server for a namespace (blocking version for initial setup)
       */
      async createIdleServer(namespaceUuid, includeInactiveServers = false) {
        if (this.idleServers[namespaceUuid]) {
          return;
        }
        const tempSessionId = `idle_${namespaceUuid}_${Date.now()}`;
        const newServer = await this.createNewServer(
          tempSessionId,
          namespaceUuid,
          includeInactiveServers
        );
        if (newServer) {
          const wrappedServer = {
            server: newServer.server,
            cleanup: newServer.cleanup
          };
          this.idleServers[namespaceUuid] = wrappedServer;
          logger_default.info(`Created idle MetaMCP server for namespace ${namespaceUuid}`);
        }
      }
      /**
       * Create an idle MetaMCP server for a namespace asynchronously (non-blocking)
       */
      createIdleServerAsync(namespaceUuid, includeInactiveServers = false) {
        if (this.idleServers[namespaceUuid] || this.creatingIdleServers.has(namespaceUuid)) {
          return;
        }
        this.creatingIdleServers.add(namespaceUuid);
        const tempSessionId = `idle_${namespaceUuid}_${Date.now()}`;
        this.createNewServer(tempSessionId, namespaceUuid, includeInactiveServers).then((newServer) => {
          if (newServer && !this.idleServers[namespaceUuid]) {
            const wrappedServer = {
              server: newServer.server,
              cleanup: newServer.cleanup
            };
            this.idleServers[namespaceUuid] = wrappedServer;
            logger_default.info(
              `Created background idle MetaMCP server for namespace ${namespaceUuid}`
            );
          } else if (newServer) {
            newServer.cleanup().catch((error) => {
              logger_default.error(
                `Error cleaning up extra idle MetaMCP server for ${namespaceUuid}:`,
                error
              );
            });
          }
        }).catch((error) => {
          logger_default.error(
            `Error creating background idle MetaMCP server for ${namespaceUuid}:`,
            error
          );
        }).finally(() => {
          this.creatingIdleServers.delete(namespaceUuid);
        });
      }
      /**
       * Ensure idle servers exist for all namespaces
       */
      async ensureIdleServers(namespaceUuids, includeInactiveServers = false) {
        const promises = namespaceUuids.map(async (namespaceUuid) => {
          if (!this.idleServers[namespaceUuid]) {
            await this.createIdleServer(namespaceUuid, includeInactiveServers);
          }
        });
        await Promise.allSettled(promises);
      }
      /**
       * Cleanup a session by sessionId
       */
      async cleanupSession(sessionId) {
        const activeServer = this.activeServers[sessionId];
        if (!activeServer) {
          return;
        }
        await activeServer.cleanup();
        await mcpServerPool.cleanupSession(sessionId);
        delete this.activeServers[sessionId];
        delete this.sessionTimestamps[sessionId];
        const namespaceUuid = this.sessionToNamespace[sessionId];
        if (namespaceUuid) {
          this.createIdleServerAsync(namespaceUuid);
          delete this.sessionToNamespace[sessionId];
        }
        logger_default.info(`Cleaned up MetaMCP server pool session ${sessionId}`);
      }
      /**
       * Cleanup all servers
       */
      async cleanupAll() {
        const activeSessionIds = Object.keys(this.activeServers);
        await Promise.allSettled(
          activeSessionIds.map((sessionId) => this.cleanupSession(sessionId))
        );
        await Promise.allSettled(
          Object.entries(this.idleServers).map(async ([_uuid, server]) => {
            await server.cleanup();
          })
        );
        await mcpServerPool.cleanupAll();
        this.idleServers = {};
        this.activeServers = {};
        this.sessionToNamespace = {};
        this.sessionTimestamps = {};
        this.creatingIdleServers.clear();
        if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
          this.cleanupTimer = null;
        }
        logger_default.info("Cleaned up all MetaMCP server pool sessions");
      }
      /**
       * Get pool status for monitoring
       */
      getPoolStatus() {
        const idle = Object.keys(this.idleServers).length;
        const active = Object.keys(this.activeServers).length;
        return {
          idle,
          active,
          activeSessionIds: Object.keys(this.activeServers),
          idleNamespaceUuids: Object.keys(this.idleServers)
        };
      }
      /**
       * Get active server instance for a specific session (for debugging/monitoring)
       */
      getServerInstance(sessionId) {
        return this.activeServers[sessionId];
      }
      /**
       * Get all active session IDs (for debugging/monitoring)
       */
      getActiveSessionIds() {
        return Object.keys(this.activeServers);
      }
      /**
       * Get MCP server pool status
       */
      getMcpServerPoolStatus() {
        return mcpServerPool.getPoolStatus();
      }
      /**
       * Invalidate and refresh idle server for a specific namespace
       * This should be called when a namespace's MCP servers list changes
       */
      async invalidateIdleServer(namespaceUuid, includeInactiveServers = false) {
        logger_default.info(`Invalidating idle server for namespace ${namespaceUuid}`);
        const existingIdleServer = this.idleServers[namespaceUuid];
        if (existingIdleServer) {
          try {
            await existingIdleServer.cleanup();
            logger_default.info(
              `Cleaned up existing idle server for namespace ${namespaceUuid}`
            );
          } catch (error) {
            logger_default.error(
              `Error cleaning up existing idle server for namespace ${namespaceUuid}:`,
              error
            );
          }
          delete this.idleServers[namespaceUuid];
        }
        this.creatingIdleServers.delete(namespaceUuid);
        await this.createIdleServer(namespaceUuid, includeInactiveServers);
      }
      /**
       * Invalidate and refresh idle servers for multiple namespaces
       */
      async invalidateIdleServers(namespaceUuids, includeInactiveServers = false) {
        const promises = namespaceUuids.map(
          (namespaceUuid) => this.invalidateIdleServer(namespaceUuid, includeInactiveServers)
        );
        await Promise.allSettled(promises);
      }
      /**
       * Clean up idle server for a specific namespace without creating a new one
       * This should be called when a namespace is being deleted
       */
      async cleanupIdleServer(namespaceUuid) {
        logger_default.info(`Cleaning up idle server for namespace ${namespaceUuid}`);
        const existingIdleServer = this.idleServers[namespaceUuid];
        if (existingIdleServer) {
          try {
            await existingIdleServer.cleanup();
            logger_default.info(`Cleaned up idle server for namespace ${namespaceUuid}`);
          } catch (error) {
            logger_default.error(
              `Error cleaning up idle server for namespace ${namespaceUuid}:`,
              error
            );
          }
          delete this.idleServers[namespaceUuid];
        }
        this.creatingIdleServers.delete(namespaceUuid);
      }
      /**
       * Ensure idle server exists for a newly created namespace
       * This should be called when a new namespace is created
       */
      async ensureIdleServerForNewNamespace(namespaceUuid, includeInactiveServers = false) {
        logger_default.info(
          `Ensuring idle server exists for new namespace ${namespaceUuid}`
        );
        if (!this.idleServers[namespaceUuid] && !this.creatingIdleServers.has(namespaceUuid)) {
          await this.createIdleServer(namespaceUuid, includeInactiveServers);
        }
      }
      /**
       * Get or create a persistent MetaMCP server for OpenAPI endpoints
       * These sessions are never cleaned up automatically and persist until invalidation
       */
      async getOpenApiServer(namespaceUuid, includeInactiveServers = false) {
        const sessionId = `openapi_${namespaceUuid}`;
        if (this.activeServers[sessionId]) {
          return this.activeServers[sessionId];
        }
        const idleServer = this.idleServers[namespaceUuid];
        if (idleServer) {
          delete this.idleServers[namespaceUuid];
          this.activeServers[sessionId] = idleServer;
          this.sessionToNamespace[sessionId] = namespaceUuid;
          this.sessionTimestamps[sessionId] = Date.now();
          logger_default.info(
            `Converted idle MetaMCP server to OpenAPI server for namespace ${namespaceUuid}, session ${sessionId}`
          );
          await this.createIdleServer(namespaceUuid, includeInactiveServers);
          return idleServer;
        }
        const newServer = await this.createNewServer(
          sessionId,
          namespaceUuid,
          includeInactiveServers
        );
        if (!newServer) {
          return void 0;
        }
        this.activeServers[sessionId] = newServer;
        this.sessionToNamespace[sessionId] = namespaceUuid;
        this.sessionTimestamps[sessionId] = Date.now();
        logger_default.info(
          `Created new OpenAPI MetaMCP server for namespace ${namespaceUuid}, session ${sessionId}`
        );
        await this.createIdleServer(namespaceUuid, includeInactiveServers);
        return newServer;
      }
      /**
       * Invalidate OpenAPI sessions for specific namespaces
       * This is called when namespace configurations change
       */
      async invalidateOpenApiSessions(namespaceUuids, includeInactiveServers = false) {
        logger_default.info(
          `Invalidating OpenAPI sessions for namespaces: ${namespaceUuids.join(", ")}`
        );
        const promises = namespaceUuids.map(async (namespaceUuid) => {
          const sessionId = `openapi_${namespaceUuid}`;
          const existingServer = this.activeServers[sessionId];
          if (existingServer) {
            try {
              await existingServer.cleanup();
              logger_default.info(
                `Cleaned up existing OpenAPI session for namespace ${namespaceUuid}`
              );
            } catch (error) {
              logger_default.error(
                `Error cleaning up OpenAPI session for namespace ${namespaceUuid}:`,
                error
              );
            }
            delete this.activeServers[sessionId];
            delete this.sessionToNamespace[sessionId];
            delete this.sessionTimestamps[sessionId];
          }
          await this.getOpenApiServer(namespaceUuid, includeInactiveServers);
        });
        await Promise.allSettled(promises);
      }
      /**
       * Start the automatic cleanup timer for expired sessions
       */
      startCleanupTimer() {
        this.cleanupTimer = setInterval(
          async () => {
            await this.cleanupExpiredSessions();
          },
          5 * 60 * 1e3
        );
      }
      /**
       * Clean up expired sessions based on session lifetime setting
       */
      async cleanupExpiredSessions() {
        try {
          const sessionLifetime = await configService.getSessionLifetime();
          if (sessionLifetime === null) {
            return;
          }
          const now = Date.now();
          const expiredSessionIds = [];
          for (const [sessionId, timestamp2] of Object.entries(
            this.sessionTimestamps
          )) {
            if (now - timestamp2 > sessionLifetime) {
              expiredSessionIds.push(sessionId);
            }
          }
          if (expiredSessionIds.length > 0) {
            logger_default.info(
              `Cleaning up ${expiredSessionIds.length} expired MetaMCP server pool sessions: ${expiredSessionIds.join(", ")}`
            );
            await Promise.allSettled(
              expiredSessionIds.map((sessionId) => this.cleanupSession(sessionId))
            );
          }
        } catch (error) {
          logger_default.error("Error during automatic MetaMCP session cleanup:", error);
        }
      }
      /**
       * Get session age in milliseconds
       */
      getSessionAge(sessionId) {
        const timestamp2 = this.sessionTimestamps[sessionId];
        return timestamp2 ? Date.now() - timestamp2 : void 0;
      }
      /**
       * Check if a session is expired
       */
      async isSessionExpired(sessionId) {
        const age = this.getSessionAge(sessionId);
        if (age === void 0) return false;
        const sessionLifetime = await configService.getSessionLifetime();
        return age > sessionLifetime;
      }
    };
    metaMcpServerPool = MetaMcpServerPool.getInstance();
  }
});

// src/lib/metamcp/index.ts
var metamcp_exports = {};
__export(metamcp_exports, {
  DEFAULT_INHERITED_ENV_VARS: () => DEFAULT_INHERITED_ENV_VARS2,
  McpServerPool: () => McpServerPool,
  MetaMcpServerPool: () => MetaMcpServerPool,
  connectMetaMcpClient: () => connectMetaMcpClient,
  convertDbServerToParams: () => convertDbServerToParams,
  createMetaMcpClient: () => createMetaMcpClient,
  createServer: () => createServer,
  getDefaultEnvironment: () => getDefaultEnvironment2,
  getMcpServers: () => getMcpServers,
  mcpServerPool: () => mcpServerPool,
  metaMcpServerPool: () => metaMcpServerPool,
  metamcpLogStore: () => metamcpLogStore,
  resolveEnvVariables: () => resolveEnvVariables,
  sanitizeName: () => sanitizeName,
  transformDockerUrl: () => transformDockerUrl
});
var init_metamcp = __esm({
  "src/lib/metamcp/index.ts"() {
    "use strict";
    init_client();
    init_fetch_metamcp();
    init_log_store();
    init_metamcp_proxy();
    init_utils();
    init_mcp_server_pool();
    init_metamcp_server_pool();
  }
});

// src/index.ts
import express17 from "express";

// src/auth.ts
init_db();
init_schema();
init_config_service();
init_logger();
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { genericOAuth } from "better-auth/plugins";
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}
if (!process.env.APP_URL) {
  throw new Error("APP_URL environment variable is required");
}
var BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
var BETTER_AUTH_URL = process.env.APP_URL;
var createBasicAuthCheckMiddleware = /* @__PURE__ */ __name(() => {
  return async (request) => {
    const isBasicAuthDisabled = await configService.isBasicAuthDisabled();
    if (isBasicAuthDisabled) {
      throw new Error(
        "Basic email/password authentication is currently disabled. Please use SSO/OIDC authentication instead."
      );
    }
    return { request };
  };
}, "createBasicAuthCheckMiddleware");
var oidcProviders = [];
if (process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET) {
  const oidcConfig = {
    providerId: process.env.OIDC_PROVIDER_ID || "oidc",
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    scopes: (process.env.OIDC_SCOPES || "openid email profile").split(" "),
    pkce: process.env.OIDC_PKCE !== "false",
    // Enable PKCE by default for security
    discoveryUrl: process.env.OIDC_DISCOVERY_URL,
    authorizationUrl: process.env.OIDC_AUTHORIZATION_URL
    //this is required due to a bug in better-auth: https://github.com/better-auth/better-auth/issues/3278
  };
  oidcProviders.push(oidcConfig);
  logger_default.info(`\u2713 OIDC Provider configured: ${oidcConfig.providerId}`);
}
var DEFAULT_TRUSTED_ORIGINS = [
  "http://localhost",
  "http://localhost:3000",
  "http://localhost:12008",
  "http://127.0.0.1",
  "http://127.0.0.1:12008",
  "http://127.0.0.1:3000",
  "http://0.0.0.0",
  "http://0.0.0.0:3000",
  "http://0.0.0.0:12008"
];
var extraTrustedOrigins = process.env.EXTRA_TRUSTED_ORIGINS ? process.env.EXTRA_TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean) : [];
var trustedOrigins = [...DEFAULT_TRUSTED_ORIGINS, ...extraTrustedOrigins];
var auth = betterAuth({
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionsTable,
      account: accountsTable,
      verification: verificationsTable
    }
  }),
  trustedOrigins,
  plugins: [
    // Add generic OAuth plugin for OIDC support
    ...oidcProviders.length > 0 ? [genericOAuth({ config: oidcProviders })] : []
  ],
  emailAndPassword: {
    enabled: true,
    // This will be dynamically controlled by middleware
    requireEmailVerification: false
    // Set to true if you want email verification
  },
  account: {
    accountLinking: {
      enabled: true,
      // Allow linking accounts with the same email address
      allowDifferentEmails: false,
      // Trusted providers for automatic linking (add your OIDC provider here)
      trustedProviders: oidcProviders.map((p) => p.providerId),
      // Allow automatic linking for same email addresses
      allowSameEmail: true,
      // Require email verification for account linking
      requireEmailVerification: false
    }
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    // 7 days
    updateAge: 60 * 60 * 24
    // 1 day (how often to update the session)
  },
  user: {
    additionalFields: {
      emailVerified: {
        type: "boolean",
        defaultValue: false
      }
    }
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true
    }
  },
  logger: {
    level: "debug"
    // Enable debug logging
  },
  databaseHooks: {
    user: {
      create: {
        before: /* @__PURE__ */ __name(async (user, context) => {
          const isSignupDisabled = await configService.isSignupDisabled();
          const isSsoSignupDisabled = await configService.isSsoSignupDisabled();
          const isSsoRegistration = context?.path?.includes("/callback/") || context?.path?.includes("/oauth/") || context?.path?.includes("/oidc/");
          if (isSsoRegistration) {
            if (isSsoSignupDisabled) {
              throw new Error(
                "New user registration via SSO/OAuth is currently disabled."
              );
            }
          } else {
            if (isSignupDisabled) {
              throw new Error("New user registration is currently disabled.");
            }
          }
          return { data: user };
        }, "before")
      }
    }
  },
  // Add middleware to check basic auth setting
  middleware: [
    {
      path: "/sign-in/email",
      middleware: createBasicAuthCheckMiddleware()
    },
    {
      path: "/sign-up/email",
      middleware: createBasicAuthCheckMiddleware()
    },
    {
      path: "/forgot-password",
      middleware: createBasicAuthCheckMiddleware()
    },
    {
      path: "/reset-password",
      middleware: createBasicAuthCheckMiddleware()
    }
  ]
});
console.log("\u2713 Better Auth instance created successfully");
console.log(`\u2713 OIDC Providers configured: ${oidcProviders.length}`);

// src/lib/startup.ts
init_repositories();

// src/lib/bootstrap.service.ts
import crypto2 from "crypto";
import { ConfigKeyEnum as ConfigKeyEnum2 } from "@repo/zod-types";
import { and as and7, eq as eq10, isNull as isNull5, notInArray as notInArray2 } from "drizzle-orm";
init_db();
init_schema();
var BOOTSTRAP_COMPLETE_KEY = "BOOTSTRAP_COMPLETE";
var BOOTSTRAP_USER_PASSWORD_FP_PREFIX = "BOOTSTRAP_USER_PASSWORD_FINGERPRINT_";
function parseBool(value, def) {
  if (value === void 0) return def;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return def;
}
__name(parseBool, "parseBool");
function nonEmpty(value) {
  const v = value?.trim();
  return v ? v : void 0;
}
__name(nonEmpty, "nonEmpty");
function generateApiKey() {
  return `sk_mt_${crypto2.randomBytes(32).toString("hex")}`;
}
__name(generateApiKey, "generateApiKey");
function maskKey(key) {
  if (!key) return "";
  if (key.length <= 14) return `${key.slice(0, 6)}\u2026`;
  return `${key.slice(0, 10)}\u2026${key.slice(-4)}`;
}
__name(maskKey, "maskKey");
function sha256Hex(input) {
  return crypto2.createHash("sha256").update(input, "utf8").digest("hex");
}
__name(sha256Hex, "sha256Hex");
function parseJsonArray(envVar, defaultValue) {
  if (!envVar) return defaultValue;
  try {
    const parsed = JSON.parse(envVar);
    if (!Array.isArray(parsed)) {
      console.warn(
        `\u26A0\uFE0F Environment variable is not an array, using default: ${envVar.slice(0, 50)}...`
      );
      return defaultValue;
    }
    return parsed;
  } catch (err) {
    console.warn(
      `\u26A0\uFE0F Failed to parse JSON array from environment variable: ${err}`
    );
    return defaultValue;
  }
}
__name(parseJsonArray, "parseJsonArray");
function getOwnerEmail(config) {
  return config.user_email ?? config.owner;
}
__name(getOwnerEmail, "getOwnerEmail");
function parseEnvConfig() {
  const usersArray = parseJsonArray(
    process.env.BOOTSTRAP_USERS,
    []
  );
  const singleUserEmail = nonEmpty(process.env.BOOTSTRAP_USER_EMAIL);
  const singleUserPassword = nonEmpty(process.env.BOOTSTRAP_USER_PASSWORD);
  if (singleUserEmail && singleUserPassword && usersArray.length === 0) {
    usersArray.push({
      email: singleUserEmail,
      password: singleUserPassword,
      name: nonEmpty(process.env.BOOTSTRAP_USER_NAME) ?? "Administrator"
    });
  }
  return {
    // Single user (legacy - for backwards compatibility in some contexts)
    defaultUserEmail: singleUserEmail,
    defaultUserPassword: singleUserPassword,
    defaultUserName: nonEmpty(process.env.BOOTSTRAP_USER_NAME) ?? "Administrator",
    // Multiple users
    users: usersArray,
    deleteOtherUsers: parseBool(
      process.env.BOOTSTRAP_DELETE_OTHER_USERS,
      false
    ),
    recreateDefaultUser: parseBool(process.env.BOOTSTRAP_RECREATE_USER, false),
    preserveApiKeysOnRecreate: parseBool(
      process.env.BOOTSTRAP_PRESERVE_API_KEYS,
      true
    ),
    warnOnPasswordChange: parseBool(
      process.env.BOOTSTRAP_WARN_PASSWORD_CHANGE,
      true
    ),
    bootstrapOnlyOnFirstRun: parseBool(
      process.env.BOOTSTRAP_ONLY_FIRST_RUN,
      false
    ),
    // Registration controls
    disableUiRegistration: parseBool(
      process.env.BOOTSTRAP_DISABLE_REGISTRATION_UI,
      false
    ),
    disableSsoRegistration: parseBool(
      process.env.BOOTSTRAP_DISABLE_REGISTRATION_SSO,
      false
    ),
    // Array configurations
    apiKeys: parseJsonArray(process.env.BOOTSTRAP_API_KEYS, []),
    namespaces: parseJsonArray(
      process.env.BOOTSTRAP_NAMESPACES,
      []
    ),
    endpoints: parseJsonArray(
      process.env.BOOTSTRAP_ENDPOINTS,
      []
    )
  };
}
__name(parseEnvConfig, "parseEnvConfig");
async function upsertConfig(key, value, description) {
  await db.insert(configTable).values({
    id: key,
    value,
    description,
    updated_at: /* @__PURE__ */ new Date()
  }).onConflictDoUpdate({
    target: [configTable.id],
    set: { value, description, updated_at: /* @__PURE__ */ new Date() }
  });
}
__name(upsertConfig, "upsertConfig");
async function getConfigValue(key) {
  const row = await db.query.configTable.findFirst({
    where: eq10(configTable.id, key)
  });
  return row?.value ?? null;
}
__name(getConfigValue, "getConfigValue");
async function shouldSkipBootstrap(config) {
  if (!config.bootstrapOnlyOnFirstRun) return false;
  try {
    const v = await getConfigValue(BOOTSTRAP_COMPLETE_KEY);
    if (v === "true") {
      console.log(
        "\u2713 Bootstrap already completed; BOOTSTRAP_ONLY_FIRST_RUN=true (skipping one-time bootstrap steps)"
      );
      return true;
    }
  } catch (err) {
    console.warn(
      "\u26A0\uFE0F Failed to read BOOTSTRAP_COMPLETE marker; proceeding with bootstrap.",
      err
    );
  }
  return false;
}
__name(shouldSkipBootstrap, "shouldSkipBootstrap");
async function markBootstrapComplete() {
  try {
    await upsertConfig(
      BOOTSTRAP_COMPLETE_KEY,
      "true",
      "One-time bootstrap completion marker"
    );
  } catch (err) {
    console.warn("\u26A0\uFE0F Failed to write BOOTSTRAP_COMPLETE marker:", err);
  }
}
__name(markBootstrapComplete, "markBootstrapComplete");
async function warnIfPasswordChanged(email, password, warnOnChange, hasExistingUser, recreateUser) {
  if (!warnOnChange) return;
  if (!hasExistingUser) return;
  try {
    const currentFp = sha256Hex(password);
    const fpKey = `${BOOTSTRAP_USER_PASSWORD_FP_PREFIX}${email}`;
    const previousFp = await getConfigValue(fpKey);
    if (previousFp && previousFp !== currentFp && !recreateUser) {
      console.warn(
        `\u26A0\uFE0F Password for ${email} appears to have changed since last applied.`
      );
      console.warn(
        "\u26A0\uFE0F BOOTSTRAP_RECREATE_USER=false so the existing user's password will NOT be updated."
      );
      console.warn(
        "\u26A0\uFE0F To force the environment password to apply, set BOOTSTRAP_RECREATE_USER=true."
      );
    }
  } catch (err) {
    console.warn(
      `\u26A0\uFE0F Failed password-change detection for ${email} (ignored):`,
      err
    );
  }
}
__name(warnIfPasswordChanged, "warnIfPasswordChanged");
async function recordPasswordFingerprint(email, password) {
  try {
    const fpKey = `${BOOTSTRAP_USER_PASSWORD_FP_PREFIX}${email}`;
    await upsertConfig(
      fpKey,
      sha256Hex(password),
      `Fingerprint of last-applied password for ${email}`
    );
  } catch (err) {
    console.warn(`\u26A0\uFE0F Failed to store password fingerprint for ${email}:`, err);
  }
}
__name(recordPasswordFingerprint, "recordPasswordFingerprint");
async function ensureUser(userConfig, config) {
  const email = userConfig.email;
  const password = userConfig.password;
  const name = userConfig.name ?? "User";
  console.log(`\u{1F527} Initializing user: ${email}`);
  const existing = await db.query.usersTable.findFirst({
    where: eq10(usersTable.email, email)
  });
  await warnIfPasswordChanged(
    email,
    password,
    config.warnOnPasswordChange,
    !!existing,
    config.recreateDefaultUser
  );
  let preservedUserApiKeys;
  let recreated = false;
  if (existing && config.recreateDefaultUser) {
    recreated = true;
    console.warn(
      `\u26A0\uFE0F BOOTSTRAP_RECREATE_USER=true \u2014 deleting existing user ${email} to reapply password via Better Auth`
    );
    if (config.preserveApiKeysOnRecreate) {
      try {
        preservedUserApiKeys = await db.select({
          name: apiKeysTable.name,
          key: apiKeysTable.key,
          is_active: apiKeysTable.is_active
        }).from(apiKeysTable).where(eq10(apiKeysTable.user_id, existing.id));
      } catch (err) {
        console.warn(`\u26A0\uFE0F Failed to preserve API keys for ${email}:`, err);
      }
    }
    try {
      await db.delete(accountsTable).where(eq10(accountsTable.userId, existing.id));
    } catch (err) {
      console.warn(`\u26A0\uFE0F Failed to delete accounts for ${email}:`, err);
    }
    try {
      await db.delete(apiKeysTable).where(eq10(apiKeysTable.user_id, existing.id));
    } catch (err) {
      console.warn(
        `\u26A0\uFE0F Failed to delete user-scoped API keys for ${email}:`,
        err
      );
    }
    try {
      await db.delete(usersTable).where(eq10(usersTable.id, existing.id));
    } catch (err) {
      console.warn(`\u26A0\uFE0F Failed to delete existing user ${email}:`, err);
    }
  }
  if (!existing || recreated) {
    const request = new Request("http://internal/api/auth/sign-up/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name
      })
    });
    const response = await auth.handler(request);
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.warn(
        `\u26A0\uFE0F Better Auth sign-up failed for ${email} (${response.status}). Continuing startup. ${body ? `Response: ${body}` : ""}`
      );
      return { email, recreated };
    }
  }
  const user = await db.query.usersTable.findFirst({
    where: eq10(usersTable.email, email)
  });
  if (!user) {
    console.warn(`\u26A0\uFE0F User ${email} not found after signup; skipping.`);
    return { email, recreated };
  }
  try {
    await db.update(usersTable).set({
      name,
      emailVerified: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(usersTable.id, user.id));
  } catch (err) {
    console.warn(`\u26A0\uFE0F Failed to update user metadata for ${email}:`, err);
  }
  if (recreated && config.preserveApiKeysOnRecreate && preservedUserApiKeys) {
    for (const k of preservedUserApiKeys) {
      try {
        await db.insert(apiKeysTable).values({
          name: k.name,
          key: k.key,
          user_id: user.id,
          is_active: k.is_active
        }).onConflictDoUpdate({
          target: [apiKeysTable.user_id, apiKeysTable.name],
          set: { key: k.key, is_active: k.is_active }
        });
      } catch (err) {
        console.warn(
          `\u26A0\uFE0F Failed to restore preserved API key for ${email}:`,
          err
        );
      }
    }
    console.log(`\u2713 Restored preserved API keys for recreated user ${email}`);
  }
  if (!existing || recreated) {
    await recordPasswordFingerprint(email, password);
  }
  console.log(`\u2713 User ready: ${email}`);
  return { userId: user.id, email, recreated };
}
__name(ensureUser, "ensureUser");
async function bootstrapUsers(config) {
  const userMap = /* @__PURE__ */ new Map();
  if (!config.users || config.users.length === 0) {
    console.warn(
      "\u26A0\uFE0F No users configured for bootstrap (BOOTSTRAP_USERS is empty and no single user config found)"
    );
    return userMap;
  }
  console.log(`\u{1F465} Bootstrapping ${config.users.length} user(s)...`);
  for (const userConfig of config.users) {
    try {
      if (!userConfig.email || !userConfig.password) {
        console.warn("\u26A0\uFE0F User config missing email or password; skipping");
        continue;
      }
      const result = await ensureUser(userConfig, config);
      if (result.userId) {
        userMap.set(result.email, result.userId);
      }
    } catch (err) {
      console.warn(`\u26A0\uFE0F Failed to bootstrap user ${userConfig.email}:`, err);
    }
  }
  return userMap;
}
__name(bootstrapUsers, "bootstrapUsers");
async function maybeDeleteOtherUsers(config, bootstrappedEmails) {
  if (!config.deleteOtherUsers) return;
  if (bootstrappedEmails.length === 0) {
    console.warn(
      "\u26A0\uFE0F BOOTSTRAP_DELETE_OTHER_USERS=true but no bootstrapped users found; skipping to avoid lockout."
    );
    return;
  }
  console.warn(
    `\u26A0\uFE0F BOOTSTRAP_DELETE_OTHER_USERS=true \u2014 deleting all users except bootstrapped users`
  );
  try {
    await db.delete(usersTable).where(notInArray2(usersTable.email, bootstrappedEmails));
    console.log("\u2713 Deleted other users");
  } catch (err) {
    console.warn("\u26A0\uFE0F Failed to delete other users:", err);
  }
}
__name(maybeDeleteOtherUsers, "maybeDeleteOtherUsers");
async function bootstrapApiKeys(config, userMap) {
  if (!config.apiKeys || config.apiKeys.length === 0) {
    console.log(
      "\u2139\uFE0F No API keys configured for bootstrap (BOOTSTRAP_API_KEYS is empty)"
    );
    return;
  }
  console.log(`\u{1F511} Bootstrapping ${config.apiKeys.length} API key(s)...`);
  for (const apiKeyConfig of config.apiKeys) {
    try {
      const name = apiKeyConfig.name;
      const isPublic = apiKeyConfig.is_public ?? false;
      const ownerEmail = getOwnerEmail(apiKeyConfig);
      let userId = null;
      if (!isPublic) {
        if (ownerEmail) {
          userId = userMap.get(ownerEmail) ?? null;
          if (!userId) {
            console.warn(
              `\u26A0\uFE0F Skipping API key "${name}" because user "${ownerEmail}" was not found`
            );
            continue;
          }
        } else {
          const firstUserId = Array.from(userMap.values())[0];
          if (!firstUserId) {
            console.warn(
              `\u26A0\uFE0F Skipping private API key "${name}" because no users are available`
            );
            continue;
          }
          userId = firstUserId;
        }
      }
      const whereCondition = userId ? and7(eq10(apiKeysTable.user_id, userId), eq10(apiKeysTable.name, name)) : and7(isNull5(apiKeysTable.user_id), eq10(apiKeysTable.name, name));
      const existing = await db.query.apiKeysTable.findFirst({
        where: whereCondition
      });
      if (!existing) {
        const key = generateApiKey();
        await db.insert(apiKeysTable).values({
          name,
          key,
          user_id: userId,
          is_active: true
        });
        const ownerInfo = userId ? `for user ${ownerEmail ?? Array.from(userMap.keys())[0]}` : "(public)";
        console.log(
          `\u2713 Created ${isPublic ? "public" : "private"} API key "${name}" ${ownerInfo}: ${maskKey(key)}`
        );
      } else {
        const ownerInfo = userId ? `for user ${ownerEmail ?? Array.from(userMap.keys())[0]}` : "(public)";
        console.log(
          `\u2713 ${isPublic ? "Public" : "Private"} API key "${name}" ${ownerInfo} already exists: ${maskKey(existing.key)}`
        );
      }
    } catch (err) {
      console.warn(
        `\u26A0\uFE0F Failed to bootstrap API key "${apiKeyConfig.name}":`,
        err
      );
    }
  }
}
__name(bootstrapApiKeys, "bootstrapApiKeys");
async function bootstrapNamespaces(config, userMap) {
  const namespaceMap = /* @__PURE__ */ new Map();
  if (!config.namespaces || config.namespaces.length === 0) {
    console.log(
      "\u2139\uFE0F No namespaces configured for bootstrap (BOOTSTRAP_NAMESPACES is empty)"
    );
    return namespaceMap;
  }
  console.log(`\u{1F527} Bootstrapping ${config.namespaces.length} namespace(s)...`);
  for (const nsConfig of config.namespaces) {
    try {
      const name = nsConfig.name;
      const description = nsConfig.description ?? null;
      const isPublic = nsConfig.is_public ?? false;
      const shouldUpdate = nsConfig.update ?? true;
      const ownerEmail = getOwnerEmail(nsConfig);
      let ownerUserId = null;
      if (!isPublic) {
        if (ownerEmail) {
          ownerUserId = userMap.get(ownerEmail) ?? null;
          if (!ownerUserId) {
            console.warn(
              `\u26A0\uFE0F Skipping namespace "${name}" because user "${ownerEmail}" was not found`
            );
            continue;
          }
        } else {
          const firstUserId = Array.from(userMap.values())[0];
          if (!firstUserId) {
            console.warn(
              `\u26A0\uFE0F Skipping private namespace "${name}" because no users are available`
            );
            continue;
          }
          ownerUserId = firstUserId;
        }
      }
      const whereCondition = ownerUserId ? and7(
        eq10(namespacesTable.name, name),
        eq10(namespacesTable.user_id, ownerUserId)
      ) : and7(eq10(namespacesTable.name, name), isNull5(namespacesTable.user_id));
      const existing = await db.query.namespacesTable.findFirst({
        where: whereCondition
      });
      if (!existing) {
        const inserted = await db.insert(namespacesTable).values({
          name,
          description,
          user_id: ownerUserId
        }).returning({ uuid: namespacesTable.uuid });
        const uuid2 = inserted?.[0]?.uuid;
        if (uuid2) {
          namespaceMap.set(name, uuid2);
          const ownerInfo = ownerUserId ? `for user ${ownerEmail ?? Array.from(userMap.keys())[0]}` : "(public)";
          console.log(
            `\u2713 Created ${isPublic ? "public" : "private"} namespace "${name}" ${ownerInfo}`
          );
        } else {
          console.warn(`\u26A0\uFE0F Namespace insert for "${name}" did not return uuid`);
        }
      } else {
        namespaceMap.set(name, existing.uuid);
        if (shouldUpdate) {
          await db.update(namespacesTable).set({
            description: description ?? existing.description,
            updated_at: /* @__PURE__ */ new Date(),
            user_id: ownerUserId
          }).where(eq10(namespacesTable.uuid, existing.uuid));
          console.log(`\u2713 Updated namespace "${name}"`);
        } else {
          console.log(`\u2713 Namespace "${name}" already exists (no update)`);
        }
      }
    } catch (err) {
      console.warn(`\u26A0\uFE0F Failed to bootstrap namespace "${nsConfig.name}":`, err);
    }
  }
  return namespaceMap;
}
__name(bootstrapNamespaces, "bootstrapNamespaces");
async function bootstrapEndpoints(config, namespaceMap, userMap) {
  if (!config.endpoints || config.endpoints.length === 0) {
    console.log(
      "\u2139\uFE0F No endpoints configured for bootstrap (BOOTSTRAP_ENDPOINTS is empty)"
    );
    return;
  }
  console.log(`\u{1F527} Bootstrapping ${config.endpoints.length} endpoint(s)...`);
  for (const epConfig of config.endpoints) {
    try {
      const name = epConfig.name;
      const description = epConfig.description ?? null;
      const enableAuth = epConfig.enable_auth ?? true;
      const enableAuthQuery = epConfig.enable_auth_query ?? false;
      const enableAuthOauth = epConfig.enable_auth_oauth ?? false;
      const isPublic = epConfig.is_public ?? true;
      const shouldUpdate = epConfig.update ?? true;
      const ownerEmail = getOwnerEmail(epConfig);
      let ownerUserId = null;
      if (!isPublic) {
        if (ownerEmail) {
          ownerUserId = userMap.get(ownerEmail) ?? null;
          if (!ownerUserId) {
            console.warn(
              `\u26A0\uFE0F Skipping endpoint "${name}" because user "${ownerEmail}" was not found`
            );
            continue;
          }
        } else {
          const firstUserId = Array.from(userMap.values())[0];
          if (!firstUserId) {
            console.warn(
              `\u26A0\uFE0F Skipping private endpoint "${name}" because no users are available`
            );
            continue;
          }
          ownerUserId = firstUserId;
        }
      }
      let namespaceUuid;
      let namespaceName;
      if (epConfig.namespace) {
        namespaceUuid = namespaceMap.get(epConfig.namespace);
        namespaceName = epConfig.namespace;
        if (!namespaceUuid) {
          console.warn(
            `\u26A0\uFE0F Skipping endpoint "${name}" because specified namespace "${epConfig.namespace}" was not found. Available namespaces: ${Array.from(namespaceMap.keys()).join(", ")}`
          );
          continue;
        }
      } else {
        if (namespaceMap.size > 0) {
          namespaceUuid = Array.from(namespaceMap.values())[0];
          namespaceName = Array.from(namespaceMap.keys())[0];
        }
      }
      if (!namespaceUuid) {
        console.warn(
          `\u26A0\uFE0F Skipping endpoint "${name}" because no namespace is available. Bootstrap at least one namespace first.`
        );
        continue;
      }
      const existing = await db.query.endpointsTable.findFirst({
        where: eq10(endpointsTable.name, name)
      });
      const values = {
        name,
        description,
        namespace_uuid: namespaceUuid,
        enable_api_key_auth: enableAuth,
        use_query_param_auth: enableAuthQuery,
        enable_oauth: enableAuthOauth,
        user_id: ownerUserId,
        updated_at: /* @__PURE__ */ new Date()
      };
      if (!existing) {
        await db.insert(endpointsTable).values(values);
        const ownerInfo = ownerUserId ? `for user ${ownerEmail ?? Array.from(userMap.keys())[0]}` : "(public)";
        const namespaceInfo = namespaceName ? ` in namespace "${namespaceName}"` : "";
        console.log(
          `\u2713 Created ${isPublic ? "public" : "private"} endpoint "${name}" ${ownerInfo}${namespaceInfo}`
        );
      } else {
        if (shouldUpdate) {
          await db.update(endpointsTable).set(values).where(eq10(endpointsTable.uuid, existing.uuid));
          const namespaceInfo = namespaceName ? ` in namespace "${namespaceName}"` : "";
          console.log(`\u2713 Updated endpoint "${name}"${namespaceInfo}`);
        } else {
          console.log(`\u2713 Endpoint "${name}" already exists (no update)`);
        }
      }
    } catch (err) {
      console.warn(`\u26A0\uFE0F Failed to bootstrap endpoint "${epConfig.name}":`, err);
    }
  }
}
__name(bootstrapEndpoints, "bootstrapEndpoints");
function validateConfig(config) {
  if (config.disableUiRegistration && config.disableSsoRegistration && config.users.length === 0) {
    console.warn(
      "\u26A0\uFE0F Both UI and SSO registration are disabled, but no users are configured. This may lock you out."
    );
  }
  if (config.recreateDefaultUser && config.users.length === 0) {
    console.warn(
      "\u26A0\uFE0F BOOTSTRAP_RECREATE_USER=true but no users are configured; recreation cannot run."
    );
  }
  for (const user of config.users) {
    if (!user.email || user.email.trim() === "") {
      console.warn("\u26A0\uFE0F User configuration is missing 'email' field");
    }
    if (!user.password || user.password.trim() === "") {
      console.warn(`\u26A0\uFE0F User ${user.email} is missing 'password' field`);
    }
    if (user.password && user.password.length < 8) {
      console.warn(
        `\u26A0\uFE0F Password for ${user.email} is less than 8 characters. Consider using a stronger password.`
      );
    }
  }
  if (config.recreateDefaultUser && !config.preserveApiKeysOnRecreate) {
    console.warn(
      "\u26A0\uFE0F BOOTSTRAP_RECREATE_USER=true and BOOTSTRAP_PRESERVE_API_KEYS=false"
    );
    console.warn("     This will delete all API keys for the users!");
  }
  if (config.deleteOtherUsers && config.users.length === 0) {
    console.warn(
      "\u26A0\uFE0F BOOTSTRAP_DELETE_OTHER_USERS=true without any users configured"
    );
    console.warn("     This could lock you out of the system!");
  }
  for (const apiKey of config.apiKeys) {
    if (!apiKey.name || apiKey.name.trim() === "") {
      console.warn("\u26A0\uFE0F API key configuration is missing 'name' field");
    }
    const ownerEmail = getOwnerEmail(apiKey);
    if (!apiKey.is_public && ownerEmail && config.users.length === 0) {
      console.warn(
        `\u26A0\uFE0F API key "${apiKey.name}" references user "${ownerEmail}" but no users are configured`
      );
    }
  }
  for (const ns of config.namespaces) {
    if (!ns.name || ns.name.trim() === "") {
      console.warn("\u26A0\uFE0F Namespace configuration is missing 'name' field");
    }
    const ownerEmail = getOwnerEmail(ns);
    if (!ns.is_public && ownerEmail && config.users.length === 0) {
      console.warn(
        `\u26A0\uFE0F Namespace "${ns.name}" references user "${ownerEmail}" but no users are configured`
      );
    }
  }
  for (const ep of config.endpoints) {
    if (!ep.name || ep.name.trim() === "") {
      console.warn("\u26A0\uFE0F Endpoint configuration is missing 'name' field");
    }
    const ownerEmail = getOwnerEmail(ep);
    if (!ep.is_public && ownerEmail && config.users.length === 0) {
      console.warn(
        `\u26A0\uFE0F Endpoint "${ep.name}" references user "${ownerEmail}" but no users are configured`
      );
    }
  }
  if (config.endpoints.length > 0 && config.namespaces.length === 0) {
    console.warn("\u26A0\uFE0F Endpoints are configured but no namespaces are defined.");
    console.warn(
      "     Endpoints require at least one namespace to be created!"
    );
  }
}
__name(validateConfig, "validateConfig");
async function initializeEnvironmentConfiguration() {
  console.log("\u{1F680} Initializing environment-based configuration...");
  const config = parseEnvConfig();
  if (process.env.BOOTSTRAP_DEBUG === "true") {
    console.log("\u{1F4CB} Bootstrap Configuration:");
    console.log(`   Users: ${config.users.length} configured`);
    console.log(`   API Keys: ${config.apiKeys.length} configured`);
    console.log(`   Namespaces: ${config.namespaces.length} configured`);
    console.log(`   Endpoints: ${config.endpoints.length} configured`);
    console.log(`   Recreate User: ${config.recreateDefaultUser}`);
    console.log(`   First Run Only: ${config.bootstrapOnlyOnFirstRun}`);
    console.log(`   Delete Others: ${config.deleteOtherUsers}`);
  }
  validateConfig(config);
  console.log("\u{1F527} Setting registration controls...");
  try {
    await upsertConfig(
      ConfigKeyEnum2.Enum.DISABLE_SIGNUP,
      config.disableUiRegistration.toString(),
      "Whether new user signup is disabled"
    );
  } catch (err) {
    console.warn("\u26A0\uFE0F Failed to set UI registration control:", err);
  }
  try {
    await upsertConfig(
      ConfigKeyEnum2.Enum.DISABLE_SSO_SIGNUP,
      config.disableSsoRegistration.toString(),
      "Whether new user signup via SSO/OAuth is disabled"
    );
  } catch (err) {
    console.warn("\u26A0\uFE0F Failed to set SSO registration control:", err);
  }
  console.log(
    `\u2713 Registration controls set: UI=${!config.disableUiRegistration}, SSO=${!config.disableSsoRegistration}`
  );
  const skipBootstrap = await shouldSkipBootstrap(config);
  if (skipBootstrap) {
    console.log("\u2705 Environment-based configuration initialized (guarded)");
    return;
  }
  let userMap;
  try {
    userMap = await bootstrapUsers(config);
  } catch (err) {
    console.warn("\u26A0\uFE0F Users bootstrap failed:", err);
    userMap = /* @__PURE__ */ new Map();
  }
  try {
    const bootstrappedEmails = Array.from(userMap.keys());
    await maybeDeleteOtherUsers(config, bootstrappedEmails);
  } catch (err) {
    console.warn("\u26A0\uFE0F User cleanup step failed:", err);
  }
  try {
    await bootstrapApiKeys(config, userMap);
  } catch (err) {
    console.warn("\u26A0\uFE0F API keys bootstrap failed:", err);
  }
  let namespaceMap;
  try {
    namespaceMap = await bootstrapNamespaces(config, userMap);
  } catch (err) {
    console.warn("\u26A0\uFE0F Namespaces bootstrap failed:", err);
    namespaceMap = /* @__PURE__ */ new Map();
  }
  try {
    await bootstrapEndpoints(config, namespaceMap, userMap);
  } catch (err) {
    console.warn("\u26A0\uFE0F Endpoints bootstrap failed:", err);
  }
  if (config.bootstrapOnlyOnFirstRun) {
    if (userMap.size > 0 || namespaceMap.size > 0) {
      await markBootstrapComplete();
    }
  }
  console.log("\u2705 Environment-based configuration initialized successfully");
}
__name(initializeEnvironmentConfiguration, "initializeEnvironmentConfiguration");

// src/lib/startup.ts
init_metamcp();
init_server_error_tracker();
init_utils();
async function initializeOnStartup() {
  const parseBool2 = /* @__PURE__ */ __name((value, defaultValue) => {
    if (value === void 0) return defaultValue;
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "y", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "off"].includes(normalized)) return false;
    return defaultValue;
  }, "parseBool");
  const enableEnvBootstrap = parseBool2(process.env.BOOTSTRAP_ENABLE, true);
  const failHard = parseBool2(process.env.BOOTSTRAP_FAIL_HARD, false);
  if (enableEnvBootstrap) {
    try {
      await initializeEnvironmentConfiguration();
    } catch (err) {
      console.error(
        "\u274C Error initializing environment-based configuration (ignored):",
        err
      );
      if (failHard) {
        throw err;
      }
    }
  } else {
    console.log("Environment bootstrap disabled via BOOTSTRAP_ENABLE=false");
  }
}
__name(initializeOnStartup, "initializeOnStartup");
async function initializeIdleServers() {
  try {
    console.log(
      "Initializing idle servers for all namespaces and all MCP servers..."
    );
    const resetCount = await mcpServersRepository.resetAllErrorStatuses();
    if (resetCount > 0) {
      console.log(
        `Reset ${resetCount} server(s) from ERROR to NONE status on startup`
      );
    }
    serverErrorTracker.resetAllAttempts();
    const namespaces = await namespacesRepository.findAll();
    const namespaceUuids = namespaces.map((namespace) => namespace.uuid);
    if (namespaceUuids.length === 0) {
      console.log("No namespaces found in database");
    } else {
      console.log(
        `Found ${namespaceUuids.length} namespaces: ${namespaceUuids.join(", ")}`
      );
    }
    console.log("Fetching all MCP servers from database...");
    const allDbServers = await mcpServersRepository.findAll();
    console.log(`Found ${allDbServers.length} total MCP servers in database`);
    const allServerParams = {};
    for (const dbServer of allDbServers) {
      const serverParams = await convertDbServerToParams(dbServer);
      if (serverParams) {
        allServerParams[dbServer.uuid] = serverParams;
      }
    }
    console.log(
      `Successfully converted ${Object.keys(allServerParams).length} MCP servers to ServerParameters format`
    );
    if (Object.keys(allServerParams).length > 0) {
      const { mcpServerPool: mcpServerPool2 } = await Promise.resolve().then(() => (init_metamcp(), metamcp_exports));
      await mcpServerPool2.ensureIdleSessions(allServerParams);
      console.log(
        "\u2705 Successfully initialized idle MCP server pool sessions for ALL servers"
      );
    }
    if (namespaceUuids.length > 0) {
      await metaMcpServerPool.ensureIdleServers(namespaceUuids, true);
      console.log(
        "\u2705 Successfully initialized idle servers for all namespaces"
      );
    }
    console.log(
      "\u2705 Successfully initialized idle servers for all namespaces and all MCP servers"
    );
  } catch (error) {
    console.log("\u274C Error initializing idle servers:", error);
  }
}
__name(initializeIdleServers, "initializeIdleServers");

// src/routers/mcp-proxy.ts
import cors from "cors";
import express3 from "express";
import helmet from "helmet";

// src/routers/mcp-proxy/metamcp.ts
init_logger();
init_metamcp();
init_mcp_server_pool();
import { randomUUID } from "crypto";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

// src/middleware/better-auth-mcp.middleware.ts
init_logger();
var betterAuthMcpMiddleware = /* @__PURE__ */ __name(async (req, res, next) => {
  try {
    if (!req.headers.cookie) {
      logger_default.info("Auth middleware - no cookies found in request");
      return res.status(401).json({
        error: "Authentication required",
        message: "No session cookies found"
      });
    }
    const sessionUrl = new URL(
      "/api/auth/get-session",
      `http://${req.headers.host}`
    );
    const headers = new Headers();
    headers.set("cookie", req.headers.cookie);
    const sessionRequest = new Request(sessionUrl.toString(), {
      method: "GET",
      headers
    });
    const sessionResponse = await auth.handler(sessionRequest);
    if (!sessionResponse.ok) {
      logger_default.info("Auth middleware - session verification failed");
      return res.status(401).json({
        error: "Invalid session",
        message: "Session verification failed"
      });
    }
    const sessionData = await sessionResponse.json();
    if (!sessionData || !sessionData.user) {
      logger_default.info("Auth middleware - no valid user session found");
      return res.status(401).json({
        error: "Invalid session",
        message: "No valid user session found"
      });
    }
    req.user = sessionData.user;
    req.session = sessionData.session;
    next();
  } catch (error) {
    logger_default.error("Better auth middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "Failed to verify authentication"
    });
  }
}, "betterAuthMcpMiddleware");

// src/routers/mcp-proxy/metamcp.ts
var metamcpRouter = express.Router();
metamcpRouter.use(betterAuthMcpMiddleware);
var webAppTransports = /* @__PURE__ */ new Map();
var metamcpServers = /* @__PURE__ */ new Map();
var createMetaMcpServer = /* @__PURE__ */ __name(async (namespaceUuid, sessionId, includeInactiveServers = false) => {
  const { server, cleanup } = await createServer(
    namespaceUuid,
    sessionId,
    includeInactiveServers
  );
  return { server, cleanup };
}, "createMetaMcpServer");
var cleanupSession = /* @__PURE__ */ __name(async (sessionId) => {
  logger_default.info(`Cleaning up session ${sessionId}`);
  const transport = webAppTransports.get(sessionId);
  if (transport) {
    webAppTransports.delete(sessionId);
    await transport.close();
  }
  const serverInstance = metamcpServers.get(sessionId);
  if (serverInstance) {
    metamcpServers.delete(sessionId);
    await serverInstance.cleanup();
  }
  await mcpServerPool.cleanupSession(sessionId);
}, "cleanupSession");
metamcpRouter.get("/:uuid/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  try {
    const transport = webAppTransports.get(
      sessionId
    );
    if (!transport) {
      res.status(404).end("Session not found");
      return;
    } else {
      await transport.handleRequest(req, res);
    }
  } catch (error) {
    logger_default.error("Error in MetaMCP /mcp route:", error);
    res.status(500).json(error);
  }
});
metamcpRouter.post("/:uuid/mcp", async (req, res) => {
  const namespaceUuid = req.params.uuid;
  const sessionId = req.headers["mcp-session-id"];
  let mcpServerInstance;
  if (!sessionId) {
    try {
      logger_default.info(
        `New MetaMCP StreamableHttp connection request for namespace ${namespaceUuid}`
      );
      const webAppTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: randomUUID,
        onsessioninitialized: /* @__PURE__ */ __name(async (newSessionId) => {
          try {
            const includeInactiveServers = req.query.includeInactiveServers === "true";
            mcpServerInstance = await createMetaMcpServer(
              namespaceUuid,
              newSessionId,
              includeInactiveServers
            );
            logger_default.info(
              `Created MetaMCP server instance for session ${newSessionId}`
            );
            webAppTransports.set(newSessionId, webAppTransport);
            metamcpServers.set(newSessionId, mcpServerInstance);
            logger_default.info(
              `MetaMCP Client <-> Proxy sessionId: ${newSessionId} for namespace ${namespaceUuid}`
            );
            await mcpServerInstance.server.connect(webAppTransport);
            res.on("close", async () => {
              logger_default.info(
                `MetaMCP connection closed for session ${newSessionId}`
              );
              await cleanupSession(newSessionId);
            });
          } catch (error) {
            logger_default.error(`Error initializing session ${newSessionId}:`, error);
          }
        }, "onsessioninitialized")
      });
      logger_default.info("Created MetaMCP StreamableHttp transport");
      await webAppTransport.handleRequest(
        req,
        res,
        req.body
      );
    } catch (error) {
      logger_default.error("Error in MetaMCP /mcp POST route:", error);
      res.status(500).json(error);
    }
  } else {
    try {
      const transport = webAppTransports.get(
        sessionId
      );
      if (!transport) {
        res.status(404).end("Transport not found for sessionId " + sessionId);
      } else {
        await transport.handleRequest(
          req,
          res
        );
      }
    } catch (error) {
      logger_default.error("Error in MetaMCP /mcp route:", error);
      res.status(500).json(error);
    }
  }
});
metamcpRouter.delete("/:uuid/mcp", async (req, res) => {
  const namespaceUuid = req.params.uuid;
  const sessionId = req.headers["mcp-session-id"];
  logger_default.info(
    `Received DELETE message for MetaMCP namespace ${namespaceUuid} sessionId ${sessionId}`
  );
  if (sessionId) {
    try {
      await cleanupSession(sessionId);
      logger_default.info(`MetaMCP session ${sessionId} cleaned up successfully`);
      res.status(200).end();
    } catch (error) {
      logger_default.error("Error in MetaMCP /mcp DELETE route:", error);
      res.status(500).json(error);
    }
  } else {
    res.status(400).end("Missing sessionId");
  }
});
metamcpRouter.get("/:uuid/sse", async (req, res) => {
  const namespaceUuid = req.params.uuid;
  const includeInactiveServers = req.query.includeInactiveServers === "true";
  try {
    logger_default.info(
      `New MetaMCP SSE connection request for namespace ${namespaceUuid}, includeInactiveServers: ${includeInactiveServers}`
    );
    const webAppTransport = new SSEServerTransport(
      `/mcp-proxy/metamcp/${namespaceUuid}/message`,
      res
    );
    logger_default.info("Created MetaMCP SSE transport");
    const sessionId = webAppTransport.sessionId;
    const mcpServerInstance = await createMetaMcpServer(
      namespaceUuid,
      sessionId,
      includeInactiveServers
    );
    logger_default.info(`Created MetaMCP server instance for session ${sessionId}`);
    webAppTransports.set(sessionId, webAppTransport);
    metamcpServers.set(sessionId, mcpServerInstance);
    res.on("close", async () => {
      logger_default.info(`MetaMCP SSE connection closed for session ${sessionId}`);
      await cleanupSession(sessionId);
    });
    await mcpServerInstance.server.connect(webAppTransport);
  } catch (error) {
    logger_default.error("Error in MetaMCP /sse route:", error);
    res.status(500).json(error);
  }
});
metamcpRouter.post("/:uuid/message", async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    const transport = webAppTransports.get(
      sessionId
    );
    if (!transport) {
      res.status(404).end("Session not found");
      return;
    }
    await transport.handlePostMessage(req, res);
  } catch (error) {
    logger_default.error("Error in MetaMCP /message route:", error);
    res.status(500).json(error);
  }
});
metamcpRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "metamcp"
  });
});
metamcpRouter.get("/info", (req, res) => {
  res.json({
    service: "metamcp",
    version: "1.0.0",
    description: "MetaMCP unified MCP proxy service"
  });
});
var metamcp_default = metamcpRouter;

// src/routers/mcp-proxy/server.ts
init_logger();
init_repositories();
import { randomUUID as randomUUID2 } from "crypto";
import {
  SSEClientTransport as SSEClientTransport2,
  SseError
} from "@modelcontextprotocol/sdk/client/sse.js";
import { getDefaultEnvironment as getDefaultEnvironment3 } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport as StreamableHTTPClientTransport2 } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEServerTransport as SSEServerTransport2 } from "@modelcontextprotocol/sdk/server/sse.js";
import { StreamableHTTPServerTransport as StreamableHTTPServerTransport2 } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { McpServerErrorStatusEnum as McpServerErrorStatusEnum5, McpServerTypeEnum as McpServerTypeEnum2 } from "@repo/zod-types";
import express2 from "express";
import { parse as shellParseArgs } from "shell-quote";
import { findActualExecutable } from "spawn-rx";

// src/lib/mcp-proxy.ts
init_logger();
import { isJSONRPCRequest } from "@modelcontextprotocol/sdk/types.js";
function onClientError(error) {
  if (error?.message && error.message.includes("Not connected")) {
    logger_default.debug("Client transport disconnected (expected during cleanup)");
    return;
  }
  logger_default.error("Error from inspector client:", error);
}
__name(onClientError, "onClientError");
function onServerError(error) {
  if (error?.message && error.message.includes("Not connected")) {
    logger_default.debug("Server transport disconnected (expected during cleanup)");
    return;
  }
  if (error?.message && error.message.includes("Error POSTing to endpoint (HTTP 404)") || error?.cause && JSON.stringify(error.cause).includes("ECONNREFUSED")) {
    logger_default.error("Connection refused. Is the MCP server running?");
  } else {
    logger_default.error("Error from MCP server:", error);
  }
}
__name(onServerError, "onServerError");
function mcpProxy({
  transportToClient,
  transportToServer,
  onCleanup
}) {
  let transportToClientClosed = false;
  let transportToServerClosed = false;
  let cleanupCalled = false;
  let reportedServerSession = false;
  const triggerCleanup = /* @__PURE__ */ __name(async () => {
    if (cleanupCalled) {
      logger_default.debug("Cleanup already called, skipping");
      return;
    }
    if (!onCleanup) {
      logger_default.debug("No cleanup callback provided, skipping");
      return;
    }
    cleanupCalled = true;
    try {
      logger_default.debug(
        "Triggering MCP proxy cleanup (server session/subprocess cleanup)"
      );
      await onCleanup();
      logger_default.debug("MCP proxy cleanup completed successfully");
    } catch (error) {
      logger_default.error("Error during MCP proxy cleanup:", error);
    }
  }, "triggerCleanup");
  const closeAllTransports = /* @__PURE__ */ __name(async () => {
    const promises = [];
    if (!transportToClientClosed) {
      transportToClientClosed = true;
      promises.push(transportToClient.close().catch(onClientError));
    }
    if (!transportToServerClosed) {
      transportToServerClosed = true;
      promises.push(transportToServer.close().catch(onServerError));
    }
    await Promise.allSettled(promises);
    await triggerCleanup();
  }, "closeAllTransports");
  transportToClient.onmessage = (message) => {
    if (transportToServerClosed) {
      logger_default.debug("Ignoring message to closed server transport");
      return;
    }
    transportToServer.send(message).catch(async (error) => {
      if (error?.message && error.message.includes("Not connected")) {
        logger_default.debug(
          "Server transport disconnected while sending message, cleaning up"
        );
        await closeAllTransports();
        return;
      }
      if (isJSONRPCRequest(message) && !transportToClientClosed) {
        const errorResponse = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32001,
            message: error.message,
            data: error
          }
        };
        if (!transportToClientClosed) {
          transportToClient.send(errorResponse).catch(onClientError);
        }
      }
    });
  };
  transportToServer.onmessage = (message) => {
    if (!reportedServerSession) {
      if (transportToServer.sessionId) {
        logger_default.info(
          "Proxy  <-> Server sessionId: " + transportToServer.sessionId
        );
      }
      reportedServerSession = true;
    }
    if (transportToClientClosed) {
      logger_default.debug("Ignoring message to closed client transport");
      return;
    }
    transportToClient.send(message).catch(async (error) => {
      if (error?.message && error.message.includes("Not connected")) {
        logger_default.debug(
          "Client transport disconnected while sending message, cleaning up"
        );
        await closeAllTransports();
        return;
      }
      onClientError(error);
    });
  };
  transportToClient.onclose = async () => {
    logger_default.debug("Client transport closed");
    if (!transportToClientClosed) {
      transportToClientClosed = true;
      if (!transportToServerClosed) {
        logger_default.debug("Closing server transport due to client close");
        await transportToServer.close().catch(onServerError);
      }
    }
    await triggerCleanup();
  };
  transportToServer.onclose = async () => {
    logger_default.debug("Server transport closed");
    if (!transportToServerClosed) {
      transportToServerClosed = true;
      if (!transportToClientClosed) {
        logger_default.debug("Closing client transport due to server close");
        await transportToClient.close().catch(onClientError);
      }
    }
    await triggerCleanup();
  };
  transportToClient.onerror = async (error) => {
    if (error?.message && error.message.includes("Not connected")) {
      logger_default.debug("Client transport error: Not connected, cleaning up");
      await closeAllTransports();
      return;
    }
    onClientError(error);
  };
  transportToServer.onerror = async (error) => {
    if (error?.message && error.message.includes("Not connected")) {
      logger_default.debug("Server transport error: Not connected, cleaning up");
      await closeAllTransports();
      return;
    }
    onServerError(error);
  };
}
__name(mcpProxy, "mcpProxy");

// src/routers/mcp-proxy/server.ts
init_client();
init_mcp_server_pool();
init_utils();
init_process_managed_transport();
var SSE_HEADERS_PASSTHROUGH = ["authorization"];
var STREAMABLE_HTTP_HEADERS_PASSTHROUGH = [
  "authorization",
  "mcp-session-id",
  "last-event-id"
];
var defaultEnvironment = {
  ...getDefaultEnvironment3()
};
var STDIO_COOLDOWN_DURATION = 1e4;
var stdioCommandCooldowns = /* @__PURE__ */ new Map();
var createStdioKey = /* @__PURE__ */ __name((command, args, env) => {
  return `${command}:${args.join(",")}:${JSON.stringify(env)}`;
}, "createStdioKey");
var isStdioInCooldown = /* @__PURE__ */ __name((command, args, env) => {
  const key = createStdioKey(command, args, env);
  const cooldownEnd = stdioCommandCooldowns.get(key);
  if (cooldownEnd && Date.now() < cooldownEnd) {
    return true;
  }
  if (cooldownEnd && Date.now() >= cooldownEnd) {
    stdioCommandCooldowns.delete(key);
  }
  return false;
}, "isStdioInCooldown");
var setStdioCooldown = /* @__PURE__ */ __name((command, args, env) => {
  const key = createStdioKey(command, args, env);
  stdioCommandCooldowns.set(key, Date.now() + STDIO_COOLDOWN_DURATION);
}, "setStdioCooldown");
var extractServerUuidFromStdioCommand = /* @__PURE__ */ __name(async (command, args) => {
  try {
    const fullCommand = `${command} ${args.join(" ")}`;
    logger_default.info(`Looking for server with command: ${fullCommand}`);
    const servers = await mcpServersRepository.findAll();
    logger_default.info(`Found ${servers.length} servers in database`);
    for (const server of servers) {
      if (server.type === "STDIO" && server.command) {
        const serverCommand = `${server.command} ${(server.args || []).join(" ")}`;
        logger_default.info(
          `Checking server ${server.name} (${server.uuid}): ${serverCommand}`
        );
        if (serverCommand === fullCommand) {
          logger_default.info(
            `Found exact match for server ${server.name} (${server.uuid})`
          );
          return server.uuid;
        }
      }
    }
    for (const server of servers) {
      if (server.type === "STDIO" && server.command === command) {
        logger_default.info(
          `Found command-only match for server ${server.name} (${server.uuid})`
        );
        return server.uuid;
      }
    }
    logger_default.info(`No server found for command: ${fullCommand}`);
    return null;
  } catch (error) {
    logger_default.error("Error extracting server UUID from STDIO command:", error);
    return null;
  }
}, "extractServerUuidFromStdioCommand");
var checkServerErrorStatus = /* @__PURE__ */ __name(async (serverUuid) => {
  try {
    const server = await mcpServersRepository.findByUuid(serverUuid);
    if (!server) {
      logger_default.info(`Server ${serverUuid} not found`);
      return false;
    }
    const isInError = server.error_status === McpServerErrorStatusEnum5.Enum.ERROR;
    if (isInError) {
      logger_default.info(`Server ${server.name} (${serverUuid}) is in ERROR state`);
    }
    return isInError;
  } catch (error) {
    logger_default.error(
      `Error checking server error status for ${serverUuid}:`,
      error
    );
    return false;
  }
}, "checkServerErrorStatus");
var getHttpHeaders = /* @__PURE__ */ __name((req, transportType) => {
  const headers = {
    Accept: transportType === McpServerTypeEnum2.Enum.SSE ? "text/event-stream" : "text/event-stream, application/json"
  };
  const defaultHeaders = transportType === McpServerTypeEnum2.Enum.SSE ? SSE_HEADERS_PASSTHROUGH : STREAMABLE_HTTP_HEADERS_PASSTHROUGH;
  for (const key of defaultHeaders) {
    if (req.headers[key] === void 0) {
      continue;
    }
    const value = req.headers[key];
    headers[key] = Array.isArray(value) ? value[value.length - 1] : value;
  }
  if (req.headers["x-custom-auth-header"] !== void 0) {
    const customHeaderName = req.headers["x-custom-auth-header"];
    const lowerCaseHeaderName = customHeaderName.toLowerCase();
    if (req.headers[lowerCaseHeaderName] !== void 0) {
      const value = req.headers[lowerCaseHeaderName];
      headers[customHeaderName] = value;
    }
  }
  return headers;
}, "getHttpHeaders");
var serverRouter = express2.Router();
serverRouter.use(betterAuthMcpMiddleware);
var webAppTransports2 = /* @__PURE__ */ new Map();
var serverTransports = /* @__PURE__ */ new Map();
var cleanupSession2 = /* @__PURE__ */ __name(async (sessionId) => {
  logger_default.info(`Cleaning up proxy session ${sessionId}`);
  const webAppTransport = webAppTransports2.get(sessionId);
  if (webAppTransport) {
    try {
      await webAppTransport.close();
    } catch (error) {
      logger_default.error(
        `Error closing web app transport for session ${sessionId}:`,
        error
      );
    }
    webAppTransports2.delete(sessionId);
  }
  const serverTransport = serverTransports.get(sessionId);
  if (serverTransport) {
    try {
      await serverTransport.close();
    } catch (error) {
      logger_default.error(
        `Error closing server transport for session ${sessionId}:`,
        error
      );
    }
    serverTransports.delete(sessionId);
  }
  logger_default.info(`Session ${sessionId} cleanup completed`);
}, "cleanupSession");
var createTransport = /* @__PURE__ */ __name(async (req) => {
  const query = req.query;
  logger_default.info("Query parameters:", JSON.stringify(query));
  const transportType = query.transportType;
  if (transportType === McpServerTypeEnum2.Enum.STDIO) {
    const command = query.command;
    const origArgs = shellParseArgs(query.args);
    const queryEnv = query.env ? JSON.parse(query.env) : {};
    const resolvedQueryEnv = resolveEnvVariables(queryEnv);
    const env = { ...process.env, ...defaultEnvironment, ...resolvedQueryEnv };
    const { cmd, args } = findActualExecutable(command, origArgs);
    if (isStdioInCooldown(cmd, args, env)) {
      logger_default.info(`STDIO command in cooldown: ${cmd} ${args.join(" ")}`);
      const cooldownEnd = stdioCommandCooldowns.get(
        createStdioKey(cmd, args, env)
      );
      if (cooldownEnd) {
        throw new Error(
          `Command "${cmd} ${args.join(" ")}" is in cooldown. Please wait ${Math.ceil((cooldownEnd - Date.now()) / 1e3)} seconds before retrying.`
        );
      }
    }
    const serverUuid = await extractServerUuidFromStdioCommand(cmd, args);
    if (serverUuid) {
      const isInError = await checkServerErrorStatus(serverUuid);
      if (isInError) {
        throw new Error(
          `Server is in error state and cannot be connected to. Please check the server configuration and try again later.`
        );
      }
    }
    logger_default.info(`STDIO transport: command=${cmd}, args=${args}`);
    const transport = new ProcessManagedStdioTransport({
      command: cmd,
      args,
      env,
      stderr: "pipe"
    });
    try {
      await transport.start();
      return transport;
    } catch (error) {
      setStdioCooldown(cmd, args, env);
      logger_default.info(
        `STDIO command failed, setting cooldown: ${cmd} ${args.join(" ")}`
      );
      throw error;
    }
  } else if (transportType === McpServerTypeEnum2.Enum.SSE) {
    const url = transformDockerUrl(query.url);
    const servers = await mcpServersRepository.findAll();
    const matchingServer = servers.find(
      (server) => server.type === "SSE" && server.url === url
    );
    if (matchingServer) {
      const isInError = await checkServerErrorStatus(matchingServer.uuid);
      if (isInError) {
        throw new Error(
          `Server is in error state and cannot be connected to. Please check the server configuration and try again later.`
        );
      }
    }
    const headers = {
      ...matchingServer?.headers || {},
      ...getHttpHeaders(req, transportType)
    };
    logger_default.info(
      `SSE transport: url=${url}, headers=${JSON.stringify(headers)}`
    );
    const transport = new SSEClientTransport2(new URL(url), {
      eventSourceInit: {
        fetch: /* @__PURE__ */ __name((url2, init) => fetch(url2, { ...init, headers }), "fetch")
      },
      requestInit: {
        headers
      }
    });
    await transport.start();
    return transport;
  } else if (transportType === McpServerTypeEnum2.Enum.STREAMABLE_HTTP) {
    const url = transformDockerUrl(query.url);
    const servers = await mcpServersRepository.findAll();
    const matchingServer = servers.find(
      (server) => server.type === "STREAMABLE_HTTP" && server.url === url
    );
    if (matchingServer) {
      const isInError = await checkServerErrorStatus(matchingServer.uuid);
      if (isInError) {
        throw new Error(
          `Server is in error state and cannot be connected to. Please check the server configuration and try again later.`
        );
      }
    }
    const headers = {
      ...matchingServer?.headers || {},
      ...getHttpHeaders(req, transportType)
    };
    const transport = new StreamableHTTPClientTransport2(new URL(url), {
      requestInit: {
        headers
      }
    });
    await transport.start();
    return transport;
  } else {
    logger_default.error(`Invalid transport type: ${transportType}`);
    throw new Error("Invalid transport type specified");
  }
}, "createTransport");
serverRouter.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  try {
    const transport = webAppTransports2.get(
      sessionId
    );
    if (!transport) {
      res.status(404).end("Session not found");
      return;
    } else {
      await transport.handleRequest(req, res);
    }
  } catch (error) {
    logger_default.error("Error in /mcp route:", error);
    res.status(500).json(error);
  }
});
serverRouter.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let serverTransport;
  if (!sessionId) {
    try {
      logger_default.info("New StreamableHttp connection request");
      try {
        serverTransport = await createTransport(req);
      } catch (error) {
        if (error instanceof SseError && error.code === 401) {
          logger_default.error(
            "Received 401 Unauthorized from MCP server:",
            error.message
          );
          res.status(401).json(error);
          return;
        }
        throw error;
      }
      logger_default.info("Created StreamableHttp server transport");
      if (serverTransport instanceof ProcessManagedStdioTransport) {
        serverTransport.onprocesscrash = async (exitCode, signal) => {
          logger_default.warn(
            `StreamableHttp STDIO process crashed with code: ${exitCode}, signal: ${signal}`
          );
          const query = req.query;
          const command = query.command;
          const origArgs = shellParseArgs(query.args);
          const serverUuid = await extractServerUuidFromStdioCommand(
            command,
            origArgs
          );
          if (serverUuid) {
            mcpServerPool.handleServerCrashWithoutNamespace(serverUuid, exitCode, signal).catch((error) => {
              logger_default.error(
                `Error reporting StreamableHttp STDIO crash to server pool for ${serverUuid}:`,
                error
              );
            });
          } else {
            logger_default.warn(
              `Could not determine server UUID for crashed StreamableHttp STDIO process: ${command} ${origArgs.join(" ")}`
            );
          }
        };
      }
      const newSessionId = randomUUID2();
      const webAppTransport = new StreamableHTTPServerTransport2({
        sessionIdGenerator: /* @__PURE__ */ __name(() => newSessionId, "sessionIdGenerator"),
        onsessioninitialized: /* @__PURE__ */ __name((sessionId2) => {
          webAppTransports2.set(sessionId2, webAppTransport);
          if (serverTransport) {
            serverTransports.set(sessionId2, serverTransport);
          }
          logger_default.info("Client <-> Proxy  sessionId: " + sessionId2);
        }, "onsessioninitialized")
      });
      logger_default.info("Created StreamableHttp client transport");
      await webAppTransport.start();
      try {
        mcpProxy({
          transportToClient: webAppTransport,
          transportToServer: serverTransport,
          onCleanup: /* @__PURE__ */ __name(async () => {
            await cleanupSession2(newSessionId);
          }, "onCleanup")
        });
      } catch (error) {
        logger_default.error(
          `Error setting up proxy for session ${newSessionId}:`,
          error
        );
        await cleanupSession2(newSessionId);
        throw error;
      }
      await webAppTransport.handleRequest(
        req,
        res
      );
    } catch (error) {
      logger_default.error("Error in /mcp POST route:", error);
      res.status(500).json(error);
    }
  } else {
    try {
      const transport = webAppTransports2.get(
        sessionId
      );
      if (!transport) {
        res.status(404).end("Transport not found for sessionId " + sessionId);
      } else {
        await transport.handleRequest(
          req,
          res
        );
      }
    } catch (error) {
      logger_default.error("Error in /mcp route:", error);
      res.status(500).json(error);
    }
  }
});
serverRouter.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const mcpServerName = req.query.mcpServerName || "Unknown Server";
  logger_default.info(
    `Received DELETE message for sessionId ${sessionId}, MCP server: ${mcpServerName}`
  );
  if (sessionId) {
    try {
      const serverTransport = serverTransports.get(
        sessionId
      );
      if (!serverTransport) {
        res.status(404).end("Transport not found for sessionId " + sessionId);
        return;
      }
      try {
        await serverTransport.terminateSession();
      } catch (error) {
        logger_default.warn(`Warning: Error terminating session ${sessionId}:`, error);
      }
      await cleanupSession2(sessionId);
      logger_default.info(
        `Session ${sessionId} terminated and cleaned up successfully`
      );
      res.status(200).end();
    } catch (error) {
      logger_default.error("Error in /mcp DELETE route:", error);
      res.status(500).json(error);
    }
  } else {
    res.status(400).end("Missing sessionId");
  }
});
serverRouter.get("/stdio", async (req, res) => {
  try {
    logger_default.info("New STDIO connection request");
    let serverTransport;
    try {
      serverTransport = await createTransport(req);
      logger_default.info("Created server transport");
    } catch (error) {
      if (error instanceof SseError && error.code === 401) {
        logger_default.error(
          "Received 401 Unauthorized from MCP server. Authentication failure."
        );
        res.status(401).json(error);
        return;
      }
      throw error;
    }
    const webAppTransport = new SSEServerTransport2(
      "/mcp-proxy/server/message",
      res
    );
    logger_default.info("Created client transport");
    webAppTransports2.set(webAppTransport.sessionId, webAppTransport);
    serverTransports.set(webAppTransport.sessionId, serverTransport);
    const handleConnectionClose = /* @__PURE__ */ __name(() => {
      logger_default.info(`Connection closed for session ${webAppTransport.sessionId}`);
      cleanupSession2(webAppTransport.sessionId);
    }, "handleConnectionClose");
    res.on("close", handleConnectionClose);
    res.on("finish", handleConnectionClose);
    res.on("error", (error) => {
      logger_default.error(
        `Response error for SSE session ${webAppTransport.sessionId}:`,
        error
      );
      handleConnectionClose();
    });
    await webAppTransport.start();
    const stdinTransport = serverTransport;
    stdinTransport.onprocesscrash = async (exitCode, signal) => {
      logger_default.warn(
        `STDIO process crashed with code: ${exitCode}, signal: ${signal}`
      );
      const query = req.query;
      const command = query.command;
      const origArgs = shellParseArgs(query.args);
      logger_default.info(
        `STDIO crash handler called for command: ${command} ${origArgs.join(" ")}`
      );
      const serverUuid = await extractServerUuidFromStdioCommand(
        command,
        origArgs
      );
      if (serverUuid) {
        logger_default.info(
          `Reporting crash to server pool for server UUID: ${serverUuid}`
        );
        mcpServerPool.handleServerCrashWithoutNamespace(serverUuid, exitCode, signal).catch((error) => {
          logger_default.error(
            `Error reporting STDIO crash to server pool for ${serverUuid}:`,
            error
          );
        });
      } else {
        logger_default.warn(
          `Could not determine server UUID for crashed STDIO process: ${command} ${origArgs.join(" ")}`
        );
      }
    };
    const commandStartTime = Date.now();
    const QUICK_FAILURE_THRESHOLD = 5e3;
    stdinTransport.onclose = () => {
      const runTime = Date.now() - commandStartTime;
      if (runTime < QUICK_FAILURE_THRESHOLD) {
        const query = req.query;
        const command = query.command;
        const origArgs = shellParseArgs(query.args);
        const queryEnv = query.env ? JSON.parse(query.env) : {};
        const resolvedQueryEnv = resolveEnvVariables(queryEnv);
        const env = {
          ...process.env,
          ...defaultEnvironment,
          ...resolvedQueryEnv
        };
        const { cmd, args } = findActualExecutable(command, origArgs);
        setStdioCooldown(cmd, args, env);
        logger_default.info(
          `STDIO process terminated quickly (${runTime}ms), setting cooldown: ${cmd} ${args.join(" ")}`
        );
      }
    };
    if (stdinTransport.stderr) {
      stdinTransport.stderr.on("data", (chunk) => {
        const errorContent = chunk.toString();
        if (errorContent.includes("MODULE_NOT_FOUND")) {
          webAppTransport.send({
            jsonrpc: "2.0",
            method: "notifications/stderr",
            params: {
              content: "Command not found, transports removed"
            }
          }).catch((error) => {
            if (error?.message && !error.message.includes("Not connected")) {
              logger_default.error("Error sending stderr notification:", error);
            }
          });
          webAppTransport.close();
          cleanupSession2(webAppTransport.sessionId);
          logger_default.error("Command not found, transports removed");
        } else {
          if (errorContent.includes("ENOENT") || errorContent.includes("no such file or directory")) {
            const query = req.query;
            const command = query.command;
            const origArgs = shellParseArgs(query.args);
            const queryEnv = query.env ? JSON.parse(query.env) : {};
            const resolvedQueryEnv = resolveEnvVariables(queryEnv);
            const env = {
              ...process.env,
              ...defaultEnvironment,
              ...resolvedQueryEnv
            };
            const { cmd, args } = findActualExecutable(command, origArgs);
            setStdioCooldown(cmd, args, env);
            logger_default.info(
              `STDIO process reported startup error, setting cooldown: ${cmd} ${args.join(" ")}`
            );
          }
          webAppTransport.send({
            jsonrpc: "2.0",
            method: "notifications/stderr",
            params: {
              content: errorContent
            }
          }).catch((error) => {
            if (error?.message && !error.message.includes("Not connected")) {
              logger_default.error("Error sending stderr notification:", error);
            }
          });
        }
      });
    }
    mcpProxy({
      transportToClient: webAppTransport,
      transportToServer: serverTransport,
      onCleanup: /* @__PURE__ */ __name(async () => {
        await cleanupSession2(webAppTransport.sessionId);
      }, "onCleanup")
    });
  } catch (error) {
    logger_default.error("Error in /stdio route:", error);
    res.status(500).json(error);
  }
});
serverRouter.get("/sse", async (req, res) => {
  try {
    logger_default.info(
      "New SSE connection request. NOTE: The sse transport is deprecated and has been replaced by StreamableHttp"
    );
    let serverTransport;
    try {
      serverTransport = await createTransport(req);
    } catch (error) {
      if (error instanceof SseError && error.code === 401) {
        logger_default.error(
          "Received 401 Unauthorized from MCP server. Authentication failure."
        );
        res.status(401).json(error);
        return;
      } else if (error instanceof SseError && error.code === 404) {
        logger_default.error(
          "Received 404 not found from MCP server. Does the MCP server support SSE?"
        );
        res.status(404).json(error);
        return;
      } else if (JSON.stringify(error).includes("ECONNREFUSED")) {
        logger_default.error("Connection refused. Is the MCP server running?");
        res.status(500).json(error);
      } else {
        throw error;
      }
    }
    if (serverTransport) {
      const webAppTransport = new SSEServerTransport2(
        "/mcp-proxy/server/message",
        res
      );
      webAppTransports2.set(webAppTransport.sessionId, webAppTransport);
      logger_default.info("Created client transport");
      if (serverTransport) {
        serverTransports.set(webAppTransport.sessionId, serverTransport);
      }
      logger_default.info("Created server transport");
      const handleConnectionClose = /* @__PURE__ */ __name(() => {
        logger_default.info(
          `Connection closed for session ${webAppTransport.sessionId}`
        );
        cleanupSession2(webAppTransport.sessionId);
      }, "handleConnectionClose");
      res.on("close", handleConnectionClose);
      res.on("finish", handleConnectionClose);
      res.on("error", (error) => {
        logger_default.error(
          `Response error for STDIO session ${webAppTransport.sessionId}:`,
          error
        );
        handleConnectionClose();
      });
      await webAppTransport.start();
      mcpProxy({
        transportToClient: webAppTransport,
        transportToServer: serverTransport,
        onCleanup: /* @__PURE__ */ __name(async () => {
          await cleanupSession2(webAppTransport.sessionId);
        }, "onCleanup")
      });
    }
  } catch (error) {
    logger_default.error("Error in /sse route:", error);
    res.status(500).json(error);
  }
});
serverRouter.post("/message", async (req, res) => {
  try {
    const sessionId = req.query.sessionId;
    const transport = webAppTransports2.get(
      sessionId
    );
    if (!transport) {
      res.status(404).end("Session not found");
      return;
    }
    await transport.handlePostMessage(req, res);
  } catch (error) {
    logger_default.error("Error in /message route:", error);
    res.status(500).json(error);
  }
});
serverRouter.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});
var server_default = serverRouter;

// src/routers/mcp-proxy.ts
var mcpProxyRouter = express3.Router();
mcpProxyRouter.use(helmet());
mcpProxyRouter.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "mcp-session-id",
      "x-custom-auth-header",
      "last-event-id"
    ]
  })
);
mcpProxyRouter.use((req, res, next) => {
  res.header("Access-Control-Expose-Headers", "mcp-session-id");
  res.header("Access-Control-Expose-Headers", "authorization");
  res.header("Access-Control-Expose-Headers", "last-event-id");
  next();
});
mcpProxyRouter.use("/server", server_default);
mcpProxyRouter.use("/metamcp", metamcp_default);
var mcp_proxy_default = mcpProxyRouter;

// src/routers/oauth/index.ts
init_logger();
init_repositories();
import cors2 from "cors";
import express10 from "express";

// src/routers/oauth/authorization.ts
init_logger();
import express5 from "express";
init_repositories();

// src/routers/oauth/utils.ts
init_logger();
import { createHash, randomBytes } from "crypto";
import express4 from "express";
function generateSecureAuthCode() {
  const randomPart = randomBytes(32).toString("base64url");
  return `mcp_code_${randomPart}`;
}
__name(generateSecureAuthCode, "generateSecureAuthCode");
function generateSecureAccessToken() {
  const randomPart = randomBytes(32).toString("base64url");
  return `mcp_token_${randomPart}`;
}
__name(generateSecureAccessToken, "generateSecureAccessToken");
function generateSecureClientId() {
  const randomPart = randomBytes(16).toString("base64url");
  return `mcp_client_${randomPart}`;
}
__name(generateSecureClientId, "generateSecureClientId");
function generateSecureClientSecret() {
  const randomPart = randomBytes(32).toString("base64url");
  return `mcp_secret_${randomPart}`;
}
__name(generateSecureClientSecret, "generateSecureClientSecret");
function validateRedirectUri(uri, allowedHosts) {
  try {
    const parsedUri = new URL(uri);
    if (!["https:", "http:"].includes(parsedUri.protocol)) {
      return false;
    }
    if (process.env.NODE_ENV === "production" && parsedUri.protocol !== "https:") {
      return false;
    }
    if (process.env.NODE_ENV === "production") {
      const hostname = parsedUri.hostname.toLowerCase();
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.")) {
        return false;
      }
    }
    if (allowedHosts && allowedHosts.length > 0) {
      return allowedHosts.includes(parsedUri.hostname);
    }
    return true;
  } catch {
    return false;
  }
}
__name(validateRedirectUri, "validateRedirectUri");
function getBaseUrl(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  const forwardedHost = req.headers["x-forwarded-host"];
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedHost) {
    const protocol = forwardedProto || "http";
    return `${protocol}://${forwardedHost}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}
__name(getBaseUrl, "getBaseUrl");
function jsonParsingMiddleware(req, res, next) {
  const needsJsonParsing = req.path.startsWith("/oauth/") && req.method === "POST" || req.path === "/oauth/register" && req.method === "POST";
  if (needsJsonParsing) {
    return express4.json({
      limit: "10mb",
      type: "application/json"
    })(req, res, next);
  }
  next();
}
__name(jsonParsingMiddleware, "jsonParsingMiddleware");
function urlencodedParsingMiddleware(req, res, next) {
  const needsUrlencodedParsing = req.path.startsWith("/oauth/") && req.method === "POST" || req.path === "/oauth/register" && req.method === "POST";
  if (needsUrlencodedParsing) {
    return express4.urlencoded({
      extended: true,
      limit: "10mb"
    })(req, res, next);
  }
  next();
}
__name(urlencodedParsingMiddleware, "urlencodedParsingMiddleware");
var RateLimiter = class {
  static {
    __name(this, "RateLimiter");
  }
  attempts = /* @__PURE__ */ new Map();
  maxAttempts;
  windowMs;
  constructor(maxAttempts = 10, windowMs = 15 * 60 * 1e3) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  isRateLimited(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }
    if (record.count >= this.maxAttempts) {
      return true;
    }
    record.count++;
    return false;
  }
  reset(identifier) {
    this.attempts.delete(identifier);
  }
  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.attempts) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
};
var authEndpointLimiter = new RateLimiter(20, 1 * 60 * 1e3);
var tokenEndpointLimiter = new RateLimiter(20, 1 * 60 * 1e3);
setInterval(
  () => {
    authEndpointLimiter.cleanup();
    tokenEndpointLimiter.cleanup();
  },
  10 * 60 * 1e3
);
function rateLimitAuth(req, res, next) {
  const identifier = req.ip || req.socket?.remoteAddress || "unknown";
  if (authEndpointLimiter.isRateLimited(identifier)) {
    logger_default.info(
      `[RATE LIMIT] Authorization endpoint rate limited for IP: ${identifier} - Too many authorization attempts`
    );
    return res.status(429).json({
      error: "too_many_requests",
      error_description: "Too many authorization attempts. Please try again later."
    });
  }
  next();
}
__name(rateLimitAuth, "rateLimitAuth");
function rateLimitToken(req, res, next) {
  const identifier = req.ip || req.socket?.remoteAddress || "unknown";
  if (tokenEndpointLimiter.isRateLimited(identifier)) {
    logger_default.info(
      `[RATE LIMIT] Token endpoint rate limited for IP: ${identifier} - Too many token requests`
    );
    return res.status(429).json({
      error: "too_many_requests",
      error_description: "Too many token requests. Please try again later."
    });
  }
  next();
}
__name(rateLimitToken, "rateLimitToken");
function securityHeaders(req, res, next) {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  if (req.path.includes("/oauth/")) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }
  next();
}
__name(securityHeaders, "securityHeaders");

// src/routers/oauth/authorization.ts
var authorizationRouter = express5.Router();
authorizationRouter.get("/oauth/authorize", rateLimitAuth, async (req, res) => {
  try {
    const {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge,
      code_challenge_method
    } = req.query;
    logger_default.info("OAuth authorize request:", {
      response_type,
      client_id,
      redirect_uri,
      scope,
      state,
      code_challenge_method
    });
    if (response_type !== "code") {
      return res.status(400).json({
        error: "unsupported_response_type",
        error_description: "Only 'code' response type is supported"
      });
    }
    if (!client_id || !redirect_uri) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing required parameters: client_id or redirect_uri"
      });
    }
    if (!code_challenge || !code_challenge_method) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "PKCE parameters (code_challenge and code_challenge_method) are required per OAuth 2.1"
      });
    }
    if (code_challenge_method !== "S256" && code_challenge_method !== "plain") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Unsupported code_challenge_method. Supported: S256, plain"
      });
    }
    if (!validateRedirectUri(redirect_uri)) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Invalid redirect_uri format or insecure scheme"
      });
    }
    const clientData = await oauthRepository.getClient(client_id);
    const finalClientId = client_id;
    if (!clientData) {
      const baseUrl2 = getBaseUrl(req);
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Client not registered. Please register your client first.",
        registration_endpoint: `${baseUrl2}/oauth/register`,
        documentation: "Use the registration endpoint to dynamically register your OAuth client before authorization."
      });
    } else {
      if (!clientData.redirect_uris.includes(redirect_uri)) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "redirect_uri is not registered for this client"
        });
      }
    }
    const oauthParams = {
      client_id: finalClientId,
      redirect_uri,
      scope: scope ? scope : "admin",
      state: state ? state : void 0,
      code_challenge: code_challenge ? code_challenge : void 0,
      code_challenge_method: code_challenge_method ? code_challenge_method : void 0
    };
    logger_default.info(
      `Using client_id: ${finalClientId} (original: ${client_id}) for redirect_uri: ${redirect_uri}`
    );
    const baseUrl = getBaseUrl(req);
    if (req.headers.cookie) {
      try {
        const sessionUrl = new URL("/api/auth/get-session", baseUrl);
        const headers = new Headers();
        headers.set("cookie", req.headers.cookie);
        const sessionRequest = new Request(sessionUrl.toString(), {
          method: "GET",
          headers
        });
        const sessionResponse = await auth.handler(sessionRequest);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          if (sessionData?.user?.id) {
            const code = generateSecureAuthCode();
            await oauthRepository.setAuthCode(code, {
              client_id: oauthParams.client_id,
              redirect_uri: oauthParams.redirect_uri,
              scope: oauthParams.scope || "admin",
              user_id: sessionData.user.id,
              code_challenge: oauthParams.code_challenge || null,
              code_challenge_method: oauthParams.code_challenge_method || null,
              expires_at: Date.now() + 10 * 60 * 1e3
              // 10 minutes
            });
            const redirectUrl = new URL(oauthParams.redirect_uri);
            redirectUrl.searchParams.set("code", code);
            if (oauthParams.state) {
              redirectUrl.searchParams.set("state", oauthParams.state);
            }
            return res.redirect(redirectUrl.toString());
          }
        }
      } catch (error) {
        logger_default.info("Session verification failed, proceeding to login:", error);
      }
    }
    const authUrl = new URL("/login", baseUrl);
    const encodedParams = Buffer.from(JSON.stringify(oauthParams)).toString(
      "base64url"
    );
    authUrl.searchParams.set(
      "callbackUrl",
      `/oauth/callback?params=${encodedParams}`
    );
    res.redirect(authUrl.toString());
  } catch (error) {
    logger_default.error("Error in OAuth authorize endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
authorizationRouter.get("/oauth/callback", async (req, res) => {
  try {
    let oauthParams;
    const { params } = req.query;
    if (params) {
      oauthParams = JSON.parse(
        Buffer.from(params, "base64url").toString()
      );
    } else {
      const { code: code2, state: state2 } = req.query;
      if (!code2) {
        return res.status(400).send("Missing authorization code");
      }
      const codeData = await oauthRepository.getAuthCode(code2);
      if (codeData) {
        if (Date.now() > codeData.expires_at.getTime()) {
          await oauthRepository.deleteAuthCode(code2);
          return res.status(400).send("Authorization code has expired");
        }
        const baseUrl = getBaseUrl(req);
        const ourCallbackUrl = `${baseUrl}/oauth/callback`;
        if (codeData.redirect_uri === ourCallbackUrl || codeData.redirect_uri.includes("/oauth/callback")) {
          return res.send(`
            <html>
              <head><title>OAuth Authorization Successful</title></head>
              <body>
                <h1>Authorization Successful</h1>
                <p>Authorization code: <code>${code2}</code></p>
                <p>State: <code>${state2 || "none"}</code></p>
                <p>You can now exchange this code for an access token using the token endpoint.</p>
                <pre>
POST ${baseUrl}/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "${code2}",
  "client_id": "${codeData.client_id}",
  "redirect_uri": "${codeData.redirect_uri}"
}
                </pre>
              </body>
            </html>
          `);
        }
        const redirectUrl2 = new URL(codeData.redirect_uri);
        redirectUrl2.searchParams.set("code", code2);
        if (state2) {
          redirectUrl2.searchParams.set("state", state2);
        }
        return res.redirect(redirectUrl2.toString());
      } else {
        return res.status(400).json({
          error: "invalid_request",
          error_description: "Invalid authorization parameters"
        });
      }
    }
    const { client_id, redirect_uri, state } = oauthParams;
    if (!req.headers.cookie) {
      const baseUrl = getBaseUrl(req);
      const loginUrl = new URL("/login", baseUrl);
      loginUrl.searchParams.set("callbackUrl", req.originalUrl);
      return res.redirect(loginUrl.toString());
    }
    const sessionUrl = new URL("/api/auth/get-session", getBaseUrl(req));
    const headers = new Headers();
    headers.set("cookie", req.headers.cookie);
    const sessionRequest = new Request(sessionUrl.toString(), {
      method: "GET",
      headers
    });
    const sessionResponse = await auth.handler(sessionRequest);
    if (!sessionResponse.ok) {
      const baseUrl = getBaseUrl(req);
      const loginUrl = new URL("/login", baseUrl);
      loginUrl.searchParams.set("callbackUrl", req.originalUrl);
      return res.redirect(loginUrl.toString());
    }
    const sessionData = await sessionResponse.json();
    if (!sessionData?.user?.id) {
      const baseUrl = getBaseUrl(req);
      const loginUrl = new URL("/login", baseUrl);
      loginUrl.searchParams.set("callbackUrl", req.originalUrl);
      return res.redirect(loginUrl.toString());
    }
    const code = generateSecureAuthCode();
    await oauthRepository.setAuthCode(code, {
      client_id,
      redirect_uri,
      scope: oauthParams.scope || "admin",
      user_id: sessionData.user.id,
      code_challenge: oauthParams.code_challenge || null,
      code_challenge_method: oauthParams.code_challenge_method || null,
      expires_at: Date.now() + 10 * 60 * 1e3
      // 10 minutes
    });
    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", code);
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }
    res.redirect(redirectUrl.toString());
  } catch (error) {
    logger_default.error("Error in OAuth callback:", error);
    res.status(500).send("OAuth callback error");
  }
});
var authorization_default = authorizationRouter;

// src/routers/oauth/metadata.ts
init_logger();
import express6 from "express";
var metadataRouter = express6.Router();
metadataRouter.get(
  "/.well-known/oauth-protected-resource",
  async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const authServerUrl = baseUrl;
      const resourceUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
      const metadata = {
        // Resource identifier - the protected resource's canonical URI
        resource: resourceUrl,
        // List of OAuth authorization server issuer identifiers
        // Point to our better-auth authorization server
        authorization_servers: [authServerUrl],
        // Supported bearer token methods (required by RFC 9728)
        bearer_methods_supported: ["header"],
        // OAuth scopes supported by this protected resource
        // MCP requires admin scope for full access
        scopes_supported: [
          "admin"
          // Administrative access to all MCP resources
        ],
        // Resource name for display purposes
        resource_name: "MetaMCP Protected Resource",
        // OAuth 2.0 DPoP support (disabled for now)
        dpop_bound_access_tokens_required: false,
        // Authorization details types supported (for fine-grained access)
        authorization_details_types_supported: ["mcp_endpoint_access"],
        // Resource server capabilities
        resource_server_capabilities: {
          // Supported token formats
          token_types_supported: ["Bearer"],
          // Token introspection support (proxied through frontend)
          introspection_endpoint: `${baseUrl}/oauth/introspect`,
          // Revocation support (proxied through frontend)
          revocation_endpoint: `${baseUrl}/oauth/revoke`
        }
      };
      res.set({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        // Allow CORS for discovery
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      return res.json(metadata);
    } catch (error) {
      logger_default.error(
        "Error generating OAuth protected resource metadata:",
        error
      );
      return res.status(500).json({
        error: "internal_server_error",
        error_description: "Failed to generate OAuth metadata"
      });
    }
  }
);
metadataRouter.get(
  "/.well-known/oauth-authorization-server",
  async (req, res) => {
    try {
      const baseUrl = getBaseUrl(req);
      const issuerUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
      const metadata = {
        // Issuer identifier (required by RFC 8414)
        issuer: issuerUrl,
        // MCP-compatible OAuth endpoints (proxied through frontend)
        authorization_endpoint: `${baseUrl}/oauth/authorize`,
        token_endpoint: `${baseUrl}/oauth/token`,
        registration_endpoint: `${baseUrl}/oauth/register`,
        userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
        // Supported response types (required by RFC 8414)
        response_types_supported: ["code"],
        // Supported response modes
        response_modes_supported: ["query"],
        // Supported grant types for MCP
        grant_types_supported: ["authorization_code", "refresh_token"],
        // Authentication methods
        token_endpoint_auth_methods_supported: [
          "client_secret_basic",
          "client_secret_post",
          "none"
        ],
        // Token revocation endpoint
        revocation_endpoint: `${baseUrl}/oauth/revoke`,
        // Code challenge methods - PKCE support (OAuth 2.1 compliant)
        code_challenge_methods_supported: ["S256"],
        // OAuth 2.1 compliance indicators
        require_pushed_authorization_requests: false,
        require_request_uri_registration: false
      };
      res.set({
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        // Allow CORS for discovery
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      return res.json(metadata);
    } catch (error) {
      logger_default.error(
        "Error generating OAuth authorization server metadata:",
        error
      );
      return res.status(500).json({
        error: "server_error",
        error_description: "Failed to generate authorization server metadata"
      });
    }
  }
);
var metadata_default = metadataRouter;

// src/routers/oauth/registration.ts
init_logger();
init_repositories();
import express7 from "express";
var registrationRouter = express7.Router();
registrationRouter.post("/oauth/register", rateLimitToken, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Request body is missing or malformed"
      });
    }
    const {
      redirect_uris,
      response_types,
      grant_types,
      client_name,
      client_uri,
      logo_uri,
      scope,
      contacts,
      tos_uri,
      policy_uri,
      token_endpoint_auth_method,
      software_id,
      software_version
    } = req.body;
    if (!redirect_uris || !Array.isArray(redirect_uris) || redirect_uris.length === 0) {
      return res.status(400).json({
        error: "invalid_redirect_uri",
        error_description: "redirect_uris is required and must be a non-empty array"
      });
    }
    for (const uri of redirect_uris) {
      if (!validateRedirectUri(uri)) {
        return res.status(400).json({
          error: "invalid_redirect_uri",
          error_description: `Invalid redirect URI: ${uri}. Must use secure scheme and valid format.`
        });
      }
    }
    const clientGrantTypes = grant_types && Array.isArray(grant_types) ? grant_types : ["authorization_code"];
    const clientResponseTypes = response_types && Array.isArray(response_types) ? response_types : ["code"];
    const clientTokenEndpointAuthMethod = token_endpoint_auth_method || "none";
    const validGrantTypes = [
      "authorization_code",
      "refresh_token",
      "client_credentials"
    ];
    const validResponseTypes = ["code"];
    const validAuthMethods = [
      "none",
      "client_secret_post",
      "client_secret_basic"
    ];
    for (const grantType of clientGrantTypes) {
      if (!validGrantTypes.includes(grantType)) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: `Unsupported grant type: ${grantType}`
        });
      }
    }
    for (const responseType of clientResponseTypes) {
      if (!validResponseTypes.includes(responseType)) {
        return res.status(400).json({
          error: "invalid_request",
          error_description: `Unsupported response type: ${responseType}`
        });
      }
    }
    if (!validAuthMethods.includes(clientTokenEndpointAuthMethod)) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: `Unsupported token endpoint auth method: ${clientTokenEndpointAuthMethod}`
      });
    }
    const clientId = generateSecureClientId();
    let clientSecret = null;
    if (clientTokenEndpointAuthMethod !== "none") {
      clientSecret = generateSecureClientSecret();
    }
    const clientRegistration = {
      client_id: clientId,
      client_secret: clientSecret,
      client_name: client_name || "Unnamed MCP Client",
      redirect_uris,
      grant_types: clientGrantTypes,
      response_types: clientResponseTypes,
      token_endpoint_auth_method: clientTokenEndpointAuthMethod,
      scope: scope || "admin",
      client_uri: client_uri || null,
      logo_uri: logo_uri || null,
      contacts: contacts && Array.isArray(contacts) ? contacts : null,
      tos_uri: tos_uri || null,
      policy_uri: policy_uri || null,
      software_id: software_id || null,
      software_version: software_version || null,
      created_at: /* @__PURE__ */ new Date()
    };
    await oauthRepository.upsertClient(clientRegistration);
    const baseUrl = req.protocol + "://" + req.get("host");
    const response = {
      client_id: clientId,
      client_name: clientRegistration.client_name,
      redirect_uris: clientRegistration.redirect_uris,
      grant_types: clientRegistration.grant_types,
      response_types: clientRegistration.response_types,
      token_endpoint_auth_method: clientRegistration.token_endpoint_auth_method,
      scope: clientRegistration.scope,
      // OAuth 2.1 Security Information
      oauth_compliance: "OAuth 2.1",
      pkce_required: true,
      pkce_methods_supported: ["S256"],
      // Endpoint information for the client
      authorization_endpoint: `${baseUrl}/oauth/authorize`,
      token_endpoint: `${baseUrl}/oauth/token`,
      userinfo_endpoint: `${baseUrl}/oauth/userinfo`,
      revocation_endpoint: `${baseUrl}/oauth/revoke`
    };
    if (clientSecret) {
      response.client_secret = clientSecret;
      response.security_note = "Store client_secret securely. For public clients, use PKCE instead.";
    } else {
      response.security_note = "This client uses PKCE for security. Ensure code_challenge and code_challenge_method are included in authorization requests.";
    }
    if (client_uri) response.client_uri = client_uri;
    if (logo_uri) response.logo_uri = logo_uri;
    if (contacts) response.contacts = contacts;
    if (tos_uri) response.tos_uri = tos_uri;
    if (policy_uri) response.policy_uri = policy_uri;
    if (software_id) response.software_id = software_id;
    if (software_version) response.software_version = software_version;
    res.status(201).json(response);
  } catch (error) {
    logger_default.error("Error in OAuth registration endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error during client registration"
    });
  }
});
registrationRouter.get("/oauth/register", async (req, res) => {
  try {
    const baseUrl = req.protocol + "://" + req.get("host");
    res.json({
      registration_endpoint: `${baseUrl}/oauth/register`,
      oauth_version: "OAuth 2.1",
      description: "Dynamic Client Registration for MetaMCP OAuth Server",
      required_parameters: {
        redirect_uris: "Array of redirect URIs for your application (HTTPS required in production)"
      },
      optional_parameters: {
        client_name: "Human-readable name for your application",
        grant_types: "OAuth grant types (default: ['authorization_code'])",
        response_types: "OAuth response types (default: ['code'])",
        token_endpoint_auth_method: "Client authentication method (default: 'none' for PKCE)",
        scope: "Requested scope (default: 'admin')",
        client_uri: "Homepage URL for your application",
        logo_uri: "Logo URL for your application",
        contacts: "Array of contact email addresses",
        tos_uri: "Terms of service URL",
        policy_uri: "Privacy policy URL"
      },
      security_recommendations: {
        use_pkce: "Always use PKCE (token_endpoint_auth_method: 'none')",
        https_only: "Use HTTPS redirect URIs in production",
        secure_storage: "Store client credentials securely if using client authentication",
        code_challenge_method: "Use 'S256' for code_challenge_method"
      },
      example_registration: {
        method: "POST",
        url: `${baseUrl}/oauth/register`,
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          client_name: "My MCP Application",
          redirect_uris: ["https://myapp.example.com/oauth/callback"],
          grant_types: ["authorization_code"],
          response_types: ["code"],
          token_endpoint_auth_method: "none",
          scope: "admin"
        }
      },
      next_steps: [
        "Register your client using POST to this endpoint",
        "Save the returned client_id",
        "Use PKCE in your authorization requests",
        "Include code_challenge and code_challenge_method=S256",
        "Exchange authorization codes for access tokens"
      ]
    });
  } catch (error) {
    logger_default.error("Error in OAuth registration info endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
var registration_default = registrationRouter;

// src/routers/oauth/token.ts
init_logger();
init_repositories();
import express8 from "express";
var tokenRouter = express8.Router();
tokenRouter.post("/oauth/token", rateLimitToken, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      logger_default.error("Token endpoint: req.body is undefined or invalid", {
        body: req.body,
        bodyType: typeof req.body,
        contentType: req.headers["content-type"],
        method: req.method
      });
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Request body is missing or malformed. Ensure Content-Type is application/json or application/x-www-form-urlencoded"
      });
    }
    const { grant_type, code, redirect_uri, client_id, code_verifier } = req.body;
    if (grant_type !== "authorization_code") {
      return res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Only 'authorization_code' grant type is supported"
      });
    }
    if (!code) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing authorization code"
      });
    }
    const codeData = await oauthRepository.getAuthCode(code);
    if (!codeData) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or expired authorization code"
      });
    }
    if (Date.now() > codeData.expires_at.getTime()) {
      await oauthRepository.deleteAuthCode(code);
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code has expired"
      });
    }
    if (codeData.client_id !== client_id) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Client ID does not match"
      });
    }
    if (codeData.redirect_uri !== redirect_uri) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Redirect URI does not match"
      });
    }
    const clientData = await oauthRepository.getClient(client_id);
    if (!clientData) {
      return res.status(400).json({
        error: "invalid_client",
        error_description: "Client not found or not registered"
      });
    }
    if (clientData.token_endpoint_auth_method === "client_secret_basic") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Client authentication required via Basic auth"
        });
      }
      const credentials = Buffer.from(
        authHeader.substring(6),
        "base64"
      ).toString();
      const [authClientId, authClientSecret] = credentials.split(":");
      if (authClientId !== client_id || authClientSecret !== clientData.client_secret) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid client credentials"
        });
      }
    } else if (clientData.token_endpoint_auth_method === "client_secret_post") {
      const { client_secret } = req.body;
      if (!client_secret || client_secret !== clientData.client_secret) {
        return res.status(401).json({
          error: "invalid_client",
          error_description: "Invalid client secret"
        });
      }
    }
    if (!codeData.code_challenge) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code was not issued with PKCE challenge"
      });
    }
    if (!code_verifier) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "PKCE code verifier is required"
      });
    }
    const crypto4 = await import("crypto");
    let challengeFromVerifier;
    if (codeData.code_challenge_method === "S256") {
      const hash = crypto4.createHash("sha256").update(code_verifier).digest();
      challengeFromVerifier = hash.toString("base64url");
    } else if (codeData.code_challenge_method === "plain") {
      challengeFromVerifier = code_verifier;
    } else {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Unsupported code challenge method"
      });
    }
    if (challengeFromVerifier !== codeData.code_challenge) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "PKCE verification failed"
      });
    }
    await oauthRepository.deleteAuthCode(code);
    const accessToken = generateSecureAccessToken();
    const expiresIn = 3600;
    await oauthRepository.setAccessToken(accessToken, {
      client_id: codeData.client_id,
      user_id: codeData.user_id,
      scope: codeData.scope,
      expires_at: Date.now() + expiresIn * 1e3
    });
    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: expiresIn,
      scope: codeData.scope
    });
  } catch (error) {
    logger_default.error("Error in OAuth token endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
tokenRouter.post("/oauth/introspect", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Request body is missing or malformed"
      });
    }
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing token parameter"
      });
    }
    const tokenData = await oauthRepository.getAccessToken(token);
    if (!tokenData || !token.startsWith("mcp_token_")) {
      return res.json({
        active: false
      });
    }
    if (Date.now() > tokenData.expires_at.getTime()) {
      await oauthRepository.deleteAccessToken(token);
      return res.json({
        active: false
      });
    }
    res.json({
      active: true,
      scope: tokenData.scope,
      client_id: "mcp_client",
      // In production, store and return actual client_id
      token_type: "Bearer",
      exp: Math.floor(tokenData.expires_at.getTime() / 1e3),
      iat: Math.floor((tokenData.expires_at.getTime() - 3600 * 1e3) / 1e3),
      // Issued 1 hour before expiry
      sub: tokenData.user_id
    });
  } catch (error) {
    logger_default.error("Error in OAuth introspect endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
tokenRouter.post("/oauth/revoke", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Request body is missing or malformed"
      });
    }
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Missing token parameter"
      });
    }
    if (await oauthRepository.getAccessToken(token)) {
      await oauthRepository.deleteAccessToken(token);
    } else {
    }
    res.status(200).send();
  } catch (error) {
    logger_default.error("Error in OAuth revoke endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
var token_default = tokenRouter;

// src/routers/oauth/userinfo.ts
init_logger();
init_repositories();
import express9 from "express";
var userinfoRouter = express9.Router();
userinfoRouter.get("/oauth/userinfo", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Missing or invalid authorization header"
      });
    }
    const token = authHeader.substring(7);
    if (!token.startsWith("mcp_token_")) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Invalid access token format"
      });
    }
    const tokenData = await oauthRepository.getAccessToken(token);
    if (!tokenData) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Token not found or expired"
      });
    }
    if (Date.now() > tokenData.expires_at.getTime()) {
      await oauthRepository.deleteAccessToken(token);
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token has expired"
      });
    }
    res.json({
      sub: tokenData.user_id,
      email: `user-${tokenData.user_id}@metamcp.local`,
      name: `MetaMCP User ${tokenData.user_id}`,
      preferred_username: `user_${tokenData.user_id}`,
      scope: tokenData.scope
    });
  } catch (error) {
    logger_default.error("Error in OAuth userinfo endpoint:", error);
    res.status(500).json({
      error: "server_error",
      error_description: "Internal server error"
    });
  }
});
var userinfo_default = userinfoRouter;

// src/routers/oauth/index.ts
var oauthRouter = express10.Router();
setInterval(
  async () => {
    try {
      await oauthRepository.cleanupExpired();
      logger_default.info("Cleaned up expired OAuth codes and tokens");
    } catch (error) {
      logger_default.error("Error cleaning up expired OAuth entries:", error);
    }
  },
  5 * 60 * 1e3
);
oauthRouter.use(
  cors2({
    origin: "*",
    // Allow all origins for OAuth endpoints
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);
oauthRouter.use(securityHeaders);
oauthRouter.use(jsonParsingMiddleware);
oauthRouter.use(urlencodedParsingMiddleware);
oauthRouter.use(metadata_default);
oauthRouter.use(authorization_default);
oauthRouter.use(token_default);
oauthRouter.use(registration_default);
oauthRouter.use(userinfo_default);
var oauth_default = oauthRouter;

// src/routers/public-metamcp.ts
init_logger();
init_endpoints_repo();
import cors3 from "cors";
import express15 from "express";

// src/routers/public-metamcp/openapi/routes.ts
import express11 from "express";

// src/middleware/api-key-oauth.middleware.ts
init_logger();
init_api_keys_repo();

// src/lib/auth-rate-limiter.ts
var AuthRateLimiter = class {
  static {
    __name(this, "AuthRateLimiter");
  }
  attempts = /* @__PURE__ */ new Map();
  maxAttempts;
  windowMs;
  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1e3) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  isRateLimited(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }
    if (now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }
    if (record.count >= this.maxAttempts) {
      return true;
    }
    record.count++;
    return false;
  }
  recordFailedAttempt(identifier) {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    if (!record) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else if (now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
    } else {
      record.count++;
    }
  }
  // Clean up old entries every 10 minutes
  cleanup() {
    const now = Date.now();
    for (const [identifier, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(identifier);
      }
    }
  }
};
var authRateLimiter = new AuthRateLimiter(20, 1 * 60 * 1e3);
setInterval(
  () => {
    authRateLimiter.cleanup();
  },
  10 * 60 * 1e3
);
function getAuthRateLimitIdentifier(req, endpoint) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const endpointId = endpoint.uuid || endpoint.name || "unknown";
  return `${ip}:${endpointId}`;
}
__name(getAuthRateLimitIdentifier, "getAuthRateLimitIdentifier");

// src/middleware/api-key-oauth.middleware.ts
var apiKeysRepository = new ApiKeysRepository();
function getBaseUrl2(req) {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }
  const forwardedHost = req.headers["x-forwarded-host"];
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedHost) {
    const protocol = forwardedProto || "http";
    return `${protocol}://${forwardedHost}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}
__name(getBaseUrl2, "getBaseUrl");
async function validateOAuthToken(token, req) {
  try {
    if (token.startsWith("mcp_token_")) {
      try {
        const baseUrl = getBaseUrl2(req);
        const introspectUrl = new URL("/oauth/introspect", baseUrl);
        const introspectRequest = new Request(introspectUrl.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        });
        const introspectResponse = await fetch(introspectRequest);
        if (!introspectResponse.ok) {
          return { valid: false, error: "Token introspection failed" };
        }
        const introspectData = await introspectResponse.json();
        if (!introspectData.active) {
          return { valid: false, error: "Token is not active" };
        }
        return {
          valid: true,
          user_id: introspectData.sub,
          scopes: introspectData.scope ? introspectData.scope.split(" ") : ["admin"]
        };
      } catch (error) {
        logger_default.error("Error introspecting MCP token:", error);
        return { valid: false, error: "Token validation failed" };
      }
    }
    return { valid: false, error: "Unsupported token format" };
  } catch (error) {
    logger_default.error("Error validating OAuth token:", error);
    return { valid: false, error: "OAuth validation failed" };
  }
}
__name(validateOAuthToken, "validateOAuthToken");
function extractAuthToken(req, endpoint) {
  const apiKeyHeader = req.headers["x-api-key"];
  if (apiKeyHeader) {
    return {
      token: apiKeyHeader,
      source: "x-api-key",
      isOAuthLikeToken: false
    };
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return {
      token,
      source: "authorization",
      isOAuthLikeToken: token.startsWith("mcp_token_")
    };
  }
  if (endpoint.enable_api_key_auth && endpoint.use_query_param_auth) {
    const queryApiKey = req.query.api_key || req.query.apikey;
    if (queryApiKey) {
      return {
        token: queryApiKey,
        source: "query",
        isOAuthLikeToken: false
      };
    }
  }
  return { source: "none", isOAuthLikeToken: false };
}
__name(extractAuthToken, "extractAuthToken");
var authenticateApiKey = /* @__PURE__ */ __name(async (req, res, next) => {
  const authReq = req;
  const endpoint = authReq.endpoint;
  const { token, source, isOAuthLikeToken } = extractAuthToken(req, endpoint);
  if (!endpoint?.enable_api_key_auth && !endpoint?.enable_oauth) {
    return next();
  }
  try {
    if (endpoint.enable_api_key_auth && !endpoint.enable_oauth) {
      if (!token) {
        return sendApiKeyRequiredResponse(res);
      }
      const apiKeyResult = await apiKeysRepository.validateApiKey(token);
      if (apiKeyResult?.valid) {
        authReq.apiKeyUserId = apiKeyResult.user_id || void 0;
        authReq.apiKeyUuid = apiKeyResult.key_uuid;
        authReq.authMethod = "api_key";
        const accessCheckResult = checkApiKeyAccess(apiKeyResult, endpoint);
        if (!accessCheckResult.allowed) {
          return res.status(403).json({
            error: "Access denied",
            message: accessCheckResult.message,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return next();
      } else {
        const rateLimitId = getAuthRateLimitIdentifier(req, endpoint);
        authRateLimiter.recordFailedAttempt(rateLimitId);
        if (authRateLimiter.isRateLimited(rateLimitId)) {
          return res.status(429).json({
            error: "too_many_requests",
            error_description: "Too many failed authentication attempts. Please try again later.",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return res.status(401).json({
          error: "invalid_api_key",
          error_description: "The provided API key is invalid or expired",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    if (endpoint.enable_api_key_auth && endpoint.enable_oauth) {
      if (!token) {
        return sendOAuthChallengeResponse(req, res, endpoint);
      }
      if (isOAuthLikeToken || source === "authorization") {
        const oauthResult = await validateOAuthToken(token, req);
        if (oauthResult.valid) {
          authReq.oauthUserId = oauthResult.user_id;
          authReq.authMethod = "oauth";
          const accessCheckResult = checkOAuthAccess(oauthResult, endpoint);
          if (!accessCheckResult.allowed) {
            return res.status(403).json({
              error: "access_denied",
              error_description: accessCheckResult.message,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          return next();
        }
      }
      const apiKeyResult = await apiKeysRepository.validateApiKey(token);
      if (apiKeyResult?.valid) {
        authReq.apiKeyUserId = apiKeyResult.user_id || void 0;
        authReq.apiKeyUuid = apiKeyResult.key_uuid;
        authReq.authMethod = "api_key";
        const accessCheckResult = checkApiKeyAccess(apiKeyResult, endpoint);
        if (!accessCheckResult.allowed) {
          return res.status(403).json({
            error: "Access denied",
            message: accessCheckResult.message,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return next();
      } else {
        const rateLimitId = getAuthRateLimitIdentifier(req, endpoint);
        authRateLimiter.recordFailedAttempt(rateLimitId);
        if (authRateLimiter.isRateLimited(rateLimitId)) {
          return res.status(429).json({
            error: "too_many_requests",
            error_description: "Too many failed authentication attempts. Please try again later.",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return res.status(401).json({
          error: "invalid_credentials",
          error_description: "Authentication failed. Invalid credentials provided.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    if (!endpoint.enable_api_key_auth && endpoint.enable_oauth) {
      if (!token) {
        return sendOAuthChallengeResponse(req, res, endpoint);
      }
      const oauthResult = await validateOAuthToken(token, req);
      if (oauthResult.valid) {
        authReq.oauthUserId = oauthResult.user_id;
        authReq.authMethod = "oauth";
        const accessCheckResult = checkOAuthAccess(oauthResult, endpoint);
        if (!accessCheckResult.allowed) {
          return res.status(403).json({
            error: "access_denied",
            error_description: accessCheckResult.message,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return next();
      } else {
        const rateLimitId = getAuthRateLimitIdentifier(req, endpoint);
        authRateLimiter.recordFailedAttempt(rateLimitId);
        if (authRateLimiter.isRateLimited(rateLimitId)) {
          return res.status(429).json({
            error: "too_many_requests",
            error_description: "Too many failed authentication attempts. Please try again later.",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        return res.status(401).json({
          error: "invalid_token",
          error_description: "The provided OAuth token is invalid or has expired.",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    return res.status(500).json({
      error: "Internal server error",
      message: "Invalid authentication configuration",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    logger_default.error("Error in authentication middleware:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to validate authentication",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}, "authenticateApiKey");
function checkApiKeyAccess(validation, endpoint) {
  const isPublicApiKey = validation.user_id === null;
  const isPrivateEndpoint = endpoint.user_id !== null;
  if (isPublicApiKey && isPrivateEndpoint) {
    return {
      allowed: false,
      message: "Public API keys cannot access private endpoints. Use a private API key owned by the endpoint owner."
    };
  }
  if (!isPublicApiKey && isPrivateEndpoint && endpoint.user_id !== validation.user_id) {
    return {
      allowed: false,
      message: "You can only access endpoints you own or public endpoints."
    };
  }
  return { allowed: true };
}
__name(checkApiKeyAccess, "checkApiKeyAccess");
function checkOAuthAccess(oauthResult, endpoint) {
  if (!oauthResult.user_id) {
    return {
      allowed: false,
      message: "OAuth token missing user information"
    };
  }
  if (endpoint.user_id === null) {
    return { allowed: true };
  }
  if (endpoint.user_id === oauthResult.user_id) {
    return { allowed: true };
  }
  return {
    allowed: false,
    message: `Access denied. This is a private endpoint owned by another user. You can only access public endpoints or endpoints you own.`
  };
}
__name(checkOAuthAccess, "checkOAuthAccess");
function sendApiKeyRequiredResponse(res) {
  return res.status(401).json({
    error: "authentication_required",
    error_description: "Authentication required via API key",
    supported_methods: [
      "X-API-Key header",
      "query parameter (api_key or apikey)"
    ],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
__name(sendApiKeyRequiredResponse, "sendApiKeyRequiredResponse");
function sendOAuthChallengeResponse(req, res, endpoint) {
  const baseUrl = getBaseUrl2(req);
  const bearerChallenge = [
    `Bearer realm="MetaMCP"`,
    `scope="admin"`,
    `resource_metadata="${baseUrl}/.well-known/oauth-protected-resource"`
  ].join(", ");
  res.set("WWW-Authenticate", bearerChallenge);
  const authMethods = ["Authorization header (Bearer token)"];
  if (endpoint.enable_api_key_auth) {
    authMethods.push("X-API-Key header");
    if (endpoint.use_query_param_auth) {
      authMethods.push("query parameter (api_key or apikey)");
    }
  }
  const errorDescription = endpoint.enable_api_key_auth ? "Authentication required via OAuth bearer token or API key" : "Authentication required via OAuth bearer token";
  return res.status(401).json({
    error: "authentication_required",
    error_description: errorDescription,
    resource_metadata: `${baseUrl}/.well-known/oauth-protected-resource`,
    supported_methods: authMethods,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
__name(sendOAuthChallengeResponse, "sendOAuthChallengeResponse");

// src/routers/public-metamcp/openapi/routes.ts
init_logger();
init_metamcp_server_pool();

// src/middleware/lookup-endpoint-middleware.ts
init_logger();
init_endpoints_repo();
var lookupEndpoint = /* @__PURE__ */ __name(async (req, res, next) => {
  const endpointName = req.params.endpoint_name;
  try {
    const endpoint = await endpointsRepository.findByName(endpointName);
    if (!endpoint) {
      return res.status(404).json({
        error: "Endpoint not found",
        message: `No endpoint found with name: ${endpointName}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const authReq = req;
    authReq.namespaceUuid = endpoint.namespace_uuid;
    authReq.endpointName = endpointName;
    authReq.endpoint = endpoint;
    next();
  } catch (error) {
    logger_default.error("Error looking up endpoint:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Failed to lookup endpoint",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}, "lookupEndpoint");

// src/routers/public-metamcp/openapi/handlers.ts
init_logger();
init_config_service();
init_fetch_metamcp();
init_mcp_server_pool();
init_filter_tools_functional();
init_functional_middleware();
init_tool_overrides_functional();
init_utils();
import {
  CompatibilityCallToolResultSchema as CompatibilityCallToolResultSchema2,
  ListToolsResultSchema as ListToolsResultSchema2
} from "@modelcontextprotocol/sdk/types.js";
var createOriginalListToolsHandler = /* @__PURE__ */ __name((includeInactiveServers = false) => {
  return async (request, context) => {
    const serverParams = await getMcpServers(
      context.namespaceUuid,
      includeInactiveServers
    );
    const allTools = [];
    await Promise.allSettled(
      Object.entries(serverParams).map(async ([mcpServerUuid, params]) => {
        const session = await mcpServerPool.getSession(
          context.sessionId,
          mcpServerUuid,
          params,
          context.namespaceUuid
        );
        if (!session) return;
        const capabilities = session.client.getServerCapabilities();
        if (!capabilities?.tools) return;
        const serverName = params.name || session.client.getServerVersion()?.name || "";
        try {
          const resetTimeoutOnProgress = await configService.getMcpResetTimeoutOnProgress();
          const timeout = await configService.getMcpTimeout();
          const maxTotalTimeout = await configService.getMcpMaxTotalTimeout();
          const mcpRequestOptions = {
            resetTimeoutOnProgress,
            timeout,
            maxTotalTimeout
          };
          const result = await session.client.request(
            {
              method: "tools/list",
              params: { _meta: request.params?._meta }
            },
            ListToolsResultSchema2,
            mcpRequestOptions
          );
          const toolsWithSource = result.tools?.map((tool) => {
            const toolName = `${sanitizeName(serverName)}__${tool.name}`;
            return {
              ...tool,
              name: toolName,
              description: tool.description
            };
          }) || [];
          allTools.push(...toolsWithSource);
        } catch (error) {
          logger_default.error(`Error fetching tools from: ${serverName}`, error);
        }
      })
    );
    return { tools: allTools };
  };
}, "createOriginalListToolsHandler");
var createOriginalCallToolHandler = /* @__PURE__ */ __name(() => {
  const toolToClient = {};
  const toolToServerUuid = {};
  return async (request, context) => {
    const { name, arguments: args } = request.params;
    const firstDoubleUnderscoreIndex = name.indexOf("__");
    if (firstDoubleUnderscoreIndex === -1) {
      throw new Error(`Invalid tool name format: ${name}`);
    }
    const serverPrefix = name.substring(0, firstDoubleUnderscoreIndex);
    const originalToolName = name.substring(firstDoubleUnderscoreIndex + 2);
    const serverParams = await getMcpServers(context.namespaceUuid);
    let targetSession = null;
    for (const [mcpServerUuid, params] of Object.entries(serverParams)) {
      const session = await mcpServerPool.getSession(
        context.sessionId,
        mcpServerUuid,
        params,
        context.namespaceUuid
      );
      if (!session) continue;
      const capabilities = session.client.getServerCapabilities();
      if (!capabilities?.tools) continue;
      const serverName = params.name || session.client.getServerVersion()?.name || "";
      if (sanitizeName(serverName) === serverPrefix) {
        targetSession = session;
        toolToClient[name] = session;
        toolToServerUuid[name] = mcpServerUuid;
        break;
      }
    }
    if (!targetSession) {
      throw new Error(`Unknown tool: ${name}`);
    }
    try {
      const resetTimeoutOnProgress = await configService.getMcpResetTimeoutOnProgress();
      const timeout = await configService.getMcpTimeout();
      const maxTotalTimeout = await configService.getMcpMaxTotalTimeout();
      const mcpRequestOptions = {
        resetTimeoutOnProgress,
        timeout,
        maxTotalTimeout
      };
      const result = await targetSession.client.request(
        {
          method: "tools/call",
          params: {
            name: originalToolName,
            arguments: args || {},
            _meta: {
              progressToken: request.params._meta?.progressToken
            }
          }
        },
        CompatibilityCallToolResultSchema2,
        mcpRequestOptions
      );
      return result;
    } catch (error) {
      logger_default.error(
        `Error calling tool "${name}" through ${targetSession.client.getServerVersion()?.name || "unknown"}:`,
        error
      );
      throw error;
    }
  };
}, "createOriginalCallToolHandler");
var createMiddlewareEnabledHandlers = /* @__PURE__ */ __name((sessionId, namespaceUuid) => {
  const handlerContext = {
    namespaceUuid,
    sessionId
  };
  const originalListToolsHandler = createOriginalListToolsHandler();
  const originalCallToolHandler = createOriginalCallToolHandler();
  const listToolsWithMiddleware = compose(
    createToolOverridesListToolsMiddleware({ cacheEnabled: true }),
    createFilterListToolsMiddleware({ cacheEnabled: true })
    // Add more middleware here as needed
    // createLoggingMiddleware(),
    // createRateLimitingMiddleware(),
  )(originalListToolsHandler);
  const callToolWithMiddleware = compose(
    createFilterCallToolMiddleware({
      cacheEnabled: true,
      customErrorMessage: /* @__PURE__ */ __name((toolName, reason) => `Access denied to tool "${toolName}": ${reason}`, "customErrorMessage")
    }),
    createToolOverridesCallToolMiddleware({ cacheEnabled: true })
    // Add more middleware here as needed
    // createAuditingMiddleware(),
    // createAuthorizationMiddleware(),
  )(originalCallToolHandler);
  return {
    handlerContext,
    listToolsWithMiddleware,
    callToolWithMiddleware
  };
}, "createMiddlewareEnabledHandlers");

// src/routers/public-metamcp/openapi/schema-generator.ts
var generateOpenApiSchema = /* @__PURE__ */ __name(async (tools, endpointName) => {
  const paths = {};
  for (const tool of tools) {
    const toolPath = `/${tool.name}`;
    const operationId = tool.name.replace(/[^a-zA-Z0-9]/g, "_");
    const requestBodySchema = tool.inputSchema || {
      type: "object",
      properties: {}
    };
    const httpMethod = requestBodySchema.properties && Object.keys(requestBodySchema.properties).length > 0 ? "post" : "get";
    const pathDefinition = {
      summary: tool.description || tool.name,
      operationId: `${operationId}`,
      responses: {
        "200": {
          description: "Successful Response",
          content: {
            "application/json": {
              schema: {}
            }
          }
        },
        "422": {
          description: "Validation Error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/HTTPValidationError"
              }
            }
          }
        }
      }
    };
    if (httpMethod === "post") {
      pathDefinition.requestBody = {
        content: {
          "application/json": {
            schema: requestBodySchema
          }
        },
        required: true
      };
    }
    paths[toolPath] = {
      [httpMethod]: pathDefinition
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: `${endpointName} Server`,
      description: `API server for ${endpointName} tools and utilities.`,
      version: "1.0.0"
    },
    paths,
    components: {
      schemas: {
        HTTPValidationError: {
          properties: {
            detail: {
              items: {
                $ref: "#/components/schemas/ValidationError"
              },
              type: "array",
              title: "Detail"
            }
          },
          type: "object",
          title: "HTTPValidationError"
        },
        ValidationError: {
          properties: {
            loc: {
              items: {
                anyOf: [
                  {
                    type: "string"
                  },
                  {
                    type: "integer"
                  }
                ]
              },
              type: "array",
              title: "Location"
            },
            msg: {
              type: "string",
              title: "Message"
            },
            type: {
              type: "string",
              title: "Error Type"
            }
          },
          type: "object",
          required: ["loc", "msg", "type"],
          title: "ValidationError"
        }
      }
    }
  };
}, "generateOpenApiSchema");

// src/routers/public-metamcp/openapi/tool-execution.ts
init_logger();
init_metamcp_server_pool();
var executeToolWithMiddleware = /* @__PURE__ */ __name(async (req, res, toolArguments) => {
  const { namespaceUuid } = req;
  const toolName = req.params.tool_name;
  try {
    const mcpServerInstance = await metaMcpServerPool.getOpenApiServer(namespaceUuid);
    if (!mcpServerInstance) {
      throw new Error("Failed to get MetaMCP server instance from pool");
    }
    const sessionId = `openapi_${namespaceUuid}`;
    const { handlerContext, callToolWithMiddleware } = createMiddlewareEnabledHandlers(sessionId, namespaceUuid);
    const callToolRequest = {
      method: "tools/call",
      params: {
        name: toolName,
        arguments: toolArguments
      }
    };
    const result = await callToolWithMiddleware(
      callToolRequest,
      handlerContext
    );
    if (result.isError) {
      return res.status(403).json({
        error: "Tool access denied",
        message: result.content?.[0]?.text || "Tool is inactive",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.json(result);
  } catch (error) {
    logger_default.error(`Error executing tool ${toolName}:`, error);
    if (error instanceof Error) {
      if (error.message.includes("Unknown tool")) {
        return res.status(404).json({
          error: "Tool not found",
          message: `Tool '${toolName}' not found`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      return res.status(500).json({
        error: "Tool execution failed",
        message: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to execute tool",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
}, "executeToolWithMiddleware");

// src/routers/public-metamcp/openapi/routes.ts
var openApiRouter = express11.Router();
openApiRouter.get(
  "/:endpoint_name/api",
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    const { endpointName } = req;
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>${endpointName} API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: '/metamcp/${endpointName}/api/openapi.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
        }
    </script>
</body>
</html>`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  }
);
openApiRouter.get(
  "/:endpoint_name/api/openapi.json",
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    const { namespaceUuid, endpointName } = req;
    try {
      const mcpServerInstance = await metaMcpServerPool.getOpenApiServer(namespaceUuid);
      if (!mcpServerInstance) {
        throw new Error("Failed to get MetaMCP server instance from pool");
      }
      const sessionId = `openapi_${namespaceUuid}`;
      const { handlerContext, listToolsWithMiddleware } = createMiddlewareEnabledHandlers(sessionId, namespaceUuid);
      const listToolsRequest = {
        method: "tools/list",
        params: {}
      };
      const result = await listToolsWithMiddleware(
        listToolsRequest,
        handlerContext
      );
      const openApiSchema = await generateOpenApiSchema(
        result.tools || [],
        endpointName
      );
      res.json(openApiSchema);
    } catch (error) {
      logger_default.error("Error generating OpenAPI schema:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to generate OpenAPI schema",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
);
openApiRouter.post(
  "/:endpoint_name/api/:tool_name",
  express11.json(),
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    await executeToolWithMiddleware(
      req,
      res,
      req.body || {}
    );
  }
);
openApiRouter.get(
  "/:endpoint_name/api/:tool_name",
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    await executeToolWithMiddleware(req, res, {});
  }
);
var routes_default = openApiRouter;

// src/routers/public-metamcp/admin.ts
import express12 from "express";
init_logger();
init_repositories();
init_server_error_tracker();
var adminRouter = express12.Router();
adminRouter.use(express12.json());
adminRouter.post(
  "/:endpoint_name/admin/reset-errors",
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    try {
      const { serverUuid } = req.body || {};
      const resetResults = [];
      if (serverUuid) {
        await serverErrorTracker.resetServerErrorState(serverUuid);
        resetResults.push(serverUuid);
        logger_default.info(
          `Admin API: Reset error state for server ${serverUuid}`
        );
      } else {
        const allServers = await mcpServersRepository.findAll();
        const errorServers = allServers.filter(
          (s) => s.error_status === "ERROR"
        );
        for (const server of errorServers) {
          await serverErrorTracker.resetServerErrorState(server.uuid);
          resetResults.push(server.name || server.uuid);
        }
        serverErrorTracker.resetAllAttempts();
        logger_default.info(
          `Admin API: Reset ${resetResults.length} servers from ERROR state: ${resetResults.join(", ")}`
        );
      }
      initializeIdleServers().catch((err) => {
        logger_default.error("Admin API: Error re-initializing idle servers:", err);
      });
      res.json({
        success: true,
        reset: resetResults.length,
        servers: resetResults,
        message: resetResults.length > 0 ? `Reset ${resetResults.length} server(s). Idle session re-initialization triggered.` : "No servers were in ERROR state."
      });
    } catch (error) {
      logger_default.error("Admin API: Error resetting server errors:", error);
      res.status(500).json({
        success: false,
        error: "Failed to reset server errors",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
);
adminRouter.get(
  "/:endpoint_name/admin/error-status",
  lookupEndpoint,
  authenticateApiKey,
  async (req, res) => {
    try {
      const allServers = await mcpServersRepository.findAll();
      const serverStatuses = allServers.map((s) => ({
        uuid: s.uuid,
        name: s.name,
        error_status: s.error_status,
        attempts: serverErrorTracker.getServerAttempts(s.uuid)
      }));
      const errorCount = serverStatuses.filter(
        (s) => s.error_status === "ERROR"
      ).length;
      res.json({
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        total: serverStatuses.length,
        errored: errorCount,
        servers: serverStatuses
      });
    } catch (error) {
      logger_default.error("Admin API: Error fetching server statuses:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch server statuses"
      });
    }
  }
);
var admin_default = adminRouter;

// src/routers/public-metamcp/sse.ts
import { SSEServerTransport as SSEServerTransport3 } from "@modelcontextprotocol/sdk/server/sse.js";
import express13 from "express";

// src/lib/rate-limit.ts
init_logger();
init_mcp_server_pool();
var RateLimitError = class extends Error {
  static {
    __name(this, "RateLimitError");
  }
  code;
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.code = -32e3;
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var TokenBucketRateLimiter = class {
  static {
    __name(this, "TokenBucketRateLimiter");
  }
  capacity;
  refillRate;
  tokens;
  lastRefill;
  constructor(capacity, refillRate) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now() / 1e3;
  }
  async consume(tokens = 1) {
    const now = Date.now() / 1e3;
    const elapsed = now - this.lastRefill;
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillRate
    );
    this.lastRefill = now;
    logger_default.debug("tokens", this.tokens);
    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }
};
var SlidingWindowRateLimiter = class {
  static {
    __name(this, "SlidingWindowRateLimiter");
  }
  clientMaxRate;
  clientMaxRateSeconds;
  requests = [];
  constructor(clientMaxRate, clientMaxRateSeconds) {
    this.clientMaxRate = clientMaxRate;
    this.clientMaxRateSeconds = clientMaxRateSeconds;
  }
  async isAllowed() {
    const now = Date.now() / 1e3;
    const cutoff = now - this.clientMaxRateSeconds;
    this.requests = this.requests.filter((t2) => t2 >= cutoff);
    if (this.requests.length < this.clientMaxRate) {
      this.requests.push(now);
      return true;
    }
    return false;
  }
};
var RateLimiting = class {
  static {
    __name(this, "RateLimiting");
  }
  maxRateSeconds;
  maxRate;
  limiters;
  constructor() {
    this.maxRateSeconds = 0;
    this.maxRate = 0;
    this.limiters = /* @__PURE__ */ new Map();
  }
  async onRequest(context, callNext) {
    const { endpoint } = context.req;
    const { user_id, namespace_uuid } = endpoint;
    const backgroundIdleSessions = mcpServerPool.getBackgroundIdleSessionsByNamespace();
    let limiter = this.limiters.get(namespace_uuid);
    this.maxRateSeconds = endpoint.max_rate_seconds ?? 0;
    this.maxRate = endpoint.max_rate ?? 0;
    if (backgroundIdleSessions.size > 0) {
      if (backgroundIdleSessions.get(namespace_uuid)?.get("status") === "created") {
        if (!backgroundIdleSessions.get(namespace_uuid)?.has(user_id)) {
          backgroundIdleSessions.get(namespace_uuid)?.set(user_id, "initialized");
          if (!limiter) {
            this.limiters.set(
              namespace_uuid,
              new TokenBucketRateLimiter(this.maxRate, this.maxRateSeconds)
            );
            limiter = this.limiters.get(namespace_uuid);
          }
        }
      }
      const allowed = await limiter?.consume();
      if (!allowed) {
        throw new RateLimitError(`Rate limit exceeded`);
      }
    }
    return callNext(context);
  }
};
var SlidingWindowRateLimiting = class {
  static {
    __name(this, "SlidingWindowRateLimiting");
  }
  limiters;
  clientMaxRate;
  clientMaxRateSeconds;
  clientMaxRateStrategy;
  clientMaxRateStrategyKey;
  constructor() {
    this.clientMaxRate = 0;
    this.clientMaxRateSeconds = 0;
    this.clientMaxRateStrategy = "ip";
    this.clientMaxRateStrategyKey = "x-forwarded-for";
    this.limiters = /* @__PURE__ */ new Map();
  }
  async onRequest(context, callNext) {
    const { endpoint, socket, headers } = context.req;
    const { namespace_uuid } = endpoint;
    this.clientMaxRate = endpoint.client_max_rate;
    this.clientMaxRateSeconds = endpoint.client_max_rate_seconds;
    this.clientMaxRateStrategy = endpoint.client_max_rate_strategy === "" ? this.clientMaxRateStrategy : endpoint.client_max_rate_strategy;
    this.clientMaxRateStrategyKey = endpoint.client_max_rate_strategy_key === "" ? this.clientMaxRateStrategyKey : endpoint.client_max_rate_strategy_key;
    const backgroundIdleSessions = mcpServerPool.getBackgroundIdleSessionsByNamespace();
    const key = headers[this.clientMaxRateStrategyKey] || socket.remoteAddress;
    let limiter = this.limiters.get(key);
    if (backgroundIdleSessions.size > 0) {
      if (backgroundIdleSessions.get(namespace_uuid)?.get("status") === "created") {
        if (!backgroundIdleSessions.get(namespace_uuid)?.has(key)) {
          backgroundIdleSessions.get(namespace_uuid)?.set(key, "initialized");
          if (!limiter) {
            this.limiters.set(
              key,
              (/* @__PURE__ */ new Map()).set(
                namespace_uuid,
                new SlidingWindowRateLimiter(
                  this.clientMaxRate,
                  this.clientMaxRateSeconds
                )
              )
            );
            limiter = this.limiters.get(key);
          } else {
            if (!limiter.has(key)) {
              limiter.set(
                namespace_uuid,
                new SlidingWindowRateLimiter(
                  this.clientMaxRate,
                  this.clientMaxRateSeconds
                )
              );
            }
          }
        }
      }
      const slidingWindowLimiter = limiter?.get(namespace_uuid);
      if (slidingWindowLimiter) {
        const allowed = await slidingWindowLimiter?.isAllowed();
        if (!allowed) {
          throw new RateLimitError(
            `Rate limit exceeded: ${this.clientMaxRate} requests per ${this.clientMaxRateSeconds} second/s`
          );
        }
      }
    }
    return callNext(context);
  }
  async onResponse(context, callNext) {
    return callNext(context);
  }
};

// src/middleware/rate-limit.middleware.ts
var slidingWindowRateLimit = new SlidingWindowRateLimiting();
var tokenBucketRateLimit = new RateLimiting();
var tokenBucketRateLimiter = /* @__PURE__ */ __name(() => {
  const limiter = tokenBucketRateLimit;
  return async function(req, res, next) {
    try {
      await limiter.onRequest({ req }, async () => {
        return next();
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        res.status(503).json({ error: err.message });
      } else {
        next(err);
      }
    }
  };
}, "tokenBucketRateLimiter");
var slidingWindowRateLimiter = /* @__PURE__ */ __name(() => {
  const limiter = slidingWindowRateLimit;
  return async function(req, res, next) {
    try {
      await limiter.onRequest({ req }, async () => {
        return next();
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        res.status(429).json({ error: err.message });
      } else {
        next(err);
      }
    }
  };
}, "slidingWindowRateLimiter");
var rateLimiter = /* @__PURE__ */ __name(() => {
  return async function(req, res, next) {
    try {
      await slidingWindowRateLimit.onRequest({ req }, async () => {
        try {
          await tokenBucketRateLimit.onRequest({ req }, async () => {
            return next();
          });
        } catch (err) {
          if (err instanceof RateLimitError) {
            res.status(503).json({ error: err.message });
          } else {
            next(err);
          }
        }
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        res.status(429).json({ error: err.message });
      } else {
        next(err);
      }
    }
  };
}, "rateLimiter");
var rateLimitMiddleware = /* @__PURE__ */ __name((req, res, next) => {
  const { endpoint } = req;
  if (endpoint.enable_client_max_rate && endpoint.enable_max_rate) {
    rateLimiter()(req, res, next);
  } else if (endpoint.enable_client_max_rate) {
    slidingWindowRateLimiter()(req, res, next);
  } else if (endpoint.enable_max_rate) {
    tokenBucketRateLimiter()(req, res, next);
  } else {
    next();
  }
}, "rateLimitMiddleware");

// src/routers/public-metamcp/sse.ts
init_logger();
init_metamcp_server_pool();

// src/lib/session-lifetime-manager.ts
init_logger();
init_config_service();
var SessionLifetimeManagerImpl = class {
  static {
    __name(this, "SessionLifetimeManagerImpl");
  }
  sessions = /* @__PURE__ */ new Map();
  sessionTimestamps = /* @__PURE__ */ new Map();
  cleanupTimer = null;
  name;
  constructor(name) {
    this.name = name;
  }
  addSession(sessionId, session) {
    this.sessions.set(sessionId, session);
    this.sessionTimestamps.set(sessionId, Date.now());
  }
  removeSession(sessionId) {
    this.sessions.delete(sessionId);
    this.sessionTimestamps.delete(sessionId);
  }
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }
  getAllSessions() {
    return new Map(this.sessions);
  }
  getSessionAge(sessionId) {
    const timestamp2 = this.sessionTimestamps.get(sessionId);
    return timestamp2 ? Date.now() - timestamp2 : void 0;
  }
  async isSessionExpired(sessionId) {
    const age = this.getSessionAge(sessionId);
    if (age === void 0) return false;
    const sessionLifetime = await configService.getSessionLifetime();
    if (sessionLifetime === null) return false;
    return age > sessionLifetime;
  }
  async cleanupExpiredSessions(cleanupCallback) {
    try {
      const sessionLifetime = await configService.getSessionLifetime();
      if (sessionLifetime === null) {
        return;
      }
      const now = Date.now();
      const expiredSessions = [];
      for (const [sessionId, timestamp2] of this.sessionTimestamps.entries()) {
        if (now - timestamp2 > sessionLifetime) {
          const session = this.sessions.get(sessionId);
          if (session) {
            expiredSessions.push({ sessionId, session });
          }
        }
      }
      if (expiredSessions.length > 0) {
        logger_default.info(
          `Cleaning up ${expiredSessions.length} expired ${this.name} sessions: ${expiredSessions.map((s) => s.sessionId).join(", ")}`
        );
        await Promise.allSettled(
          expiredSessions.map(
            ({ sessionId, session }) => cleanupCallback(sessionId, session)
          )
        );
      }
    } catch (error) {
      logger_default.error(
        `Error during automatic ${this.name} session cleanup:`,
        error
      );
    }
  }
  startCleanupTimer(cleanupCallback, intervalMs = 5 * 60 * 1e3) {
    this.cleanupTimer = setInterval(async () => {
      await this.cleanupExpiredSessions(cleanupCallback);
    }, intervalMs);
  }
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  // Utility methods for getting session counts and IDs
  getSessionCount() {
    return this.sessions.size;
  }
  getSessionIds() {
    return Array.from(this.sessions.keys());
  }
  getSessionTimestamps() {
    return new Map(this.sessionTimestamps);
  }
};

// src/routers/public-metamcp/sse.ts
var sseRouter = express13.Router();
var sessionManager = new SessionLifetimeManagerImpl("SSE");
var cleanupSession3 = /* @__PURE__ */ __name(async (sessionId, transport) => {
  logger_default.info(`Cleaning up SSE session ${sessionId}`);
  try {
    const sessionTransport = transport || sessionManager.getSession(sessionId);
    if (sessionTransport) {
      logger_default.info(`Closing transport for session ${sessionId}`);
      await sessionTransport.close();
      logger_default.info(`Transport cleaned up for session ${sessionId}`);
    } else {
      logger_default.info(`No transport found for session ${sessionId}`);
    }
    sessionManager.removeSession(sessionId);
    await metaMcpServerPool.cleanupSession(sessionId);
    logger_default.info(`Session ${sessionId} cleanup completed successfully`);
  } catch (error) {
    logger_default.error(`Error during cleanup of session ${sessionId}:`, error);
    sessionManager.removeSession(sessionId);
    logger_default.info(`Removed orphaned session ${sessionId} due to cleanup error`);
    throw error;
  }
}, "cleanupSession");
sseRouter.get(
  "/:endpoint_name/sse",
  lookupEndpoint,
  authenticateApiKey,
  rateLimitMiddleware,
  async (req, res) => {
    const authReq = req;
    const { namespaceUuid, endpointName } = authReq;
    try {
      logger_default.info(
        `New public endpoint SSE connection request for ${endpointName} -> namespace ${namespaceUuid}`
      );
      const webAppTransport = new SSEServerTransport3(
        `/metamcp/${endpointName}/message`,
        res
      );
      logger_default.info("Created public endpoint SSE transport");
      const sessionId = webAppTransport.sessionId;
      const mcpServerInstance = await metaMcpServerPool.getServer(
        sessionId,
        namespaceUuid
      );
      if (!mcpServerInstance) {
        throw new Error("Failed to get MetaMCP server instance from pool");
      }
      logger_default.info(
        `Using MetaMCP server instance for public endpoint session ${sessionId}`
      );
      sessionManager.addSession(sessionId, webAppTransport);
      res.on("close", async () => {
        logger_default.info(
          `Public endpoint SSE connection closed for session ${sessionId}`
        );
        await cleanupSession3(sessionId);
      });
      await mcpServerInstance.server.connect(webAppTransport);
    } catch (error) {
      logger_default.error("Error in public endpoint /sse route:", error);
      res.status(500).json(error);
    }
  }
);
sseRouter.post(
  "/:endpoint_name/message",
  lookupEndpoint,
  authenticateApiKey,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const sessionId = req.query.sessionId;
      const transport = sessionManager.getSession(
        sessionId
      );
      if (!transport) {
        res.status(404).end("Session not found");
        return;
      }
      await transport.handlePostMessage(req, res);
    } catch (error) {
      logger_default.error("Error in public endpoint /message route:", error);
      res.status(500).json(error);
    }
  }
);
sessionManager.startCleanupTimer(async (sessionId, transport) => {
  await cleanupSession3(sessionId, transport);
});
var sse_default = sseRouter;

// src/routers/public-metamcp/streamable-http.ts
import { randomUUID as randomUUID3 } from "crypto";
import { StreamableHTTPServerTransport as StreamableHTTPServerTransport3 } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express14 from "express";
init_logger();
init_metamcp_server_pool();
var streamableHttpRouter = express14.Router();
var sessionManager2 = new SessionLifetimeManagerImpl(
  "StreamableHTTP"
);
var cleanupSession4 = /* @__PURE__ */ __name(async (sessionId, transport) => {
  logger_default.info(`Cleaning up StreamableHTTP session ${sessionId}`);
  try {
    const sessionTransport = transport || sessionManager2.getSession(sessionId);
    if (sessionTransport) {
      logger_default.info(`Closing transport for session ${sessionId}`);
      await sessionTransport.close();
      logger_default.info(`Transport cleaned up for session ${sessionId}`);
    } else {
      logger_default.info(`No transport found for session ${sessionId}`);
    }
    sessionManager2.removeSession(sessionId);
    await metaMcpServerPool.cleanupSession(sessionId);
    logger_default.info(`Session ${sessionId} cleanup completed successfully`);
  } catch (error) {
    logger_default.error(`Error during cleanup of session ${sessionId}:`, error);
    sessionManager2.removeSession(sessionId);
    logger_default.info(`Removed orphaned session ${sessionId} due to cleanup error`);
    throw error;
  }
}, "cleanupSession");
streamableHttpRouter.get("/health/sessions", (req, res) => {
  const sessionIds = sessionManager2.getSessionIds();
  const poolStatus = metaMcpServerPool.getPoolStatus();
  res.json({
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    streamableHttpSessions: {
      count: sessionIds.length,
      sessionIds
    },
    metaMcpPoolStatus: poolStatus,
    totalActiveSessions: sessionIds.length + poolStatus.active
  });
});
streamableHttpRouter.get(
  "/:endpoint_name/mcp",
  lookupEndpoint,
  authenticateApiKey,
  rateLimitMiddleware,
  async (req, res) => {
    const sessionId = req.headers["mcp-session-id"];
    try {
      logger_default.info(`Looking up existing session: ${sessionId}`);
      logger_default.info(`Available sessions:`, sessionManager2.getSessionIds());
      const transport = sessionManager2.getSession(sessionId);
      if (!transport) {
        logger_default.info(`Session ${sessionId} not found in session manager`);
        res.status(404).end("Session not found");
        return;
      } else {
        logger_default.info(`Found session ${sessionId}, handling request`);
        await transport.handleRequest(req, res);
      }
    } catch (error) {
      logger_default.error("Error in public endpoint /mcp route:", error);
      res.status(500).json(error);
    }
  }
);
streamableHttpRouter.post(
  "/:endpoint_name/mcp",
  lookupEndpoint,
  authenticateApiKey,
  rateLimitMiddleware,
  async (req, res) => {
    const authReq = req;
    const { namespaceUuid, endpointName } = authReq;
    const sessionId = req.headers["mcp-session-id"];
    logger_default.info(`POST /mcp request for endpoint: ${endpointName}`);
    logger_default.info(`Authentication method: ${authReq.authMethod || "none"}`);
    logger_default.info(`Session ID: ${sessionId || "new session"}`);
    if (!sessionId) {
      try {
        logger_default.info(
          `New public endpoint StreamableHttp connection request for ${endpointName} -> namespace ${namespaceUuid}`
        );
        const newSessionId = randomUUID3();
        logger_default.info(
          `Generated new session ID: ${newSessionId} for endpoint: ${endpointName}`
        );
        const mcpServerInstance = await metaMcpServerPool.getServer(
          newSessionId,
          namespaceUuid
        );
        if (!mcpServerInstance) {
          throw new Error("Failed to get MetaMCP server instance from pool");
        }
        logger_default.info(
          `Using MetaMCP server instance for public endpoint session ${newSessionId} (endpoint: ${endpointName})`
        );
        const transport = new StreamableHTTPServerTransport3({
          sessionIdGenerator: /* @__PURE__ */ __name(() => newSessionId, "sessionIdGenerator"),
          onsessioninitialized: /* @__PURE__ */ __name(async (sessionId2) => {
            try {
              logger_default.info(`Session initialized for sessionId: ${sessionId2}`);
            } catch (error) {
              logger_default.error(
                `Error initializing public endpoint session ${sessionId2}:`,
                error
              );
            }
          }, "onsessioninitialized")
        });
        logger_default.info("Created public endpoint StreamableHttp transport");
        logger_default.info(
          `Session ${newSessionId} will be cleaned up when DELETE request is received`
        );
        sessionManager2.addSession(newSessionId, transport);
        logger_default.info(
          `Public Endpoint Client <-> Proxy sessionId: ${newSessionId} for endpoint ${endpointName} -> namespace ${namespaceUuid}`
        );
        logger_default.info(`Stored transport for sessionId: ${newSessionId}`);
        logger_default.info(`Current stored sessions:`, sessionManager2.getSessionIds());
        logger_default.info(
          `Total active sessions: ${sessionManager2.getSessionCount()}`
        );
        await mcpServerInstance.server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (error) {
        logger_default.error("Error in public endpoint /mcp POST route:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          error: "Internal server error",
          message: errorMessage,
          endpoint: endpointName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    } else {
      logger_default.info(`Available session IDs:`, sessionManager2.getSessionIds());
      logger_default.info(`Looking for sessionId: ${sessionId}`);
      try {
        logger_default.info(`Looking up existing session: ${sessionId}`);
        logger_default.info(`Available sessions:`, sessionManager2.getSessionIds());
        const transport = sessionManager2.getSession(sessionId);
        if (!transport) {
          logger_default.error(
            `Transport not found for sessionId ${sessionId}. Available sessions:`,
            sessionManager2.getSessionIds()
          );
          res.status(404).json({
            error: "Session not found",
            message: `Transport not found for sessionId ${sessionId}`,
            available_sessions: sessionManager2.getSessionIds(),
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        } else {
          logger_default.info(`Found session ${sessionId}, handling request`);
          await transport.handleRequest(req, res);
        }
      } catch (error) {
        logger_default.error("Error in public endpoint /mcp route:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          error: "Internal server error",
          message: errorMessage,
          session_id: sessionId,
          endpoint: endpointName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
  }
);
streamableHttpRouter.delete(
  "/:endpoint_name/mcp",
  lookupEndpoint,
  authenticateApiKey,
  rateLimitMiddleware,
  async (req, res) => {
    const authReq = req;
    const { namespaceUuid, endpointName } = authReq;
    const sessionId = req.headers["mcp-session-id"];
    logger_default.info(
      `Received DELETE message for public endpoint ${endpointName} -> namespace ${namespaceUuid} sessionId ${sessionId}`
    );
    if (sessionId) {
      try {
        logger_default.info(`Starting cleanup for session ${sessionId}`);
        logger_default.info(
          `Available sessions before cleanup:`,
          sessionManager2.getSessionIds()
        );
        await cleanupSession4(sessionId);
        logger_default.info(
          `Public endpoint session ${sessionId} cleaned up successfully`
        );
        logger_default.info(
          `Available sessions after cleanup:`,
          sessionManager2.getSessionIds()
        );
        res.status(200).json({
          message: "Session cleaned up successfully",
          sessionId,
          remainingSessions: sessionManager2.getSessionIds()
        });
      } catch (error) {
        logger_default.error("Error in public endpoint /mcp DELETE route:", error);
        res.status(500).json({
          error: "Cleanup failed",
          message: error instanceof Error ? error.message : "Unknown error",
          sessionId
        });
      }
    } else {
      res.status(400).json({
        error: "Missing sessionId",
        message: "sessionId header is required for cleanup"
      });
    }
  }
);
sessionManager2.startCleanupTimer(async (sessionId, transport) => {
  await cleanupSession4(sessionId, transport);
});
var streamable_http_default = streamableHttpRouter;

// src/routers/public-metamcp.ts
var publicEndpointsRouter = express15.Router();
publicEndpointsRouter.use(
  cors3({
    origin: true,
    // Allow all origins
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "mcp-session-id",
      "Authorization",
      "X-API-Key"
    ]
  })
);
publicEndpointsRouter.use((req, res, next) => {
  if (req.path.includes("/api/tools/") && req.method === "POST") {
    return express15.json({ limit: "50mb" })(req, res, next);
  }
  next();
});
publicEndpointsRouter.use(streamable_http_default);
publicEndpointsRouter.use(sse_default);
publicEndpointsRouter.use(routes_default);
publicEndpointsRouter.use(admin_default);
publicEndpointsRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "public-endpoints"
  });
});
publicEndpointsRouter.get("/", async (req, res) => {
  try {
    const endpoints = await endpointsRepository.findAllWithNamespaces();
    const publicEndpoints = endpoints.map((endpoint) => ({
      name: endpoint.name,
      description: endpoint.description,
      namespace: endpoint.namespace.name,
      endpoints: {
        mcp: `/metamcp/${endpoint.name}/mcp`,
        sse: `/metamcp/${endpoint.name}/sse`,
        api: `/metamcp/${endpoint.name}/api`,
        openapi: `/metamcp/${endpoint.name}/api/openapi.json`
      }
    }));
    res.json({
      service: "public-endpoints",
      version: "1.0.0",
      description: "Public MetaMCP endpoints",
      endpoints: publicEndpoints
    });
  } catch (error) {
    logger_default.error("Error listing public endpoints:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to list endpoints"
    });
  }
});
var public_metamcp_default = publicEndpointsRouter;

// src/routers/trpc.ts
import { createAppRouter } from "@repo/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import cors4 from "cors";
import express16 from "express";
import helmet2 from "helmet";

// src/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
init_logger();
var createContext = /* @__PURE__ */ __name(async ({
  req,
  res
}) => {
  let user;
  let session;
  try {
    if (req.headers.cookie) {
      const sessionUrl = new URL(
        "/api/auth/get-session",
        `http://${req.headers.host}`
      );
      const headers = new Headers();
      headers.set("cookie", req.headers.cookie);
      const sessionRequest = new Request(sessionUrl.toString(), {
        method: "GET",
        headers
      });
      const sessionResponse = await auth.handler(sessionRequest);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData?.user && sessionData?.session) {
          user = sessionData.user;
          session = sessionData.session;
        }
      }
    }
  } catch (error) {
    logger_default.error("Error getting session in tRPC context:", error);
  }
  return {
    req,
    res,
    user,
    session
  };
}, "createContext");
var t = initTRPC.context().create();
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource"
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Override types to indicate user and session are guaranteed to exist
      user: ctx.user,
      session: ctx.session
    }
  });
});

// src/trpc/api-keys.impl.ts
init_logger();
init_repositories();
init_serializers();
var apiKeysRepository2 = new ApiKeysRepository();
var apiKeysImplementations = {
  create: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const apiKeyUserId = input.user_id !== void 0 ? input.user_id : userId;
      const result = await apiKeysRepository2.create({
        name: input.name,
        user_id: apiKeyUserId,
        is_active: true
      });
      return ApiKeysSerializer.serializeCreateApiKeyResponse(result);
    } catch (error) {
      logger_default.error("Error creating API key:", error);
      throw new Error(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  }, "create"),
  list: /* @__PURE__ */ __name(async (userId) => {
    try {
      const apiKeys = await apiKeysRepository2.findAccessibleToUser(userId);
      return {
        apiKeys: ApiKeysSerializer.serializeApiKeyList(apiKeys)
      };
    } catch (error) {
      logger_default.error("Error fetching API keys:", error);
      throw new Error("Failed to fetch API keys");
    }
  }, "list"),
  update: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const result = await apiKeysRepository2.update(input.uuid, userId, {
        name: input.name,
        is_active: input.is_active
      });
      return ApiKeysSerializer.serializeApiKey(result);
    } catch (error) {
      logger_default.error("Error updating API key:", error);
      throw new Error(
        error instanceof Error ? error.message : "Internal server error"
      );
    }
  }, "update"),
  delete: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      await apiKeysRepository2.delete(input.uuid, userId);
      return {
        success: true,
        message: "API key deleted successfully"
      };
    } catch (error) {
      logger_default.error("Error deleting API key:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "delete"),
  validate: /* @__PURE__ */ __name(async (input) => {
    try {
      const result = await apiKeysRepository2.validateApiKey(input.key);
      return {
        valid: result.valid,
        user_id: result.user_id ?? void 0,
        key_uuid: result.key_uuid
      };
    } catch (error) {
      logger_default.error("Error validating API key:", error);
      return { valid: false };
    }
  }, "validate")
};

// src/trpc/config.impl.ts
init_config_service();
var configImplementations = {
  getSignupDisabled: /* @__PURE__ */ __name(async () => {
    return await configService.isSignupDisabled();
  }, "getSignupDisabled"),
  setSignupDisabled: /* @__PURE__ */ __name(async (input) => {
    await configService.setSignupDisabled(input.disabled);
    return { success: true };
  }, "setSignupDisabled"),
  getSsoSignupDisabled: /* @__PURE__ */ __name(async () => {
    return await configService.isSsoSignupDisabled();
  }, "getSsoSignupDisabled"),
  setSsoSignupDisabled: /* @__PURE__ */ __name(async (input) => {
    await configService.setSsoSignupDisabled(input.disabled);
    return { success: true };
  }, "setSsoSignupDisabled"),
  getBasicAuthDisabled: /* @__PURE__ */ __name(async () => {
    return await configService.isBasicAuthDisabled();
  }, "getBasicAuthDisabled"),
  setBasicAuthDisabled: /* @__PURE__ */ __name(async (input) => {
    await configService.setBasicAuthDisabled(input.disabled);
    return { success: true };
  }, "setBasicAuthDisabled"),
  getMcpResetTimeoutOnProgress: /* @__PURE__ */ __name(async () => {
    return await configService.getMcpResetTimeoutOnProgress();
  }, "getMcpResetTimeoutOnProgress"),
  setMcpResetTimeoutOnProgress: /* @__PURE__ */ __name(async (input) => {
    await configService.setMcpResetTimeoutOnProgress(input.enabled);
    return { success: true };
  }, "setMcpResetTimeoutOnProgress"),
  getMcpTimeout: /* @__PURE__ */ __name(async () => {
    return await configService.getMcpTimeout();
  }, "getMcpTimeout"),
  setMcpTimeout: /* @__PURE__ */ __name(async (input) => {
    await configService.setMcpTimeout(input.timeout);
    return { success: true };
  }, "setMcpTimeout"),
  getMcpMaxTotalTimeout: /* @__PURE__ */ __name(async () => {
    return await configService.getMcpMaxTotalTimeout();
  }, "getMcpMaxTotalTimeout"),
  setMcpMaxTotalTimeout: /* @__PURE__ */ __name(async (input) => {
    await configService.setMcpMaxTotalTimeout(input.timeout);
    return { success: true };
  }, "setMcpMaxTotalTimeout"),
  getMcpMaxAttempts: /* @__PURE__ */ __name(async () => {
    return await configService.getMcpMaxAttempts();
  }, "getMcpMaxAttempts"),
  setMcpMaxAttempts: /* @__PURE__ */ __name(async (input) => {
    await configService.setMcpMaxAttempts(input.maxAttempts);
    return { success: true };
  }, "setMcpMaxAttempts"),
  getSessionLifetime: /* @__PURE__ */ __name(async () => {
    return await configService.getSessionLifetime();
  }, "getSessionLifetime"),
  setSessionLifetime: /* @__PURE__ */ __name(async (input) => {
    await configService.setSessionLifetime(input.lifetime);
    return { success: true };
  }, "setSessionLifetime"),
  getAllConfigs: /* @__PURE__ */ __name(async () => {
    return await configService.getAllConfigs();
  }, "getAllConfigs"),
  setConfig: /* @__PURE__ */ __name(async (input) => {
    await configService.setConfig(input.key, input.value, input.description);
    return { success: true };
  }, "setConfig"),
  getAuthProviders: /* @__PURE__ */ __name(async () => {
    return await configService.getAuthProviders();
  }, "getAuthProviders")
};

// src/trpc/endpoints.impl.ts
init_logger();
init_repositories();
init_serializers();
var apiKeysRepository3 = new ApiKeysRepository();
var endpointsImplementations = {
  create: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const existingEndpoint = await endpointsRepository.findByName(input.name);
      if (existingEndpoint) {
        return {
          success: false,
          message: "Endpoint name already exists"
        };
      }
      const effectiveUserId = input.user_id !== void 0 ? input.user_id : userId;
      const isPublicEndpoint = effectiveUserId === null;
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          message: "Selected namespace could not be found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          message: `Access denied: You don't have permission to use namespace "${namespace.name}"`
        };
      }
      if (isPublicEndpoint && namespace.user_id !== null) {
        return {
          success: false,
          message: `Access denied: Public endpoints can only use public namespaces. Namespace "${namespace.name}" is private`
        };
      }
      logger_default.info(input);
      const result = await endpointsRepository.create({
        name: input.name,
        description: input.description,
        namespace_uuid: input.namespaceUuid,
        enable_api_key_auth: input.enableApiKeyAuth ?? true,
        enable_max_rate: input.enableMaxRate ?? false,
        enable_client_max_rate: input.enableClientMaxRate ?? false,
        max_rate: input.maxRate,
        max_rate_seconds: input.maxRateSeconds,
        client_max_rate: input.clientMaxRate,
        client_max_rate_seconds: input.clientMaxRateSeconds,
        client_max_rate_strategy: input.clientMaxRateStrategy,
        client_max_rate_strategy_key: input.clientMaxRateStrategyKey,
        enable_oauth: input.enableOauth ?? false,
        use_query_param_auth: input.useQueryParamAuth ?? false,
        user_id: effectiveUserId
      });
      if (input.createMcpServer) {
        try {
          const mcpServerName = `${input.name}-endpoint`;
          const mcpServerDescription = `Auto-generated MCP server for endpoint "${input.name}"`;
          const baseUrl = process.env.APP_URL;
          const endpointUrl = `${baseUrl}/metamcp/${input.name}/mcp`;
          let bearerToken = "";
          if (input.enableApiKeyAuth) {
            try {
              const userApiKeys = await apiKeysRepository3.findByUserId(userId);
              const activeApiKey = userApiKeys.find((key) => key.is_active);
              if (activeApiKey) {
                bearerToken = activeApiKey.key;
              } else {
                const newApiKey = await apiKeysRepository3.create({
                  name: "Auto-generated for MCP Server",
                  user_id: userId,
                  is_active: true
                });
                bearerToken = newApiKey.key;
              }
            } catch (apiKeyError) {
              logger_default.error(
                "Error getting API key for MCP server:",
                apiKeyError
              );
            }
          }
          await mcpServersRepository.create({
            name: mcpServerName,
            description: mcpServerDescription,
            type: "STREAMABLE_HTTP",
            url: endpointUrl,
            bearerToken,
            command: "",
            args: [],
            env: {},
            user_id: effectiveUserId
          });
        } catch (mcpError) {
          logger_default.error("Error creating MCP server:", mcpError);
        }
      }
      return {
        success: true,
        data: EndpointsSerializer.serializeEndpoint(result),
        message: "Endpoint created successfully"
      };
    } catch (error) {
      logger_default.error("Error creating endpoint:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "create"),
  list: /* @__PURE__ */ __name(async (userId) => {
    try {
      const endpoints = await endpointsRepository.findAllAccessibleToUserWithNamespaces(userId);
      return {
        success: true,
        data: EndpointsSerializer.serializeEndpointWithNamespaceList(endpoints),
        message: "Endpoints retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching endpoints:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch endpoints"
      };
    }
  }, "list"),
  get: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const endpoint = await endpointsRepository.findByUuidWithNamespace(
        input.uuid
      );
      if (!endpoint) {
        return {
          success: false,
          message: "Endpoint not found"
        };
      }
      if (endpoint.user_id && endpoint.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only view endpoints you own or public endpoints"
        };
      }
      return {
        success: true,
        data: EndpointsSerializer.serializeEndpointWithNamespace(endpoint),
        message: "Endpoint retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching endpoint:", error);
      return {
        success: false,
        message: "Failed to fetch endpoint"
      };
    }
  }, "get"),
  delete: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const existingEndpoint = await endpointsRepository.findByUuidWithNamespace(input.uuid);
      if (!existingEndpoint) {
        return {
          success: false,
          message: "Endpoint not found"
        };
      }
      if (existingEndpoint.user_id && existingEndpoint.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only delete endpoints you own"
        };
      }
      const deletedEndpoint = await endpointsRepository.deleteByUuid(
        input.uuid
      );
      if (!deletedEndpoint) {
        return {
          success: false,
          message: "Endpoint not found"
        };
      }
      return {
        success: true,
        message: "Endpoint deleted successfully"
      };
    } catch (error) {
      logger_default.error("Error deleting endpoint:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "delete"),
  update: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const existingEndpoint = await endpointsRepository.findByUuidWithNamespace(input.uuid);
      if (!existingEndpoint) {
        return {
          success: false,
          message: "Endpoint not found"
        };
      }
      if (existingEndpoint.user_id && existingEndpoint.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update endpoints you own"
        };
      }
      const isPublicEndpoint = existingEndpoint.user_id === null;
      if (input.namespaceUuid !== existingEndpoint.namespace_uuid) {
        const namespace = await namespacesRepository.findByUuid(
          input.namespaceUuid
        );
        if (!namespace) {
          return {
            success: false,
            message: "Selected namespace could not be found"
          };
        }
        if (namespace.user_id && namespace.user_id !== userId) {
          return {
            success: false,
            message: `Access denied: You don't have permission to use namespace "${namespace.name}"`
          };
        }
        if (isPublicEndpoint && namespace.user_id !== null) {
          return {
            success: false,
            message: `Access denied: Public endpoints can only use public namespaces. Namespace "${namespace.name}" is private`
          };
        }
      }
      const duplicateEndpoint = await endpointsRepository.findByName(
        input.name
      );
      if (duplicateEndpoint && duplicateEndpoint.uuid !== input.uuid) {
        return {
          success: false,
          message: "Endpoint name already exists"
        };
      }
      const result = await endpointsRepository.update({
        uuid: input.uuid,
        name: input.name,
        description: input.description,
        namespace_uuid: input.namespaceUuid,
        enable_api_key_auth: input.enableApiKeyAuth,
        enable_max_rate: input.enableMaxRate ?? false,
        enable_client_max_rate: input.enableClientMaxRate ?? false,
        max_rate: input.maxRate,
        max_rate_seconds: input.maxRateSeconds,
        client_max_rate: input.clientMaxRate,
        client_max_rate_seconds: input.clientMaxRateSeconds,
        client_max_rate_strategy: input.clientMaxRateStrategy,
        client_max_rate_strategy_key: input.clientMaxRateStrategyKey,
        enable_oauth: input.enableOauth,
        use_query_param_auth: input.useQueryParamAuth
      });
      return {
        success: true,
        data: EndpointsSerializer.serializeEndpoint(result),
        message: "Endpoint updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating endpoint:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "update")
};

// src/trpc/logs.impl.ts
init_logger();
init_log_store();
var logsImplementations = {
  getLogs: /* @__PURE__ */ __name(async (input) => {
    try {
      const logs = metamcpLogStore.getLogs(input.limit);
      const totalCount = metamcpLogStore.getLogCount();
      return {
        success: true,
        data: logs,
        totalCount
      };
    } catch (error) {
      logger_default.error("Error getting logs:", error);
      throw new Error("Failed to get logs");
    }
  }, "getLogs"),
  clearLogs: /* @__PURE__ */ __name(async () => {
    try {
      metamcpLogStore.clearLogs();
      return {
        success: true,
        message: "All logs have been cleared successfully"
      };
    } catch (error) {
      logger_default.error("Error clearing logs:", error);
      throw new Error("Failed to clear logs");
    }
  }, "clearLogs")
};

// src/trpc/mcp-servers.impl.ts
init_logger();
init_repositories();
init_serializers();
init_mcp_server_pool();
init_tool_overrides_functional();
init_metamcp_server_pool();
init_server_error_tracker();
init_utils();
import {
  McpServerTypeEnum as McpServerTypeEnum3
} from "@repo/zod-types";
var mcpServersImplementations = {
  create: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const effectiveUserId = input.user_id !== void 0 ? input.user_id : userId;
      const createdServer = await mcpServersRepository.create({
        ...input,
        user_id: effectiveUserId
      });
      if (!createdServer) {
        return {
          success: false,
          message: "Failed to create MCP server"
        };
      }
      const serverParams = await convertDbServerToParams(createdServer);
      if (serverParams) {
        mcpServerPool.ensureIdleSessionForNewServer(createdServer.uuid, serverParams).then(() => {
          logger_default.info(
            `Ensured idle session for newly created server: ${createdServer.name} (${createdServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error ensuring idle session for newly created server ${createdServer.name} (${createdServer.uuid}):`,
            error
          );
        });
      }
      return {
        success: true,
        data: McpServersSerializer.serializeMcpServer(createdServer),
        message: "MCP server created successfully"
      };
    } catch (error) {
      logger_default.error("Error creating MCP server:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "create"),
  list: /* @__PURE__ */ __name(async (userId) => {
    try {
      const servers = await mcpServersRepository.findAllAccessibleToUser(userId);
      return {
        success: true,
        data: McpServersSerializer.serializeMcpServerList(servers),
        message: "MCP servers retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching MCP servers:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch MCP servers"
      };
    }
  }, "list"),
  bulkImport: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const serversToInsert = [];
      const errors = [];
      let imported = 0;
      for (const [serverName, serverConfig] of Object.entries(
        input.mcpServers
      )) {
        try {
          if (!/^[a-zA-Z0-9_-]+$/.test(serverName)) {
            throw new Error(
              `Server name "${serverName}" is invalid. Server names must only contain letters, numbers, underscores, and hyphens.`
            );
          }
          const serverWithDefaults = {
            name: serverName,
            type: serverConfig.type || "STDIO",
            description: serverConfig.description || null,
            command: serverConfig.command || null,
            args: serverConfig.args || [],
            env: serverConfig.env || {},
            url: serverConfig.url || null,
            bearerToken: void 0,
            headers: serverConfig.headers || {},
            user_id: userId
            // Default bulk imported servers to current user
          };
          serversToInsert.push(serverWithDefaults);
        } catch (error) {
          errors.push(
            `Failed to process server "${serverName}": ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }
      if (serversToInsert.length > 0) {
        const createdServers = await mcpServersRepository.bulkCreate(serversToInsert);
        imported = serversToInsert.length;
        if (createdServers && createdServers.length > 0) {
          createdServers.forEach(async (server) => {
            try {
              const params = await convertDbServerToParams(server);
              if (params) {
                mcpServerPool.ensureIdleSessionForNewServer(server.uuid, params).then(() => {
                  logger_default.info(
                    `Ensured idle session for bulk imported server: ${server.name} (${server.uuid})`
                  );
                }).catch((error) => {
                  logger_default.error(
                    `Error ensuring idle session for bulk imported server ${server.name} (${server.uuid}):`,
                    error
                  );
                });
              }
            } catch (error) {
              logger_default.error(
                `Error processing idle session for bulk imported server ${server.name} (${server.uuid}):`,
                error
              );
            }
          });
        }
      }
      return {
        success: true,
        imported,
        errors: errors.length > 0 ? errors : void 0,
        message: `Successfully imported ${imported} MCP servers${errors.length > 0 ? ` with ${errors.length} errors` : ""}`
      };
    } catch (error) {
      logger_default.error("Error bulk importing MCP servers:", error);
      return {
        success: false,
        imported: 0,
        message: error instanceof Error ? error.message : "Internal server error during bulk import"
      };
    }
  }, "bulkImport"),
  get: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const server = await mcpServersRepository.findByUuid(input.uuid);
      if (server && server.user_id && server.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only view servers you own or public servers"
        };
      }
      if (!server) {
        return {
          success: false,
          message: "MCP server not found"
        };
      }
      return {
        success: true,
        data: McpServersSerializer.serializeMcpServer(server),
        message: "MCP server retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching MCP server:", error);
      return {
        success: false,
        message: "Failed to fetch MCP server"
      };
    }
  }, "get"),
  delete: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const server = await mcpServersRepository.findByUuid(input.uuid);
      if (!server) {
        return {
          success: false,
          message: "MCP server not found"
        };
      }
      if (server.user_id && server.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only delete servers you own"
        };
      }
      const affectedNamespaceUuids = await namespaceMappingsRepository.findNamespacesByServerUuid(
        input.uuid
      );
      await mcpServerPool.cleanupIdleSession(input.uuid);
      const deletedServer = await mcpServersRepository.deleteByUuid(input.uuid);
      if (!deletedServer) {
        return {
          success: false,
          message: "MCP server not found"
        };
      }
      if (affectedNamespaceUuids.length > 0) {
        metaMcpServerPool.invalidateIdleServers(affectedNamespaceUuids).then(() => {
          logger_default.info(
            `Invalidated idle MetaMCP servers for ${affectedNamespaceUuids.length} namespaces after deleting server: ${deletedServer.name} (${deletedServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error invalidating idle MetaMCP servers after deleting server ${deletedServer.uuid}:`,
            error
          );
        });
        metaMcpServerPool.invalidateOpenApiSessions(affectedNamespaceUuids).then(() => {
          logger_default.info(
            `Invalidated OpenAPI sessions for ${affectedNamespaceUuids.length} namespaces after deleting server: ${deletedServer.name} (${deletedServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error invalidating OpenAPI sessions after deleting server ${deletedServer.uuid}:`,
            error
          );
        });
        affectedNamespaceUuids.forEach((namespaceUuid) => {
          clearOverrideCache(namespaceUuid);
        });
        logger_default.info(
          `Cleared tool overrides cache for ${affectedNamespaceUuids.length} namespaces after deleting server: ${deletedServer.name} (${deletedServer.uuid})`
        );
      }
      return {
        success: true,
        message: "MCP server deleted successfully"
      };
    } catch (error) {
      logger_default.error("Error deleting MCP server:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "delete"),
  update: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const server = await mcpServersRepository.findByUuid(input.uuid);
      if (!server) {
        return {
          success: false,
          message: "MCP server not found"
        };
      }
      if (server.user_id && server.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update servers you own"
        };
      }
      const effectiveUserId = input.user_id !== void 0 ? input.user_id : server.user_id;
      const updatedServer = await mcpServersRepository.update({
        ...input,
        user_id: effectiveUserId
      });
      if (!updatedServer) {
        return {
          success: false,
          message: "MCP server not found"
        };
      }
      if (updatedServer.type === McpServerTypeEnum3.Enum.STDIO) {
        try {
          await serverErrorTracker.resetServerErrorState(updatedServer.uuid);
          logger_default.info(
            `Reset error status for updated stdio server: ${updatedServer.name} (${updatedServer.uuid})`
          );
        } catch (error) {
          logger_default.error(
            `Error resetting error status for updated stdio server ${updatedServer.name} (${updatedServer.uuid}):`,
            error
          );
        }
      }
      const serverParams = await convertDbServerToParams(updatedServer);
      if (serverParams) {
        mcpServerPool.invalidateIdleSession(updatedServer.uuid, serverParams).then(() => {
          logger_default.info(
            `Invalidated and refreshed idle session for updated server: ${updatedServer.name} (${updatedServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error invalidating idle session for updated server ${updatedServer.name} (${updatedServer.uuid}):`,
            error
          );
        });
      }
      const affectedNamespaceUuids = await namespaceMappingsRepository.findNamespacesByServerUuid(
        updatedServer.uuid
      );
      if (affectedNamespaceUuids.length > 0) {
        metaMcpServerPool.invalidateIdleServers(affectedNamespaceUuids).then(() => {
          logger_default.info(
            `Invalidated idle MetaMCP servers for ${affectedNamespaceUuids.length} namespaces after updating server: ${updatedServer.name} (${updatedServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error invalidating idle MetaMCP servers after updating server ${updatedServer.uuid}:`,
            error
          );
        });
        metaMcpServerPool.invalidateOpenApiSessions(affectedNamespaceUuids).then(() => {
          logger_default.info(
            `Invalidated OpenAPI sessions for ${affectedNamespaceUuids.length} namespaces after updating server: ${updatedServer.name} (${updatedServer.uuid})`
          );
        }).catch((error) => {
          logger_default.error(
            `Error invalidating OpenAPI sessions after updating server ${updatedServer.uuid}:`,
            error
          );
        });
        affectedNamespaceUuids.forEach((namespaceUuid) => {
          clearOverrideCache(namespaceUuid);
        });
        logger_default.info(
          `Cleared tool overrides cache for ${affectedNamespaceUuids.length} namespaces after updating server: ${updatedServer.name} (${updatedServer.uuid})`
        );
      }
      return {
        success: true,
        data: McpServersSerializer.serializeMcpServer(updatedServer),
        message: "MCP server updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating MCP server:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "update")
};

// src/trpc/namespaces.impl.ts
init_logger();
init_repositories();
init_serializers();
init_tool_overrides_functional();
init_metamcp_server_pool();
var namespacesImplementations = {
  create: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const effectiveUserId = input.user_id !== void 0 ? input.user_id : userId;
      const isPublicNamespace = effectiveUserId === null;
      if (input.mcpServerUuids && input.mcpServerUuids.length > 0) {
        const serverPromises = input.mcpServerUuids.map(
          (uuid2) => mcpServersRepository.findByUuid(uuid2)
        );
        const servers = await Promise.all(serverPromises);
        const missingServers = servers.some((server) => !server);
        if (missingServers) {
          return {
            success: false,
            message: "One or more selected MCP servers could not be found"
          };
        }
        for (const server of servers) {
          if (!server) continue;
          if (server.user_id && server.user_id !== userId) {
            return {
              success: false,
              message: `Access denied: You don't have permission to use server "${server.name}"`
            };
          }
          if (isPublicNamespace && server.user_id !== null) {
            return {
              success: false,
              message: `Access denied: Public namespaces can only contain public MCP servers. Server "${server.name}" is private`
            };
          }
        }
      }
      const result = await namespacesRepository.create({
        name: input.name,
        description: input.description,
        mcpServerUuids: input.mcpServerUuids,
        user_id: effectiveUserId
      });
      metaMcpServerPool.ensureIdleServerForNewNamespace(result.uuid).then(() => {
        logger_default.info(
          `Ensured idle MetaMCP server exists for new namespace ${result.uuid}`
        );
      }).catch((error) => {
        logger_default.error(
          `Error ensuring idle MetaMCP server for new namespace ${result.uuid}:`,
          error
        );
      });
      return {
        success: true,
        data: NamespacesSerializer.serializeNamespace(result),
        message: "Namespace created successfully"
      };
    } catch (error) {
      logger_default.error("Error creating namespace:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "create"),
  list: /* @__PURE__ */ __name(async (userId) => {
    try {
      const namespaces = await namespacesRepository.findAllAccessibleToUser(userId);
      return {
        success: true,
        data: NamespacesSerializer.serializeNamespaceList(namespaces),
        message: "Namespaces retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching namespaces:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch namespaces"
      };
    }
  }, "list"),
  get: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespaceWithServers = await namespacesRepository.findByUuidWithServers(input.uuid);
      if (!namespaceWithServers) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (namespaceWithServers.user_id && namespaceWithServers.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only view namespaces you own or public namespaces"
        };
      }
      return {
        success: true,
        data: NamespacesSerializer.serializeNamespaceWithServers(
          namespaceWithServers
        ),
        message: "Namespace retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching namespace:", error);
      return {
        success: false,
        message: "Failed to fetch namespace"
      };
    }
  }, "get"),
  getTools: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          data: [],
          message: "Namespace not found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          data: [],
          message: "Access denied: You can only view tools for namespaces you own or public namespaces"
        };
      }
      const toolsData = await namespacesRepository.findToolsByNamespaceUuid(
        input.namespaceUuid
      );
      return {
        success: true,
        data: NamespacesSerializer.serializeNamespaceTools(toolsData),
        message: "Namespace tools retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching namespace tools:", error);
      return {
        success: false,
        data: [],
        message: "Failed to fetch namespace tools"
      };
    }
  }, "getTools"),
  delete: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const existingNamespace = await namespacesRepository.findByUuid(
        input.uuid
      );
      if (!existingNamespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (existingNamespace.user_id && existingNamespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only delete namespaces you own"
        };
      }
      const deletedNamespace = await namespacesRepository.deleteByUuid(
        input.uuid
      );
      if (!deletedNamespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      try {
        await metaMcpServerPool.cleanupIdleServer(input.uuid);
        logger_default.info(
          `Cleaned up idle MetaMCP server for deleted namespace ${input.uuid}`
        );
      } catch (error) {
        logger_default.error(
          `Error cleaning up idle MetaMCP server for deleted namespace ${input.uuid}:`,
          error
        );
      }
      clearOverrideCache(input.uuid);
      logger_default.info(
        `Cleared tool overrides cache for deleted namespace ${input.uuid}`
      );
      return {
        success: true,
        message: "Namespace deleted successfully"
      };
    } catch (error) {
      logger_default.error("Error deleting namespace:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "delete"),
  update: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const existingNamespace = await namespacesRepository.findByUuid(
        input.uuid
      );
      if (!existingNamespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (existingNamespace.user_id && existingNamespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update namespaces you own"
        };
      }
      const effectiveUserId = input.user_id !== void 0 ? input.user_id : existingNamespace.user_id;
      const isPublicNamespace = effectiveUserId === null;
      if (input.mcpServerUuids && input.mcpServerUuids.length > 0) {
        const serverPromises = input.mcpServerUuids.map(
          (uuid2) => mcpServersRepository.findByUuid(uuid2)
        );
        const servers = await Promise.all(serverPromises);
        const missingServers = servers.some((server) => !server);
        if (missingServers) {
          return {
            success: false,
            message: "One or more selected MCP servers could not be found"
          };
        }
        for (const server of servers) {
          if (!server) continue;
          if (server.user_id && server.user_id !== userId) {
            return {
              success: false,
              message: `Access denied: You don't have permission to use server "${server.name}"`
            };
          }
          if (isPublicNamespace && server.user_id !== null) {
            return {
              success: false,
              message: `Access denied: Public namespaces can only contain public MCP servers. Server "${server.name}" is private`
            };
          }
        }
      }
      const result = await namespacesRepository.update({
        uuid: input.uuid,
        name: input.name,
        description: input.description,
        user_id: input.user_id,
        mcpServerUuids: input.mcpServerUuids
      });
      metaMcpServerPool.invalidateIdleServer(input.uuid).then(() => {
        logger_default.info(
          `Invalidated idle MetaMCP server for updated namespace ${input.uuid}`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating idle MetaMCP server for namespace ${input.uuid}:`,
          error
        );
      });
      metaMcpServerPool.invalidateOpenApiSessions([input.uuid]).then(() => {
        logger_default.info(
          `Invalidated OpenAPI session for updated namespace ${input.uuid}`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating OpenAPI session for namespace ${input.uuid}:`,
          error
        );
      });
      clearOverrideCache(input.uuid);
      logger_default.info(
        `Cleared tool overrides cache for updated namespace ${input.uuid}`
      );
      return {
        success: true,
        data: NamespacesSerializer.serializeNamespace(result),
        message: "Namespace updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating namespace:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "update"),
  updateServerStatus: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update server status for namespaces you own"
        };
      }
      const updatedMapping = await namespaceMappingsRepository.updateServerStatus({
        namespaceUuid: input.namespaceUuid,
        serverUuid: input.serverUuid,
        status: input.status
      });
      if (!updatedMapping) {
        return {
          success: false,
          message: "Server not found in namespace"
        };
      }
      metaMcpServerPool.invalidateIdleServer(input.namespaceUuid).then(() => {
        logger_default.info(
          `Invalidated idle MetaMCP server for namespace ${input.namespaceUuid} after server status update`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating idle MetaMCP server for namespace ${input.namespaceUuid}:`,
          error
        );
      });
      metaMcpServerPool.invalidateOpenApiSessions([input.namespaceUuid]).then(() => {
        logger_default.info(
          `Invalidated OpenAPI session for namespace ${input.namespaceUuid} after server status update`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating OpenAPI session for namespace ${input.namespaceUuid}:`,
          error
        );
      });
      return {
        success: true,
        message: "Server status updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating server status:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "updateServerStatus"),
  updateToolStatus: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update tool status for namespaces you own"
        };
      }
      const updatedMapping = await namespaceMappingsRepository.updateToolStatus(
        {
          namespaceUuid: input.namespaceUuid,
          toolUuid: input.toolUuid,
          serverUuid: input.serverUuid,
          status: input.status
        }
      );
      if (!updatedMapping) {
        return {
          success: false,
          message: "Tool not found in namespace"
        };
      }
      return {
        success: true,
        message: "Tool status updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating tool status:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "updateToolStatus"),
  updateToolOverrides: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only update tool overrides for namespaces you own"
        };
      }
      const updatedMapping = await namespaceMappingsRepository.updateToolOverrides({
        namespaceUuid: input.namespaceUuid,
        toolUuid: input.toolUuid,
        serverUuid: input.serverUuid,
        overrideName: input.overrideName,
        overrideTitle: input.overrideTitle,
        overrideDescription: input.overrideDescription,
        overrideAnnotations: input.overrideAnnotations
      });
      if (!updatedMapping) {
        return {
          success: false,
          message: "Tool not found in namespace"
        };
      }
      clearOverrideCache(input.namespaceUuid);
      logger_default.info(
        `Cleared tool overrides cache for namespace ${input.namespaceUuid} after updating tool overrides`
      );
      return {
        success: true,
        message: "Tool overrides updated successfully"
      };
    } catch (error) {
      logger_default.error("Error updating tool overrides:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "updateToolOverrides"),
  refreshTools: /* @__PURE__ */ __name(async (input, userId) => {
    try {
      const namespace = await namespacesRepository.findByUuid(
        input.namespaceUuid
      );
      if (!namespace) {
        return {
          success: false,
          message: "Namespace not found"
        };
      }
      if (namespace.user_id && namespace.user_id !== userId) {
        return {
          success: false,
          message: "Access denied: You can only refresh tools for namespaces you own"
        };
      }
      if (!input.tools || input.tools.length === 0) {
        return {
          success: true,
          message: "No tools to refresh",
          toolsCreated: 0,
          mappingsCreated: 0
        };
      }
      const parsedTools = [];
      for (const tool of input.tools) {
        const lastDoubleUnderscoreIndex = tool.name.lastIndexOf("__");
        if (lastDoubleUnderscoreIndex === -1) {
          logger_default.warn(
            `Tool name "${tool.name}" does not contain "__" separator, skipping`
          );
          continue;
        }
        const serverName = tool.name.substring(0, lastDoubleUnderscoreIndex);
        const toolName = tool.name.substring(lastDoubleUnderscoreIndex + 2);
        try {
          const fullToolName = `${serverName}__${toolName}`;
          const originalToolName = await mapOverrideNameToOriginal(
            fullToolName,
            input.namespaceUuid
          );
          if (originalToolName !== fullToolName) {
            logger_default.info(
              `Skipping override tool "${fullToolName}" as it maps to original "${originalToolName}"`
            );
            continue;
          }
        } catch (error) {
          logger_default.warn(
            `Failed to map override name for tool "${toolName}":`,
            error
          );
        }
        if (!serverName || !toolName) {
          logger_default.warn(`Invalid tool name format "${tool.name}", skipping`);
          continue;
        }
        parsedTools.push({
          serverName,
          toolName,
          description: tool.description || "",
          inputSchema: tool.inputSchema
        });
      }
      if (parsedTools.length === 0) {
        return {
          success: true,
          message: "No valid tools to refresh after parsing",
          toolsCreated: 0,
          mappingsCreated: 0
        };
      }
      const toolsByServerName = {};
      for (const parsedTool of parsedTools) {
        let server = await mcpServersRepository.findByName(
          parsedTool.serverName
        );
        if (!server && parsedTool.serverName.includes("__")) {
          const firstDoubleUnderscoreIndex = parsedTool.serverName.indexOf("__");
          const actualServerName = parsedTool.serverName.substring(
            0,
            firstDoubleUnderscoreIndex
          );
          server = await mcpServersRepository.findByName(actualServerName);
          if (server) {
            logger_default.info(
              `Found nested MetaMCP server mapping: "${parsedTool.serverName}" -> "${actualServerName}"`
            );
            const remainingPart = parsedTool.serverName.substring(
              firstDoubleUnderscoreIndex + 2
            );
            parsedTool.toolName = `${remainingPart}__${parsedTool.toolName}`;
            parsedTool.serverName = actualServerName;
          }
        }
        if (!server) {
          logger_default.warn(
            `Server "${parsedTool.serverName}" not found in database, skipping tool "${parsedTool.toolName}"`
          );
          continue;
        }
        if (!toolsByServerName[parsedTool.serverName]) {
          toolsByServerName[parsedTool.serverName] = {
            serverUuid: server.uuid,
            tools: []
          };
        }
        toolsByServerName[parsedTool.serverName].tools.push({
          toolName: parsedTool.toolName,
          description: parsedTool.description,
          inputSchema: parsedTool.inputSchema
        });
      }
      if (Object.keys(toolsByServerName).length === 0) {
        return {
          success: false,
          message: "No servers found for the provided tools"
        };
      }
      let totalToolsCreated = 0;
      let totalMappingsCreated = 0;
      for (const [serverName, serverData] of Object.entries(
        toolsByServerName
      )) {
        const { serverUuid, tools } = serverData;
        const upsertedTools = await toolsRepository.bulkUpsert({
          mcpServerUuid: serverUuid,
          tools: tools.map((tool) => ({
            name: tool.toolName,
            // Use the actual tool name, not the prefixed name
            description: tool.description,
            inputSchema: tool.inputSchema
          }))
        });
        totalToolsCreated += upsertedTools.length;
        const toolMappings = upsertedTools.map((tool) => ({
          toolUuid: tool.uuid,
          serverUuid,
          status: "ACTIVE"
        }));
        const createdMappings = await namespaceMappingsRepository.bulkUpsertNamespaceToolMappings({
          namespaceUuid: input.namespaceUuid,
          toolMappings
        });
        totalMappingsCreated += createdMappings.length;
        logger_default.info(
          `Processed ${tools.length} tools for server "${serverName}" (${serverUuid})`
        );
      }
      metaMcpServerPool.invalidateIdleServer(input.namespaceUuid).then(() => {
        logger_default.info(
          `Invalidated idle MetaMCP server for namespace ${input.namespaceUuid} after tools refresh`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating idle MetaMCP server for namespace ${input.namespaceUuid}:`,
          error
        );
      });
      metaMcpServerPool.invalidateOpenApiSessions([input.namespaceUuid]).then(() => {
        logger_default.info(
          `Invalidated OpenAPI session for namespace ${input.namespaceUuid} after tools refresh`
        );
      }).catch((error) => {
        logger_default.error(
          `Error invalidating OpenAPI session for namespace ${input.namespaceUuid}:`,
          error
        );
      });
      return {
        success: true,
        message: `Successfully refreshed ${totalToolsCreated} tools with ${totalMappingsCreated} mappings`,
        toolsCreated: totalToolsCreated,
        mappingsCreated: totalMappingsCreated
      };
    } catch (error) {
      logger_default.error("Error refreshing namespace tools:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "refreshTools")
};

// src/trpc/oauth.impl.ts
init_logger();
init_repositories();
init_serializers();
var oauthImplementations = {
  get: /* @__PURE__ */ __name(async (input) => {
    try {
      const session = await oauthSessionsRepository.findByMcpServerUuid(
        input.mcp_server_uuid
      );
      if (!session) {
        return {
          success: false,
          message: "OAuth session not found"
        };
      }
      return {
        success: true,
        data: OAuthSessionsSerializer.serializeOAuthSession(session),
        message: "OAuth session retrieved successfully"
      };
    } catch (error) {
      logger_default.error("Error fetching OAuth session:", error);
      return {
        success: false,
        message: "Failed to fetch OAuth session"
      };
    }
  }, "get"),
  upsert: /* @__PURE__ */ __name(async (input) => {
    try {
      const session = await oauthSessionsRepository.upsert({
        mcp_server_uuid: input.mcp_server_uuid,
        ...input.client_information && {
          client_information: input.client_information
        },
        ...input.tokens && { tokens: input.tokens },
        ...input.code_verifier && { code_verifier: input.code_verifier }
      });
      if (!session) {
        return {
          success: false,
          error: "Failed to upsert OAuth session"
        };
      }
      return {
        success: true,
        data: OAuthSessionsSerializer.serializeOAuthSession(session),
        message: "OAuth session upserted successfully"
      };
    } catch (error) {
      logger_default.error("Error upserting OAuth session:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error"
      };
    }
  }, "upsert")
};

// src/routers/trpc.ts
init_tools_impl();
var appRouter = createAppRouter({
  frontend: {
    mcpServers: mcpServersImplementations,
    namespaces: namespacesImplementations,
    endpoints: endpointsImplementations,
    oauth: oauthImplementations,
    tools: toolsImplementations,
    apiKeys: apiKeysImplementations,
    config: configImplementations,
    logs: logsImplementations
  }
});
var trpcRouter = express16.Router();
trpcRouter.use(helmet2());
trpcRouter.use(
  cors4({
    origin: process.env.APP_URL,
    credentials: true
  })
);
trpcRouter.use(
  "/frontend",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var trpc_default = trpcRouter;

// src/index.ts
init_logger();
var app = express17();
app.use((req, res, next) => {
  if (req.path.startsWith("/mcp-proxy/") || req.path.startsWith("/metamcp/")) {
    next();
  } else {
    express17.json({ limit: "50mb" })(req, res, next);
  }
});
app.use(oauth_default);
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/auth")) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value[0] : value);
        }
      });
      const request = new Request(url.toString(), {
        method: req.method,
        headers,
        body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : void 0
      });
      const response = await auth.handler(request);
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      const body = await response.text();
      res.send(body);
    } catch (error) {
      logger_default.error("Auth route error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      });
    }
    return;
  }
  next();
});
app.use("/metamcp", public_metamcp_default);
app.use("/mcp-proxy", mcp_proxy_default);
app.use("/trpc", trpc_default);
async function start() {
  await initializeOnStartup();
  app.listen(12009, async () => {
    console.log(`Server is running on port 12009`);
    console.log(`Auth routes available at: http://localhost:12009/api/auth`);
    console.log(
      `Public MetaMCP endpoints available at: http://localhost:12009/metamcp`
    );
    console.log(
      `MCP Proxy routes available at: http://localhost:12009/mcp-proxy`
    );
    console.log(`tRPC routes available at: http://localhost:12009/trpc`);
    console.log(
      "Waiting for server to be fully ready before initializing idle servers..."
    );
    await new Promise((resolve) => setTimeout(resolve, 3e3)).then(
      initializeIdleServers
    );
  });
}
__name(start, "start");
start().catch((err) => {
  console.error("\u274C Fatal startup error:", err);
});
var gracefulShutdown = /* @__PURE__ */ __name(async (signal) => {
  console.log(`${signal} received, cleaning up MCP server pools...`);
  try {
    const { mcpServerPool: mcpServerPool2 } = await Promise.resolve().then(() => (init_metamcp(), metamcp_exports));
    const { metaMcpServerPool: metaMcpServerPool2 } = await Promise.resolve().then(() => (init_metamcp_server_pool(), metamcp_server_pool_exports));
    await Promise.allSettled([
      mcpServerPool2.cleanupAll(),
      metaMcpServerPool2.cleanupAll()
    ]);
    console.log("MCP server pools cleaned up successfully");
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
  }
  process.exit(0);
}, "gracefulShutdown");
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});
//# sourceMappingURL=index.js.map