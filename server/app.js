import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import http from 'http';

const port = parseInt(process.env.PORT, 10) || 3000;
const app = express();
app.set('port', port);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.get('*', (req, res) => res.status(200).send({
  message: 'welcome to docman',
}));

const server = http.createServer(app);
server.listen(port);
