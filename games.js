// ===== SETUP =====
const gCafeId = localStorage.getItem('cafeId');
const gCustomerName = localStorage.getItem('customerName');
const gCustomerMobile = localStorage.getItem('customerMobile');

if (!gCustomerMobile) {
  window.location.href = 'customer-login.html';
}

let currentPoints = 0;

// Load current points
db.collection('Customers').doc(gCustomerMobile).get().then((doc) => {
  if (doc.exists) {
    currentPoints = doc.data().gamePoints || 0;
    document.getElementById('totalPoints').innerText = currentPoints;
  }
});

function addPoints(points) {
  currentPoints += points;
  document.getElementById('totalPoints').innerText = currentPoints;

  const custRef = db.collection('Customers').doc(gCustomerMobile);
  custRef.get().then((doc) => {
    if (!doc.exists) return;
    const existing = doc.data().gamePoints || 0;
    custRef.update({
      gamePoints: existing + points,
      cafeId: gCafeId,
      name: gCustomerName
    });
  });
}

function goBack() {
  const container = document.getElementById('gameContainer');
  if (container.style.display === 'block') {
    // If inside a game, go back to game selector
    container.style.display = 'none';
    document.getElementById('gameSelector').style.display = 'grid';
  } else {
    window.location.href = 'customer-dashboard.html';
  }
}

// ===== LOAD SELECTED GAME =====
function loadGame(gameName) {
  document.getElementById('gameSelector').style.display = 'none';
  const container = document.getElementById('gameContainer');
  container.style.display = 'block';

  if (gameName === 'spin') renderSpinWheel(container);
  else if (gameName === 'tictactoe') renderTicTacToe(container);
  else if (gameName === 'memory') renderMemoryGame(container);
  else if (gameName === 'quiz') renderQuiz(container);
}
// Auto-load game if URL has ?game= param
const urlParams = new URLSearchParams(window.location.search);
const gameParam = urlParams.get('game');
if (gameParam) {
  loadGame(gameParam);
}

// =====================================================
// ===== GAME 1: SPIN THE WHEEL =====
// =====================================================
const wheelPrizes = [10, 5, 20, 0, 15, 5, 25, 10];
const wheelColors = ['#ff7e5f', '#feb47b', '#ffcbb3', '#ff9478', '#ffb199', '#ffd4b3', '#ff8c66', '#ffa985'];
let wheelSpinning = false;
let wheelRotation = 0;

function renderSpinWheel(container) {
  container.innerHTML = `
    <div class="wheel-wrap">
      <canvas id="wheelCanvas" width="280" height="280"></canvas>
      <button class="spin-btn" id="spinBtn" onclick="spinWheel()">🎡 SPIN NOW</button>
    </div>
  `;
  drawWheel(0);
}

function drawWheel(rotation) {
  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');
  const cx = 140, cy = 140, radius = 130;
  const sliceAngle = (2 * Math.PI) / wheelPrizes.length;

  ctx.clearRect(0, 0, 280, 280);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  wheelPrizes.forEach((prize, i) => {
    const startAngle = i * sliceAngle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = wheelColors[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Segoe UI';
    ctx.fillText(prize + ' pts', radius - 15, 5);
    ctx.restore();
  });

  ctx.restore();

  // Pointer
  ctx.beginPath();
  ctx.moveTo(cx - 10, 5);
  ctx.lineTo(cx + 10, 5);
  ctx.lineTo(cx, 25);
  ctx.closePath();
  ctx.fillStyle = '#333';
  ctx.fill();
}

function spinWheel() {
  if (wheelSpinning) return;
  wheelSpinning = true;
  document.getElementById('spinBtn').disabled = true;

  const spins = 5 + Math.random() * 3;
  const winningIndex = Math.floor(Math.random() * wheelPrizes.length);
  const sliceAngle = (2 * Math.PI) / wheelPrizes.length;
  const targetRotation = (spins * 2 * Math.PI) + (2 * Math.PI - (winningIndex * sliceAngle) - sliceAngle / 2);

  let startTime = null;
  const duration = 4000;
  const startRotation = wheelRotation;

  function animateSpin(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);

    wheelRotation = startRotation + (targetRotation * easeOut);
    drawWheel(wheelRotation);

    if (progress < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      wheelSpinning = false;
      document.getElementById('spinBtn').disabled = false;
      const won = wheelPrizes[winningIndex];
      addPoints(won);
      setTimeout(() => alert(`🎉 You won ${won} points!`), 300);
    }
  }
  requestAnimationFrame(animateSpin);
}

