import validator from 'validator';


export default {
  id: id => validator.isAlpha(id),
};
