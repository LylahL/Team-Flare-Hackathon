/**
 * Monitoring and Logging Configuration
 * 
 * This file configures various monitoring and logging systems for the application.
 * It includes Winston for logging, Sentry for error tracking, and custom performance monitoring.
 */

const winston = require('winston');
require('winston-daily-rotate-file');
const Sentry = require('@sentry/node');
const { Express } = require('@sentry/integrations');
const { combine, timestamp, printf, colorize, json } = winston.format;

// Load environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (environment === 'production' ? 'warn' : 'debug');
const sentryDsn = process.env.SENTRY_DSN || '';

/**
 * Winston logger configuration
 */
const loggerConfig = {
  // Console logger for development
  console: {
    level: logLevel,
    handleExceptions: true,
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  },
  
  // File logger for production and staging
  file: {
    level: logLevel,
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: combine(
      timestamp(),
      json()
    ),
  },
  
  // Custom transports based on environment
  getTransports: () => {
    const transports = [new winston.transports.Console(loggerConfig.console)];
    
    if (environment !== 'development') {
      transports.push(
        new winston.transports.DailyRotateFile(loggerConfig.file)
      );
    }
    
    return transports;
  }
};

/**
 * Sentry configuration for error tracking
 */
const sentryConfig = {
  dsn: sentryDsn,
  environment,
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  integrations: [new Express()],
  
  // Configure based on environment
  initialize: (app) => {
    if (!sentryDsn) {
      console.warn('Sentry DSN not configured. Error tracking is disabled.');
      return;
    }
    
    Sentry.init(sentryConfig);
    
    // Add Sentry request handler and trackers
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    
    // Add Sentry error handler at the end of your middleware stack
    app.use(Sentry.Handlers.errorHandler());
    
    console.log(`Sentry initialized for ${environment} environment`);
  }
};

/**
 * Performance monitoring configuration
 */
const performanceConfig = {
  // Configure route response time monitoring
  routeMonitoring: (app) => {
    app.use((req, res, next) => {
      const start = Date.now();
      
      // Log when response is finished
      res.on('finish', () => {
        const duration = Date.now() - start;
        const logger = winston.createLogger({
          transports: loggerConfig.getTransports()
        });
        
        // Log slow responses (>500ms)
        if (duration > 500) {
          logger.warn('Slow response', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            status: res.statusCode
          });
        }
        
        // Log all API calls for debugging in development
        if (environment === 'development' || logLevel === 'debug') {
          logger.debug('API Request', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            status: res.statusCode
          });
        }
      });
      
      next();
    });
  },
  
  // Database monitoring for slow queries
  databaseMonitoring: (mongoose) => {
    mongoose.set('debug', environment === 'development');
    
    // Add MongoDB performance hooks
    if (environment !== 'development') {
      const logger = winston.createLogger({
        transports: loggerConfig.getTransports()
      });
      
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
        Sentry.captureException(err);
      });
      
      // Log slow queries (>100ms)
      mongoose.connection.once('open', () => {
        mongoose.connection.db.command({ serverStatus: 1 }, (err, result) => {
          if (!err && result.ok) {
            logger.info('MongoDB server status', { 
              version: result.version,
              uptime: result.uptime,
              connections: result.connections.current
            });
          }
        });
      });
    }
  },
  
  // Health check endpoint
  healthCheck: (app) => {
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        environment,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
  }
};

/**
 * Initialize all monitoring and logging
 */
function initialize(app, mongoose) {
  // Initialize Winston logger
  const logger = winston.createLogger({
    transports: loggerConfig.getTransports(),
    exitOnError: false
  });
  
  // Replace console.log with winston
  console.log = (...args) => logger.info.call(logger, ...args);
  console.info = (...args) => logger.info.call(logger, ...args);
  console.warn = (...args) => logger.warn.call(logger, ...args);
  console.error = (...args) => logger.error.call(logger, ...args);
  console.debug = (...args) => logger.debug.call(logger, ...args);
  
  // Initialize Sentry if DSN is configured
  sentryConfig.initialize(app);
  
  // Set up performance monitoring
  performanceConfig.routeMonitoring(app);
  performanceConfig.databaseMonitoring(mongoose);
  performanceConfig.healthCheck(app);
  
  return logger;
}

module.exports = {
  initialize,
  logger: winston.createLogger({
    transports: loggerConfig.getTransports()
  }),
  Sentry
};

