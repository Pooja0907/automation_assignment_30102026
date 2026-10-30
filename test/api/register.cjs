const path = require('node:path');
require('dotenv/config');

process.env.TS_NODE_PROJECT = path.resolve(__dirname, '../../tsconfig.api.json');
require('ts-node/register');
