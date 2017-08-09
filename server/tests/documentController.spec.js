import { expect } from 'chai';

import bcrypt from '../../build/utilities/bcrypt';

const User = require('../../build/models').User;
const Document = require('../../build/models').Document;
const Role = require('../../build/models').Role;
const request = require('supertest');
require('babel-register');
const app = require('../../build/app').default;


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
              expect(res.body.message).to.equal('Document created succesfully');
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
              expect(res.body.message).to.equal('Please input a title or some content');
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
    it('throws a 400 if a user tries to create a document with the wrong access levele', (done) => {
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
              access: 'wrong'
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              expect(res.body.message).to.equal('You cannot create a document with this access level');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });
  });

  describe('GET /api/v1/documents', () => {
    it('gets a list of public and role based documents when an editor makes a request', (done) => {
      User.create({
        name: 'editor',
        email: 'editor@editor.com',
        password: bcrypt.hash('editor'),
        roleId: 3
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'editor@editor.com',
            password: 'editor',
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .get('/api/v1/documents/')
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect(res.body.message).to.equal('Data found');
                expect(res.status).to.equal(200);
                done();
              });
          });
      });
    });

    it('gets a list of public documents ', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 3
        })
        .expect(400)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/documents/')
            .send({
              title: 'title',
              content: 'content',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.message).to.equal('Data found');
              expect(res.status).to.equal(200);
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
        .expect(400)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/documents/100')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.message).to.equals('This document doesn\'t exist');
              expect((res.status)).to.equals(404);
              done();
            });
        });
    });
    it('returns a 400 if users passes a string as the id', (done) => {
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
            .get('/api/v1/documents/alpaha')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.message).to.equal('Please use an integer value');
              expect((res.status)).to.equals(400);
              done();
            });
        });
    });
    it('returns a 200 if a user finds a public document that exists', (done) => {
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
              access: 'public'
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
                  expect(res.body.message).to.equal('Document Found succesfully');
                  expect(res.status).to.equal(200);
                  done();
                });
            });
        });
    });
    it('returns a 400 if a user tries to access a private document that does not belong to them', (done) => {
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
                .post('/api/v1/users')
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
                    .end((err, res) => {
                      expect(res.body.message).to.equal('You do not have access to this document');
                      expect(res.status).to.equal(400);
                      done();
                    });
                });
            });
        });
    });
    it('returns a 200 if an editor tries to access a role based document that exists', (done) => {
      User.create({
        name: 'editor',
        email: 'editor@editor.com',
        password: bcrypt.hash('editor'),
        roleId: 3
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'editor@editor.com',
            password: 'editor',
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .post('/api/v1/documents/')
              .send({
                title: 'title',
                content: 'content',
                access: 'role'
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
                    expect(res.body.message).to.equal('Document Found succesfully');
                    expect(res.status).to.equal(200);
                    done();
                  });
              });
          });
      });
    });
  });

  describe('PUT /api/vi/documents/:id', () => {
    it('returns a 400 if users passes a string as the id', (done) => {
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
            .put('/api/v1/documents/sdsf')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              expect(res.body.message).to.equals('Please use an integer value');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });

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
              expect(res.body.message).to.equal('This document doesn\'t exist');
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
                  expect(res.body.message).to.equal('Document updated');
                  expect((res.status)).to.equals(200);
                  done();
                });
              done();
            });
        });
    });

    it('returns a 400 if a user updates a document to an incorrect access level', (done) => {
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
                  access: 'i am not correct'
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  expect((res.status)).to.equals(400);
                  done();
                });
            });
        });
    });

    it('returns a 400 if a user updates a document to a document that already exists', (done) => {
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
                .post('/api/v1/documents')
                .send({
                  title: 'document',
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
                      title: 'document'
                    })
                    .set('Authorization', `${token}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .end((err, res) => {
                      expect((res.body.message)).to.equals('This document exists already');
                      done();
                    });
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
    it('returns a 400 if a user passes a string as the id', (done) => {
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
            .delete('/api/v1/documents/sdfg')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              expect(res.body.message).to.equal('Please use an integer value')
              expect(res.status).to.equals(400);
              done();
            });
        });
    });

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
              expect(res.body.message).to.equal('this document doesnt exist');
              expect(res.status).to.equals(404);
              done();
            });
        });
    });
    it('returns a 200 if a user deletes a document belonging to them', (done) => {
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
                  expect(res.body.message).to.equal('Document has been deleted successfully');
                  expect(res.status).to.equal(200);
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
    it('returns a 404 if a user searches for a document that doesn\'t exist', (done) => {
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
              console.log(res.body);
              expect(res.body.message).to.equal('This document doesnt exist');
              expect(res.status).to.equals(404);
              done();
            });
        });
    });

    it('returns a 400 if a user doesnt input a search query', (done) => {
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
            .get('/api/v1/search/documents/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end((err, res) => {
              console.log(res.body);
              expect(res.body.message).to.equal('Please input a search query');
              expect(res.status).to.equals(400);
              done();
            });
        });
    });
  });
});
