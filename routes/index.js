var fs = require('fs'),
    // mysql = require('../../config/mySqlConnection'),
    // creds = require('../../config/mySqlCredentials'),
    postgrator = require('postgrator');


exports.configure = function(app) {

  app.get('/', index);

  // app.get('/', canUpgrade, index);
  // app.get('/upgrade', canUpgrade, upgrade);
  // app.get('/ok', upToDate);
}


function getModel() {
  return {
    "title": "Postgrator UI - admin tool",
    "selectedDatabase": "NotSelected"
  };
}


/* GET / */
/*********/
function index(req, res) {
  var model = getModel();

  model.supportedDatabases = [
    { text: '--Select a Database--', value: 'NotSelected' },
    { text: 'Postgress', value: 'pg' },
    { text: 'MySql', value: 'mysql' },
    { text: 'MS Sql', value: 'mssql' }
  ];

  // model.updateAvailable = req.params.updateAvailable;

  res.render('index', model);
}

/* GET /upgrade */
/****************/
function upgrade(req, res) {

  var model = getModel();

  postgrator.config.set({
      migrationDirectory: __dirname + '/../migrations',  // path to the migrations
      driver: 'mysql',
      host: creds.host,
      database: 'ticknall',
      username: creds.admin_username,
      password: creds.admin_password
  });

  postgrator.migrate(req.params.latest, function (err, migrations) {
      if (err) {
        console.log('nope: ' + err);
        model.message = err;
      } else {
        console.log(migrations);
        model.message = migrations;
      }
      res.render('index', model);
  });
}

/* GET /ok */
/***********/
function upToDate(req, res) {
  var model = getModel();
  model.message = 'your schema is up to date';
//  model.updateAvailable = false;
  res.render('index', model);
}


function getCurrentSchemaVersion(connection, errHandler, callback) {

  var schemaQuery = "select version from schemaversion order by version desc limit 1";
  connection.query(schemaQuery, function(err, data) {

    if (err) {
      errHandler(err);
    } else {
      var result = data[0];
      callback(result.version);
    }
  });
}


function getLatestAvailable(errHandler, callback) {

  // check the migrations folder for files like nnn.(un)do.sql
  fs.readdir(__dirname + '/../migrations/', function(err, files) {
    if (err) {
      errHandler(err);
    }

    var latestAvailable = files.filter(function(file) {
      return file.match('[0-9]+.do.sql');
    }).map(function(file) {
      return file.split('.')[0];
    }).sort(function(a,b) {
      return b-a;
    })[0];

    callback(latestAvailable);
  });
}



function canUpgrade(req, res, next) {

  console.log('can upgrade?');

  req.params.updateAvailable = false;

  var connection = mysql.getConnection('ticknall', function(err) {
    console.log('could not connect to ticknall db');
    throw err;
  });

  getCurrentSchemaVersion(connection, function(err) {
    console.log(err);
    throw err;
  }, function(version) {
    getLatestAvailable(function(err) {
      console.log(err);
      throw err;
    }, function(latest) {
      if (latest > version) {

        console.log('yes, can upgrade! latest / version : ' + latest + ' / ' + version);

        req.params.latest = latest;
        req.params.updateAvailable = true;
        next();
      } else {
        req.params.message = 'your schema is up to date';
        console.log('no, no upgrade!');

        res.redirect('/ok');
      }
    });
  });
}
