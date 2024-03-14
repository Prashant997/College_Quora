const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    heading: String,
    question: String,
    date: String,
    time: String,
    author: String,
    authorId : String,
    answers : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Answer',
        }
    ]
})


const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;