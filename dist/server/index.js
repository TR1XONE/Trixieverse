// server/index.ts
import express3 from "express";
import compression from "compression";
import { WebSocketServer } from "ws";
import http from "http";
import dotenv3 from "dotenv";
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";

// server/utils/logger.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var Logger = class {
  logDir;
  maxLogSize = 10 * 1024 * 1024;
  // 10MB
  constructor() {
    this.logDir = path.join(__dirname, "../../logs");
    this.ensureLogDir();
  }
  /**
   * Ensure log directory exists
   */
  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  /**
   * Get log file path
   */
  getLogFile(level) {
    return path.join(this.logDir, `${level}.log`);
  }
  /**
   * Write log entry
   */
  writeLog(level, data) {
    const entry = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level,
      ...data
    };
    const logFile = this.getLogFile(level);
    const logEntry = JSON.stringify(entry) + "\n";
    try {
      if (fs.existsSync(logFile)) {
        const stats = fs.statSync(logFile);
        if (stats.size > this.maxLogSize) {
          const backupFile = `${logFile}.${Date.now()}`;
          fs.renameSync(logFile, backupFile);
        }
      }
      fs.appendFileSync(logFile, logEntry);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[${level.toUpperCase()}]`, data);
      }
    } catch (error) {
      console.error("Failed to write log:", error);
    }
  }
  /**
   * Log info
   */
  info(message, data) {
    this.writeLog("info", { message, ...data });
  }
  /**
   * Log warning
   */
  warn(message, data) {
    this.writeLog("warn", { message, ...data });
  }
  /**
   * Log error
   */
  error(data) {
    this.writeLog("error", data);
  }
  /**
   * Log debug
   */
  debug(message, data) {
    if (process.env.NODE_ENV === "development") {
      this.writeLog("debug", { message, ...data });
    }
  }
  /**
   * Log performance
   */
  performance(endpoint, duration, statusCode) {
    this.writeLog("performance", {
      message: `${endpoint} - ${duration}ms - ${statusCode}`,
      endpoint,
      duration,
      statusCode
    });
  }
  /**
   * Get logs
   */
  getLogs(level, limit = 100) {
    try {
      const logFile = this.getLogFile(level);
      if (!fs.existsSync(logFile)) {
        return [];
      }
      const content = fs.readFileSync(logFile, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());
      return lines.slice(-limit).map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter((entry) => entry !== null);
    } catch (error) {
      console.error("Failed to read logs:", error);
      return [];
    }
  }
  /**
   * Clear old logs
   */
  clearOldLogs(daysOld = 7) {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1e3;
      files.forEach((file) => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log: ${file}`);
        }
      });
    } catch (error) {
      console.error("Failed to clear old logs:", error);
    }
  }
};
var logger_default = new Logger();

// server/middleware/requestLogger.ts
function requestLogger(req, res, next) {
  const startTime = Date.now();
  logger_default.debug(`${req.method} ${req.path}`, {
    query: req.query,
    userId: req.user?.id,
    ip: req.ip
  });
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    logger_default.performance(`${req.method} ${req.path}`, duration, statusCode);
    if (statusCode >= 400) {
      logger_default.warn(`${req.method} ${req.path} - ${statusCode}`, {
        userId: req.user?.id,
        ip: req.ip,
        duration
      });
    }
    return originalSend.call(this, data);
  };
  next();
}

// server/middleware/errorHandler.ts
var ErrorHandler = class {
  /**
   * Handle errors
   */
  static handle(err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    logger_default.error({
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      stack: err.stack
    });
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
        ...process.env.NODE_ENV === "development" && { stack: err.stack }
      }
    });
  }
  /**
   * Async error wrapper
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
  /**
   * 404 handler
   */
  static notFound(req, res, next) {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
  }
  /**
   * Validation error handler
   */
  static validationError(errors) {
    const message = errors.map((e) => e.msg).join(", ");
    const error = new Error(message);
    error.statusCode = 400;
    return error;
  }
  /**
   * Authentication error
   */
  static authError(message = "Unauthorized") {
    const error = new Error(message);
    error.statusCode = 401;
    return error;
  }
  /**
   * Authorization error
   */
  static forbiddenError(message = "Forbidden") {
    const error = new Error(message);
    error.statusCode = 403;
    return error;
  }
  /**
   * Conflict error
   */
  static conflictError(message = "Conflict") {
    const error = new Error(message);
    error.statusCode = 409;
    return error;
  }
  /**
   * Rate limit error
   */
  static rateLimitError() {
    const error = new Error("Too many requests, please try again later");
    error.statusCode = 429;
    return error;
  }
};
var errorHandler_default = ErrorHandler;

// server/middleware/security.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "mongo-sanitize";
import cors from "cors";
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // 5 requests per windowMs
  message: "Too many login attempts, please try again later",
  skipSuccessfulRequests: true
});
var apiLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 30,
  // 30 requests per minute
  message: "Too many API requests, please try again later"
});
function sanitizeInput(req, res, next) {
  if (req.body) {
    req.body = mongoSanitize()(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize()(req.query);
  }
  next();
}
function preventSQLInjection(req, res, next) {
  const sqlKeywords = ["DROP", "DELETE", "INSERT", "UPDATE", "SELECT", "UNION", "EXEC", "SCRIPT"];
  const checkString = (str) => {
    return sqlKeywords.some((keyword) => str.toUpperCase().includes(keyword));
  };
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string" && checkString(value)) {
        return next(errorHandler_default.forbiddenError("Invalid input detected"));
      }
    }
  }
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string" && checkString(value)) {
        return next(errorHandler_default.forbiddenError("Invalid input detected"));
      }
    }
  }
  next();
}
function preventXSS(req, res, next) {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  const checkString = (str) => {
    return xssPatterns.some((pattern) => pattern.test(str));
  };
  if (req.body) {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === "string" && checkString(value)) {
        return next(errorHandler_default.forbiddenError("Invalid input detected"));
      }
    }
  }
  next();
}
var corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"]
};
function applySecurityMiddleware(app2) {
  app2.use(helmet());
  app2.use(cors(corsOptions));
  app2.use("/api/", generalLimiter);
  app2.use("/api/auth/login", authLimiter);
  app2.use("/api/auth/register", authLimiter);
  app2.use(sanitizeInput);
  app2.use(preventXSS);
  app2.use(preventSQLInjection);
}

// server/utils/cache.ts
var Cache = class {
  cache = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1e3);
  }
  /**
   * Set cache entry
   */
  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1e3;
    this.cache.set(key, { value, expiresAt });
  }
  /**
   * Get cache entry
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }
  /**
   * Check if key exists
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
  /**
   * Delete cache entry
   */
  delete(key) {
    this.cache.delete(key);
  }
  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }
  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }
  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }
  /**
   * Get cache stats
   */
  stats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, entry.expiresAt - Date.now())
      }))
    };
  }
  /**
   * Destroy cache
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
};
var cache_default = new Cache();

// server/middleware/cacheMiddleware.ts
function invalidateCache(pattern) {
  if (!pattern) {
    cache_default.clear();
    return;
  }
  const stats = cache_default.stats();
  stats.entries.forEach((entry) => {
    if (entry.key.includes(pattern)) {
      cache_default.delete(entry.key);
    }
  });
}
function cacheInvalidationMiddleware(req, res, next) {
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (req.user?.id) {
      invalidateCache(req.user.id);
    }
  }
  next();
}

// server/services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// server/database/connection.ts
import pkg from "pg";
import dotenv from "dotenv";
var { Pool } = pkg;
dotenv.config();
var DatabaseService = class {
  pool = null;
  config;
  constructor() {
    const user = process.env.DB_USER || process.env.PGUSER || "postgres";
    const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || "password";
    const host = process.env.DB_HOST || process.env.PGHOST || "localhost";
    const port = parseInt(process.env.DB_PORT || process.env.PGPORT || "5432");
    const database = process.env.DB_NAME || process.env.PGDATABASE || "trixieverse";
    if (process.env.DATABASE_URL) {
      try {
        const url = new URL(process.env.DATABASE_URL);
        this.config = {
          user: url.username || user,
          password: url.password || password,
          host: url.hostname || host,
          port: parseInt(url.port || String(port)),
          database: url.pathname.slice(1) || database,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
        };
      } catch (error) {
        console.warn("Failed to parse DATABASE_URL, using individual variables");
        this.config = {
          user,
          password,
          host,
          port,
          database,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
        };
      }
    } else {
      this.config = {
        user,
        password,
        host,
        port,
        database,
        ssl: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
      };
    }
  }
  /**
   * Initialize database connection pool
   */
  async connect() {
    try {
      this.pool = new Pool(this.config);
      const client = await this.pool.connect();
      console.log("\u2705 Database connected successfully");
      client.release();
    } catch (error) {
      console.error("\u274C Database connection failed:", error);
      throw error;
    }
  }
  /**
   * Execute a query
   */
  async query(text, params) {
    if (!this.pool) {
      throw new Error("Database not connected");
    }
    try {
      return await this.pool.query(text, params);
    } catch (error) {
      console.error("Query error:", error);
      throw error;
    }
  }
  /**
   * Execute a transaction
   */
  async transaction(callback) {
    if (!this.pool) {
      throw new Error("Database not connected");
    }
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  /**
   * Close database connection
   */
  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log("\u2705 Database disconnected");
    }
  }
  /**
   * Get pool for advanced operations
   */
  getPool() {
    return this.pool;
  }
};
var connection_default = new DatabaseService();

