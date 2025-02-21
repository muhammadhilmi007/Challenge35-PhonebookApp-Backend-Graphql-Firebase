const { db } = require('../config/firebase');

const FirebaseService = {
  async getAllContacts(params) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search = ''
    } = params;

    try {
      const snapshot = await db.ref('contacts').once('value');
      let contacts = [];
      
      snapshot.forEach(childSnapshot => {
        contacts.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });

      // First apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        contacts = contacts.filter(contact => 
          contact.name.toLowerCase().includes(searchLower) ||
          contact.phone.toLowerCase().includes(searchLower)
        );
      }

      // Then apply sorting to filtered results
      contacts.sort((a, b) => {
        const aValue = (a[sortBy] || '').toLowerCase();
        const bValue = (b[sortBy] || '').toLowerCase();
        return sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      });

      // Finally apply pagination to sorted results
      const total = contacts.length;
      const pages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedContacts = contacts.slice(startIndex, startIndex + limit);

      return {
        contacts: paginatedContacts,
        total,
        page,
        limit,
        pages
      };
    } catch (error) {
      throw new Error(`Failed to fetch contacts: ${error.message}`);
    }
  },

  async getContactById(id) {
    try {
      const snapshot = await db.ref(`contacts/${id}`).once('value');
      if (!snapshot.exists()) {
        throw new Error('Contact not found');
      }
      return { id: snapshot.key, ...snapshot.val() };
    } catch (error) {
      throw new Error(`Failed to fetch contact: ${error.message}`);
    }
  },

  async createContact(data) {
    try {
      const timestamp = new Date().toISOString();
      const contactData = {
        ...data,
        photo: null,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      const newContactRef = db.ref('contacts').push();
      await newContactRef.set(contactData);
      
      return { id: newContactRef.key, ...contactData };
    } catch (error) {
      throw new Error(`Failed to create contact: ${error.message}`);
    }
  },

  async updateContact(id, data) {
    try {
      const timestamp = new Date().toISOString();
      const updateData = {
        ...data,
        updatedAt: timestamp
      };
      
      // Get current data first
      const currentData = await this.getContactById(id);
      const mergedData = { ...currentData, ...updateData };
      delete mergedData.id; // Remove id as it's not stored in the value
      
      await db.ref(`contacts/${id}`).update(mergedData);
      return { id, ...mergedData };
    } catch (error) {
      throw new Error(`Failed to update contact: ${error.message}`);
    }
  },

  async deleteContact(id) {
    try {
      const contact = await this.getContactById(id);
      await db.ref(`contacts/${id}`).remove();
      return contact;
    } catch (error) {
      throw new Error(`Failed to delete contact: ${error.message}`);
    }
  },
  
  async updateAvatar(id, photoUrl) {
    try {
      const timestamp = new Date().toISOString();
      
      // Get current data first
      const currentData = await this.getContactById(id);
      currentData.photo = photoUrl;
      currentData.updatedAt = timestamp;
      delete currentData.id; // Remove id as it's not stored in the value
      
      await db.ref(`contacts/${id}`).update(currentData);
      return { id, ...currentData };
    } catch (error) {
      throw new Error(`Failed to update avatar: ${error.message}`);
    }
  }
};

module.exports = FirebaseService;