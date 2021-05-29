import { Logger, LoggerService } from '@nestjs/common';
import { Subject } from 'rxjs';
import { LogEntry } from './log-entry';
import { LogLevel } from './log-levels.enum';

export class CustomLogger extends Logger {
  private logLevel = LogLevel.DEBUG;
  logStream$ = new Subject<LogEntry>();

  constructor(context?: string, isTimestampEnabled?: boolean) {
    super(context, isTimestampEnabled);
  }
  error(message: any, trace?: string, context?: string) {
    this.logStream$.next({
      level: LogLevel.ERROR,
      context,
      message,
      trace,
    });
    if (this.logLevel <= LogLevel.ERROR) super.error(message, trace, context);
  }
  log(message: any, context?: string) {
    this.logStream$.next({
      level: LogLevel.LOG,
      context,
      message,
    });
    if (this.logLevel <= LogLevel.LOG) super.log(message, context);
  }
  warn(message: any, context?: string) {
    this.logStream$.next({
      level: LogLevel.WARN,
      context,
      message,
    });
    if (this.logLevel <= LogLevel.WARN) super.warn(message, context);
  }
  debug(message: any, context?: string) {
    this.logStream$.next({
      level: LogLevel.DEBUG,
      context,
      message,
    });
    if (this.logLevel <= LogLevel.DEBUG) super.debug(message, context);
  }
  verbose(message: any, context?: string) {
    this.logStream$.next({
      level: LogLevel.VERBOSE,
      context,
      message,
    });
    if (this.logLevel <= LogLevel.VERBOSE) super.verbose(message, context);
  }
}
