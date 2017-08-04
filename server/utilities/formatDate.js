import moment from 'moment';

/**
 * @description formats a date
 * @function
 * @param {string} date The date to format
 * @returns {Date} Date
 */
export default {
  format: (date) => {
    if (date) {
      return moment(date).format('ddd, MMM Do YYYY, h:mm:ss a');
    }
  }
};