// server/services/authService.ts
import dotenv2 from "dotenv";
dotenv2.config();
var AuthService = class {
  jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
  refreshSecret = process.env.REFRESH_SECRET || "your-refresh-secret-change-in-production";
  accessTokenExpiry = "15m";
  refreshTokenExpiry = "7d";
  /**
   * Register a new user
   */
  async register(email, username, password) {
    try {
      const existingUser = await connection_default.query(
        "SELECT id FROM users WHERE email = $1 OR username = $2",
        [email, username]
      );
      if (existingUser.rows.length > 0) {
        throw new Error("Email or username already exists");
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await connection_default.query(
        `INSERT INTO users (email, username, password_hash, last_login)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING id, email, username, created_at`,
        [email, username, passwordHash]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }
  /**
   * Login user
   */
  async login(email, password) {
    try {
      const result = await connection_default.query(
        "SELECT id, email, username, password_hash FROM users WHERE email = $1 AND is_active = true",
        [email]
      );
      if (result.rows.length === 0) {
        throw new Error("Invalid email or password");
      }
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new Error("Invalid email or password");
      }
      await connection_default.query(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1",
        [user.id]
      );
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username
      });
      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          created_at: user.created_at
        },
        tokens
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
  /**
   * Generate JWT tokens
   */
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry
    });
    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshTokenExpiry
    });
    return { accessToken, refreshToken };
  }
  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }
  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      const result = await connection_default.query(
        "SELECT id, email, username FROM users WHERE id = $1 AND is_active = true",
        [payload.userId]
      );
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }
      const user = result.rows[0];
      return this.generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
  }
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const result = await connection_default.query(
        "SELECT id, email, username, created_at FROM users WHERE id = $1 AND is_active = true",
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Get user error:", error);
      throw error;
    }
  }
  /**
   * Update user profile
   */
  async updateProfile(userId, email, username) {
    try {
      const updates = [];
      const params = [userId];
      let paramIndex = 2;
      if (email) {
        updates.push(`email = $${paramIndex}`);
        params.push(email);
        paramIndex++;
      }
      if (username) {
        updates.push(`username = $${paramIndex}`);
        params.push(username);
        paramIndex++;
      }
      if (updates.length === 0) {
        throw new Error("No updates provided");
      }
      const result = await connection_default.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $1
         RETURNING id, email, username, created_at`,
        params
      );
      return result.rows[0];
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    try {
      const result = await connection_default.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
      );
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }
      const user = result.rows[0];
      const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!passwordMatch) {
        throw new Error("Invalid password");
      }
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await connection_default.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [newPasswordHash, userId]
      );
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }
};
var authService_default = new AuthService();

// server/middleware/authMiddleware.ts
var verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Missing or invalid authorization header"
      });
    }
    const token = authHeader.substring(7);
    try {
      const payload = authService_default.verifyAccessToken(token);
      req.user = payload;
      req.userId = payload.userId;
      next();
    } catch (error) {
      return res.status(401).json({
        error: "Invalid or expired token"
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Authentication error"
    });
  }
};

// server/routes/apiRoutes.ts
import { Router as Router7 } from "express";

// server/routes/authRoutes.ts
import { Router } from "express";
var router = Router();
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match"
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }
    const user = await authService_default.register(email, username, password);
    const tokens = authService_default.generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username
    });
    res.status(201).json({
      success: true,
      user,
      tokens
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Registration failed"
    });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }
    const { user, tokens } = await authService_default.login(email, password);
    res.json({
      success: true,
      user,
      tokens
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({
      error: error instanceof Error ? error.message : "Login failed"
    });
  }
});
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        error: "Refresh token is required"
      });
    }
    const tokens = await authService_default.refreshAccessToken(refreshToken);
    res.json({
      success: true,
      tokens
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(401).json({
      error: error instanceof Error ? error.message : "Token refresh failed"
    });
  }
});
router.get("/me", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const user = await authService_default.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to get user"
    });
  }
});
router.put("/profile", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const { email, username } = req.body;
    const user = await authService_default.updateProfile(req.userId, email, username);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to update profile"
    });
  }
});
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "New passwords do not match"
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }
    await authService_default.changePassword(req.userId, oldPassword, newPassword);
    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to change password"
    });
  }
});
var authRoutes_default = router;

// server/routes/accountRoutes.ts
import { Router as Router2 } from "express";

// server/services/mockOpggService.ts
var demoPlayers = {
  "TR1XON#EUW": {
    name: "TR1XON",
    tag: "EUW",
    level: 32,
    rank: "Emerald",
    rp: 75,
    winRate: 58,
    matchCount: 124,
    champions: [
      {
        name: "Ahri",
        tier: "S+",
        mastery: 7,
        winRate: 62,
        pickRate: 45,
        matchCount: 56
      },
      {
        name: "Lux",
        tier: "S",
        mastery: 6,
        winRate: 58,
        pickRate: 30,
        matchCount: 37
      },
      {
        name: "Akali",
        tier: "A",
        mastery: 5,
        winRate: 52,
        pickRate: 15,
        matchCount: 18
      },
      {
        name: "Seraphine",
        tier: "A",
        mastery: 4,
        winRate: 55,
        pickRate: 8,
        matchCount: 10
      },
      {
        name: "Twisted Fate",
        tier: "B",
        mastery: 3,
        winRate: 48,
        pickRate: 2,
        matchCount: 3
      }
    ],
    recentMatches: [
      {
        id: "match_001",
        champion: "Ahri",
        result: "win",
        kda: "12/2/8",
        duration: 1850,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1e3)
      },
      {
        id: "match_002",
        champion: "Lux",
        result: "win",
        kda: "8/3/15",
        duration: 2100,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1e3)
      },
      {
        id: "match_003",
        champion: "Ahri",
        result: "loss",
        kda: "5/6/4",
        duration: 1650,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1e3)
      },
      {
        id: "match_004",
        champion: "Akali",
        result: "win",
        kda: "10/4/6",
        duration: 1900,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1e3)
      },
      {
        id: "match_005",
        champion: "Seraphine",
        result: "win",
        kda: "3/1/18",
        duration: 2050,
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1e3)
      }
    ],
    lastUpdated: /* @__PURE__ */ new Date()
  },
  "Faker#KR": {
    name: "Faker",
    tag: "KR",
    level: 35,
    rank: "Grandmaster",
    rp: 200,
    winRate: 68,
    matchCount: 156,
    champions: [
      {
        name: "Ahri",
        tier: "S+",
        mastery: 7,
        winRate: 72,
        pickRate: 50,
        matchCount: 78
      },
      {
        name: "Lux",
        tier: "S+",
        mastery: 7,
        winRate: 70,
        pickRate: 35,
        matchCount: 55
      },
      {
        name: "Akali",
        tier: "S",
        mastery: 6,
        winRate: 65,
        pickRate: 12,
        matchCount: 19
      },
      {
        name: "Twisted Fate",
        tier: "S",
        mastery: 6,
        winRate: 62,
        pickRate: 2,
        matchCount: 3
      },
      {
        name: "Seraphine",
        tier: "A",
        mastery: 5,
        winRate: 58,
        pickRate: 1,
        matchCount: 1
      }
    ],
    recentMatches: [
      {
        id: "match_001",
        champion: "Ahri",
        result: "win",
        kda: "15/1/10",
        duration: 1800,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1e3)
      },
      {
        id: "match_002",
        champion: "Lux",
        result: "win",
        kda: "10/2/18",
        duration: 2e3,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1e3)
      },
      {
        id: "match_003",
        champion: "Ahri",
        result: "win",
        kda: "13/3/9",
        duration: 1950,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1e3)
      },
      {
        id: "match_004",
        champion: "Akali",
        result: "win",
        kda: "12/2/8",
        duration: 1850,
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1e3)
      },
      {
        id: "match_005",
        champion: "Lux",
        result: "win",
        kda: "8/1/20",
        duration: 2100,
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1e3)
      }
    ],
    lastUpdated: /* @__PURE__ */ new Date()
  }
};
var MockOpggService = class {
  /**
   * Search for a player by name and tag
   */
  async searchPlayer(gameName, tag) {
    const key = `${gameName}#${tag}`;
    if (demoPlayers[key]) {
      return JSON.parse(JSON.stringify(demoPlayers[key]));
    }
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const randomPlayer = JSON.parse(JSON.stringify(demoPlayers[randomKey]));
    randomPlayer.name = gameName;
    randomPlayer.tag = tag;
    return randomPlayer;
  }
  /**
   * Get player stats by summoner ID
   */
  async getPlayerStats(summonerId) {
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    return JSON.parse(JSON.stringify(demoPlayers[randomKey]));
  }
  /**
   * Get player's recent matches
   */
  async getRecentMatches(summonerId, limit = 10) {
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const player = demoPlayers[randomKey];
    return player.recentMatches.slice(0, limit);
  }
  /**
   * Get champion statistics for a player
   */
  async getChampionStats(summonerId) {
    const randomKey = Object.keys(demoPlayers)[Math.floor(Math.random() * Object.keys(demoPlayers).length)];
    const player = demoPlayers[randomKey];
    return player.champions;
  }
  /**
   * Get tier list for a specific role
   */
  async getTierList(role) {
    return [
      { name: "Ahri", tier: "S+", pickRate: 45, winRate: 62 },
      { name: "Lux", tier: "S+", pickRate: 40, winRate: 60 },
      { name: "Akali", tier: "S", pickRate: 30, winRate: 58 },
      { name: "Seraphine", tier: "S", pickRate: 25, winRate: 57 },
      { name: "Twisted Fate", tier: "A", pickRate: 15, winRate: 52 }
    ];
  }
};
var mockOpggService_default = new MockOpggService();

