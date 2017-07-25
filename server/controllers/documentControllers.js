import db from '../models/index';

const Document = require('../models').Document;

export default {
  create: (req, res) => {
    const body = req.body;
    body.userId = req.decoded.id;
    body.roleId = req.decoded.roleId;
    if (body.roleId === 2) {
      if (body.access === 'role') {
        return res.send({
          message: 'Invalid command'
        });
      }
    }
    Document
      .create(body)
      .then(response => res.status(201).send(response))
      .catch(error => res.status(400).send(error));
  },

  list: (req, res) => {
    let query;
    if (req.decoded.roleId === 2) {
      query = {
        where: { access: 'public' },
        include: [{
          model: db.User,
        }]
      };
      if (req.query.limit && req.query.offset) {
        query.limit = req.query.limit;
        query.offset = req.query.offset;
      }
    } else if (req.decoded.roleId === 3) {
      query = {
        where: { $or: [{ access: 'public' }, { access: 'role' }] },
        include: [{
          model: db.User
        }]
      };
      if (req.query.limit && req.query.offset) {
        query.limit = req.query.limit;
        query.offset = req.query.offset;
      }
    } else {
      query = {
        where: {},
        include: [{
          model: db.User
        }]
      };
      if (req.query.limit && req.query.offset) {
        query.limit = req.query.limit;
        query.offset = req.query.offset;
      }
    }
    Document
      .findAll(query)
      .then(documents => res.status(200).send(documents))
      .catch(error => res.status(400).send(error));
  },

  findDocument: (req, res) => {
    Document
      .findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).json({ message: 'this document doesnt exist' });
        } else if ((req.decoded.id === document.userId || req.isAdmin)) {
          return res.status(200).json(document);
        } else if (req.decoded.id !== document.userId) {
          return res.status(404).json({ message: 'you dont have access to this document' });
        }
      })
      .catch(error => res.status(400).send(error));
  },

  updateDocument: (req, res) => {
    Document
      .findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).json({ message: 'this document doesnt exist' });
        } else if (document.userId !== req.decoded.id) {
          return res.status(404).json({ message: 'you cannot edit this document' });
        }
        return document
          .update({
            title: req.body.title || document.title,
            content: req.body.content || document.content,
            access: req.body.access || document.access
          })
          .then(() => res.status(200).send(document))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

  deleteDocument: (req, res) => {
    Document
      .findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).json({ message: 'this document doesnt exist' });
        } else if ((req.decoded.id === document.userId || req.isAdmin)) {
          return document
            .destroy()
            .then(() => res.status(204).send())
            .catch(error => res.status(400).send(error));
        } else if (req.decoded.id !== document.userId) {
          return res.status(404).json({ message: 'you dont have access to this document' });
        }
      })
      .catch(error => res.status(400).send(error));
  },

  searchDocuments: (req, res) => {
    let query;
    if (req.isAdmin) {
      query = {
        where: { title: req.query.q }
      };
    } else {
      query = {
        where: { title: req.query.q, access: 'public', roleId: req.decoded.roleId }
      };
    }
    Document
      .findAll(query)
      .then((document) => {
        if (document === undefined) {
          return res.status(404).json({ message: 'this document doesnt exist' });
        }
        return res.status(200).json(document[0].dataValues);
      })
      .catch(error => res.status(400).send(error));
  }

};

