import moment from 'moment';


export default {
/**
  * @description formats a date
  * @function
  * @param {string} date The date to format
  * @returns {Date} Date
*/
  format: (date) => {
    if (date) {
      return moment(date).format('ddd, MMM Do YYYY, h:mm:ss a');
    }
  }
};
