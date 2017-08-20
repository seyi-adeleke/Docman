import validator from 'validator';


export default {
  /**
   * @param {integer} id - The  identifier in the parameter
   * @return {Boolean} True/False 
   */
  id: id => validator.isAlpha(id),
};