// server/routes/accountRoutes.ts
var router2 = Router2();
router2.post("/connect", async (req, res) => {
  try {
    const { gameName, tag } = req.body;
    if (!gameName || !tag) {
      return res.status(400).json({
        error: "Game name and tag are required"
      });
    }
    const player = await mockOpggService_default.searchPlayer(gameName, tag);
    if (!player) {
      return res.status(404).json({
        error: "Player not found"
      });
    }
    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error("Error connecting account:", error);
    res.status(500).json({
      error: "Failed to connect account"
    });
  }
});
router2.get("/:summonerId/stats", async (req, res) => {
  try {
    const { summonerId } = req.params;
    const player = await mockOpggService_default.getPlayerStats(summonerId);
    if (!player) {
      return res.status(404).json({
        error: "Player not found"
      });
    }
    res.json({
      success: true,
      player
    });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({
      error: "Failed to fetch player stats"
    });
  }
});
router2.get("/:summonerId/matches", async (req, res) => {
  try {
    const { summonerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const matches = await mockOpggService_default.getRecentMatches(summonerId, limit);
    res.json({
      success: true,
      matches
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({
      error: "Failed to fetch matches"
    });
  }
});
router2.get("/:summonerId/champions", async (req, res) => {
  try {
    const { summonerId } = req.params;
    const champions = await mockOpggService_default.getChampionStats(summonerId);
    res.json({
      success: true,
      champions
    });
  } catch (error) {
    console.error("Error fetching champion stats:", error);
    res.status(500).json({
      error: "Failed to fetch champion stats"
    });
  }
});
router2.get("/meta/tier-list", async (req, res) => {
  try {
    const role = req.query.role;
    if (!role) {
      return res.status(400).json({
        error: "Role is required"
      });
    }
    const tierList = await mockOpggService_default.getTierList(role);
    res.json({
      success: true,
      tierList
    });
  } catch (error) {
    console.error("Error fetching tier list:", error);
    res.status(500).json({
      error: "Failed to fetch tier list"
    });
  }
});
var accountRoutes_default = router2;

// server/routes/coachRoutes.ts
import { Router as Router3 } from "express";

// server/agents/coachAgent.ts
var CoachAgent = class {
  personality;
  memory;
  constructor(personality, memory) {
    this.personality = personality;
    this.memory = memory;
  }
  /**
   * Generate a personalized coach response based on context
   */
  async generateResponse(context) {
    switch (context.type) {
      case "greeting":
        return this.generateGreeting();
      case "match_analysis":
        return this.generateMatchAnalysis(context.data);
      case "motivation":
        return this.generateMotivation();
      case "goal_update":
        return this.generateGoalUpdate(context.data);
      case "achievement":
        return this.generateAchievementCelebration(context.data);
      case "struggle":
        return this.generateComfort(context.data);
      default:
        return this.generateGenericResponse();
    }
  }
  /**
   * Generate a personalized greeting
   */
  generateGreeting() {
    const greetings = {
      Sage: [
        `Welcome back, ${this.memory.playerName}. I've been analyzing the meta while you were away. Shall we discuss your next moves?`,
        `Greetings, ${this.memory.playerName}. I sense you're ready for another climb. Let's make it count.`,
        `${this.memory.playerName}, your journey continues. I'm here to guide you through every step.`
      ],
      Blaze: [
        `YOOO ${this.memory.playerName}! LET'S GOOOO! \u{1F525} Ready to crush some ranked?`,
        `${this.memory.playerName}! I've been HYPED waiting for you! Let's show them what you're made of!`,
        `WELCOME BACK, CHAMPION! \u{1F680} Time to climb and dominate!`
      ],
      Echo: [
        `I've been waiting for you, ${this.memory.playerName}. The path to mastery awaits.`,
        `Your presence is felt, ${this.memory.playerName}. Shall we continue our journey?`,
        `${this.memory.playerName}... I sense great potential in you today.`
      ],
      Nova: [
        `Hey ${this.memory.playerName}! \u{1F604} Missed you! Ready to have some fun while climbing?`,
        `${this.memory.playerName}! You're back! Let's make today awesome! \u{1F3AE}`,
        `Haha, good to see you ${this.memory.playerName}! Let's get this bread! \u{1F4AA}`
      ]
    };
    const personalityGreetings = greetings[this.personality.name];
    return personalityGreetings[Math.floor(Math.random() * personalityGreetings.length)];
  }
  /**
   * Generate match analysis feedback
   */
  generateMatchAnalysis(matchData) {
    const { result, kda, cs, mistakes, highlights } = matchData;
    if (result === "win") {
      return this.generateWinAnalysis(matchData);
    } else {
      return this.generateLossAnalysis(matchData);
    }
  }
  generateWinAnalysis(matchData) {
    const analyses = {
      Sage: [
        `Excellent work, ${this.memory.playerName}. Your ${matchData.cs} CS/min demonstrates improved farming efficiency. Let's maintain this momentum.`,
        `I've analyzed your positioning in that teamfight. Your decision-making was sound. Here's what we can refine further...`
      ],
      Blaze: [
        `YOOOOO! THAT WAS INSANE! \u{1F525} Your KDA was FIRE! You're on an absolute TEAR!`,
        `${this.memory.playerName}! I LOVED that play! That's the energy I want to see! KEEP IT UP!`
      ],
      Echo: [
        `Your victory reveals something deeper about your growth. The patterns are becoming clearer.`,
        `I sense a shift in your playstyle. This win is no accident. You're evolving.`
      ],
      Nova: [
        `HAHA! That was HILARIOUS and AWESOME at the same time! \u{1F602} Great job out there!`,
        `Dude, that play was CHEF'S KISS! \u{1F44C} You're getting better every game!`
      ]
    };
    const analysis = analyses[this.personality.name];
    return analysis[Math.floor(Math.random() * analysis.length)];
  }
  generateLossAnalysis(matchData) {
    const analyses = {
      Sage: [
        `That loss was valuable, ${this.memory.playerName}. I noticed ${matchData.mistakes[0] || "some positioning issues"}. Let's focus on this in your next game.`,
        `Don't be discouraged. Even the best players have losses. Here's what I observed...`
      ],
      Blaze: [
        `Hey, even LEGENDS have bad games! \u{1F525} You got this! Let's learn and come back STRONGER!`,
        `That's okay, ${this.memory.playerName}! One loss doesn't define you! Let's analyze and DOMINATE next time!`
      ],
      Echo: [
        `This loss carries a lesson. I sense frustration, but also opportunity for growth.`,
        `The path to mastery includes defeats. This is part of your evolution.`
      ],
      Nova: [
        `Hey, it happens! \u{1F604} Even the pros lose! Let's laugh it off and come back stronger!`,
        `One loss doesn't mean anything, ${this.memory.playerName}! You got this! \u{1F4AA}`
      ]
    };
    const analysis = analyses[this.personality.name];
    return analysis[Math.floor(Math.random() * analysis.length)];
  }
  /**
   * Generate motivational message
   */
  generateMotivation() {
    const motivations = {
      Sage: [
        `${this.memory.playerName}, I believe in your potential. Every great player started where you are now.`,
        `Remember why you started this journey. Your dedication will pay off.`
      ],
      Blaze: [
        `YOU GOT THIS, ${this.memory.playerName}! \u{1F680} I BELIEVE IN YOU! LET'S GOOOOO!`,
        `Don't give up! You're STRONGER than you think! KEEP PUSHING! \u{1F4AA}`
      ],
      Echo: [
        `Your potential is boundless, ${this.memory.playerName}. Trust the process.`,
        `I see greatness in your future. Keep walking this path.`
      ],
      Nova: [
        `You're doing AMAZING, ${this.memory.playerName}! \u{1F604} Keep being awesome!`,
        `Believe in yourself! You're way better than you think! \u{1F3AE}`
      ]
    };
    const motivation = motivations[this.personality.name];
    return motivation[Math.floor(Math.random() * motivation.length)];
  }
  /**
   * Generate goal update message
   */
  generateGoalUpdate(goalData) {
    const { goalTitle, progress, percentage } = goalData;
    const updates = {
      Sage: [
        `${this.memory.playerName}, you're ${percentage}% toward your goal of "${goalTitle}". Your consistency is impressive.`,
        `Progress update: You're making steady advancement on "${goalTitle}". Keep this pace.`
      ],
      Blaze: [
        `YOOO! You're ${percentage}% done with "${goalTitle}"! YOU'RE CRUSHING IT! \u{1F525}`,
        `${percentage}% TOWARD YOUR GOAL! I'm SO HYPED for you, ${this.memory.playerName}!`
      ],
      Echo: [
        `Your journey toward "${goalTitle}" is ${percentage}% complete. The path becomes clearer.`,
        `I sense your determination. ${percentage}% progress on "${goalTitle}". You're on the right path.`
      ],
      Nova: [
        `${percentage}% done with "${goalTitle}"! You're KILLING IT! \u{1F604} Keep going!`,
        `Dude, you're almost there! ${percentage}% toward "${goalTitle}"! Let's finish this! \u{1F4AA}`
      ]
    };
    const update = updates[this.personality.name];
    return update[Math.floor(Math.random() * update.length)];
  }
  /**
   * Generate achievement celebration
   */
  generateAchievementCelebration(achievementData) {
    const { achievementName, tier } = achievementData;
    const celebrations = {
      Sage: [
        `Congratulations, ${this.memory.playerName}. You've unlocked "${achievementName}". This marks your progress.`,
        `${achievementName} achieved. Your dedication continues to bear fruit.`
      ],
      Blaze: [
        `YOOOOOOO!!! \u{1F389} YOU UNLOCKED "${achievementName}"!!! I'M SO PROUD OF YOU!!!`,
        `${this.memory.playerName}!!! THAT'S AMAZING!!! "${achievementName}" IS YOURS!!! \u{1F680}`
      ],
      Echo: [
        `"${achievementName}" is now yours. Another milestone in your ascension.`,
        `You've achieved "${achievementName}". The pattern of your growth continues.`
      ],
      Nova: [
        `YESSS!!! \u{1F389} You got "${achievementName}"!!! That's SO COOL! \u{1F604}`,
        `Dude! "${achievementName}"! YOU'RE AWESOME! \u{1F525}`
      ]
    };
    const celebration = celebrations[this.personality.name];
    return celebration[Math.floor(Math.random() * celebration.length)];
  }
  /**
   * Generate comfort message for struggles
   */
  generateComfort(struggleData) {
    const { issue } = struggleData;
    const comforts = {
      Sage: [
        `${this.memory.playerName}, struggles are part of growth. Let's analyze this ${issue} together and find solutions.`,
        `I understand your frustration with ${issue}. This is an opportunity to improve. I'm here to help.`
      ],
      Blaze: [
        `Hey ${this.memory.playerName}, I got you! \u{1F4AA} We'll figure out this ${issue} together and come back STRONGER!`,
        `Don't worry! ${issue} is just a temporary setback! We'll crush it next time! \u{1F525}`
      ],
      Echo: [
        `I sense your struggle with ${issue}. But within struggle lies the seed of mastery.`,
        `${issue} is a teacher, ${this.memory.playerName}. Let's learn from it together.`
      ],
      Nova: [
        `Hey, it's okay! \u{1F604} ${issue} happens to everyone! We'll figure it out together!`,
        `Don't be sad! ${issue} is just a learning moment! You got this! \u{1F4AA}`
      ]
    };
    const comfort = comforts[this.personality.name];
    return comfort[Math.floor(Math.random() * comfort.length)];
  }
  /**
   * Generate generic response
   */
  generateGenericResponse() {
    const responses = {
      Sage: [
        `How can I assist you today, ${this.memory.playerName}?`,
        `What would you like to work on?`
      ],
      Blaze: [
        `What's up, ${this.memory.playerName}? Let's DO THIS! \u{1F525}`,
        `Ready to improve? Let's go!`
      ],
      Echo: [
        `I'm listening, ${this.memory.playerName}.`,
        `What's on your mind?`
      ],
      Nova: [
        `Yo ${this.memory.playerName}! What's up? \u{1F604}`,
        `What do you need help with?`
      ]
    };
    const response = responses[this.personality.name];
    return response[Math.floor(Math.random() * response.length)];
  }
  /**
   * Update coach memory with new information
   */
  updateMemory(updates) {
    this.memory = {
      ...this.memory,
      ...updates,
      lastInteractionDate: /* @__PURE__ */ new Date(),
      totalInteractions: this.memory.totalInteractions + 1
    };
  }
  /**
   * Get coach memory
   */
  getMemory() {
    return this.memory;
  }
  /**
   * Get coach personality
   */
  getPersonality() {
    return this.personality;
  }
  /**
   * Update coach personality
   */
  setPersonality(personality) {
    this.personality = personality;
  }
};
var coachAgent_default = CoachAgent;

// server/routes/coachRoutes.ts
var router3 = Router3();
var coachAgents = /* @__PURE__ */ new Map();
function getOrCreateCoach(userId, personality, memory) {
  if (!coachAgents.has(userId)) {
    coachAgents.set(userId, new coachAgent_default(personality, memory));
  }
  return coachAgents.get(userId);
}
router3.post("/response", async (req, res) => {
  try {
    const { userId, personality, memory, context } = req.body;
    if (!userId || !context) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse(context);
    if (memory) {
      coach.updateMemory(memory);
    }
    res.json({
      success: true,
      response,
      memory: coach.getMemory()
    });
  } catch (error) {
    console.error("Error generating coach response:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});
router3.get("/memory/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }
    res.json({
      success: true,
      memory: coach.getMemory()
    });
  } catch (error) {
    console.error("Error getting coach memory:", error);
    res.status(500).json({ error: "Failed to get memory" });
  }
});
router3.put("/memory/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { memory } = req.body;
    if (!memory) {
      return res.status(400).json({ error: "Missing memory data" });
    }
    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }
    coach.updateMemory(memory);
    res.json({
      success: true,
      memory: coach.getMemory()
    });
  } catch (error) {
    console.error("Error updating coach memory:", error);
    res.status(500).json({ error: "Failed to update memory" });
  }
});
router3.put("/personality/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const { personality } = req.body;
    if (!personality) {
      return res.status(400).json({ error: "Missing personality data" });
    }
    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }
    coach.setPersonality(personality);
    res.json({
      success: true,
      personality: coach.getPersonality()
    });
  } catch (error) {
    console.error("Error updating coach personality:", error);
    res.status(500).json({ error: "Failed to update personality" });
  }
});
router3.get("/personality/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const coach = coachAgents.get(userId);
    if (!coach) {
      return res.status(404).json({ error: "Coach not found" });
    }
    res.json({
      success: true,
      personality: coach.getPersonality()
    });
  } catch (error) {
    console.error("Error getting coach personality:", error);
    res.status(500).json({ error: "Failed to get personality" });
  }
});
router3.post("/greeting", async (req, res) => {
  try {
    const { userId, personality, memory } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({ type: "greeting" });
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error("Error generating greeting:", error);
    res.status(500).json({ error: "Failed to generate greeting" });
  }
});
router3.post("/analyze-match", async (req, res) => {
  try {
    const { userId, personality, memory, matchData } = req.body;
    if (!userId || !matchData) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({
      type: "match_analysis",
      data: matchData
    });
    res.json({
      success: true,
      response,
      analysis: {
        result: matchData.result,
        kda: matchData.kda,
        cs: matchData.cs
      }
    });
  } catch (error) {
    console.error("Error analyzing match:", error);
    res.status(500).json({ error: "Failed to analyze match" });
  }
});
router3.post("/celebrate-achievement", async (req, res) => {
  try {
    const { userId, personality, memory, achievement } = req.body;
    if (!userId || !achievement) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const coach = getOrCreateCoach(userId, personality, memory);
    const response = await coach.generateResponse({
      type: "achievement",
      data: achievement
    });
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error("Error celebrating achievement:", error);
    res.status(500).json({ error: "Failed to celebrate achievement" });
  }
});
var coachRoutes_default = router3;

