/* eslint-disable no-console */
import chalk from 'chalk';

export default {
  err: (message, useLogger) => useLogger && console.error(chalk.red(message)),
  info: (message, useLogger) => useLogger && console.info(chalk.blue(message)),
  log: (message, useLogger) => useLogger && console.log(chalk.green(message)),
  warn: (message, useLogger) =>
    useLogger && console.warn(chalk.yellow(message)),
  trace: (message, useLogger) =>
    useLogger && console.trace(chalk.magenta(message))
};
