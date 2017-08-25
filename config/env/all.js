require('dotenv').config();
let path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
let keys = rootPath + '/keys.txt';

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
  db: process.env.MONGOHQ_URL
};
