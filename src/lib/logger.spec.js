import chalk from 'chalk';
import log from './logger';

global.console = {
  log: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('Logger', () => {
  it('should error if arg is error', () => {
    log.err('error message', true);
    expect(global.console.error).toHaveBeenCalledWith(
      chalk.red('error message')
    );
  });

  it('should info if arg is info', () => {
    log.info('info message', true);
    expect(global.console.info).toHaveBeenCalledWith(
      chalk.blue('info message')
    );
  });

  it('should log if arg is log', () => {
    log.log('log message', true);
    expect(global.console.log).toHaveBeenCalledWith(chalk.green('log message'));
  });

  it('should warn if arg is warn', () => {
    log.warn('warn message', true);
    expect(global.console.warn).toHaveBeenCalledWith(
      chalk.yellow('warn message')
    );
  });
});
