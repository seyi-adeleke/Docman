import paginate from '../utilities/paginate';

const Document = require('../models').Document;

export default {
  /**
   * create: This enables registered users create documents
   * @function create
   * @param {object} req request
   * @param {object} res response
   * @return {object} Json data
   */
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
        response
      }))
      .catch(error => res.status(400).send(error));
  },
  /**
    *list: This lists out all documents in the database
    * @function list
    * @param {object} req request
    * @param {object} res response
    * @return {object} Json data 
    */
  list: (req, res) => {
    const query = {
      where: {}
    };
    query.limit = Math.abs(req.query.limit) || 10;
    query.offset = Math.abs(req.query.offset) || 0;
    Document
      .findAll(query)
      .then((documents) => {
        const count = documents.length;
        paginate.information(count, query.limit, query.offset, documents, res);
      })
      .catch(error => res.status(400).send(error));
  },

  /**
   * findDocument: This finds a particular users document
   * @function findDocument
   * @param {object} req
   * @param {object} res
   * @return {object} Json data
   */
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

/**
  * updateDocument: This updates a document
  * @function updateDocument
  * @param {object} req
  * @param {object} res
  * @return {object} Json data
*/
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

/**
   * deleteDocument: This deletes a users documents
   * @function deleteDocument
   * @param {object} req
   * @param {object} res
   * @return {null}
   */
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
/**
 * searchDocument: This searches for a particular document
 * @function searchDocuments
 * @param {object} req
 * @param {object} res
 * @return {object} Json data
 */
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

