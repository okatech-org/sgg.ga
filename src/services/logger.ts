/**
 * SGG Digital — Service Logger Frontend
 * 
 * Remplace les console.error/warn par un logger structuré.
 * En développement : logs visuels en console avec couleurs.
 * En production   : collecte les erreurs pour monitoring (Sentry, GCP, etc.).
 * 
 * Usage:
 *   import { logger } from '@/services/logger';
 *   logger.error('API Error', { endpoint, status });
 *   logger.warn('Fallback mock activé', { module: 'PTM' });
 *   logger.info('Rapport soumis', { rapportId });
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
    module?: string;
}

type LogTransport = (entry: LogEntry) => void;

// ============================================================================
// TRANSPORTS
// ============================================================================

/** Console transport — colorful dev-friendly output */
const consoleTransport: LogTransport = (entry) => {
    const styles: Record<LogLevel, string> = {
        debug: 'color: #8B5CF6',
        info: 'color: #3B82F6',
        warn: 'color: #F59E0B',
        error: 'color: #EF4444; font-weight: bold',
    };

    const prefix = `[SGG ${entry.level.toUpperCase()}]`;
    const style = styles[entry.level];

    if (entry.context && Object.keys(entry.context).length > 0) {
        console[entry.level](`%c${prefix} ${entry.message}`, style, entry.context);
    } else {
        console[entry.level](`%c${prefix} ${entry.message}`, style);
    }
};

/** In-memory buffer for batch sending to backend monitoring */
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 50;

const bufferTransport: LogTransport = (entry) => {
    if (entry.level === 'error' || entry.level === 'warn') {
        logBuffer.push(entry);
        if (logBuffer.length > MAX_BUFFER_SIZE) {
            logBuffer.shift(); // Ring buffer — remove oldest
        }
    }
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
    private transports: LogTransport[] = [];
    private minLevel: LogLevel = 'debug';
    private defaultModule?: string;

    private readonly levelPriority: Record<LogLevel, number> = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };

    constructor() {
        // Always buffer errors for potential monitoring
        this.transports.push(bufferTransport);

        // Console output in development
        const isDev = typeof import.meta !== 'undefined'
            && import.meta.env?.MODE !== 'production';

        if (isDev) {
            this.transports.push(consoleTransport);
            this.minLevel = 'debug';
        } else {
            // In production, only log warnings and errors to console
            this.transports.push(consoleTransport);
            this.minLevel = 'warn';
        }
    }

    /** Create a child logger with a fixed module name */
    child(module: string): Logger {
        const child = Object.create(this) as Logger;
        child.defaultModule = module;
        return child;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
        if (this.levelPriority[level] < this.levelPriority[this.minLevel]) {
            return;
        }

        const entry: LogEntry = {
            level,
            message,
            context,
            timestamp: new Date().toISOString(),
            module: this.defaultModule,
        };

        this.transports.forEach((transport) => {
            try {
                transport(entry);
            } catch {
                // Transport failure should never crash the app
            }
        });
    }

    debug(message: string, context?: Record<string, unknown>) {
        this.log('debug', message, context);
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context);
    }

    error(message: string, context?: Record<string, unknown>) {
        this.log('error', message, context);
    }

    /** Get buffered entries (for sending to monitoring service) */
    getBufferedEntries(): readonly LogEntry[] {
        return [...logBuffer];
    }

    /** Clear the buffer after successful flush */
    clearBuffer() {
        logBuffer.length = 0;
    }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const logger = new Logger();

// Pre-built child loggers for common modules
export const apiLogger = logger.child('API');
export const authLogger = logger.child('Auth');
export const reportingLogger = logger.child('Reporting');
export const garLogger = logger.child('GAR');
export const exportLogger = logger.child('Export');