// server/routes/gamificationRoutes.ts
import { Router as Router4 } from "express";

// server/services/gamificationService.ts
var GamificationService = class {
  /**
   * Award achievement
   */
  async awardAchievement(userId, achievementType, data) {
    try {
      const existing = await connection_default.query(
        `SELECT id FROM achievements 
         WHERE user_id = $1 AND achievement_type = $2`,
        [userId, achievementType]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0];
      }
      const result = await connection_default.query(
        `INSERT INTO achievements 
         (user_id, achievement_type, title, description, rarity, icon_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, achievementType, data.title, data.description, data.rarity, data.iconUrl]
      );
      const xpReward = {
        common: 10,
        rare: 25,
        epic: 50,
        legendary: 100
      }[data.rarity];
      await this.addXP(userId, xpReward);
      return result.rows[0];
    } catch (error) {
      console.error("Award achievement error:", error);
      throw error;
    }
  }
  /**
   * Add XP to user
   */
  async addXP(userId, amount) {
    try {
      const result = await connection_default.query(
        `SELECT 
           COALESCE((SELECT SUM(CAST(analysis_data->>'performanceScore' AS FLOAT)) FROM matches WHERE user_id = $1), 0) as total_xp
         FROM users WHERE id = $1`,
        [userId]
      );
      const totalXP = (result.rows[0]?.total_xp || 0) + amount;
      const level = Math.floor(totalXP / 100) + 1;
      return totalXP;
    } catch (error) {
      console.error("Add XP error:", error);
      throw error;
    }
  }
  /**
   * Get user level
   */
  async getUserLevel(userId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           COALESCE(SUM(CAST(analysis_data->>'performanceScore' AS FLOAT)), 0) as total_xp
         FROM matches WHERE user_id = $1`,
        [userId]
      );
      const totalXP = result.rows[0]?.total_xp || 0;
      const level = Math.floor(totalXP / 100) + 1;
      const nextLevelXP = level * 100;
      const currentLevelXP = (level - 1) * 100;
      const xpInLevel = totalXP - currentLevelXP;
      return {
        level,
        xp: xpInLevel,
        nextLevelXP: nextLevelXP - currentLevelXP
      };
    } catch (error) {
      console.error("Get user level error:", error);
      throw error;
    }
  }
  /**
   * Track win streak
   */
  async updateWinStreak(userId, playerAccountId, isWin) {
    try {
      const result = await connection_default.query(
        `SELECT result FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT 5`,
        [userId, playerAccountId]
      );
      if (!isWin) {
        return 0;
      }
      let streak = 0;
      for (const match of result.rows) {
        if (match.result === "win") {
          streak++;
        } else {
          break;
        }
      }
      if (streak === 3) {
        await this.awardAchievement(userId, "win_streak_3", {
          title: "3-Win Streak",
          description: "Won 3 matches in a row",
          rarity: "common",
          iconUrl: "\u{1F525}"
        });
      } else if (streak === 5) {
        await this.awardAchievement(userId, "win_streak_5", {
          title: "5-Win Streak",
          description: "Won 5 matches in a row",
          rarity: "rare",
          iconUrl: "\u{1F525}\u{1F525}"
        });
      } else if (streak === 10) {
        await this.awardAchievement(userId, "win_streak_10", {
          title: "10-Win Streak",
          description: "Won 10 matches in a row",
          rarity: "epic",
          iconUrl: "\u{1F525}\u{1F525}\u{1F525}"
        });
      }
      return streak;
    } catch (error) {
      console.error("Update win streak error:", error);
      throw error;
    }
  }
  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 100, timeframe = "month") {
    try {
      const timeframeSQL = {
        week: "AND m.match_timestamp > NOW() - INTERVAL '7 days'",
        month: "AND m.match_timestamp > NOW() - INTERVAL '30 days'",
        all: ""
      }[timeframe];
      const result = await connection_default.query(
        `SELECT 
           u.id,
           u.username,
           COUNT(m.id) as matches_played,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(m.id) * 100 as win_rate,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           COUNT(a.id) as achievements_unlocked,
           ROW_NUMBER() OVER (ORDER BY AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) DESC) as rank
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id ${timeframeSQL}
         LEFT JOIN achievements a ON u.id = a.user_id
         GROUP BY u.id, u.username
         HAVING COUNT(m.id) > 0
         ORDER BY avg_performance DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get leaderboard error:", error);
      throw error;
    }
  }
  /**
   * Get user rank
   */
  async getUserRank(userId, timeframe = "month") {
    try {
      const timeframeSQL = {
        week: "AND m.match_timestamp > NOW() - INTERVAL '7 days'",
        month: "AND m.match_timestamp > NOW() - INTERVAL '30 days'",
        all: ""
      }[timeframe];
      const result = await connection_default.query(
        `SELECT rank FROM (
           SELECT 
             u.id,
             ROW_NUMBER() OVER (ORDER BY AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) DESC) as rank
           FROM users u
           LEFT JOIN matches m ON u.id = m.user_id ${timeframeSQL}
           GROUP BY u.id
           HAVING COUNT(m.id) > 0
         ) ranked
         WHERE id = $1`,
        [userId]
      );
      return result.rows[0]?.rank || 0;
    } catch (error) {
      console.error("Get user rank error:", error);
      throw error;
    }
  }
  /**
   * Get user achievements
   */
  async getUserAchievements(userId) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM achievements 
         WHERE user_id = $1
         ORDER BY unlocked_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Get user achievements error:", error);
      throw error;
    }
  }
  /**
   * Get badges progress
   */
  async getBadgesProgress(userId) {
    try {
      const achievements = await this.getUserAchievements(userId);
      const level = await this.getUserLevel(userId);
      const badges = [
        {
          type: "skill",
          title: "Skill Master",
          description: "Reach 100 performance score",
          icon: "\u2B50",
          progress: Math.min(level.level * 10, 100),
          maxProgress: 100
        },
        {
          type: "milestone",
          title: "Match Veteran",
          description: "Play 100 matches",
          icon: "\u{1F3AE}",
          progress: Math.min(achievements.length * 5, 100),
          maxProgress: 100
        },
        {
          type: "community",
          title: "Community Hero",
          description: "Help 10 players improve",
          icon: "\u{1F49C}",
          progress: 0,
          maxProgress: 100
        },
        {
          type: "seasonal",
          title: "Season Champion",
          description: "Reach top 10 in season",
          icon: "\u{1F451}",
          progress: 0,
          maxProgress: 100
        }
      ];
      return badges;
    } catch (error) {
      console.error("Get badges progress error:", error);
      throw error;
    }
  }
  /**
   * Check and award milestone achievements
   */
  async checkMilestones(userId, playerAccountId) {
    try {
      const awarded = [];
      const matchResult = await connection_default.query(
        `SELECT COUNT(*) as count FROM matches WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );
      const matchCount = matchResult.rows[0].count;
      const milestones = [
        { count: 1, achievement: "first_match", title: "First Step", rarity: "common" },
        { count: 10, achievement: "ten_matches", title: "Getting Started", rarity: "common" },
        { count: 50, achievement: "fifty_matches", title: "Dedicated Player", rarity: "rare" },
        { count: 100, achievement: "hundred_matches", title: "Veteran", rarity: "epic" },
        { count: 500, achievement: "five_hundred_matches", title: "Legend", rarity: "legendary" }
      ];
      for (const milestone of milestones) {
        if (matchCount >= milestone.count) {
          const achievement = await this.awardAchievement(userId, milestone.achievement, {
            title: milestone.title,
            description: `Played ${milestone.count} matches`,
            rarity: milestone.rarity,
            iconUrl: "\u{1F3C6}"
          });
          awarded.push(achievement);
        }
      }
      return awarded;
    } catch (error) {
      console.error("Check milestones error:", error);
      throw error;
    }
  }
};
var gamificationService_default = new GamificationService();

// server/routes/gamificationRoutes.ts
var router4 = Router4();
router4.get("/level", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const level = await gamificationService_default.getUserLevel(userId);
    res.json(level);
  } catch (error) {
    res.status(500).json({ error: "Failed to get level" });
  }
});
router4.get("/achievements", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const achievements = await gamificationService_default.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: "Failed to get achievements" });
  }
});
router4.get("/badges", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const badges = await gamificationService_default.getBadgesProgress(userId);
    res.json(badges);
  } catch (error) {
    res.status(500).json({ error: "Failed to get badges" });
  }
});
router4.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 100, timeframe = "month" } = req.query;
    const leaderboard = await gamificationService_default.getLeaderboard(
      parseInt(limit),
      timeframe
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});
router4.get("/rank", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { timeframe = "month" } = req.query;
    const rank = await gamificationService_default.getUserRank(
      userId,
      timeframe
    );
    res.json({ rank });
  } catch (error) {
    res.status(500).json({ error: "Failed to get rank" });
  }
});
var gamificationRoutes_default = router4;

// server/routes/socialRoutes.ts
import { Router as Router5 } from "express";

