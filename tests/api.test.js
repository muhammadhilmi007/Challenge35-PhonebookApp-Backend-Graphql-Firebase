const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const { expect } = chai;

chai.use(chaiHttp);

describe('Phonebook API', () => {
  let testContactId;

  const testContact = {
    name: 'Test User',
    phone: '08123456789'
  };

  describe('GraphQL API', () => {
    it('should create a new contact', async () => {
      const query = `
        mutation CreateContact($input: ContactInput!) {
          createContact(input: $input) {
            id
            name
            phone
          }
        }
      `;

      const res = await chai.request(app)
        .post('/graphql')
        .send({
          query,
          variables: { input: testContact }
        });

      expect(res).to.have.status(200);
      expect(res.body.data.createContact).to.have.property('id');
      expect(res.body.data.createContact.name).to.equal(testContact.name);
      testContactId = res.body.data.createContact.id;
    });

    it('should get contacts with pagination', async () => {
      const query = `
        query GetContacts($pagination: PaginationInput) {
          contacts(pagination: $pagination) {
            contacts {
              id
              name
              phone
            }
            total
            page
            limit
          }
        }
      `;

      const res = await chai.request(app)
        .post('/graphql')
        .send({
          query,
          variables: {
            pagination: {
              page: 1,
              limit: 10
            }
          }
        });

      expect(res).to.have.status(200);
      expect(res.body.data.contacts).to.have.property('contacts');
      expect(res.body.data.contacts.contacts).to.be.an('array');
    });

    it('should update a contact', async () => {
      const query = `
        mutation UpdateContact($id: ID!, $input: ContactInput!) {
          updateContact(id: $id, input: $input) {
            id
            name
            phone
          }
        }
      `;

      const updatedContact = {
        name: 'Updated Test User',
        phone: '08123456780'
      };

      const res = await chai.request(app)
        .post('/graphql')
        .send({
          query,
          variables: {
            id: testContactId,
            input: updatedContact
          }
        });

      expect(res).to.have.status(200);
      expect(res.body.data.updateContact.name).to.equal(updatedContact.name);
    });

    it('should delete a contact', async () => {
      const query = `
        mutation DeleteContact($id: ID!) {
          deleteContact(id: $id) {
            id
            name
            phone
          }
        }
      `;

      const res = await chai.request(app)
        .post('/graphql')
        .send({
          query,
          variables: { id: testContactId }
        });

      expect(res).to.have.status(200);
      expect(res.body.data.deleteContact.id).to.equal(testContactId);
    });
  });
});