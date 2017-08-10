import { expect } from 'chai';

import bcrypt from '../../build/utilities/bcrypt';

const User = require('../../build/models').User;
const Document = require('../../build/models').Document;
const Role = require('../../build/models').Role;
const request = require('supertest');
require('babel-register');
const app = require('../../build/app').default;

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
          expect(res.body.message)
            .to.equal('Registration Was Succesfull, You have been logged in');
          expect(res.status).to.equal(201);
          done();
        });
    });

    it('returns an error message if a user tries to signup twice', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'ade',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(201)
        .end(() => {
          request(app)
            .post('/api/v1/users')
            .send({
              name: 'ade',
              password: 'seyi',
              email: 'seyi@seyi.com',
              roleId: 2
            })
            .expect(400)
            .end((err, res) => {
              expect(res.body.message).to.equal('This Email already exists');
              done();
            });
        });
    });

    it('returns an error message for incorrect sign up info', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'tolu'
        })
        .expect(400)
        .end((err, res) => {
          expect(res.body.message)
            .to.equals('Please add a name, email and password');
          expect(res.status).to.equal(400);
          done();
        });
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('Logs a user in', (done) => {
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
    it('responds with an error message if the email/password is incorrect',
      (done) => {
        request(app)
          .post('/api/v1/users')
          .send({
            name: 'ade',
            password: bcrypt.hash('seyi'),
            email: 'seyi@seyi.com',
            roleId: 2
          })
          .expect(201)
          .end(() => {
            request(app)
              .post('/api/v1/users/login')
              .send({
                password: 'sey',
                email: 'seyi@seyi.com',
              })
              .expect(400)
              .end((err, res) => {
                expect(res.body.message)
                  .to.equal('The email/password is incorrect');
                done();
              });
          });
      });
  });


  describe('GET /api/v1/users/', () => {
    it('returns an error message when an unathenticated user tries to access the route',
      (done) => {
        request(app)
          .get('/api/v1/users/')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            expect((res.body.message)).to.equals('You are not logged in');
            done();
          });
      });
    it('gets a list of all users when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
                done();
              });
          });
      });
    });
    it('returns an error message when a user with an incorrect token tries to access the route', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'seyi',
          password: 'seyi',
          email: 'seyi@seyi.com',
          roleId: 2
        })
        .expect(201)
        .end(() => {
          request(app)
            .get('/api/v1/users/')
            .set('Authorization', 'token')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect((res.body.message))
                .to.equals('There was an error processing your request');
              done();
            });
        });
    });
    it('returns an error message if a user that is not an admin tries to access the route', (done) => {
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
          token = res.body.token;
          request(app)
            .get('/api/v1/users/')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .end((err, res) => {
              expect((res.body.message))
                .to.equals('You do not have access to this route');
              done();
            });
        });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns an error if the user passes a string as the id', (done) => {
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
            .get('/api/v1/users/sdfgh')
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(400)
            .end((err, res) => {
              expect(res.body.message).to.equal('The Identifier in the parameter should be an integer value');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });
    it('returns an error message when an unathenticated user tries to access the route',
      (done) => {
        request(app)
          .get('/api/v1/users/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            expect((res.body.message)).to.equals('You are not logged in');
            done();
          });
      });
    it('returns an error message when a user with an incorrect token tries to access the route',
      (done) => {
        request(app)
          .post('/api/v1/users')
          .send({
            name: 'seyi',
            password: 'seyi',
            email: 'seyi@seyi.com',
            roleId: 2
          })
          .expect(201)
          .end(() => {
            request(app)
              .get('/api/v1/users/1')
              .set('Authorization', 'token')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                expect((res.body.message))
                  .to.equals('There was an error processing your request');
                done();
              });
          });
      });
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
              expect(res.body.message)
                .to.equal('You do not have access to this users information');
              expect(typeof (res.body)).to.equals('object');
              done();
            });
        });
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('returns an error message if the user passes a string as the id', (done) => {
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
            .put('/api/v1/users/asdf')
            .send({
              email: 'adeleke@adeleke.com',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.message)
                .to
                .equal(
                  'The Identifier in the parameter should be an integer value');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });
    it('returns an error message is the user tries to update their email to an invalid email', (done) => {
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
              email: 'adelekeadeleke.com',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(200)
            .end((err, res) => {
              expect(res.body.message).to.equal('Please use a valid email');
              expect(res.status).to.equal(400);
              done();
            });
        });
    });
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
              expect(res.body.message).to.equal('User updated succesfully');
              expect(res.status).to.equal(200);
              done();
            });
          done();
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
              expect((res.body.message))
                .to.equals('You cannot edit this users information');
              done();
            });
        });
    });
    it('returns an error message if the user tries to update their email to an email that already exists', (done) => {
      request(app)
        .post('/api/v1/users')
        .send({
          name: 'test',
          password: 'test',
          email: 'test@test.com',
          roleId: 2
        })
        .expect(200)
        .end(() => {
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
                .put('/api/v1/users/2')
                .send({
                  email: 'test@test.com',
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect(400)
                .end((err, res) => {
                  expect((res.body.message))
                    .to.equals('This email already exists');
                  done();
                });
            });
        });
    });
<<<<<<< Updated upstream

