'use strict'

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

//Modelo Comentarios
var CommentsSchema = Schema({
    content: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'}
});

var Comment = mongoose.model('Comment', CommentsSchema);

// Modole de Topics
var TopicSchema = Schema({
    title: String,
    content: String,
    code: String,
    lang: String,
    date: { type: Date, default: Date.now },
    user: { type: Schema.ObjectId, ref: 'User'},
    comments: [CommentsSchema]
});

// Cargar paginación
TopicSchema.plugin(mongoosePaginate);

module.exports =  mongoose.model('Topic', TopicSchema);