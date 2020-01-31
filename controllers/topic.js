'use strict'

var validator = require('validator');
var Topic = require('../models/topic');

var controller = {
    save: function(req, res){
        //Recoger los parametros por post
        var params = req.body;

        //Validar datos
        try{
            var validator_title = !validator.isEmpty(params.title);
            var validator_content = !validator.isEmpty(params.content);
            var validator_lang = !validator.isEmpty(params.lang);

        }catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            });
        }

        if(validator_content && validator_title && validator_lang){
            //Crear obj a guardar
            var topic = new Topic();
        
            //Asignar valores
            topic.title = params.title;
            topic.content = params.content;
            topic.code = params.code;
            topic.lang = params.lang;
        
            //Guardar
            topic.save((err, topicStored) => {
        
                if(err || !topicStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no se ha guardado'  
                    });
                }
        
                //Devolver respuesta
                return res.status(200).send({
                    status: 'sucess',
                    topic: topicStored   
                });
            });
        
        }else{
            return res.status(200).send({
                status: 'error',
                message: 'Los datos no son válidos' 
            });
        }
    },

    getTopics: function(req, res){
        //Cargar libreria de paginación
        //Recoger la pagina actual
        //Indicar la opciones de paginación
        //Find Paginado
        //Devolver resultado (topics, totalTopics, totalPaginas)

        return res.status(200).send({
            message: 'Metodo obtener topics'
        });
    }
};

module.exports = controller;