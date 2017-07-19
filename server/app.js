import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';

const LocalStorage = require('node-localstorage').LocalStorage;

const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();
app.set('port', port);

app.set('superSecret');

if (typeof localStorage === 'undefined' || localStorage === null) {
  const localStorage = new LocalStorage('./scratch');
}

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./routes')(app);

app.get('*', (req, res) => res.status(200).send({
  message: 'welcome to docman',
}));

const server = http.createServer(app);
server.listen(port);