<<<<<<< HEAD
=======
>>>>>>> Stashed changes
    it('encrypts a password when a user tries to update it', (done) => {
=======
   it('encrypts a password when a user tries to update it', (done) => {
>>>>>>> 293dcebfe09870a648ba7bb859ce3154e695f489
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
            .put('/api/v1/users/1')
            .send({
              password: 'new password',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect(400)
            .end((err, res) => {
              expect((res.body.message)).to.equals('User updated succesfully');
              done();
            });
        });
    });
  });

  describe('GET /api/v1/users/:id/documents', () => {
    it('returns an error message is the user passes a string as the id',
      (done) => {
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
              .get('/api/v1/users/asdfgh/documents')
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect(200)
              .end((err, res) => {
                expect(res.body.message)
                  .to
                  .equal(
                    'The Identifier in the parameter should be an integer value');
                expect(res.status).to.equals(400);
                done();
              });
            done();
          });
      });
    it('Returns a message if the user doesn\'t have any documents', (done) => {
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
              expect(res.body.message)
                .to.equal('You currently do not have any documents');
              expect(res.status).to.equals(200);
              done();
            });
          done();
        });
    });
    it('Returns a users documents', (done) => {
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
            .post('/api/v1/documents/')
            .send({
              title: 'title',
              content: 'content',
            })
            .set('Authorization', `${token}`)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .end(() => {
              request(app)
                .get('/api/v1/users/1/documents')
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                  expect(res.status).to.equals(200);
                  done();
                });
            });
        });
    });
    it('returns an error message if the signed in user searches for another users documents',
      (done) => {
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
                expect(res.body.message)
                  .to.equals('you dont have access to these documents');
                done();
              });
            done();
          });
      });
  });

  describe('GET /api/v1/search/users/', () => {
    it('returns a response if the user searches for a user that doesn\'t exist',
      (done) => {
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
              expect(res.status).to.equals(200);
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
      }).then(() => {
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
                expect(res.status).to.equal(200);
                done();
              });
          });
      });
    });

    it('Returns a paginated list of documents', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
    it('changes the role of a user', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
    it('returns an error message if the admin passes a string as the id', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
                  .put('/api/v1/users/zxc/role')
                  .send({
                    role: 3
                  })
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(400)
                  .end((err, res) => {
                    expect(res.status).to.equal(400);
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
      }).then(() => {
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
    it('returns an error message when the admin tries to change his role',
      (done) => {
        User.create({
          name: 'admin',
          email: 'admin@admin.com',
          password: bcrypt.hash('admin'),
          roleId: 1
        }).then(() => {
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
                .put('/api/v1/users/1/role')
                .send({
                  role: 3
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  expect(res.status).to.equal(400);
                  done();
                });
              done();
            });
        });
      });
    it('returns an error message when the admin tries to change the role of a user that doesnt exist', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
              .put('/api/v1/users/500/role')
              .send({
                role: 3
              })
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                expect(res.body.message).to.equal('This user doesnt exist');
                done();
              });
          });
      });
    });
  });

  describe('GET /api/v1/documents/:id', () => {
    it('Returns a document when an admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
              .end(() => {
                request(app)
                  .get('/api/v1/documents/1')
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
  });

  describe('GET /api/v1/search/documents/', () => {
    it('returns a document when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
              .end(() => {
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

  describe('DELETE /api/v1/users/:id/', () => {
    it('Deletes the user when the admin makes a request', (done) => {
      User.create({
        name: 'admin',
        email: 'admin@admin.com',
        password: bcrypt.hash('admin'),
        roleId: 1
      }).then(() => {
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
              .post('/api/v1/users/')
              .send({
                name: 'seyi',
                email: 'seyi@seyi.com',
                password: bcrypt.hash('seyi')
              })
              .set('Authorization', `${token}`)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end(() => {
                request(app)
                  .delete('/api/v1/users/2')
                  .set('Authorization', `${token}`)
                  .set('Accept', 'application/json')
                  .expect('Content-Type', /json/)
                  .expect(204)
                  .end((err, res) => {
                    expect(res.status).to.equal(200);
                    done();
                  });
              });
          });
      });
    });

    it('returns an error message if the admin passes a string as the id',
      (done) => {
        User.create({
          name: 'admin',
          email: 'admin@admin.com',
          password: bcrypt.hash('admin'),
          roleId: 1
        }).then(() => {
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
                .post('/api/v1/users/')
                .send({
                  name: 'seyi',
                  email: 'seyi@seyi.com',
                  password: bcrypt.hash('seyi')
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(() => {
                  request(app)
                    .delete('/api/v1/users/asdsf')
                    .set('Authorization', `${token}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end((err, res) => {
                      expect(res.status).to.equal(400);
                      done();
                    });
                });
            });
        });
      });

    it('returns an error message if the admin tries to delete himself',
      (done) => {
        User.create({
          name: 'admin',
          email: 'admin@admin.com',
          password: bcrypt.hash('admin'),
          roleId: 1
        }).then(() => {
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
                .post('/api/v1/users/')
                .send({
                  name: 'seyi',
                  email: 'seyi@seyi.com',
                  password: bcrypt.hash('seyi')
                })
                .set('Authorization', `${token}`)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(() => {
                  request(app)
                    .delete('/api/v1/users/1')
                    .set('Authorization', `${token}`)
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400)
                    .end((err, res) => {
                      expect(res.body.message).to.equal('The admin cannot delete himself');
                      done();
                    });
                });
            });
        });
      });
  });
});
