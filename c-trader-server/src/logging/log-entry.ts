import { LogLevel } from './log-levels.enum';

export class LogEntry {
  timestamp: number;
  level: LogLevel;
  context: string;
  message: string;
  trace?: string;
}
