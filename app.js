const express = require('express');
const cors = require('cors');
const { createHandler } = require('graphql-http/lib/use/express');
const { schema, resolvers } = require('./graphql/schema');
const authMiddleware = require('./middlewares/auth');
const errorHandler = require('./middlewares/error');
const upload = require('./config/multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Auth middleware
app.use(authMiddleware);

// GraphQL endpoint
app.use('/graphql', createHandler({
  schema: schema,
  rootValue: resolvers,
  graphiql: process.env.NODE_ENV === 'development'
}));

// File upload endpoint
app.put('/api/contacts/:id/avatar', upload.single('photo'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const updatedContact = await resolvers.updateAvatar({ 
      id, 
      photo: photoUrl 
    });
    
    res.json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use(errorHandler);

module.exports = app;

