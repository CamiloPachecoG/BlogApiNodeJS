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
            topic.user = req.user.sub;
        
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
        //Cargar libreria de paginación -> Models/topic.js
        //Recoger la pagina actual
        if(!req.params.page || req.params.page == 0 || req.params.page == "0" || req.params.page == null || req.params.page == undefined){
            var page = 1;
        }else{
            var page = parseInt(req.params.page);
        }

        //Indicar la opciones de paginación
        var option = {
            sort: { date: -1},
            populate: 'user',
            limit: 5,
            page: page
        }
        //Find Paginado
        Topic.paginate({}, option, (err, topics) => {
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al hacer la consulta'  
                });
            }
            if(!topics){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay Topics'  
                });
            }
            //Devolver resultado (topics, totalTopics, totalPaginas)
            return res.status(200).send({
                status: 'sucess',
                topics: topics.docs,
                totalDocs: topics.totalDocs,
                totalPages: topics.totalPages
            });
        })
    },

    getTopicsByUser: function(req, res){
        //Conseguir el ID del usuario
        var userId = req.params.user;

        //Hacer una find con el User
        Topic.find({
            user: userId
        })
        .sort([['date', 'descending']])
        .exec((err, topics) => {
            if(err){
                //Devolver resultado
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if(!topics){
                //Devolver resultado
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay temas para mostrar'
                });
            }

            //Devolver resultado
            return res.status(200).send({
                status: 'success',
                topics
            });
        });
    },

    getTopic: function(req, res){
        //Sacar el id del topic de la url
        var topicId = req.params.id;

        //Find por id del topic
        Topic.findById(topicId)
             .populate('user')
             .exec((err, topic) => {
                if(err){
                    //Devolver resultado
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if(!topic){
                    //Devolver resultado
                    return res.status(404).send({
                        status: 'error',
                        message: 'El tema no existe'
                    });
                }

                //Devolver resultado
                return res.status(200).send({
                    status: 'success',
                    topic
                });
             }); 
    }
};

module.exports = controller;