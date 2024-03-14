const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
    answer: String,
    date: String,
    author: String,
    authorId: String,
    votes: Number,
    upVoters : [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    downVoters : [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    images: [
        {
            url: String,
            filename: String
        }
    ]
})

// AnswerSchema.post('findOneAndDelete', async function(data){
//     console.log("post");
//     console.log(data);
// })

const Answer = mongoose.model('Answer', AnswerSchema);

module.exports = Answer;