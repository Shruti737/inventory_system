require('dotenv').config();

const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

/**
 * Start the server.
 * We try to connect to the database and sync the models first.
 * If the database is unavailable we still start the HTTP server so the
 * app can be inspected (database endpoints will return an error).
 */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Simple sync for a small assignment (creates/updates tables).
    await sequelize.sync();
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();