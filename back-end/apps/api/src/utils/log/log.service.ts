import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LogService {
  private readonly loggers = new Map<Readonly<string>, Logger>();

  has(name: string): boolean {
    return this.loggers.has(name);
  }
  hasNot(name: string): boolean {
    return !this.has(name);
  }

  create(name: string): Logger {
    const logger = new Logger(name);
    this.loggers.set(name, logger);
    return logger;
  }
  get(name: string): Logger | undefined {
    return this.loggers.get(name);
  }
  getOrCreate(name: string): Logger {
    return this.loggers.get(name) ?? this.create(name);
  }
}
