import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import 'winston-daily-rotate-file';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.colorize(),
        format.printf(({ timestamp, level, message, context, ms }) => {
          return `[Nest] ${timestamp} ${level} [${context || 'App'}] ${message} ${ms}`;
        }),
      ),
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: format.combine(format.timestamp(), format.json()),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});
