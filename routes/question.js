const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Question = require('../models/questions');
const ExpressError = require('../utils/ExpressError');
const Fuse = require('fuse.js');
const User = require('../models/user');
const {validateQuestion, questionDeleteMiddleware, isLoggedIn, authorizeQuestion} = require('../utils/middleware');
const {DateAndMonth, Time} = require('../utils/helperFunction');

const fuseOptions = {
    isCaseSensitive: false,
    includeScore: false,
    shouldSort: true,
    includeMatches: false,
    findAllMatches: false,
    minMatchCharLength: 1,
    location: 0,
    threshold: 0.6,
    distance: 100,
    useExtendedSearch: false,
    ignoreLocation: false,
    ignoreFieldNorm: false,
    keys: [
      "question",
      "author",
      "heading",
    ]
};

router.get('', catchAsync( async (req, res) => {
    const questions = await Question.find({});
    res.render('questions/index', {questions});
}))

// router.get('/new', isLoggedIn,  (req, res) => {
//     // res.render('questions/new');
//     res.redirect('/collegeQuora');
// })

router.post('/new', isLoggedIn, validateQuestion, catchAsync( async(req, res, next) => {
    
    const question = req.body.question;
    const currentDate = DateAndMonth();
    const currentTime = Time();
    const author = req.user.name;
    const authorId = req.user._id;
    const reqUser = await User.findById(authorId);
    let i = reqUser.qAsked;
    if(Number.isNaN(i)){
        i = 0;
    }
    reqUser.qAsked = i + 1;
    await reqUser.save(); 
    const newQuestion = new Question({heading: question.heading, question: question.question, date: currentDate, author : author, authorId: authorId, time: currentTime});
    await newQuestion.save();
    req.flash('success', 'Successfully added a new Question !');
    res.redirect(`/collegeQuora/${newQuestion._id}`);

}))

router.get('/search', catchAsync(async(req, res) => {
    const {searchInput} = req.query;
    const allQuestions = await Question.find({});
    const fuse = new Fuse(allQuestions, fuseOptions);
    const resultArr = fuse.search(searchInput);
    // console.log(resultArr);
    let result = [];
    for(let currItem of resultArr){
        result.push(currItem.item)
    }
    // console.log(result);
    // const searchResult = allQuestions.filter(currQuestion => {
    //     if(currQuestion.question.includes(searchInput)){
    //         return true;
    //     }
    // })
    // res.render('questions/index', {questions: searchResult});
    res.render('questions/index', {questions: result});
}))

router.get('/:id', catchAsync( async (req, res) => {
    const ID = req.params.id;
    // console.log(ID);
    const reqQuestion = await Question.findById(ID).populate({
        path: 'answers',
        populate: [{
            path: 'upVoters',
            model: 'User',
            select: 'name'
        },
        {
            path: 'downVoters',
            model: 'User',
            select: 'name',
        }]
    })
    // console.log('outside');
    // console.log(reqQuestion);
    // console.log(reqQuestion.answers[0].upVoters);
    // console.log(reqQuestion.answers[0].downVoters);

    
    if(!reqQuestion){
        // console.log('inside the if');
        req.flash('error', "Can't able to find the question !");
        return res.redirect('/collegeQuora');
    }
    reqQuestion.answers.sort((a, b) => b.votes - a.votes);
    res.render('questions/show', {reqQuestion});
}))


// router.get('/:id/edit', isLoggedIn, authorizeQuestion ,catchAsync(async (req, res) => {
//     const reqQuestion = await Question.findById(req.params.id);
//     res.render('questions/edit', {reqQuestion});
// }))

router.put('/:id/edit', isLoggedIn, authorizeQuestion , validateQuestion,catchAsync( async (req, res) => {
    
    const newQuestion = req.body.question.question;
    const newHeading  = req.body.question.heading;
    const ID = req.params.id;
    const updatedQuestion = await Question.findByIdAndUpdate(ID, {heading: newHeading, question: newQuestion});
    res.redirect(`/collegeQuora/${ID}`);
}))

router.delete('/:id', isLoggedIn, authorizeQuestion , questionDeleteMiddleware ,catchAsync( async (req, res) => {
    const ID = req.params.id;
    await Question.findByIdAndDelete(ID);
    res.redirect('/collegeQuora');
}))

module.exports = router;