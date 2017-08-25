/**
 * Module dependencies.
 */
require('dotenv').config();
const express = require('express');

const fs = require('fs');

const passport = require('passport');

const logger = require('mean-logger');

const io = require('socket.io');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

//Load configurations
//if test env, load example file
const env = process.env.NODE_ENV || 'development';

const config = require('./config/config');

const auth = require('./config/middlewares/authorization');

const mongoose = require('mongoose');

//Bootstrap db connection
const db = mongoose.connect(config.db);

//Bootstrap models
const modelPath = __dirname + '/app/models';
const walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
      const newPath = path + '/' + file;
      let stat = fs.statSync(newPath);
      if (stat.isFile()) {
        if (/(.*)\.(js|coffee)/.test(file)) {
          require(newPath);
        }
      } else if (stat.isDirectory()) {
        walk(newPath);
      }
    });
};
walk(modelPath);

//bootstrap passport config
require('./config/passport')(passport);

let app = express();

app.use(function(req, res, next){
    next();
});

//express settings
require('./config/express')(app, passport, mongoose);

//Bootstrap routes
require('./config/routes')(app, passport, auth);

//Start the app by listening on <port>
const port = config.port;
const server = app.listen(port);
const ioObj = io.listen(server, { log: false });
//game logic handled here
require('./config/socket/socket')(ioObj);
console.log('Express app started on port ' + port);

//Initializing logger
logger.init(app, passport, mongoose);

//expose app
exports = module.exports = app;
