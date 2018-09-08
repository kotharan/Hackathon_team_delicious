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

app.get('/', (req,res,next) => {
  var context = {};
  res.render('home', context);
});

app.get('/daily', (req,res,next) => {
  var context = {};
  res.render('daily', context):
});

app.get('/daily-req', (req,res,next) => {
    
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
       context.label = response.data.rows[0].label;
       context.image = response.data.rows[0].image;
       context.source = response.data.rows[0].source;
       context.url = response.data.rows[0].url;
       context.yield = response.data.rows[0].yield;
       context.calories = response.data.rows[0].calories;
       context.ingredients = response.data.rows[0].ingredients;
       context.totalNutrients = response.data.rows[0].totalNutrients;
       context.dietLabels = response.data.rows[0].dietLabels;
       context.healthLabels = response.data.rows[0].healthLabels;
     })
     .catch(function (error) {
       context.error = error;
     });
     res.render('daily-result', context);
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
