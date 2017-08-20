import jwt from 'jsonwebtoken';


export default {
  /**
   * @param {object} req object
   * @param {object} res object
   * @param {function} next
   * @returns {object} json
   */
  isLoggedIn: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.send({ message: 'You are not logged in' });
    }
    const token = (req.headers.authorization);
    jwt.verify(token, 'secret', (error, decoded) => {
      if (error) {
        return res
          .send({ message: 'There was an error processing your request' });
      }
      req.decoded = decoded;
      if (req.decoded.roleId === 1) {
        req.isAdmin = true;
      }
      next();
    });
  },
  /**
   * @param {object} req object
   * @param {object} res object
   * @param {function} next
   * @returns {object} json
   */
  isAdmin: (req, res, next) => {
    if (!req.headers.authorization) {
      return res.send({ message: 'You are not logged in' });
    }
    const token = (req.headers.authorization);

    jwt.verify(token, 'secret', (error, decoded) => {
      if (error) {
        return res
          .send({ message: 'There was an error processing your request' });
      }
      req.decoded = decoded;
      if (req.decoded.roleId !== 1) {
        return res.send({ message: 'You do not have access to this route' });
      }
      req.isAdmin = true;
      next();
    });
  },
};
