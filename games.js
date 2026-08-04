// ===== INITIALIZATION & USER DATA =====
let currentPoints = 0;
const customerMobile = localStorage.getItem('customerMobile');
const customerName = localStorage.getItem('customerName') || 'Guest';

// जब पेज लोड होगा, चेक करेगा कि कस्टमर लॉगिन है या नहीं
window.onload = () => {
    if(!customerMobile) {
        alert("Please login from the QR Code first!");
        window.location.href = 'customer-login.html';
        return;
    }
    loadUserPoints();
};

// Firebase से कस्टमर के पॉइंट्स रियल-टाइम में लाना
function loadUserPoints() {
    db.collection('Customers').doc(customerMobile).onSnapshot((doc) => {
        if (doc.exists) {
            currentPoints = doc.data().points || 0;
            document.getElementById('userPoints').innerText = `🏆 ${currentPoints} Pts`;
        }
    });
}

// कस्टमर के अकाउंट में जीतने पर पॉइंट्स जोड़ना
function addPoints(pts) {
    currentPoints += pts;
    db.collection('Customers').doc(customerMobile).set({
        points: currentPoints
    }, { merge: true }) // Merge: true से पुराना डेटा (जैसे नाम, टेबल) डिलीट नहीं होता
    .then(() => {
        alert(`🎉 Awesome! You won ${pts} Points!`);
    })
    .catch((err) => console.error("Error adding points: ", err));
}

// ===== UI NAVIGATION =====
function openGame(sectionId) {
    document.getElementById('mainMenu').style.display = 'none';
    document.querySelectorAll('.game-section').forEach(el => el.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    
    if(sectionId === 'tictactoeSection') initTicTacToe();
    if(sectionId === 'quizSection') loadQuiz();
}

function closeGame() {
    document.getElementById('mainMenu').style.display = 'block';
    document.querySelectorAll('.game-section').forEach(el => el.style.display = 'none');
    clearInterval(quizTimer); // क्विज़ बंद करने पर टाइमर रोक दें
}

// ==========================================
// 1. TIC-TAC-TOE LOGIC (VS COMPUTER)
// ==========================================
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;

function initTicTacToe() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    const boardEl = document.getElementById('tttBoard');
    boardEl.innerHTML = "";
    
    for(let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => handleCellClick(cell, i);
        boardEl.appendChild(cell);
    }
}

function handleCellClick(cell, index) {
    if(board[index] !== "" || !gameActive) return;
    
    // Player's move
    board[index] = currentPlayer;
    cell.innerText = currentPlayer;
    cell.style.color = "#ff4757"; // Red for X
    
    checkWin();
    
    // Computer's turn (AI)
    if(gameActive) {
        currentPlayer = "O";
        setTimeout(computerMove, 500); 
    }
}

function computerMove() {
    if(!gameActive) return;
    let emptyCells = [];
    board.forEach((val, i) => { if(val === "") emptyCells.push(i) });
    
    if(emptyCells.length > 0) {
        let randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomIndex] = "O";
        
        const cells = document.querySelectorAll('.cell');
        cells[randomIndex].innerText = "O";
        cells[randomIndex].style.color = "#2ed573"; // Green for O
        
        checkWin();
        currentPlayer = "X"; // Back to player
    }
}

function checkWin() {
    const winConditions = [
        [0,1,2], [3,4,5], [6,7,8], // Horizontal
        [0,3,6], [1,4,7], [2,5,8], // Vertical
        [0,4,8], [2,4,6]           // Diagonal
    ];
    
    for(let i=0; i<winConditions.length; i++) {
        const [a,b,c] = winConditions[i];
        if(board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            if(board[a] === "X") {
                addPoints(20);
            } else {
                alert("💻 Computer Wins! Try again.");
            }
            return;
        }
    }
    
    if(!board.includes("")) {
        gameActive = false;
        alert("It's a Draw! 🤝");
    }
}

// ==========================================
// 2. GK QUIZ LOGIC (WITH TIMER)
// ==========================================
const questions = [
    { q: "What is the capital of India?", opts: ["Mumbai", "New Delhi", "Jaipur", "Kolkata"], ans: "New Delhi" },
    { q: "Which planet is known as the Red Planet?", opts: ["Earth", "Mars", "Jupiter", "Venus"], ans: "Mars" },
    { q: "Who is known as the Iron Man of India?", opts: ["Bhagat Singh", "Sardar Patel", "Gandhi Ji", "Nehru"], ans: "Sardar Patel" },
    { q: "What is 15 + 25?", opts: ["30", "40", "45", "50"], ans: "40" },
    { q: "Which is the largest animal on Earth?", opts: ["Elephant", "Blue Whale", "Giraffe", "Shark"], ans: "Blue Whale" }
];
let quizTimer;

function loadQuiz() {
    let qNum = Math.floor(Math.random() * questions.length);
    let currentQ = questions[qNum];
    
    document.getElementById('questionText').innerText = currentQ.q;
    const optsDiv = document.getElementById('quizOptions');
    optsDiv.innerHTML = "";
    
    currentQ.opts.forEach(opt => {
        let btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, currentQ.ans);
        optsDiv.appendChild(btn);
    });

    // 15 Second Timer
    let timeLeft = 15;
    document.getElementById('timeRemaining').innerText = timeLeft;
    clearInterval(quizTimer);
    
    quizTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timeRemaining').innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(quizTimer);
            alert("⏰ Time's Up! You lost this question.");
            closeGame();
        }
    }, 1000);
}

function checkAnswer(selected, correct) {
    clearInterval(quizTimer); // Stop timer immediately
    if(selected === correct) {
        addPoints(10);
    } else {
        alert(`❌ Wrong Answer! The correct answer was: ${correct}`);
    }
    setTimeout(closeGame, 500);
}

// ==========================================
// 3. LIVE LEADERBOARD LOGIC
// ==========================================
function loadLeaderboard() {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = "Fetching top players... ⏳";
    
    // Firebase से सबसे ज़्यादा Points वाले Top 10 कस्टमर लाना
    db.collection('Customers')
      .orderBy('points', 'desc')
      .limit(10)
      .get()
      .then(snapshot => {
          listEl.innerHTML = "";
          if(snapshot.empty) {
              listEl.innerHTML = "<p>No players yet. Play a game to be #1!</p>";
              return;
          }
          let rank = 1;
          snapshot.forEach(doc => {
              let data = doc.data();
              let name = data.name || "Unknown";
              let pts = data.points || 0;
              
              // टॉप 3 के लिए स्पेशल Emojis 🥇🥈🥉
              let rankIcon = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;
              
              listEl.innerHTML += `
                <div class="leaderboard-item">
                    <span>${rankIcon} &nbsp; <b>${name}</b></span>
                    <span style="color:#2ed573; font-weight:bold;">${pts} Pts</span>
                </div>
              `;
              rank++;
          });
      })
      .catch(err => {
          console.error(err);
          listEl.innerHTML = "<p style='color:red;'>Error loading leaderboard.</p>";
      });
                              }

