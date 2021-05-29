import { LogLevel } from './log-levels.enum';

export class LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  trace?: string;
}
