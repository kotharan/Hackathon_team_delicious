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
       if(response.data.hits.length == 0)
       {
         context.error = "Please try again (check your calories).";
         res.render('daily', context);
       }
       else
       {
         var idx = 0;         
         while(response.data.hits[idx].recipe.yield < req.query.servings && attempts < 5)
         {
           idx++;
           attempts++;
         }

         context.uri = response.data.hits[idx].recipe.uri;
         context.label = response.data.hits[idx].recipe.label;
         context.image = response.data.hits[idx].recipe.image;
         context.source = response.data.hits[idx].recipe.source;
         context.url = response.data.hits[idx].recipe.url;
         context.yield = response.data.hits[idx].recipe.yield;
         context.calories = response.data.hits[idx].recipe.calories;
         context.ingredients = response.data.hits[idx].recipe.ingredients;
         context.totalNutrients = response.data.hits[idx].recipe.totalNutrients;
         context.dietLabels = response.data.hits[idx].recipe.dietLabels;
         context.healthLabels = response.data.hits[idx].recipe.healthLabels;
         context.params = req.query;
         res.render('daily-result', context);
       } 
    })
     .catch(function (error) {
       context.error = "Please try again (check your calories).";
       console.log(error);
       res.render('daily', context);
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
    var meals = 0;
    var idx = 0;
    var servingsLeft;
    context.urls = [];
    context.recipes = [];
    if(response.data.count < 3)
    {
      context.error = "Please try again (check your calories).";
      res.render('weekly', context);
    }
    else
    {
      servingsLeft = response.data.hits[idx].recipe.yield;
      while(meals < 7 && (idx < response.data.count))
      {
        context.recipes.push(response.data.hits[idx].recipe);
        servingsLeft = servingsLeft - req.query.servings;
        meals++;
        if(servingsLeft < req.query.servings)
        {
          idx++;
          servingsLeft = response.data.hits[idx].recipe.yield;
        }
      }
      context.params = req.query;
      res.render('weekly-result', context);
    }
  })
  .catch(function (error) {
    context.error = "Please try again (check your calories).";
    console.log(error);
    res.render('weekly', context);
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
