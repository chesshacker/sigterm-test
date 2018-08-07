const Koa = require('koa');
const Router = require('koa-router');
const log = require('./log');

const app = new Koa();
const router = new Router();

const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

const STAY_ALIVE = process.env.STAY_ALIVE === 'true';

router.get('/pid', async ctx => {
  log.info(`Returning pid = ${process.pid}`);
  ctx.body = `${process.pid}\n`;
});

router.get('/slow', async ctx => {
  log.info('Starting slow request');
  await setTimeoutPromise(5000);
  ctx.body = 'sloth says hello\n';
  log.info('Finished slow request');
});

router.get('/', async ctx => {
  log.info('ok');
  ctx.body = 'ok\n';
});

app.use(router.routes());

const server = app.listen(3000, () => {
  log.info('Listening on port 3000');
  log.info(`STAY_ALIVE = ${STAY_ALIVE}`);
});

process.on('SIGTERM', function () {
  if (STAY_ALIVE) {
    log.info('SIGTERM received - ignoring it.');
  } else {
    log.info('SIGTERM received - starting shut down...');
    server.close(function () {
      log.info('Server closed. Shut down gracefully.');
      process.exit(0);
    });
  }
});
