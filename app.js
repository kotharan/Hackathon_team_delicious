var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var axios = require('axios');
const key = '79af778290ddfbd1a6148aed578f2bc2';
const id = '2c673fd4';

app.engine('handlebars', handlebars.engine);
app.use(bodyParser.urlencoded({extended:true}));
app.use('/static', express.static('public'));
app.set('view engine', handlebars');
app.set('port', process.argv[2]);

app.get('/', function(req,res) {
  var context = {};
  res.render('home', context);
});

app.get('/daily', function(req,res) {
  var context = {};
  res.render('daily', context):
});

app.get('/daily-req', function(req,res) {
    
    var context = {};
    var path = 'https://api.edamam.com/search';
    
    axios.get(path, {
       params: {
         app_id: id,
         app_key: key,
         diet: req.query.diet,
         excluded: req.query.excluded,
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
       context.ingredients = response.data.h[0].recipe.ingredients;
       context.totalNutrients = response.data.rows[0].recipe.totalNutrients;
       context.dietLabels = response.data.rows[0].recipe.dietLabels;
       context.healthLabels = response.data.rows[0].recipe.healthLabels;
     })
     .catch(function (error) {
       context.error = error;
     });
<<<<<<< HEAD
     context.params = req.query;
=======
>>>>>>> 532930bec3ade6dd91d90882b4b8ef28922f8025
     res.render('daily-result', context);
});

app.get('/weekly-req', function(req,res) {

  var context = {};
  var path = 'https://api.edamam.com/search';

  axios.get(path, {
    params: {
      app_id: id,
      app_key: key,
      diet: req.query.diet,
      excluded: req.query.excluded,
      health: req.query.health,
      calories: req.query.min + '-' + req.query.max
    }
  })
  .then(function (response) {
    var servings = 0;
    var idx = 0;
    while(servings < 7 && idx < response.data.count)
    {
      context.recipes.push(response.data.hits[idx].recipe);
      servings += response.data.rows[idx].yield;
    }
  })
  .catch(function (error) {
    context.error = error;
  });
  res.render('weekly-result', context);
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
