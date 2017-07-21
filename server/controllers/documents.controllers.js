import db from '../models/index';

const Document = require('../models').Document;

module.exports.create = (req, res) => {
  const body = req.body;
  body.userId = req.decoded.id;
  Document
    .create(body)
    .then(response => res.status(201).send(response))
    .catch(error => res.status(400).send(error));
};

