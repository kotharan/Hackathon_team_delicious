var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var axios = require('axios');
var https = require('https');
var url = require('url');
const key = '79af778290ddfbd1a6148aed578f2bc2';
const id = '2c673fd4';

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

app.get('/home', function(req,res) {
  res.render('home');
});

app.get('/daily', function(req,res) {
  var context = {};
  res.render('daily', context);
});

app.get('/weekly', function(req,res) {
  var context = {};
  res.render('weekly', context);
});

app.get('/daily-req', function(req,res) {

    var context = {};
    var apipath = 'https://api.edamam.com/search';

    axios.get(apipath, {
       params: {
         q: '',
         app_id: id,
         app_key: key,
         diet: req.query.diet,
         health: req.query.health,
         calories: req.query.min + '-' + req.query.max
       }
     })
     .then(function (response) {
       context.uri = response.data.hits[0].recipe.uri;
       context.label = response.data.hits[0].recipe.label;
       context.image = response.data.hits[0].recipe.image;
       context.source = response.data.hits[0].recipe.source;
       context.url = response.data.hits[0].recipe.url;
       context.yield = response.data.hits[0].recipe.yield;
       context.calories = response.data.hits[0].recipe.calories;
       context.ingredients = response.data.hits[0].recipe.ingredients;
       context.totalNutrients = response.data.hits[0].recipe.totalNutrients;
       context.dietLabels = response.data.hits[0].recipe.dietLabels;
       context.healthLabels = response.data.hits[0].recipe.healthLabels;
       context.params = req.query;
       res.render('daily-result', context);
     })
     .catch(function (error) {
       console.log(error);
     });
});
app.get('/weekly-req', function(req,res) {

  var context = {};
  var apipath = 'https://api.edamam.com/search';

  axios.get(apipath, {
    params: {
      q: '',
      app_id: id,
      app_key: key,
      diet: req.query.diet,
      health: req.query.health,
      calories: req.query.min + '-' + req.query.max
    }
  })
  .then(function (response) {
    var servings = 0;
    var idx = 0;
    var servingsLeft;
    context.recipes = [];
    servingsLeft = response.data.hits[idx].recipe.yield;
    while(servings < 7 && idx < response.data.count)
    {
      context.recipes.push(response.data.hits[idx].recipe);
      servingsLeft = servingsLeft - 1;
      servings = servings + 1;
      if(servingsLeft == 0)
      {
        idx++;
        servingsLeft = response.data.hits[idx].recipe.yield;
      }
    }
    console.log(context.recipes);
    context.params = req.query;
    res.render('weekly-result', context);
  })
  .catch(function (error) {
    console.log(error);
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
