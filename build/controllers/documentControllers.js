'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../models/index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Document = require('../models').Document;

exports.default = {
  create: function create(req, res) {
    var body = req.body;
    body.userId = req.decoded.id;
    body.roleId = req.decoded.roleId;
    if (body.roleId === 2) {
      if (body.access === 'role') {
        return res.status(404).json({ message: 'You cannot create Role based documents' });
      }
    }
    Document.create(body).then(function (response) {
      return res.status(201).send(response);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  list: function list(req, res) {
    var query = void 0;
    var limit = parseInt(req.query.limit, 10);
    var offset = parseInt(req.query.offset, 10);
    if (limit && offset) {
      query.limit = limit;
      query.offset = offset;
    }
    query = {
      where: {}
    };
    Document.findAll(query).then(function (documents) {
      return res.status(200).send(documents);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  findDocument: function findDocument(req, res) {
    Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).json({ message: 'this document doesnt exist' });
      } else if (req.decoded.id === document.userId || req.isAdmin) {
        return res.status(200).json(document);
      } else if (req.decoded.id !== document.userId) {
        return res.status(404).json({ message: 'you dont have access to this document' });
      }
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  updateDocument: function updateDocument(req, res) {
    Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).json({ message: 'this document doesnt exist' });
      } else if (document.userId !== req.decoded.id) {
        return res.status(404).json({ message: 'you cannot edit this document' });
      }
      return document.update({
        title: req.body.title || document.title,
        content: req.body.content || document.content,
        access: req.body.access || document.access
      }).then(function () {
        return res.status(200).send(document);
      }).catch(function (error) {
        return res.status(400).send(error);
      });
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  deleteDocument: function deleteDocument(req, res) {
    Document.findById(req.params.id).then(function (document) {
      if (!document) {
        return res.status(404).json({ message: 'this document doesnt exist' });
      } else if (req.decoded.id === document.userId || req.isAdmin) {
        return document.destroy().then(function () {
          return res.status(204).send();
        }).catch(function (error) {
          return res.status(400).send(error);
        });
      } else if (req.decoded.id !== document.userId) {
        return res.status(404).json({ message: 'you dont have access to this document' });
      }
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  },

  searchDocuments: function searchDocuments(req, res) {
    var query = void 0;
    if (req.isAdmin) {
      query = {
        where: { title: req.query.q }
      };
    } else {
      query = {
        where: { title: req.query.q, access: 'public', roleId: req.decoded.roleId }
      };
    }
    Document.findAll(query).then(function (document) {
      if (document === undefined) {
        return res.status(404).json({ message: 'this document doesnt exist' });
      }
      return res.status(200).json(document[0].dataValues);
    }).catch(function (error) {
      return res.status(400).send(error);
    });
  }

};