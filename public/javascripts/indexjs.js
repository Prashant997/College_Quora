
const newQuestionBlock = document.getElementById("newQuestionBlock");

if(newQuestionBlock){
    newQuestionBlock.style.cursor = "pointer";
}

const toggleBtn = document.querySelector('.darkmode-toggle');

if(toggleBtn){
    toggleBtn.innerText = "🌗";
}