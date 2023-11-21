/* eslint-disable global-require */

import 'dotenv/config';
import hbs from 'handlebars';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import expressStaticGzip from 'express-static-gzip';

import { router } from './router';
import { logger, isDev } from './utils';

const app = express();
const basePath = process.env.SERVER_BASE_PATH || '/';
const port = 3001;

// TODO Configure Cross Origin Requests
app.use(cors());

if (isDev) {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackConfig = require('../webpack.config');
  const webpackCompiler = webpack(webpackConfig());

  const wdmInstance = webpackDevMiddleware(webpackCompiler, {
    publicPath: '/',
  });

  app.use(wdmInstance);

  if (process.env.LIVERELOAD === 'ON') {
    const livereload = require('livereload');
    const lrserver = livereload.createServer();

    const onDone = () =>
      lrserver.sendAllClients(
        JSON.stringify({ command: 'reload', liveCSS: false, liveImg: false }),
      );

    if (webpackCompiler.hooks) {
      webpackCompiler.hooks.done.tap('webpack-hot-middleware', onDone);
    } else {
      webpackCompiler.plugin('done', onDone);
    }
  }
}

const configTemplate = fs.readFileSync(path.resolve(__dirname, './config-template.js'), {
  encoding: 'utf-8',
});

const template = hbs.compile(configTemplate);

app.use(
  '/',
  expressStaticGzip('dist/client', {
    enableBrotli: true,
    orderPreference: ['br'],
    index: false,
    serveStatic: {
      maxAge: 31536000000,
      immutable: true,
      setHeaders: (res, currPath) => {
        if (currPath.includes('/remoteEntry.js')) {
          res.setHeader('Cache-Control', 'public, max-age=0');
        }
      },
    },
  }),
);

app.use('/config', (req, res) => {
  const result = template({ env: process.env });

  res.setHeader('content-type', 'text/javascript');
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.write(result);
  res.end();
});

app.use(`${basePath}/api`, router);

app.listen(port, () => {
  logger.warn({ message: `Cko Dashboard listening at http://localhost:${port}` });
});
