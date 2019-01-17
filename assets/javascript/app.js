let screenDrop = [ "cheers.jpg", "theOffice.jpg", "friends.jpg", "fullHouse.jpg", "seinfeld.jpg", ]
let staticNoise = new Audio("assets/sounds/static.wav");
let triviaQuestions;
let triviaHistory = [];
let gameTimer;

let correctAns, incorrect1, incorrect2, incorrect3;

function shuffleArr(arr) {
    let holder;
    let randNum;
    for(var i = 0; i < arr.length; i++) {
        randNum = Math.floor(Math.random() * arr.length);
        holder = arr[randNum];
        arr[randNum] = arr[i];
        arr[i] = holder;
    }
    return arr;
}

$.ajax({
    url: "https://opentdb.com/api.php?amount=25&category=14&difficulty=easy&type=multiple",
    method: "GET"
}).then(function(response) {
    triviaQuestions = response.results;
    console.log(response.results);
    triviaQuestions = shuffleArr(triviaQuestions);
});


let answersArr;

$(document).ready(function() {
    

    let display = $("#display");
    let screenImg = $("#screen");
    let question = $("#question");
    let ans1 = $("#a-1");
    let ans2 = $("#a-2");
    let ans3 = $("#a-3");
    let ans4 = $("#a-4");
    let shotClock = $("#timer");
    let counter;
    let correct = $("#cor-ans");
    let correctCount = 0;
    let incorrect = $("#incor-ans");
    let incorrectCount = 0;

    // Start game with power knob
    $("#pwr-btn").on("click", function(event) {

        // hide start instructions
        $("#start-screen").attr("hidden", "true");

        // load first background
        
        newQuestions();
        $("#correct-card").removeAttr("hidden");
        correct.text(correctCount);
        $("#incorrect-card").removeAttr("hidden");
        incorrect.text(incorrectCount);


    })

    function newBackdrop() {
        display.attr("hidden", true);
        staticNoise.play();
        screenImg.attr("src", "assets/images/static.gif")
        //reset backdrop
        return new Promise((resolve) => {
            setTimeout(function() {
            staticNoise.pause();
            let newScreen = screenDrop[Math.floor(Math.random() * screenDrop.length)];
            console.log(newScreen);
            screenImg.attr("src", "assets/images/" + newScreen);
            staticNoise.load();
            resolve('done');
            }, 2000);
        });
    }

    async function newQuestions() {

        if(isEnd())
            return;
        gameTimer = setInterval(startTimer, 1000);
        try {
            await newBackdrop();
        } catch(err) {
            console.log(err);
        }
        
        counter = 15;
        shotClock.text(counter);
        shotClock.removeAttr("hidden");

        let currentRound;
        currentRound = triviaQuestions.pop();
        let currentQuestion = currentRound.question;
        if(currentQuestion.length > 49) {
            let breakpoint = currentQuestion.lastIndexOf(' ', 49);
            currentQuestion = currentQuestion.slice(0, breakpoint) + "<br>" + currentQuestion.slice(breakpoint);
            if(currentQuestion.length > 90) {
                let anotherBreakpoint = currentQuestion.lastIndexOf(' ', 90);
                currentQuestion = currentQuestion.slice(0,anotherBreakpoint) + "<br>" + currentQuestion.slice(anotherBreakpoint);
            }
        }
        // let currentRoundArr = [];
        correctAns = {
            ans : currentRound.correct_answer,
            selected: false,
            isCorrect: true,
        }
        incorrect1 = {
            ans: currentRound.incorrect_answers.pop(),
            selected: false,
            isCorrect: false,
        }
        incorrect2 = {
            ans: currentRound.incorrect_answers.pop(),
            selected: false,
            isCorrect: false,
        }
        incorrect3 = {
            ans: currentRound.incorrect_answers.pop(),
            selected: false,
            isCorrect: false,
        }

        // currentRoundArr.push(currentQuestion, correctAns, incorrect1, incorrect2, incorrect3);

        triviaHistory.push({
            answers: [correctAns, incorrect1, incorrect2, incorrect3 ],
            question: currentQuestion,
        });

        answersArr = [ correctAns, incorrect1, incorrect2, incorrect3 ];
        
        answersArr = shuffleArr(answersArr);
        bindIt(answersArr[0], ans1);
        bindIt(answersArr[1], ans2);
        bindIt(answersArr[2], ans3);
        bindIt(answersArr[3], ans4);
        question.html(currentQuestion);
        display.attr("hidden", false);
    }

    function bindIt(answer, jQueryHTML) {
        jQueryHTML.off("click");
        jQueryHTML.html(answer.ans);

        jQueryHTML.on("click", function(event) {

            answer.selected = true;

            if(answer.isCorrect) {
                jQueryHTML.removeClass("badge-light");
                jQueryHTML.addClass("badge-success");
                correct.text(++correctCount);
            }
            else {
                jQueryHTML.removeClass("badge-light");
                jQueryHTML.addClass("badge-danger");
                incorrect.text(++incorrectCount);
            }

            $(".ans-btn").off("click");

            shotClock.attr("hidden", "true");

            clearInterval(gameTimer);

            setTimeout(function() {
                newQuestions()
                jQueryHTML.removeClass("badge-danger");
                jQueryHTML.addClass("badge-light");
            }, 2000);
        })
    }



    function startTimer() {
        if(counter === 0) {
            clearInterval(gameTimer);
            shotClock.attr("hidden", "true");
            incorrect.text(++incorrectCount);
            if(isEnd())
                return;
            newQuestions();
        }
        shotClock.text(counter--);
    }

    function isEnd() {
        if(correctCount + incorrectCount >= 10) {
            let correctCard = $("#correct-card");
            let incorrectCard = $("#incorrect-card")
            $("body").empty().append(correctCard).append(incorrectCard);
            let endContainer = $("<div class='container jumbotron'>");
            for(i = 0; i < triviaHistory.length; i++) {
                endContainer.append($("<div>").html(triviaHistory[i].question).addClass("mb-3"));
                for(j = 0; j < triviaHistory[i].answers.length; j++) {
                    let eachAns = $("<div>");
                    eachAns.html(triviaHistory[i].answers[j].ans);
                    if(triviaHistory[i].answers[j].isCorrect)
                        eachAns.addClass("bg-success");
                    if(triviaHistory[i].answers[j].selected)
                        eachAns.addClass("border border-info");
                    if(j === triviaHistory[i].answers.length - 1)
                        eachAns.addClass("mb-5");
                    endContainer.append(eachAns).addClass("mt-3");
                }

            }

            $("body").append(endContainer);
            return true;
        }
        else
            return false;
    }
});