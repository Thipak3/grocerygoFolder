const isDebug = process.env.LOG_LEVEL === 'debug';

function formatMessage(level: string, message: string, context?: any) {
  const timestamp = new Date().toISOString();
  let log = `[${timestamp}] [${level}] ${message}`;
  if (context !== undefined) {
    if (context instanceof Error) {
      log += `\nError: ${context.message}\nStack: ${context.stack}`;
    } else {
      log += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }
  }
  return log;
}

export const log = {
  info: (message: string, context?: any) => {
    if (process.env.NODE_ENV !== 'production' || isDebug) {
      console.log(formatMessage('INFO', message, context));
    }
  },
  debug: (message: string, context?: any) => {
    if (process.env.NODE_ENV !== 'production' || isDebug) {
      console.log(formatMessage('DEBUG', message, context));
    }
  },
  warn: (message: string, context?: any) => {
    console.warn(formatMessage('WARN', message, context));
  },
  error: (message: string, context?: any) => {
    console.error(formatMessage('ERROR', message, context));
  },
};
