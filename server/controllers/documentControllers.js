import db from '../models/index';

const Document = require('../models').Document;

export default {
  create: (req, res) => {
    if (req.body.title === undefined || req.body.content === undefined) {
      return res.status(400).send({ message: 'Please input a title or some content' });
    }
    const body = req.body;
    if (body.access === undefined) {
      body.access = 'public';
    }
    body.access = req.body.access.toLowerCase();
    body.userId = req.decoded.id;
    body.roleId = req.decoded.roleId;
    if (body.roleId === 2) {
      if (body.access === 'role') {
        return res.status(404).json({ message: 'You cannot create Role based documents' });
      }
    }
    Document
      .create(body)
      .then(response => res.status(201).send({
        message: 'Document created succesfully',
        response }))
      .catch(error => res.status(400).send(error));
  },

  list: (req, res) => {
    let query;
    const limit = parseInt(req.query.limit, 10);
    const offset = parseInt(req.query.offset, 10);
    if (limit && offset) {
      query.limit = limit;
      query.offset = offset;
    }
    query = {
      where: {}
    };
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
          return res.status(404).json({ message: 'This documents doesn\'t exist' });
        } else if (req.isAdmin) {
          return res.status(200).send(document);
        } else if (document.access === 'public') {
          return res.status(200).json({ message: 'Document Found succesfully', document });
        } else if (document.access === 'private' && req.decoded.id !== document.userId) {
          return res.status(404).json({ message: 'You do not have access to this document' });
        } else if (document.access === 'role' && req.decoded.roleId === 3) {
          return res.status(200).json({ message: 'Document Found succesfully', document });
        }
      })
      .catch(error => res.status(400).send(error));
  },


  updateDocument: (req, res) => {
    Document
      .findById(req.params.id)
      .then((document) => {
        const updatedDocument = {
          title: req.body.title,
          content: req.body.content,
          access: req.body.access
        };
        if (req.body.access === 'role' && req.decoded.roleId === 2) {
          return res.status(400).send({ message: 'You cannot create role based documents' });
        }
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
          .then(() => res.status(200).json({ message: 'Document updated', updatedDocument }));
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
    } else if (req.decoded.roleId === 2) {
      query = {
        where: { title: req.query.q, access: 'public' }
      };
    } else if (req.decoded.roleId === 3) {
      query = {
        where: { title: req.query.q, $or: [{ access: 'public' }, { access: 'role' }] }
      };
    }
    Document
      .findAll(query)
      .then((document) => {
        const message = 'Document Found';
        if (document[0] === undefined) {
          return res.status(404).json({ message: 'This document doesnt exist' });
        }
        const searchedDocument = {
          title: document[0].dataValues.title,
          content: document[0].dataValues.content
        };
        return res.status(200).json({ message, searchedDocument });
      })
      .catch(error => res.status(400).send(error));
  }

};