// server/services/socialService.ts
var SocialService = class {
  /**
   * Add friend
   */
  async addFriend(userId, friendId) {
    try {
      const existing = await connection_default.query(
        `SELECT id FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId]
      );
      if (existing.rows.length > 0) {
        throw new Error("Already friends");
      }
      await connection_default.query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'accepted')`,
        [userId, friendId]
      );
      await connection_default.query(
        `INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'accepted')`,
        [friendId, userId]
      );
    } catch (error) {
      console.error("Add friend error:", error);
      throw error;
    }
  }
  /**
   * Get friends list
   */
  async getFriends(userId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           u.id,
           u.username,
           pa.current_rank as "currentRank",
           CASE WHEN s.user_id IS NOT NULL THEN true ELSE false END as "isOnline"
         FROM friendships f
         JOIN users u ON f.friend_id = u.id
         LEFT JOIN player_accounts pa ON u.id = pa.user_id AND pa.is_primary = true
         LEFT JOIN sessions s ON u.id = s.user_id AND s.expires_at > NOW()
         WHERE f.user_id = $1 AND f.status = 'accepted'
         ORDER BY u.username`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Get friends error:", error);
      throw error;
    }
  }
  /**
   * Remove friend
   */
  async removeFriend(userId, friendId) {
    try {
      await connection_default.query(
        `DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)`,
        [userId, friendId]
      );
    } catch (error) {
      console.error("Remove friend error:", error);
      throw error;
    }
  }
  /**
   * Create coaching circle
   */
  async createCoachingCircle(userId, data) {
    try {
      const result = await connection_default.query(
        `INSERT INTO coaching_circles (creator_id, name, description, is_public)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, data.name, data.description, data.isPublic]
      );
      const circleId = result.rows[0].id;
      await connection_default.query(
        `INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, 'admin')`,
        [circleId, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Create coaching circle error:", error);
      throw error;
    }
  }
  /**
   * Join coaching circle
   */
  async joinCoachingCircle(userId, circleId) {
    try {
      const existing = await connection_default.query(
        `SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2`,
        [circleId, userId]
      );
      if (existing.rows.length > 0) {
        throw new Error("Already a member");
      }
      await connection_default.query(
        `INSERT INTO circle_members (circle_id, user_id, role) VALUES ($1, $2, 'member')`,
        [circleId, userId]
      );
    } catch (error) {
      console.error("Join coaching circle error:", error);
      throw error;
    }
  }
  /**
   * Get coaching circles
   */
  async getCoachingCircles(userId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           cc.id,
           cc.name,
           cc.description,
           COUNT(cm.id) as "memberCount",
           u.username as "createdBy",
           cc.created_at as "createdAt"
         FROM coaching_circles cc
         JOIN circle_members cm ON cc.id = cm.circle_id
         JOIN users u ON cc.creator_id = u.id
         WHERE cm.user_id = $1
         GROUP BY cc.id, u.username
         ORDER BY cc.created_at DESC`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error("Get coaching circles error:", error);
      throw error;
    }
  }
  /**
   * Get circle members
   */
  async getCircleMembers(circleId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           u.id,
           u.username,
           cm.role,
           pa.current_rank as "currentRank"
         FROM circle_members cm
         JOIN users u ON cm.user_id = u.id
         LEFT JOIN player_accounts pa ON u.id = pa.user_id AND pa.is_primary = true
         WHERE cm.circle_id = $1
         ORDER BY cm.role DESC, u.username`,
        [circleId]
      );
      return result.rows;
    } catch (error) {
      console.error("Get circle members error:", error);
      throw error;
    }
  }
  /**
   * Post in circle
   */
  async postInCircle(userId, circleId, content) {
    try {
      const result = await connection_default.query(
        `INSERT INTO circle_posts (circle_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [circleId, userId, content]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Post in circle error:", error);
      throw error;
    }
  }
  /**
   * Get circle feed
   */
  async getCircleFeed(circleId, limit = 50) {
    try {
      const result = await connection_default.query(
        `SELECT 
           cp.id,
           cp.content,
           u.username,
           cp.created_at as "createdAt",
           COUNT(DISTINCT cpl.id) as "likeCount",
           COUNT(DISTINCT cpc.id) as "commentCount"
         FROM circle_posts cp
         JOIN users u ON cp.user_id = u.id
         LEFT JOIN circle_post_likes cpl ON cp.id = cpl.post_id
         LEFT JOIN circle_post_comments cpc ON cp.id = cpc.post_id
         WHERE cp.circle_id = $1
         GROUP BY cp.id, u.username
         ORDER BY cp.created_at DESC
         LIMIT $2`,
        [circleId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get circle feed error:", error);
      throw error;
    }
  }
  /**
   * Create tournament
   */
  async createTournament(userId, data) {
    try {
      const result = await connection_default.query(
        `INSERT INTO tournaments (creator_id, name, description, max_players, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'upcoming')
         RETURNING *`,
        [userId, data.name, data.description, data.maxPlayers, data.startDate, data.endDate]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Create tournament error:", error);
      throw error;
    }
  }
  /**
   * Join tournament
   */
  async joinTournament(userId, tournamentId) {
    try {
      const existing = await connection_default.query(
        `SELECT id FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2`,
        [tournamentId, userId]
      );
      if (existing.rows.length > 0) {
        throw new Error("Already joined");
      }
      await connection_default.query(
        `INSERT INTO tournament_participants (tournament_id, user_id, status)
         VALUES ($1, $2, 'active')`,
        [tournamentId, userId]
      );
    } catch (error) {
      console.error("Join tournament error:", error);
      throw error;
    }
  }
  /**
   * Get tournaments
   */
  async getTournaments(status = "upcoming") {
    try {
      const result = await connection_default.query(
        `SELECT 
           t.id,
           t.name,
           t.description,
           t.max_players as "maxPlayers",
           COUNT(tp.id) as "participantCount",
           t.start_date as "startDate",
           t.end_date as "endDate",
           t.status,
           u.username as "createdBy"
         FROM tournaments t
         LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
         JOIN users u ON t.creator_id = u.id
         WHERE t.status = $1
         GROUP BY t.id, u.username
         ORDER BY t.start_date ASC`,
        [status]
      );
      return result.rows;
    } catch (error) {
      console.error("Get tournaments error:", error);
      throw error;
    }
  }
  /**
   * Share achievement
   */
  async shareAchievement(userId, achievementId) {
    try {
      const result = await connection_default.query(
        `INSERT INTO achievement_shares (user_id, achievement_id, shared_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, achievementId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Share achievement error:", error);
      throw error;
    }
  }
  /**
   * Get shared achievements feed
   */
  async getSharedAchievementsFeed(limit = 50) {
    try {
      const result = await connection_default.query(
        `SELECT 
           u.username,
           a.title as "achievementTitle",
           a.rarity,
           ash.shared_at as "sharedAt"
         FROM achievement_shares ash
         JOIN users u ON ash.user_id = u.id
         JOIN achievements a ON ash.achievement_id = a.id
         ORDER BY ash.shared_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get shared achievements feed error:", error);
      throw error;
    }
  }
};
var socialService_default = new SocialService();

// server/routes/socialRoutes.ts
var router5 = Router5();
router5.get("/friends", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const friends = await socialService_default.getFriends(userId);
    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: "Failed to get friends" });
  }
});
router5.post("/friends/:friendId", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await socialService_default.addFriend(userId, friendId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add friend" });
  }
});
router5.delete("/friends/:friendId", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { friendId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await socialService_default.removeFriend(userId, friendId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove friend" });
  }
});
router5.get("/circles", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const circles = await socialService_default.getCoachingCircles(userId);
    res.json(circles);
  } catch (error) {
    res.status(500).json({ error: "Failed to get circles" });
  }
});
router5.post("/circles", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, description, isPublic } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }
    const circle = await socialService_default.createCoachingCircle(userId, {
      name,
      description: description || "",
      isPublic: isPublic || false
    });
    res.json(circle);
  } catch (error) {
    res.status(500).json({ error: "Failed to create circle" });
  }
});
router5.post("/circles/:circleId/join", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { circleId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await socialService_default.joinCoachingCircle(userId, circleId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to join circle" });
  }
});
router5.get("/circles/:circleId/members", async (req, res) => {
  try {
    const { circleId } = req.params;
    const members = await socialService_default.getCircleMembers(circleId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to get members" });
  }
});
router5.get("/circles/:circleId/feed", async (req, res) => {
  try {
    const { circleId } = req.params;
    const { limit = 50 } = req.query;
    const feed = await socialService_default.getCircleFeed(circleId, parseInt(limit));
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: "Failed to get feed" });
  }
});
router5.post("/circles/:circleId/post", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { circleId } = req.params;
    const { content } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }
    const post = await socialService_default.postInCircle(userId, circleId, content);
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to post" });
  }
});
router5.get("/tournaments", async (req, res) => {
  try {
    const { status = "upcoming" } = req.query;
    const tournaments = await socialService_default.getTournaments(status);
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tournaments" });
  }
});
router5.post("/tournaments", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, description, maxPlayers, startDate, endDate } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name required" });
    }
    const tournament = await socialService_default.createTournament(userId, {
      name,
      description: description || "",
      maxPlayers: maxPlayers || 32,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    res.json(tournament);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tournament" });
  }
});
router5.post("/tournaments/:tournamentId/join", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tournamentId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await socialService_default.joinTournament(userId, tournamentId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to join tournament" });
  }
});
router5.post("/achievements/:achievementId/share", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { achievementId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const share = await socialService_default.shareAchievement(userId, achievementId);
    res.json(share);
  } catch (error) {
    res.status(500).json({ error: "Failed to share achievement" });
  }
});
router5.get("/achievements/feed", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const feed = await socialService_default.getSharedAchievementsFeed(parseInt(limit));
    res.json(feed);
  } catch (error) {
    res.status(500).json({ error: "Failed to get feed" });
  }
});
var socialRoutes_default = router5;

// server/routes/analyticsRoutes.ts
import { Router as Router6 } from "express";

// server/services/skillProfileService.ts
var SkillProfileService = class {
  /**
   * Get skill profile for a player
   */
  async getSkillProfile(userId, playerAccountId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           mechanics_score as "mechanicsScore",
           macro_play_score as "macroPlayScore",
           decision_making_score as "decisionMakingScore",
           consistency_score as "consistencyScore",
           clutch_factor_score as "clutchFactorScore",
           overall_rating as "overallRating",
           trend,
           matches_analyzed as "matchesAnalyzed"
         FROM skill_profiles 
         WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Get skill profile error:", error);
      throw error;
    }
  }
  /**
   * Calculate trend based on recent matches
   */
  async calculateTrend(userId, playerAccountId) {
    try {
      const result = await connection_default.query(
        `SELECT analysis_data FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT 10`,
        [userId, playerAccountId]
      );
      if (result.rows.length < 3) {
        return "stable";
      }
      const scores = result.rows.map((row) => {
        try {
          return JSON.parse(row.analysis_data).performanceScore;
        } catch {
          return 50;
        }
      });
      const oldAvg = scores.slice(5).reduce((a, b) => a + b, 0) / Math.max(scores.slice(5).length, 1);
      const newAvg = scores.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      const difference = newAvg - oldAvg;
      if (difference > 5) return "improving";
      if (difference < -5) return "declining";
      return "stable";
    } catch (error) {
      console.error("Calculate trend error:", error);
      return "stable";
    }
  }
  /**
   * Get skill breakdown by role
   */
  async getSkillByRole(userId, playerAccountId) {
    try {
      const result = await connection_default.query(
        `SELECT 
           role,
           COUNT(*) as match_count,
           AVG(CAST(analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate
         FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         GROUP BY role
         ORDER BY match_count DESC`,
        [userId, playerAccountId]
      );
      return result.rows;
    } catch (error) {
      console.error("Get skill by role error:", error);
      throw error;
    }
  }
  /**
   * Get skill breakdown by champion
   */
  async getSkillByChampion(userId, playerAccountId, limit = 10) {
    try {
      const result = await connection_default.query(
        `SELECT 
           champion_name,
           match_count,
           win_rate,
           average_kda,
           total_kills,
           total_deaths,
           total_assists
         FROM champion_stats 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_count DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get skill by champion error:", error);
      throw error;
    }
  }
  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(userId, playerAccountId, days = 30) {
    try {
      const result = await connection_default.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(*) as matches,
           AVG(CAST(analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate,
           AVG(flow_state_score) as avg_flow_state
         FROM matches 
         WHERE user_id = $1 AND player_account_id = $2 
         AND match_timestamp > NOW() - INTERVAL '1 day' * $3
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [userId, playerAccountId, days]
      );
      return result.rows;
    } catch (error) {
      console.error("Get performance trends error:", error);
      throw error;
    }
  }
  /**
   * Get strengths and weaknesses
   */
  async getStrengthsAndWeaknesses(userId, playerAccountId) {
    try {
      const profile = await this.getSkillProfile(userId, playerAccountId);
      if (!profile) {
        return { strengths: [], weaknesses: [] };
      }
      const scores = [
        { name: "Mechanics", score: profile.mechanicsScore },
        { name: "Macro Play", score: profile.macroPlayScore },
        { name: "Decision Making", score: profile.decisionMakingScore },
        { name: "Consistency", score: profile.consistencyScore },
        { name: "Clutch Factor", score: profile.clutchFactorScore }
      ];
      scores.sort((a, b) => b.score - a.score);
      const strengths = scores.slice(0, 2).filter((s) => s.score >= 60).map((s) => s.name);
      const weaknesses = scores.slice(-2).filter((s) => s.score < 60).map((s) => s.name);
      return { strengths, weaknesses };
    } catch (error) {
      console.error("Get strengths and weaknesses error:", error);
      return { strengths: [], weaknesses: [] };
    }
  }
  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId, playerAccountId) {
    try {
      const { strengths, weaknesses } = await this.getStrengthsAndWeaknesses(userId, playerAccountId);
      const profile = await this.getSkillProfile(userId, playerAccountId);
      if (!profile) {
        return [];
      }
      const recommendations = [];
      if (profile.mechanicsScore < 60) {
        recommendations.push("Focus on improving your champion mechanics through practice");
      }
      if (profile.macroPlayScore < 60) {
        recommendations.push("Work on map awareness and roaming to other lanes");
      }
      if (profile.decisionMakingScore < 60) {
        recommendations.push("Review your decision-making in crucial moments");
      }
      if (profile.consistencyScore < 60) {
        recommendations.push("Aim to reduce deaths and play safer");
      }
      if (profile.clutchFactorScore < 60) {
        recommendations.push("Practice staying calm in high-pressure situations");
      }
      if (strengths.length > 0) {
        recommendations.push(`Your ${strengths[0]} is your biggest strength - keep it up!`);
      }
      return recommendations;
    } catch (error) {
      console.error("Get recommendations error:", error);
      return [];
    }
  }
  /**
   * Compare skill profile with average
   */
  async compareWithAverage(userId, playerAccountId) {
    try {
      const profile = await this.getSkillProfile(userId, playerAccountId);
      if (!profile) {
        return null;
      }
      const averageScores = {
        mechanicsScore: 50,
        macroPlayScore: 50,
        decisionMakingScore: 50,
        consistencyScore: 50,
        clutchFactorScore: 50
      };
      return {
        mechanics: {
          player: profile.mechanicsScore,
          average: averageScores.mechanicsScore,
          difference: profile.mechanicsScore - averageScores.mechanicsScore
        },
        macroPlay: {
          player: profile.macroPlayScore,
          average: averageScores.macroPlayScore,
          difference: profile.macroPlayScore - averageScores.macroPlayScore
        },
        decisionMaking: {
          player: profile.decisionMakingScore,
          average: averageScores.decisionMakingScore,
          difference: profile.decisionMakingScore - averageScores.decisionMakingScore
        },
        consistency: {
          player: profile.consistencyScore,
          average: averageScores.consistencyScore,
          difference: profile.consistencyScore - averageScores.consistencyScore
        },
        clutchFactor: {
          player: profile.clutchFactorScore,
          average: averageScores.clutchFactorScore,
          difference: profile.clutchFactorScore - averageScores.clutchFactorScore
        }
      };
    } catch (error) {
      console.error("Compare with average error:", error);
      throw error;
    }
  }
};
var skillProfileService_default = new SkillProfileService();

// server/services/coachLearningService.ts
var CoachLearningService = class {
  /**
   * Save a memorable moment
   */
  async saveMemory(userId, playerAccountId, memoryType, data) {
    try {
      const result = await connection_default.query(
        `INSERT INTO coach_memories 
         (user_id, player_account_id, memory_type, champion_name, enemy_champion, 
          description, kda, importance_score, coach_reaction, match_timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          playerAccountId,
          memoryType,
          data.championName,
          data.enemyChampion || null,
          data.description,
          data.kda,
          data.importanceScore,
          data.coachReaction,
          data.matchTimestamp
        ]
      );
      await this.updateRelationshipScore(userId, data.importanceScore / 10);
      return result.rows[0];
    } catch (error) {
      console.error("Save memory error:", error);
      throw error;
    }
  }
  /**
   * Get coach memories for a player
   */
  async getMemories(userId, playerAccountId, limit = 10) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM coach_memories 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY importance_score DESC, created_at DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get memories error:", error);
      throw error;
    }
  }
  /**
   * Get memorable moments by type
   */
  async getMemoriesByType(userId, playerAccountId, memoryType, limit = 5) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM coach_memories 
         WHERE user_id = $1 AND player_account_id = $2 AND memory_type = $3
         ORDER BY importance_score DESC
         LIMIT $4`,
        [userId, playerAccountId, memoryType, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get memories by type error:", error);
      throw error;
    }
  }
  /**
   * Update coach relationship
   */
  async updateRelationshipScore(userId, scoreIncrease) {
    try {
      let relationship = await connection_default.query(
        `SELECT * FROM coach_relationships WHERE user_id = $1`,
        [userId]
      );
      if (relationship.rows.length === 0) {
        const result2 = await connection_default.query(
          `INSERT INTO coach_relationships (user_id, relationship_score, total_interactions, trust_level)
           VALUES ($1, $2, 1, $3)
           RETURNING *`,
          [userId, scoreIncrease, Math.min(scoreIncrease, 10)]
        );
        return result2.rows[0];
      }
      const current = relationship.rows[0];
      const newScore = Math.min(current.relationship_score + scoreIncrease, 100);
      const newStage = this.calculateRelationshipStage(newScore);
      const newTrustLevel = Math.min(current.trust_level + scoreIncrease / 5, 100);
      const result = await connection_default.query(
        `UPDATE coach_relationships 
         SET relationship_score = $1, 
             relationship_stage = $2,
             trust_level = $3,
             total_interactions = total_interactions + 1,
             last_interaction = CURRENT_TIMESTAMP
         WHERE user_id = $4
         RETURNING *`,
        [newScore, newStage, newTrustLevel, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Update relationship error:", error);
      throw error;
    }
  }
  /**
   * Calculate relationship stage based on score
   */
  calculateRelationshipStage(score) {
    if (score < 15) return "stranger";
    if (score < 30) return "acquaintance";
    if (score < 60) return "friend";
    if (score < 85) return "best_friend";
    return "legend";
  }
  /**
   * Get coach relationship
   */
  async getRelationship(userId) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM coach_relationships WHERE user_id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Get relationship error:", error);
      throw error;
    }
  }
  /**
   * Add inside joke to coach personality
   */
  async addInsideJoke(userId, joke) {
    try {
      const relationship = await this.getRelationship(userId);
      if (!relationship) {
        return;
      }
      const currentJokes = relationship.inside_jokes || [];
      const updatedJokes = [...currentJokes, joke];
      await connection_default.query(
        `UPDATE coach_relationships 
         SET inside_jokes = $1, personal_jokes = personal_jokes + 1
         WHERE user_id = $2`,
        [updatedJokes, userId]
      );
    } catch (error) {
      console.error("Add inside joke error:", error);
      throw error;
    }
  }
  /**
   * Get coach personality for user
   */
  async getCoachPersonality(userId) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM coach_personalities WHERE user_id = $1`,
        [userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Get coach personality error:", error);
      throw error;
    }
  }
  /**
   * Update coach personality
   */
  async updateCoachPersonality(userId, personality) {
    try {
      const result = await connection_default.query(
        `INSERT INTO coach_personalities 
         (user_id, personality_type, accent, response_style, message_length, celebration_level)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id) DO UPDATE SET
         personality_type = $2,
         accent = $3,
         response_style = $4,
         message_length = $5,
         celebration_level = $6,
         updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          userId,
          personality.personalityType,
          personality.accent,
          personality.responseStyle,
          personality.messageLength || "medium",
          personality.celebrationLevel || 5
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Update coach personality error:", error);
      throw error;
    }
  }
  /**
   * Generate coach response based on context
   */
  async generateCoachResponse(userId, context) {
    try {
      const personality = await this.getCoachPersonality(userId);
      const relationship = await this.getRelationship(userId);
      if (!personality) {
        return "Great job out there!";
      }
      const responses = {
        win: [
          "YOOO THAT WAS INSANE! \u{1F525}",
          "You absolutely dominated that match!",
          "That was a masterclass performance!",
          "Your mechanics were on point!"
        ],
        loss: [
          "You gave it your all, that's what matters!",
          "This is a learning opportunity - let's analyze what happened.",
          "Don't worry, we'll bounce back stronger!",
          "Every loss teaches us something new."
        ],
        epic_play: [
          "THAT WAS LEGENDARY! \u{1F3C6}",
          "I've never seen a play like that before!",
          "Your decision-making was perfect!",
          "That play is going to be in the highlight reel!"
        ],
        milestone: [
          "CONGRATULATIONS! You reached a new milestone! \u{1F389}",
          "Your hard work is paying off!",
          "This is just the beginning!",
          "You're on fire right now!"
        ]
      };
      const eventResponses = responses[context.eventType] || responses.win;
      const randomResponse = eventResponses[Math.floor(Math.random() * eventResponses.length)];
      if (relationship && relationship.relationship_stage === "best_friend") {
        return `${randomResponse} You know I believe in you! \u{1F49C}`;
      }
      return randomResponse;
    } catch (error) {
      console.error("Generate coach response error:", error);
      return "Great job!";
    }
  }
};
var coachLearningService_default = new CoachLearningService();

// server/services/matchAnalysisService.ts
var MatchAnalysisService = class {
  /**
   * Analyze a match and save insights
   */
  async analyzeMatch(userId, playerAccountId, matchData) {
    try {
      const participant = this.findPlayerInMatch(matchData, userId);
      if (!participant) {
        throw new Error("Player not found in match data");
      }
      const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;
      const performanceScore = this.calculatePerformanceScore(participant);
      const flowStateScore = this.calculateFlowState(participant);
      const insights = this.generateInsights(participant);
      const memoryType = this.determineMemoryType(participant, performanceScore);
      const matchResult = await connection_default.query(
        `INSERT INTO matches 
         (user_id, player_account_id, riot_match_id, champion_name, role, result, 
          kills, deaths, assists, kda, gold_earned, damage_dealt, damage_taken, 
          cs, duration_seconds, match_timestamp, analyzed, analysis_data, flow_state_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, $17, $18)
         RETURNING *`,
        [
          userId,
          playerAccountId,
          matchData.metadata.matchId,
          participant.championName,
          participant.individualPosition || "unknown",
          participant.win ? "win" : "loss",
          participant.kills,
          participant.deaths,
          participant.assists,
          kda,
          participant.goldEarned,
          participant.totalDamageDealtToChampions,
          participant.totalDamageTaken,
          participant.totalMinionsKilled,
          matchData.info.gameDuration,
          new Date(matchData.info.gameCreation),
          JSON.stringify({
            insights,
            performanceScore,
            flowStateScore
          }),
          flowStateScore
        ]
      );
      if (memoryType) {
        const coachReaction = await coachLearningService_default.generateCoachResponse(userId, {
          eventType: memoryType,
          championName: participant.championName,
          kda,
          matchResult: participant.win ? "win" : "loss"
        });
        await coachLearningService_default.saveMemory(userId, playerAccountId, memoryType, {
          championName: participant.championName,
          enemyChampion: this.getEnemyChampions(matchData, participant.teamId)[0],
          description: insights.join(" | "),
          kda,
          importanceScore: performanceScore,
          coachReaction,
          matchTimestamp: new Date(matchData.info.gameCreation)
        });
      }
      await this.updateSkillProfile(userId, playerAccountId, participant, performanceScore);
      await this.updateChampionStats(userId, playerAccountId, participant);
      return {
        matchId: matchData.metadata.matchId,
        championName: participant.championName,
        role: participant.individualPosition || "unknown",
        result: participant.win ? "win" : "loss",
        kda,
        performanceScore,
        flowStateScore,
        insights,
        memoryType,
        coachReaction: memoryType ? await coachLearningService_default.generateCoachResponse(userId, {
          eventType: memoryType,
          championName: participant.championName,
          kda
        }) : ""
      };
    } catch (error) {
      console.error("Match analysis error:", error);
      throw error;
    }
  }
  /**
   * Calculate performance score (0-100)
   */
  calculatePerformanceScore(participant) {
    let score = 50;
    const kda = (participant.kills + participant.assists) / Math.max(participant.deaths, 1);
    score += Math.min(kda * 5, 20);
    const csPerMin = participant.totalMinionsKilled / (participant.timePlayed / 60);
    score += Math.min(csPerMin / 5 * 10, 15);
    const damagePerMin = participant.totalDamageDealtToChampions / (participant.timePlayed / 60);
    score += Math.min(damagePerMin / 100 * 10, 15);
    score += Math.min(participant.visionScore / 5, 10);
    score += Math.min((participant.turretKills + participant.inhibitorKills) * 2, 10);
    if (participant.win) {
      score += 10;
    }
    return Math.min(Math.max(score, 0), 100);
  }
  /**
   * Calculate flow state score (0-100)
   * Measures how "in the zone" the player was
   */
  calculateFlowState(participant) {
    let score = 50;
    score += Math.min(participant.largestKillingSpree * 2, 20);
    const multiKills = participant.doubleKills * 2 + participant.tripleKills * 5 + participant.quadraKills * 10 + participant.pentaKills * 20;
    score += Math.min(multiKills, 20);
    if (participant.deaths === 0) {
      score += 15;
    } else if (participant.deaths <= 2) {
      score += 10;
    }
    score += Math.min(participant.longestTimeSpentLiving / 300 * 10, 10);
    const objectives = participant.turretKills + participant.inhibitorKills + participant.baronKills;
    score += Math.min(objectives * 5, 15);
    return Math.min(Math.max(score, 0), 100);
  }
  /**
   * Generate insights from match
   */
  generateInsights(participant) {
    const insights = [];
    if (participant.kills >= 10) {
      insights.push("Excellent kill participation");
    }
    if (participant.deaths === 0) {
      insights.push("Perfect positioning - no deaths");
    }
    if (participant.assists >= 15) {
      insights.push("Great team support");
    }
    const csPerMin = participant.totalMinionsKilled / (participant.timePlayed / 60);
    if (csPerMin >= 7) {
      insights.push("Outstanding CS efficiency");
    }
    if (participant.totalDamageDealtToChampions > 2e4) {
      insights.push("High damage output");
    }
    if (participant.visionScore >= 30) {
      insights.push("Excellent map awareness");
    }
    if (participant.turretKills + participant.inhibitorKills >= 3) {
      insights.push("Strong objective focus");
    }
    if (insights.length === 0) {
      insights.push("Solid performance overall");
    }
    return insights;
  }
  /**
   * Determine if this match should be saved as a memory
   */
  determineMemoryType(participant, performanceScore) {
    if (performanceScore >= 80 && participant.win) {
      return "epic_play";
    }
    if (participant.pentaKills > 0 || participant.quadraKills > 0) {
      return "clutch_moment";
    }
    if (participant.deaths >= 5 && !participant.win) {
      return "mistake";
    }
    if (performanceScore >= 60 && !participant.win) {
      return "learning";
    }
    return null;
  }
  /**
   * Find player in match data
   */
  findPlayerInMatch(matchData, userId) {
    return matchData.info.participants[0];
  }
  /**
   * Get enemy champions
   */
  getEnemyChampions(matchData, teamId) {
    return matchData.info.participants.filter((p) => p.teamId !== teamId).map((p) => p.championName).slice(0, 3);
  }
  /**
   * Update skill profile based on match
   */
  async updateSkillProfile(userId, playerAccountId, participant, performanceScore) {
    try {
      let profile = await connection_default.query(
        `SELECT * FROM skill_profiles WHERE user_id = $1 AND player_account_id = $2`,
        [userId, playerAccountId]
      );
      const mechanicsScore = Math.min(50 + participant.kills * 2, 100);
      const macroScore = Math.min(50 + participant.totalMinionsKilled / 100 * 2, 100);
      const decisionScore = Math.min(50 + participant.assists / 10 * 2, 100);
      const consistencyScore = Math.min(50 + (100 - participant.deaths * 10), 100);
      const clutchScore = Math.min(50 + participant.largestKillingSpree * 2, 100);
      const overallRating = (mechanicsScore + macroScore + decisionScore + consistencyScore + clutchScore) / 5;
      if (profile.rows.length === 0) {
        await connection_default.query(
          `INSERT INTO skill_profiles 
           (user_id, player_account_id, mechanics_score, macro_play_score, decision_making_score, 
            consistency_score, clutch_factor_score, overall_rating, matches_analyzed)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
          [userId, playerAccountId, mechanicsScore, macroScore, decisionScore, consistencyScore, clutchScore, overallRating]
        );
      } else {
        const current = profile.rows[0];
        const weight = 0.7;
        await connection_default.query(
          `UPDATE skill_profiles 
           SET mechanics_score = $1,
               macro_play_score = $2,
               decision_making_score = $3,
               consistency_score = $4,
               clutch_factor_score = $5,
               overall_rating = $6,
               matches_analyzed = matches_analyzed + 1,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = $7 AND player_account_id = $8`,
          [
            current.mechanics_score * (1 - weight) + mechanicsScore * weight,
            current.macro_play_score * (1 - weight) + macroScore * weight,
            current.decision_making_score * (1 - weight) + decisionScore * weight,
            current.consistency_score * (1 - weight) + consistencyScore * weight,
            current.clutch_factor_score * (1 - weight) + clutchScore * weight,
            overallRating,
            userId,
            playerAccountId
          ]
        );
      }
    } catch (error) {
      console.error("Update skill profile error:", error);
    }
  }
  /**
   * Update champion statistics
   */
  async updateChampionStats(userId, playerAccountId, participant) {
    try {
      const champResult = await connection_default.query(
        `SELECT * FROM champion_stats 
         WHERE user_id = $1 AND player_account_id = $2 AND champion_name = $3`,
        [userId, playerAccountId, participant.championName]
      );
      if (champResult.rows.length === 0) {
        await connection_default.query(
          `INSERT INTO champion_stats 
           (user_id, player_account_id, champion_name, match_count, total_kills, 
            total_deaths, total_assists, average_kda, last_played)
           VALUES ($1, $2, $3, 1, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
          [
            userId,
            playerAccountId,
            participant.championName,
            participant.kills,
            participant.deaths,
            participant.assists,
            ((participant.kills + participant.assists) / Math.max(participant.deaths, 1)).toFixed(2)
          ]
        );
      } else {
        const current = champResult.rows[0];
        const newKda = ((current.total_kills + participant.kills + current.total_assists + participant.assists) / Math.max(current.total_deaths + participant.deaths, 1)).toFixed(2);
        await connection_default.query(
          `UPDATE champion_stats 
           SET match_count = match_count + 1,
               total_kills = total_kills + $1,
               total_deaths = total_deaths + $2,
               total_assists = total_assists + $3,
               average_kda = $4,
               last_played = CURRENT_TIMESTAMP
           WHERE user_id = $5 AND player_account_id = $6 AND champion_name = $7`,
          [
            participant.kills,
            participant.deaths,
            participant.assists,
            newKda,
            userId,
            playerAccountId,
            participant.championName
          ]
        );
      }
    } catch (error) {
      console.error("Update champion stats error:", error);
    }
  }
  /**
   * Get match history
   */
  async getMatchHistory(userId, playerAccountId, limit = 20) {
    try {
      const result = await connection_default.query(
        `SELECT * FROM matches 
         WHERE user_id = $1 AND player_account_id = $2
         ORDER BY match_timestamp DESC
         LIMIT $3`,
        [userId, playerAccountId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get match history error:", error);
      throw error;
    }
  }
};
var matchAnalysisService_default = new MatchAnalysisService();

// server/routes/analyticsRoutes.ts
var router6 = Router6();
router6.get("/skill-profile", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const profile = await skillProfileService_default.getSkillProfile(userId, playerAccountId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: "Failed to get skill profile" });
  }
});
router6.get("/trend", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const trend = await skillProfileService_default.calculateTrend(userId, playerAccountId);
    res.json({ trend });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate trend" });
  }
});
router6.get("/by-role", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const data = await skillProfileService_default.getSkillByRole(userId, playerAccountId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get role analytics" });
  }
});
router6.get("/by-champion", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, limit = 10 } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const data = await skillProfileService_default.getSkillByChampion(
      userId,
      playerAccountId,
      parseInt(limit)
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get champion analytics" });
  }
});
router6.get("/trends", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, days = 30 } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const trends = await skillProfileService_default.getPerformanceTrends(
      userId,
      playerAccountId,
      parseInt(days)
    );
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: "Failed to get trends" });
  }
});
router6.get("/strengths-weaknesses", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const data = await skillProfileService_default.getStrengthsAndWeaknesses(
      userId,
      playerAccountId
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analysis" });
  }
});
router6.get("/recommendations", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const recommendations = await skillProfileService_default.getRecommendations(
      userId,
      playerAccountId
    );
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});
router6.get("/compare", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const comparison = await skillProfileService_default.compareWithAverage(
      userId,
      playerAccountId
    );
    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: "Failed to get comparison" });
  }
});
router6.get("/match-history", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { playerAccountId, limit = 20 } = req.query;
    if (!userId || !playerAccountId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    const matches = await matchAnalysisService_default.getMatchHistory(
      userId,
      playerAccountId,
      parseInt(limit)
    );
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: "Failed to get match history" });
  }
});
var analyticsRoutes_default = router6;

