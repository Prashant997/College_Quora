const Joi = require('joi');

module.exports.questionSchema = Joi.object({
    question : Joi.object({
        heading : Joi.string().required(),
        question : Joi.string().required(),
    }).required()
})

module.exports.answerSchema = Joi.object({
    answer : Joi.string().required(),
})