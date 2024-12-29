const config = require('./config.json');

const dbConfig = {
  host: config.dbConfig.host,
  user: config.dbConfig.user,
  password: config.dbConfig.password,
  database: config.dbConfig.database,
};

module.exports = dbConfig;
