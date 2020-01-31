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