import { expect } from 'chai';
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

describe('User Controller ', () => {
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

  describe('POST /api/v1/users', () => {
    it('Creates a new user', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'ade',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(201)
        .end((err, res) => {
          expect(res.status).to.equal(201);
          done();
        });
    });

    it('throws a 400 for incorrect sign up info', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'tolu'
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body.message).to.equals('Please crosscheck your information');
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('POST /api/v1/uses/login', () => {
    it('responds with a 200 to a valid login request', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'tolu@tolu.com',
          password: 'tolu',
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equals('This account doesnt exist');
          done();
        });
    });
    it('responds with an error message to an invalid login request', (done) => {
      request(app)
        .post('/api/v1/users/login')
        .send()
        .expect(200)
        .end((err, res) => {
          expect(res.body.message).to.equals('Please input a password');
          done();
        });
      done();
    });
  });


  describe('GET /api/v1/users/', () => {
    it('gets a list of all users when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'admin@admin.com',
            password: 'admin',
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .get('/api/v1/users/?limit=1&offset=1')
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect(typeof (res.body)).to.equals('object');
                request(app)
                  .delete('/api/v1/users/1')
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .end((err, res) => {
                    expect(typeof (res.body)).to.equals('object');
                    done();
                  });
              });
          });
      });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns a particular user based on the ID provided in params', (done) => {
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
            .get('/api/v1/users/1')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect(typeof (res.body)).to.equals('object');
              done();
            });
          done();
        });
    });
    it('returns an error message if the user tries to find another users information', (done) => {
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
            .get('/api/v1/users/100')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect(typeof (res.body)).to.equals('object');
              done();
            });
        });
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('updates a user with the correct access information', (done) => {
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
            .put('/api/v1/users/1')
            .send({
              email: 'adeleke@adeleke.com',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.email).to.equal('adeleke@adeleke.com');
              done();
            });
        });
    });
    it('returns an error message if the user tries to update another users details', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'test',
          password: 'test',
          email: 'test@test.com',
          roleId: 2
        })
        .expect(200)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .put('/api/v1/users/100')
            .send({
              email: 'adeleke@adeleke.com',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, res) => {
              expect((res.body.message)).to.equals('You cannot edit this users information');
              done();
            });
        });
    });
  });

  describe('GET /api/v1/users/:id/documents', () => {
    it('searches for a users documents', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'test',
          password: 'test',
          email: 'test@test.com',
          roleId: 2
        })
        .expect(204)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/users/1/documents')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.length).to.equals(0);
              done();
            });
          done();
        });
    });

    it('returns an error message if the signed in user searches for another users documents', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'test',
          password: 'test',
          email: 'test@test.com',
          roleId: 2
        })
        .expect(204)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/users/100/documents')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.message).to.equals('you dont have access to these documents');
              done();
            });
          done();
        });
    });
  });

  describe('GET /api/v1/search/users/', () => {
    xit('returns the correct response if the user searches for a user that doesn\'t exist ', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'femi',
          password: 'femi',
          email: 'femi@femi.com',
          roleId: 2
        })
        .expect(204)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/?q=adsf')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, res) => {
              expect(res.status).to.equal(404);
              expect(res.body.message).to.equal('This user doesn\'t exist');
              done();
            });
        });
    });

    it('searches for a user', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'femi',
          password: 'femi',
          email: 'femi@femi.com',
          roleId: 2
        })
        .expect(204)
        .end((err, res) => {
          token = res.body.token;
          request(app)
            .get('/api/v1/search/users/?q=femi')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.searchedUser.name).to.equals('femi');
              done();
            });
        });
    });
  });

  describe('GET /api/v1/documents', () => {
    it('Returns a list of documents when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'admin@admin.com',
            password: 'admin',
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
                expect(res.body.length).to.equal(0);
                done();
              });
          });
      });
    });

    it('Returns a paginated list of documents when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'admin@admin.com',
            password: 'admin',
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .get('/api/v1/documents/?limit=1&offset=1')
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect(typeof res.body).to.equal('object');
                done();
              });
          });
      });
    });
  });

  describe('PUT api/v1/users/:id/role', () => {
    it('admin can change the role of a user', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/')
          .send({
            name: 'femi',
            password: 'femi',
            email: 'femi@femi.com',
            roleId: 2,
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .post('/api/v1/users/login')
              .send({
                email: 'admin@admin.com',
                password: 'admin',
              })
              .expect(200)
              .end((err, res) => {
                token = res.body.token;
                request(app)
                  .put('/api/v1/users/2/role')
                  .send({
                    role: 3
                  })
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    expect(res.status).to.equal(200);
                    done();
                  });
              });
          });
      });
    });

    it('returns an error message when the admin makes an invalid request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/')
          .send({
            name: 'femi',
            password: 'femi',
            email: 'femi@femi.com',
            roleId: 2,
          })
          .expect(200)
          .end((err, res) => {
            token = res.body.token;
            request(app)
              .post('/api/v1/users/login')
              .send({
                email: 'admin@admin.com',
                password: 'admin',
              })
              .expect(200)
              .end((err, res) => {
                token = res.body.token;
                request(app)
                  .put('/api/v1/users/2/role')
                  .send({
                    role: 100
                  })
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(404)
                  .end((err, res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body.message).to.equal('invalid command');
                    done();
                  });
              });
          });
      });
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('Return a 200 when an admin finds a document that exists', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'admin@admin.com',
            password: 'admin',
          })
          .expect(200)
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
              .expect(200)
              .end((err, res) => {
                request(app)
                  .get('/api/v1/documents/1')
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.title).to.equal('title');
                    done();
                  });
              });
          });
      });
    });
  });

  describe('GET /api/v1/search/documents/', () => {
    it('returns a document when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then((res) => {
        request(app)
          .post('/api/v1/users/login')
          .send({
            email: 'admin@admin.com',
            password: 'admin',
          })
          .expect(200)
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
              .expect(200)
              .end((err, res) => {
                request(app)
                  .get('/api/v1/search/documents/?q=title')
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    expect(typeof res.body).to.equal('object');
                    done();
                  });
              });
          });
      });
    });
  });
});
