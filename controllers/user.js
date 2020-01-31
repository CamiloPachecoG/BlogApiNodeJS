'use strict'

var validator = require('validator');
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var jwt = require('../services/jwt');

var controller = {
    save: function(req, res){
        //Recoger los parametros de la petición
        var params = req.body;

        //Validar los datos
        try{
            var validator_name = !validator.isEmpty(params.name);
            var validator_surname = !validator.isEmpty(params.surname);
            var validator_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validator_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(200).send({
                message: 'Faltan datos por enviar'
            }); 
        }
        //console.log(validator_name, validator_surname, validator_email, validator_password);

        if(validator_name && validator_surname && validator_email && validator_password){
            //Crear Obj Usuario
            var user = new User();

            //Asignar valores al usuario
            user.name = params.name;
            user.surname = params.surname;
            user.email = params.email.toLowerCase();
            user.role = 'role_user';
            user.image = null;

            //Comprobar que el usuario no exista
            User.findOne({email: user.email}, (err, issetUser) => {
                if(err){
                    return res.status(500).send({
                        message: 'Error al Comprobar Usuario'
                    });
                }
                if(!issetUser){
                    //si no,
                    
                    //Cifrar password y guardar
                    bcrypt.hash(params.password, null, null, (err, hash) => {
                        user.password = hash;

                        //Guardar
                        user.save((err, userStorage) => {
                            if(err){
                                return res.status(500).send({
                                    message: 'Error al Guardar Usuario'
                                });
                            }
                            if(!userStorage){
                                return res.status(400).send({
                                    message: 'El usuario no se ha Guardado'
                                });
                            }
                            //Devolver Respuesta
                            return res.status(200).send({
                                status: 'success',
                                user: userStorage
                            });

                        });//close save
                    });//close bcrypt
                }else{
                    return res.status(500).send({
                        message: 'El usuario ya está Registrado'
                    });
                }
            });    

        }else{
            return res.status(200).send({
                message: 'Error al Validar Datos'
            });
        }
    },

    login: function(req, res){
        //Recoge los parametros
        var params = req.body;

        //Validar Datos
        try{
            var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
            var validate_password = !validator.isEmpty(params.password);
        }catch(err){
            return res.status(500).send({
                message: 'Faltan datos'
            }); 
        }

        if(!validate_email || !validate_password){
            return res.status(200).send({
                message: 'Datos incorrectos'
            });
        }

        //Buscar el usuario en la BD
        User.findOne({email: params.email.toLowerCase()}, (err, user) => {

            if(err){
                return res.status(500).send({
                    message: 'Error al identificarse',
                }); 
            }

            if(!user){
                return res.status(404).send({
                    message: 'Usuario no Encontrado',
                }); 
            }
            //Si lo encuentra
            //Comprobar PW
            bcrypt.compare(params.password, user.password, (err, check) => {
                //Si es correcto
                if(check){
                    //Generar Token JWT
                    if(params.gettoken){
                        //Devolver los datos
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    }else{
                         //Limpiar Obj
                        user.password = undefined;

                        //Devolver los datos
                        return res.status(200).send({
                            status: 'success',
                            user
                        });
                    }
                }else{
                    return res.status(200).send({
                        message: 'Credenciales incorrectas',
                    }); 
                }

            });
        });
    },

    update: function(req, res){
        //Recoger los datos del usuario(body)
        var params = req.body;

         //Validar los datos
         try{
            var validator_name = !validator.isEmpty(params.name);
            var validator_surname = !validator.isEmpty(params.surname);
            var validator_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
         }catch(err){
            return res.status(500).send({
                message: 'Faltan datos'
            }); 
         }

        //Eliminar propiedades innecesarias
        delete params.password;

        var userId = req.user.sub;

        //Comprobar si el Email es unique
        if(req.user.email != params.email){

            User.findOne({email: params.email.toLowerCase()}, (err, user) => {

                if(err){
                    return res.status(500).send({
                        message: 'Error al identificarse',
                    }); 
                }
    
                if(user && user.email == params.email){
                    return res.status(200).send({
                        message: 'El email no puede ser modificado',
                    }); 
                }
            });    
        }else{
            //Buscar y actualizar
            User.findOneAndUpdate({_id: userId}, params, {new:true}, (err, userUpdate) => {

                //Devolver respuestas
                if(err){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar usuario'
                    }); 
                }

                if(!userUpdate){
                    return res.status(500).send({
                        status: 'error',
                        message: 'No se ha actualizado los datos'
                    }); 
                }

                return res.status(200).send({
                    status: 'success',
                    user: userUpdate
                }); 
            });
        }
    },

    uploadAvatar: function(req, res){
        //Configurar el modulo multipart(middleware) routes/user.js
        //Recoger el fichero de la petición
        var file_name = 'avatar no subido.. ';
        
        if(!req.files){
            return res.status(404).send({
                status: 'error',
                message: file_name
            }); 
        }
        //Conseguir el nombre y la extensión del archivo
        var file_path = req.files.file0.path;

        // ** En MacOS o Linux
        var file_split = file_path.split('/');

        // ** En Windows
        // var files_split = files_path.split('\\');

        //Nombre del archivo
        var file_name = file_split[2];

        //Extensión del archivo
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        //Comprobar la extensión, si no es válida borrar fichero
        if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){
            fs.unlink(file_path, (err) => {
                return res.status(200).send({
                    status: 'error',
                    message: 'La extensión no es válida.'
                }); 
            });

        }else{
            //Sacar el id del usuario identificado
            var userId = req.user.sub;

            //Buscar y actualizar el documento
            User.findOneAndUpdate({ _id: userId }, {image: file_name}, {new: true}, (err, userUpdate) => {
                if (err || !userUpdate){
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al guardar.',
                    }); 
                }
                //Devolver Repuesta
                return res.status(200).send({
                    status: 'success',
                    user: userUpdate
                }); 
            });
        }    
    },

    avatar: function(req, res){
        var fileName = req.params.fileName;
        var pathFile = './uploads/users/'+fileName;

        fs.exists(pathFile, (exists)=> {
            if(exists){
                return res.sendFile(path.resolve(pathFile));
            }else{
                return res.status(404).send({
                    message: 'La imagen no existe'
                });
            }
        });
    },

    getUsers: function(req, res){
        User.find().exec((err, users) => {
            if(err || !users){
                return res.status(404).send({
                    status: 'error',
                    message: 'No hay usuarios que mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                users
            });
        });
    },

    getUser: function(req, res){
        var userId = req.params.userId;

        User.findById(userId).exec((err, user) => {
            if(err || !user){
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el usuario'
                });
            }

            return res.status(200).send({
                status: 'success',
                user
            });
        });
    }


};

module.exports = controller;