// server/routes/apiRoutes.ts
var router7 = Router7();
router7.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
router7.use("/auth", authRoutes_default);
router7.use("/account", verifyToken, accountRoutes_default);
router7.use("/coach", verifyToken, coachRoutes_default);
router7.use("/gamification", verifyToken, gamificationRoutes_default);
router7.use("/social", verifyToken, socialRoutes_default);
router7.use("/analytics", verifyToken, analyticsRoutes_default);
var apiRoutes_default = router7;

// server/routes/adminRoutes.ts
import { Router as Router8 } from "express";

// server/services/adminService.ts
var AdminService = class {
  /**
   * Get admin dashboard stats
   */
  async getDashboardStats() {
    try {
      const usersResult = await connection_default.query("SELECT COUNT(*) as count FROM users");
      const totalUsers = usersResult.rows[0].count;
      const activeResult = await connection_default.query(
        `SELECT COUNT(DISTINCT user_id) as count FROM matches 
         WHERE match_timestamp > NOW() - INTERVAL '7 days'`
      );
      const activeUsers = activeResult.rows[0].count;
      const matchesResult = await connection_default.query("SELECT COUNT(*) as count FROM matches");
      const totalMatches = matchesResult.rows[0].count;
      const winRateResult = await connection_default.query(
        `SELECT AVG(CASE WHEN result = 'win' THEN 1 ELSE 0 END) * 100 as avg_win_rate FROM matches`
      );
      const averageWinRate = winRateResult.rows[0].avg_win_rate || 0;
      const achievementsResult = await connection_default.query("SELECT COUNT(*) as count FROM achievements");
      const totalAchievements = achievementsResult.rows[0].count;
      const topPlayersResult = await connection_default.query(
        `SELECT 
           u.username,
           COUNT(m.id) as matches,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(m.id) * 100 as win_rate,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id
         GROUP BY u.id, u.username
         HAVING COUNT(m.id) > 0
         ORDER BY avg_performance DESC
         LIMIT 10`
      );
      const topPlayers = topPlayersResult.rows;
      return {
        totalUsers,
        activeUsers,
        totalMatches,
        averageWinRate,
        totalAchievements,
        topPlayers
      };
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      throw error;
    }
  }
  /**
   * Get all users
   */
  async getAllUsers(limit = 100, offset = 0) {
    try {
      const result = await connection_default.query(
        `SELECT 
           id,
           email,
           username,
           created_at as "createdAt",
           last_login as "lastLogin",
           is_active as "isActive"
         FROM users
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  }
  /**
   * Get user details
   */
  async getUserDetails(userId) {
    try {
      const userResult = await connection_default.query(
        `SELECT 
           id,
           email,
           username,
           created_at as "createdAt",
           last_login as "lastLogin",
           is_active as "isActive"
         FROM users WHERE id = $1`,
        [userId]
      );
      if (userResult.rows.length === 0) {
        throw new Error("User not found");
      }
      const user = userResult.rows[0];
      const statsResult = await connection_default.query(
        `SELECT 
           COUNT(m.id) as matches,
           SUM(CASE WHEN m.result = 'win' THEN 1 ELSE 0 END) as wins,
           AVG(CAST(m.analysis_data->>'performanceScore' AS FLOAT)) as avg_performance,
           COUNT(a.id) as achievements
         FROM users u
         LEFT JOIN matches m ON u.id = m.user_id
         LEFT JOIN achievements a ON u.id = a.user_id
         WHERE u.id = $1`,
        [userId]
      );
      const stats = statsResult.rows[0];
      return {
        ...user,
        stats
      };
    } catch (error) {
      console.error("Get user details error:", error);
      throw error;
    }
  }
  /**
   * Suspend user
   */
  async suspendUser(userId, reason) {
    try {
      await connection_default.query(
        `UPDATE users SET is_active = false WHERE id = $1`,
        [userId]
      );
      await this.logAdminAction("suspend_user", userId, { reason });
    } catch (error) {
      console.error("Suspend user error:", error);
      throw error;
    }
  }
  /**
   * Unsuspend user
   */
  async unsuspendUser(userId) {
    try {
      await connection_default.query(
        `UPDATE users SET is_active = true WHERE id = $1`,
        [userId]
      );
      await this.logAdminAction("unsuspend_user", userId, {});
    } catch (error) {
      console.error("Unsuspend user error:", error);
      throw error;
    }
  }
  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      await connection_default.query("DELETE FROM matches WHERE user_id = $1", [userId]);
      await connection_default.query("DELETE FROM achievements WHERE user_id = $1", [userId]);
      await connection_default.query("DELETE FROM coach_memories WHERE user_id = $1", [userId]);
      await connection_default.query("DELETE FROM users WHERE id = $1", [userId]);
      await this.logAdminAction("delete_user", userId, {});
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  }
  /**
   * Get reported content
   */
  async getReportedContent(limit = 50) {
    try {
      const result = await connection_default.query(
        `SELECT 
           id,
           reported_by as "reportedBy",
           content_type as "contentType",
           content_id as "contentId",
           reason,
           status,
           created_at as "createdAt"
         FROM reports
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit]
      );
      return result.rows;
    } catch (error) {
      console.error("Get reported content error:", error);
      throw error;
    }
  }
  /**
   * Resolve report
   */
  async resolveReport(reportId, action) {
    try {
      await connection_default.query(
        `UPDATE reports SET status = $1, resolved_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [action, reportId]
      );
      await this.logAdminAction("resolve_report", reportId, { action });
    } catch (error) {
      console.error("Resolve report error:", error);
      throw error;
    }
  }
  /**
   * Get system logs
   */
  async getSystemLogs(limit = 100, offset = 0) {
    try {
      const result = await connection_default.query(
        `SELECT 
           id,
           action,
           admin_id as "adminId",
           target_id as "targetId",
           details,
           created_at as "createdAt"
         FROM admin_logs
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get system logs error:", error);
      throw error;
    }
  }
  /**
   * Log admin action
   */
  async logAdminAction(action, targetId, details) {
    try {
      console.log(`[ADMIN] ${action} - Target: ${targetId}`, details);
    } catch (error) {
      console.error("Log admin action error:", error);
    }
  }
  /**
   * Get system health
   */
  async getSystemHealth() {
    try {
      const dbHealth = await connection_default.query("SELECT 1");
      const dbStatus = dbHealth.rows.length > 0 ? "healthy" : "unhealthy";
      const sizeResult = await connection_default.query(
        "SELECT pg_size_pretty(pg_database_size('trixieverse')) as size"
      );
      const dbSize = sizeResult.rows[0].size;
      const connectionsResult = await connection_default.query(
        "SELECT count(*) as count FROM pg_stat_activity"
      );
      const activeConnections = connectionsResult.rows[0].count;
      return {
        database: {
          status: dbStatus,
          size: dbSize,
          activeConnections
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("Get system health error:", error);
      return {
        database: {
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error"
        },
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * Get analytics report
   */
  async getAnalyticsReport(days = 30) {
    try {
      const dauResult = await connection_default.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(DISTINCT user_id) as users
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );
      const matchesResult = await connection_default.query(
        `SELECT 
           DATE(match_timestamp) as date,
           COUNT(*) as matches
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );
      const winRateResult = await connection_default.query(
        `SELECT 
           DATE(match_timestamp) as date,
           SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END)::FLOAT / COUNT(*) * 100 as win_rate
         FROM matches
         WHERE match_timestamp > NOW() - INTERVAL '1 day' * $1
         GROUP BY DATE(match_timestamp)
         ORDER BY date DESC`,
        [days]
      );
      return {
        dailyActiveUsers: dauResult.rows,
        dailyMatches: matchesResult.rows,
        dailyWinRate: winRateResult.rows
      };
    } catch (error) {
      console.error("Get analytics report error:", error);
      throw error;
    }
  }
};
var adminService_default = new AdminService();

// server/routes/adminRoutes.ts
var router8 = Router8();
var adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
router8.use(adminOnly);
router8.get("/dashboard", async (req, res) => {
  try {
    const stats = await adminService_default.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get dashboard stats" });
  }
});
router8.get("/users", async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const users = await adminService_default.getAllUsers(
      parseInt(limit),
      parseInt(offset)
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
});
router8.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await adminService_default.getUserDetails(userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to get user details" });
  }
});
router8.post("/users/:userId/suspend", async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ error: "Reason required" });
    }
    await adminService_default.suspendUser(userId, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to suspend user" });
  }
});
router8.post("/users/:userId/unsuspend", async (req, res) => {
  try {
    const { userId } = req.params;
    await adminService_default.unsuspendUser(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to unsuspend user" });
  }
});
router8.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await adminService_default.deleteUser(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});
router8.get("/reports", async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const reports = await adminService_default.getReportedContent(parseInt(limit));
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to get reports" });
  }
});
router8.post("/reports/:reportId/resolve", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body;
    if (!action) {
      return res.status(400).json({ error: "Action required" });
    }
    await adminService_default.resolveReport(reportId, action);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to resolve report" });
  }
});
router8.get("/logs", async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const logs = await adminService_default.getSystemLogs(
      parseInt(limit),
      parseInt(offset)
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get logs" });
  }
});
router8.get("/health", async (req, res) => {
  try {
    const health = await adminService_default.getSystemHealth();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: "Failed to get system health" });
  }
});
router8.get("/analytics", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await adminService_default.getAnalyticsReport(parseInt(days));
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to get analytics" });
  }
});
var adminRoutes_default = router8;

// server/database/initDb.ts
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
async function initializeDatabase() {
  try {
    console.log("\u{1F504} Starting database initialization...");
    await connection_default.connect();
    console.log("\u2705 Connected to database");
    const result = await connection_default.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );
    const tablesExist = result.rows[0].exists;
    if (!tablesExist) {
      console.log("\u{1F4CA} Tables not found, creating schema...");
      const schemaPath = path2.join(__dirname2, "schema.sql");
      const schema = fs2.readFileSync(schemaPath, "utf-8");
      const statements = schema.split(";").map((stmt) => stmt.trim()).filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));
      let executedCount = 0;
      for (const statement of statements) {
        try {
          await connection_default.query(statement);
          executedCount++;
        } catch (error) {
          if (error.message && (error.message.includes("already exists") || error.message.includes("does not exist"))) {
          } else {
            console.error("Schema creation error:", error.message);
          }
        }
      }
      console.log(`\u2705 Database schema created! (${executedCount} statements executed)`);
    } else {
      console.log("\u2705 Database tables already exist");
    }
  } catch (error) {
    console.error("\u274C Database initialization failed:", error);
    throw error;
  }
}

// server/index.ts
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
dotenv3.config();
var app = express3();
var PORT = process.env.PORT || 3e3;
var NODE_ENV = process.env.NODE_ENV || "development";
var server = http.createServer(app);
var wss = new WebSocketServer({ server });
applySecurityMiddleware(app);
app.use(express3.json({ limit: "10mb" }));
app.use(express3.urlencoded({ limit: "10mb", extended: true }));
app.use(compression());
app.use(requestLogger);
app.use(cacheInvalidationMiddleware);
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});
app.use("/api", apiRoutes_default);
app.use("/api/coach", coachRoutes_default);
app.use("/api/account", accountRoutes_default);
app.use("/api/admin", verifyToken, adminRoutes_default);
var staticPath = path3.resolve(__dirname3, "..", "dist", "public");
app.use(express3.static(staticPath));
app.get("*", (req, res) => {
  res.sendFile(path3.join(staticPath, "index.html"));
});
app.use(errorHandler_default.notFound);
app.use((err, req, res, next) => {
  errorHandler_default.handle(err, req, res, next);
});
wss.on("connection", (ws) => {
  logger_default.info("WebSocket client connected");
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case "coach_message":
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: "coach_message",
                  data: message.data,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                })
              );
            }
          });
          break;
        case "match_update":
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: "match_update",
                  data: message.data,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                })
              );
            }
          });
          break;
        case "achievement_unlocked":
          wss.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  type: "achievement_unlocked",
                  data: message.data,
                  timestamp: (/* @__PURE__ */ new Date()).toISOString()
                })
              );
            }
          });
          break;
      }
    } catch (error) {
      logger_default.error({ message: "WebSocket message error", error });
    }
  });
  ws.on("close", () => {
    logger_default.info("WebSocket client disconnected");
  });
  ws.on("error", (error) => {
    logger_default.error({ message: "WebSocket error", error });
  });
});
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    logger_default.info(`\u{1F680} TrixieVerse Server running on port ${PORT}`);
    logger_default.info(`\u{1F4CA} Environment: ${NODE_ENV}`);
    logger_default.info(`\u{1F310} WebSocket server ready`);
    logger_default.info(`\u{1F4DA} API: http://localhost:${PORT}/api`);
    logger_default.info(`\u{1F527} Health: http://localhost:${PORT}/api/health`);
  });
}).catch((error) => {
  logger_default.error("Failed to initialize database:", error);
  process.exit(1);
});
process.on("SIGTERM", () => {
  logger_default.info("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    logger_default.info("HTTP server closed");
    process.exit(0);
  });
});
process.on("SIGINT", () => {
  logger_default.info("SIGINT signal received: closing HTTP server");
  server.close(() => {
    logger_default.info("HTTP server closed");
    process.exit(0);
  });
});
process.on("unhandledRejection", (reason, promise) => {
  logger_default.error({
    message: "Unhandled Rejection",
    reason
  });
});
process.on("uncaughtException", (error) => {
  logger_default.error({
    message: "Uncaught Exception",
    error: error.message
  });
  process.exit(1);
});
var index_default = server;
export {
  index_default as default,
  wss
};
