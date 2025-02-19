const FirebaseService = require('../services/firebase');

const resolvers = {
  contacts: async ({ pagination }) => {
    const result = await FirebaseService.getAllContacts(pagination || {});
    return {
      contacts: result.contacts,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
      total: result.total
    };
  },

  contact: async ({ id }) => {
    return await FirebaseService.getContactById(id);
  },

  createContact: async ({ input }) => {
    return await FirebaseService.createContact(input);
  },

  updateContact: async ({ id, input }) => {
    return await FirebaseService.updateContact(id, input);
  },

  deleteContact: async ({ id }) => {
    return await FirebaseService.deleteContact(id);
  },

  updateAvatar: async ({ id, photo }) => {
    return await FirebaseService.updateAvatar(id, photo);
  }
};

module.exports = resolvers;