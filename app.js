'use strict'

//Requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar Express
var app = express();

//Cargar Archivos de Rutas
var user_routes = require('./routes/user');
var topic_routes = require('./routes/topic');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Corse

//Rescribir Rutas
app.use('/api', user_routes);
app.use('/api', topic_routes);

//Exportar el Modulo
module.exports = app;