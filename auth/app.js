var bodyParser = require('body-parser');
var express = require('express');
var OAuthServer = require('express-oauth-server');

var mongoose = require('mongoose');

var uristring = 'mongodb+srv://strapi:147896325@cluster0.xnpzb.mongodb.net/async-architecture-auth?retryWrites=true&w=majority';

// Makes connection asynchronously. Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + uristring);
  }
});

var app = express();

app.oauth = new OAuthServer({
  model: require('./model'),
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(app.oauth.authorize());

// Post token.
app.post('/oauth/token', app.oauth.token());

// Get authorization.
app.get('/oauth/authorize', function (req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(
      util.format('/login?redirect=%s&client_id=%s&redirect_uri=%s', req.path, req.query.client_id, req.query.redirect_uri)
    );
  }

  return render('authorize', {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
  });
});

// Post authorization.
app.post('/oauth/authorize', function (req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(util.format('/login?client_id=%s&redirect_uri=%s', req.query.client_id, req.query.redirect_uri));
  }

  return app.oauth.authorize();
});

// Get login.
app.get('/login', function (req) {
  //   return render('login', {
  //     redirect: req.query.redirect,
  //     client_id: req.query.client_id,
  //     redirect_uri: req.query.redirect_uri
  //   });
});

// Post login.
app.post('/login', function (req, res) {
  // @TODO: Insert your own login mechanism.
  if (req.body.email !== 'thom@nightworld.com') {
    // return render('login', {
    //   redirect: req.body.redirect,
    //   client_id: req.body.client_id,
    //   redirect_uri: req.body.redirect_uri
    // });
  }

  // Successful logins should send the user back to /oauth/authorize.
  var path = req.body.redirect || '/home';

  return res.redirect(util.format('/%s?client_id=%s&redirect_uri=%s', path, req.query.client_id, req.query.redirect_uri));
});

// Get secret.
app.get('/secret', app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token.
  res.send('Secret area');
});

app.get('/public', function (req, res) {
  // Does not require an access_token.
  res.send('Public area');
});

// Start listening for requests.
app.listen(3000, () => {
  console.log('Express server listening on port 3000');
});
