import chai from 'chai';

const expect = chai.expect;

const Document = require('../../../build/models').Document;
const User = require('../../../build/models').User;
require('babel-register');


describe(('Document Model'), () => {
  describe(('Creates Document'), () => {
    beforeEach((done) => {
      User.destroy({
        where: {},
        truncate: true,
        cascade: true,
        restartIdentity: true
      });
      done();
    });
    it('should fail if no title is provided', (done) => {
      Document.create({
        content: 'seyi@yahoo.com'
      })
        .catch((error) => {
          expect(/notNull Violation/.test(error.message)).to.equal(true);
          done();
        });
    });

    it('should fail if no content is provided', (done) => {
      Document.create({
        title: 'title'
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });

    it('should fail if no access level is provided', (done) => {
      Document.create({
        title: 'title',
        content: 'content',
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });

    it('should fail if no role id is provided', (done) => {
      Document.create({
        title: 'title',
        content: 'content',
        access: 'public',
      })
        .catch((error) => {
          expect(error.errors[0].type).to.equal('notNull Violation');
          done();
        });
    });

    it('should create a document', (done) => {
      User.create({
        name: 'seyi',
        email: 'seyi@yahoo.com',
        password: 'password',
        roleId: 2
      });
      Document.create({
        title: 'title',
        content: 'content',
        access: 'public',
        roleId: 2,
        userId: 1
      })
        .then((user) => {
          expect(typeof (user)).to.equal('object');
          done();
        });
    });
  });
});
