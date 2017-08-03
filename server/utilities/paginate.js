/**
 * @param {integer} totalCount  - The total number of items returned
 * @param  {integer} limit - The specified limit
 * @param {integer} offset - The specified offset
 * @param  {object} content - response from the database
 * @return {object}
 */
module.exports.information = (totalCount, limit, offset, content, response) => {
  let pageCount = Math.round(totalCount / limit);
  if (pageCount < 1 && totalCount > 0) {
    pageCount = 1;
  }
  const page = Math.round(offset / limit) + 1;
  return response.status(200).send({
    message: 'Data found',
    content,
    metaData: {
      page,
      pageCount,
      pageSize: content.length,
      totalCount,
    }
  });
};