// =====================================================
// ===== GAME 2: TIC-TAC-TOE (vs Computer) =====
// =====================================================
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttGameOver = false;

function renderTicTacToe(container) {
  tttBoard = ['', '', '', '', '', '', '', '', ''];
  tttGameOver = false;
  container.innerHTML = `
    <div class="ttt-status" id="tttStatus">Your turn (X)</div>
    <div class="ttt-board" id="tttBoard"></div>
  `;
  drawTTTBoard();
}

function drawTTTBoard() {
  const boardEl = document.getElementById('tttBoard');
  boardEl.innerHTML = '';
  tttBoard.forEach((cell, i) => {
    const div = document.createElement('div');
    div.className = 'ttt-cell';
    div.innerText = cell;
    div.onclick = () => tttMove(i);
    boardEl.appendChild(div);
  });
}

function tttMove(index) {
  if (tttBoard[index] !== '' || tttGameOver) return;
  tttBoard[index] = 'X';
  drawTTTBoard();

  const result = checkTTTWinner();
  if (result) return endTTT(result);

  document.getElementById('tttStatus').innerText = "Computer's turn...";
  setTimeout(() => {
    computerMove();
    const result2 = checkTTTWinner();
    if (result2) return endTTT(result2);
    document.getElementById('tttStatus').innerText = 'Your turn (X)';
  }, 500);
}

function computerMove() {
  const emptyCells = tttBoard.map((v, i) => v === '' ? i : null).filter(v => v !== null);
  if (emptyCells.length === 0) return;
  const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  tttBoard[randomIndex] = 'O';
  drawTTTBoard();
}

function checkTTTWinner() {
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const line of lines) {
    const [a,b,c] = line;
    if (tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c]) {
      return tttBoard[a];
    }
  }
  if (!tttBoard.includes('')) return 'draw';
  return null;
}

function endTTT(result) {
  tttGameOver = true;
  const statusEl = document.getElementById('tttStatus');
  if (result === 'X') {
    statusEl.innerText = '🎉 You Won!';
    addPoints(15);
  } else if (result === 'O') {
    statusEl.innerText = '😢 Computer Won!';
  } else {
    statusEl.innerText = "It's a Draw!";
    addPoints(5);
  }
  setTimeout(() => {
    const container = document.getElementById('gameContainer');
    container.innerHTML += '<div style="text-align:center;"><button class="play-again-btn" onclick="renderTicTacToe(document.getElementById(\'gameContainer\'))">Play Again</button></div>';
  }, 500);
  }
// =====================================================
// ===== GAME 3: MEMORY FLIP =====
// =====================================================
const memoryEmojis = ['☕', '🍕', '🍔', '🍰', '🍟', '🍩', '🥤', '🍪'];
let memoryCards = [];
let flippedCards = [];
let matchedCount = 0;
let memoryLocked = false;

function renderMemoryGame(container) {
  const cardPairs = [...memoryEmojis, ...memoryEmojis];
  memoryCards = cardPairs.sort(() => Math.random() - 0.5);
  flippedCards = [];
  matchedCount = 0;
  memoryLocked = false;

  container.innerHTML = `
    <div class="ttt-status">Find all matching pairs!</div>
    <div class="memory-board" id="memoryBoard"></div>
  `;
  drawMemoryBoard();
}

function drawMemoryBoard() {
  const boardEl = document.getElementById('memoryBoard');
  boardEl.innerHTML = '';
  memoryCards.forEach((emoji, i) => {
    const div = document.createElement('div');
    const isFlipped = flippedCards.includes(i);
    const isMatched = document.getElementById('matched-' + i) !== null;
    div.className = 'memory-card' + (isFlipped ? ' flipped' : '') + (matchedIndexes.includes(i) ? ' matched' : '');
    div.innerText = (isFlipped || matchedIndexes.includes(i)) ?
