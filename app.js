'use strict'

//Requires
var express = require('express');
var bodyParser = require('body-parser');

//Ejecutar Express
var app = express();

//Cargar Archivos de Rutas
var user_routes = require('./routes/user');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Corse

//Rescribir Rutas
app.use('/api', user_routes);


//Exportar el Modulo
module.exports = app;