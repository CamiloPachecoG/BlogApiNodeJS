'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3999;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api-rest-node', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('conexión establecida');

            //Crear el servidor
            app.listen(port, () => {
                console.log('El servidor esta funcionando');
            });
        })
        .catch(error => console.log(error));