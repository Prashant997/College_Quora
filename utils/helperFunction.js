const Answer = require('../models/answers');


module.exports.DateAndMonth = () => {
    const d = new Date();
    const date = d.getDate();
    const month = d.toLocaleString('default', {month: 'long'})
    const year = d.getFullYear();
    const finalDate = `${month} ${date}, ${year}`;
    return finalDate;
}

module.exports.Time = () => {
    const d = new Date();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const finalTime = `${hour}:${minute}`;
    return finalTime;
}

module.exports.alreadyUpVoted = (reqAnswer, currentUserId) => {
    // console.log(reqAnswer.voters);
    // console.log("upVoteres list = ", reqAnswer.upVoters);
    if(reqAnswer.upVoters.includes(currentUserId)){
        return true;
    }
    else
        return false;
}

module.exports.alreadyDownVoted = (reqAnswer , currentUserId, ) => {
    // console.log(reqAnswer.upVoters, reqAnswer.downVoters);
    // console.log('downVoters list = ', reqAnswer.downVoters);
    if(reqAnswer.downVoters.includes(currentUserId)){
        return true;
    }
    else
        return false;
}


// module.exports.changeColorTo = (clr, btn) => {
//     // change colour to clr
// }