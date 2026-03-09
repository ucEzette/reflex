
const noop = () => { };
const pino = () => ({
    info: noop,
    error: noop,
    debug: noop,
    fatal: noop,
    warn: noop,
    trace: noop,
    child: () => pino(),
    levels: {
        values: {
            fatal: 60,
            error: 50,
            warn: 40,
            info: 30,
            debug: 20,
            trace: 10,
        },
        labels: {
            10: 'trace',
            20: 'debug',
            30: 'info',
            40: 'warn',
            50: 'error',
            60: 'fatal',
        },
    },
});

module.exports = pino;
module.exports.default = pino;
module.exports.pino = pino;
