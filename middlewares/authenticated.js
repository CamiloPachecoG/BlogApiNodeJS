'user strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-token123";

exports.authenticated = function(req, res, next){

    //Comprobar si llega el header auth
    if(!req.headers.authorization){
        return res.status(403).send({
            message: "La petición no tiene la cabecera Autorización"
        });
    }

    //limpiar token y quitar comillas
    var token = req.headers.authorization.replace(/['"]+/g, '');

    try{
        //decode token
        var payload = jwt.decode(token, secret);

         //comprobar la expiración del token
        if(payload.exp <= moment().unix()){
            return res.status(404).send({
                message: "Token Expirado"
            });
        }

    }catch(ex){
        return res.status(404).send({
            message: "Token no es válido"
        });
    }

    //adjuntar usuario identificado a la request
    req.user = payload;

    next();
};