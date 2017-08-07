import db from '../models/index';


import utilities from '../utilities/paginate';
import date from '../utilities/formatDate';
import validate from '../utilities/validateId';

const Document = require('../models').Document;
const User = require('../models').User;

export default {
  /**
   * create: This enables registered users create documents
   * @function create
   * @param {object} req request
   * @param {object} res response
   * @return {object} Json data
   */
  create: (req, res) => {
    if (!req.body.title || !req.body.content) {
      return res.status(400)
        .send({ message: 'Please input a title or some content' });
    }
    const body = req.body;
    if (body.access === undefined) {
      body.access = 'public';
    }
    body.access = req.body.access.toLowerCase();
    if (body.access !== 'public' &&
      body.access !== 'private' && body.access !== 'role') {
      return res.status(400)
        .send({
          message: 'You cannot create a document with this access level'
        });
    }
    body.userId = req.decoded.id;
    body.roleId = req.decoded.roleId;
    if (body.roleId === 2) {
      if (body.access === 'role') {
        return res.status(404)
          .json({ message: 'You cannot create Role based documents' });
      }
    }
    Document.findAll({
      where: {
        title: req.body.title,
      }
    })
      .then((response) => {
        if (response.length === 0) {
          return Document
            .create(body)
            .then((document) => {
              res.status(201).send({
                message: 'Document created succesfully',
                document: {
                  title: document.title,
                  content: document.content,
                  access: document.access,
                  createdOn: document.createdAt,
                  id: document.id,
                }
              });
            })
            .catch((error) => {
              res.status(400).send(error);
            });
        } return res.json({
          message: 'This document exists'
        });
      })
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
    let query;
    if (req.decoded.roleId === 2) {
      query = {
        where: { access: 'public' },
        include: [{
          model: db.User,
          attributes: ['name', 'email', 'id']
        }],
        attributes: ['title', 'content', 'access', 'createdAt', 'id']
      };
    } else if (req.decoded.roleId === 3) {
      query = {
        include: [{
          model: db.User,
          attributes: ['name', 'email', 'id']
        }],
        where: { $or: [{ access: 'public' }, { access: 'role' }] },
        attributes: ['title', 'content', 'access', 'createdAt', 'id']
      };
    } else {
      query = {
        where: {},
        include: [{
          model: db.User,
          attributes: ['name', 'email', 'id']
        }],
        attributes: ['title', 'content', 'access', 'createdAt', 'id']
      };
    }
    query.limit = Math.abs(req.query.limit) || 10;
    query.offset = Math.abs(req.query.offset) || 0;
    Document
      .findAll(query)
      .then((documents) => {
        const count = documents.length;
        utilities.paginate(count, query.limit, query.offset, documents, res);
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
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }
    Document
      .findById(req.params.id, {
        include: [{
          model: User,
          as: 'User',
          attributes: ['name', 'email']
        }],
      })
      .then((document) => {
        if (!document) {
          return res.status(404)
            .json({ message: 'This document doesn\'t exist' });
        }
        const foundDocument = {
          owner: document.User.dataValues.name,
          title: document.title,
          content: document.content,
          access: document.access,
          createdOn: (document.createdAt),
          id: document.id,
        };

        if (req.isAdmin) {
          return res.status(200).json({
            message: 'Document Found succesfully', foundDocument
          });
        } else if (document.access === 'public') {
          return res.status(200).json({
            message: 'Document Found succesfully', foundDocument
          });
        } else if (document.access === 'private'
          && req.decoded.id !== document.userId) {
          return res.status(400).json({
            message: 'You do not have access to this document'
          });
        } else if (document.access === 'role' && req.decoded.roleId === 3) {
          return res.status(200).json({
            message: 'Document Found succesfully', foundDocument
          });
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
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }
    if (!req.body.title && !req.body.content && !req.body.access) {
      return res.status(400).send({
        message: 'Please cross check your request'
      });
    }
    Document
      .findById(req.params.id)
      .then((document) => {
        const updatedDocument = {
          title: req.body.title,
          content: req.body.content,
          access: req.body.access,
          updatedOn: date.format(document.updatedAt)
        };
        if (req.body.access) {
          if (req.body.access !== 'private' &&
            req.body.access !== 'public' && req.body.access !== 'role') {
            return res.status(400).send({
              document: 'You cannot change a document to this access level'
            });
          }
        }
        if (req.body.access === 'role'
          && req.decoded.roleId === 2) {
          return res.status(400).send({
            message: 'You cannot create role based documents'
          });
        }
        if (!document) {
          return res.status(404).json({
            message: 'this document doesnt exist'
          });
        } else if (document.userId !== req.decoded.id) {
          return res.status(404).json({
            message: 'you cannot edit this document'
          });
        }
        return document
          .update({
            title: req.body.title || document.title,
            content: req.body.content || document.content,
            access: req.body.access || document.access
          })
          .then(() => res.status(200).json({
            message: 'Document updated', updatedDocument
          }));
      })
      .catch(error => res.status(400).send(error));
  },

  /**
     * deleteDocument: This deletes a users documents
     * @function deleteDocument
     * @param {object} req
     * @param {object} res
     * @return {null} void
    */
  deleteDocument: (req, res) => {
    if (validate.id(req.params.id)) {
      return res.status(400)
        .send({ message: 'Please use an integer value' });
    }
    Document
      .findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404).json({
            message: 'this document doesnt exist'
          });
        } else if ((req.decoded.id === document.userId || req.isAdmin)) {
          return document
            .destroy()
            .then(() => res
              .json({ message: 'Document has been deleted successfully' }))
            .catch(error => res.status(400).send(error));
        } else if (req.decoded.id !== document.userId) {
          return res.status(404).json({
            message: 'you dont have access to this document'
          });
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
    if (req.query.q === undefined) {
      return res.status(400).send({ message: 'Please input a search query' });
    }
    const searchString = req.query.q.trim();
    let query;
    if (req.isAdmin) {
      query = {
        where: { title: { $ilike: `%${searchString}%` } },
        attributes: ['title', 'content', 'id', 'createdAt']
      };
    } else if (req.decoded.roleId === 2) {
      query = {
        where: { title: { $ilike: `%${searchString}%` }, access: 'public' },
        attributes: ['title', 'content', 'id', 'createdAt']

      };
    } else if (req.decoded.roleId === 3) {
      query = {
        where: {
          title: { $ilike: `%${searchString}%` },
          $or: [{ access: 'public' }, { access: 'role' }]
        },
        attributes: ['title', 'content', 'id', 'createdAt']
      };
    }
    Document
      .findAll(query)
      .then((document) => {
        const message = 'Document Found';
        if (document[0] === undefined) {
          return res.status(404)
            .json({ message: 'This document doesnt exist' });
        }
        return res.status(200).json({ message, document });
      })
      .catch(error => res.status(400).send(error));
  }
};

