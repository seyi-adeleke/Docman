module.exports = {
  up: (queryInterface) => {
    queryInterface.bulkInsert('Roles', [{
      title: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'User',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Editor',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: (queryInterface) => {
    queryInterface.bulkDelete('Roles', null, {});
  }
};
