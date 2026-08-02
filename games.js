// games.js - Part 9
let userPoints = 0;

// Game 1: Spin The Wheel Logic
function spinWheel() {
    const wheel = document.getElementById('wheel');
    const resultText = document.getElementById('spin-result');
    
    // Ghoomne ka animation (Random spin)
    const randomDeg = Math.floor(Math.random() * 1000) + 720; 
    wheel.style.transform = `rotate(${randomDeg}deg)`;
    
    resultText.innerText = "Spinning... 🌀";
    
    // 2 second baad result aayega
    setTimeout(() => {
        const pointsWon = Math.floor(Math.random() * 50) + 10;
        userPoints += pointsWon;
        resultText.innerText = `🎉 You won ${pointsWon} points! 🎉`;
        
        // Agle spin ke liye wheel reset karna
        setTimeout(() => {
            wheel.style.transition = 'none';
            wheel.style.transform = `rotate(${randomDeg % 360}deg)`;
            setTimeout(() => wheel.style.transition = 'transform 2s ease-out', 50);
        }, 500);
        
    }, 2000);
}

// Game 2: Slot Machine Logic
function playSlots() {
    const slots = document.getElementById('slots');
    const resultText = document.getElementById('slot-result');
    const items = ['🍎', '🍋', '🍒', '💎', '🔔'];
    
    let counter = 0;
    resultText.innerText = "Rolling... 🎰";
    
    // Slots ghoomne ka effect
    const interval = setInterval(() => {
        const s1 = items[Math.floor(Math.random() * items.length)];
        const s2 = items[Math.floor(Math.random() * items.length)];
        const s3 = items[Math.floor(Math.random() * items.length)];
        slots.innerText = `${s1} ${s2} ${s3}`;
        counter++;
        
        // 1.5 second baad rukega
        if (counter > 15) {
            clearInterval(interval);
            if (s1 === s2 && s2 === s3) {
                userPoints += 100;
                resultText.innerText = "🏆 JACKPOT! You won 100 points! 🏆";
            } else {
                resultText.innerText = "Try again! 😢";
            }
        }
    }, 100);
}

