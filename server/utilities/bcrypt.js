import bcrypt from 'bcrypt';


export default {
  /**
    * hash: Hashes a users password
    * @function hash
    * @param {string} password 
    * @return {object}  hashed password
  */
  hash: password => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null),
  /**
   * comparePassword: compares the password with the hased password
   * @function comparePassword
   * @param {string} password
   * @param {string} hashPassword
   * @return {boolean} True/False
   */
  comparePassword: (password, hashPassword) => bcrypt.compareSync(password, hashPassword),

};

