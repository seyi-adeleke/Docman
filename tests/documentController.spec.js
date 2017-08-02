import chai, { expect } from 'chai';
import jwt from 'jsonwebtoken';

import bcrypt from '../build/utilities/bcrypt';

const User = require('../build/models').User;
const Document = require('../build/models').Document;
const Role = require('../build/models').Role;
const request = require('supertest');
const assert = require('chai').assert;
require('babel-register');
const app = require('../build/app').default;


let token;
let newToken;

describe('App', () => {
  it('responds to a request', (done) => {
    request(app)
      .get('/api/v1')
      .end((err, res) => {
        expect(res.body.message).to.equal('welcome to docman');
        done();
      });
  });
});

describe('Document Controller ', () => {
  beforeEach((done) => {
    Role.destroy({
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    }).then((error) => {
      if (!error) {
        Document
          .destroy({
            where: {},
            truncate: true,
            cascade: true,
            restartIdentity: true
          })
          .then((err) => {
            if (!err) {
              User.destroy({
                where: {},
                truncate: true,
                cascade: true,
                restartIdentity: true
              }).then((err) => {
                if (!err) {
                  Role.bulkCreate([
                    {
                      title: 'Admin'
                    },
                    {
                      title: 'User'
                    },
                    {
                      title: 'Editor'
                    }
                  ]).then((err) => {
                    if (!err) {
                      //
                    }
                    done();
                  });
                }
              });
            }
          });
      }
    });
  });

  describe('POST /api/v1/documents', () => {
    it('creates a document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(400)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents/')
            .send({
              title: 'title',
              content: 'content',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(typeof res.body).to.equal('object');
              done();
            });
        });
    });
    it('throws a 400 if users try to create an incorrect document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(201)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send()
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              expect(res.status).to.equal(400);
            });
          done();
        });
    });
    it('throws a 400 if a normal user tries to create a role access document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(201)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content',
              access: 'role'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              expect(res.body.message).to.equal('You cannot create Role based documents');
              expect(res.status).to.equal(404);
              done();
            });
        });
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('returns a 404 if users try to find a document that doesn\'t exist', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(404)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/documents/100')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect((res.status)).to.equals(404);
              done();
            });
        });
    });

    it('returns a 200 if users try to find documents that belong to them and exist', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .get('/api/v1/documents/1')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect(res.status).to.equal(200);
                });
              done();
            });
        });
    });

    xit('returns a 404 if you try to access anothers user\'s private document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content',
              access: 'private'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .post('/api/v1/users/')
                .send({
                  name: 'femi',
                  password: 'femi',
                  email: 'femi@femi.com',
                  roleId: 2
                })
                .expect(200)
                .end((err, res) => {
                  token = res.body.token;
                  request(app)
                    .get('/api/v1/documents/1')
                    .set('Authorization', `${token}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                      expect(res.body.message).to.equal('You do not have access to this document')
                      done();
                    });
                });
            });
        });
    });
  });

  describe('PUT /api/vi/documents/:id', () => {
    it('returns a 400 if a user makes a request without sending data', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .put('/api/v1/documents/100')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              expect((res.body.message)).to.equals('Please cross check your request');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });
    it('returns a 404 if a user tries to update a document that doesnt exist', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .put('/api/v1/documents/100')
            .send({
              title: 'title'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              expect((res.body.message)).to.equals('this document doesnt exist');
              expect(res.status).to.equal(404);
              done();
            });
        });
    });

    it('returns a 404 if a user tries to update another users document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .post('/api/v1/users')
                .send({
                  name: 'tolu',
                  password: 'tolu',
                  email: 'tolu@tolu.com',
                  roleId: 2
                })
                .expect(200)
                .end((err, res) => {
                  newToken = res.body.token;
                  request(app)
                    .put('/api/v1/documents/1')
                    .send({
                      title: 'some new title'
                    })
                    .set('Authorization', `${newToken}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end((err, res) => {
                      expect((res.body.message)).to.equals('you cannot edit this document');
                      expect(res.status).to.equal(404);
                      done();
                    });
                });
            });
        });
    });

    it('lets users update their documents', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .put('/api/v1/documents/1')
                .send({
                  title: 'another title'
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect((res.status)).to.equals(200);
                  done();
                });
            });
        });
    });

    it('return a 400 if a normal user tries to change the access of a document to  `role` ', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .put('/api/v1/documents/1')
                .send({
                  access: 'role'
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect((res.body.message)).to.equals('You cannot create role based documents');
                  done();
                });
            });
        });
    });
  });

  describe('DELETE /api/v1/documents/:id', () => {
    it('returns a 404 if a user tries to delete a document that doesn\'t exist', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(404)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .delete('/api/v1/documents/100')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.status).to.equals(404);
              done();
            });
        });
    });
    it('returns a 204 if a user deletes a document belonging to them', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(204)
            .end((err, res) => {
              request(app)
                .delete('/api/v1/documents/1')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect(res.status).to.equal(204);
                  done();
                });
            });
        });
    });
    it('returns a 404 if a user tries to delete another users document', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .post('/api/v1/documents')
            .send({
              title: 'title',
              content: 'content'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              request(app)
                .post('/api/v1/users')
                .send({
                  name: 'tolu',
                  password: 'tolu',
                  email: 'tolu@tolu.com',
                  roleId: 2
                })
                .expect(200)
                .end((err, res) => {
                  newToken = res.body.token;
                  request(app)
                    .delete('/api/v1/documents/1')
                    .set('Authorization', `${newToken}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end((err, res) => {
                      expect(res.body.message).to.equals('you dont have access to this document');
                      expect(res.status).to.equal(404);
                      done();
                    });
                });
            });
        });
    });
  });

  describe('GET /api/v1/search/documents', () => {
    it('returns a 400 if a user searches for a document that doesn\'t exist', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(400)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/search/documents/?q=idontexist')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.status).to.equals(404);
              done();
            });
        });
    });
  });
});
