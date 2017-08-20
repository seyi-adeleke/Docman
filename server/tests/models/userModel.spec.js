import chai from 'chai';

const expect = chai.expect;

const User = require('../../../build/models').User;
require('babel-register');


describe(('User Model'), () => {
  describe(('Creates user'), () => {
    beforeEach((done) => {
      User.destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true
      });
      done();
    });
    it('should fail if no name is provided', (done) => {
      User.create({
        email: 'seyi@yahoo.com'
      })
        .catch((error) => {
          expect(/notNull Violation/.test(error.message)).to.equal(true);
          done();
        });
    });
    it('should fail if no email is provided', (done) => {
      User.create({
        name: 'seyi'
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });
    it('should fail if no password is provided', (done) => {
      User.create({
        name: 'seyi',
        email: 'seyi@yahoo.com',
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });
    it('should fail if no role id is provided', (done) => {
      User.create({
        name: 'seyi',
        email: 'seyi@yahoo.com',
        password: 'password'
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });
    it('should create a user', (done) => {
      User.create({
        name: 'seyi',
        email: 'seyi@yahoo.com',
        password: 'password',
        roleId: 2
      })
        .then((user) => {
          expect(typeof (user)).to.equal('object');
          done();
        });
    });
  });
});
