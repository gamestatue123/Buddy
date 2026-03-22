// ========== CANVAS BACKGROUND ANIMATION ==========
const canvas = document.createElement('canvas');
canvas.id = 'canvas-bg';
document.body.insertBefore(canvas, document.body.firstChild);

const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
let particles = [];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(99, 102, 241, ${Math.random() * 0.3 + 0.1})`;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const particleCount = Math.min(100, Math.floor(width * height / 15000));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let particle of particles) {
        particle.update();
        particle.draw();
    }
    
    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initParticles();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animateParticles();

// ========== MOUSE TRAIL EFFECT ==========
let mouseTrails = [];

function createMouseTrail(e) {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = e.clientX - 4 + 'px';
    trail.style.top = e.clientY - 4 + 'px';
    document.body.appendChild(trail);
    
    setTimeout(() => {
        trail.remove();
    }, 500);
}

let lastMouseMove = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseMove > 30) {
        createMouseTrail(e);
        lastMouseMove = now;
    }
});

// ========== QUOTES SYSTEM ==========
const quotes = [
    "Padh le bhai, warna IIT nahi \"I'll Try Tomorrow\" milega.",
    "Doom scrolling karke bas IIT Dholakpur hi milega 💀",
    "\"Kal se pakka padhunga\" is the biggest scam since forever.",
    "Tu notes bana raha hai ya future ka regret draft kar raha hai?",
    "5 min break = 2 ghante ka YouTube tour, wah b**h.",
    "Phone rakh de, warna rank bhi airplane mode pe chali jayegi.",
    "Motivation ka wait mat kar, wo kabhi aata hi nahi sa**a.",
    "Tere sapne IIT ke hain, habits reels wale hain 🤡",
    "Padhle warna log bolenge \"potential tha… bas use nahi kiya.\"",
    "Brain: padh le || Also brain: chal ek aur reel dekhte hain 🫠",
    "Syllabus dekh ke aise react karta hai jaise wo tujhe kha jayega.",
    "Bro timetable banata hai NASA mission jaisa, follow zero.",
    "JEE prep = 10% padhai, 90% guilt management.",
    "\"Aaj thak gaya\" — bhai tu padha kab tha? 😭",
    "Notes itne sundar ki bas dekhne ka mann karta hai, padhne ka nahi.",
    "Tu distraction ka CEO ban gaya hai.",
    "Ek aur \"last video\" aur tera future last ho jayega 💀",
    "Darr IIT ka hai, par effort WhatsApp forward jaisa hai.",
    "B**h consistency naam ki bhi koi cheez hoti hai.",
    "Rank nahi aayi toh excuse ready: \"paper hi ajeeb tha.\"",
    "Padhai se zyada tu apne pen ko ghuma raha hai.",
    "Filter me fail hogye but JEE me top karenge!!",
    "Tere goals 4K mein hain, effort 144p mein.",
    "JEE prep ya Netflix subscription? Decide kar bhai.",
    "Tera \"break\" hi tera main activity ban gaya hai.",
    "Padhte waqt neend, sote waqt overthinking—kya combo hai 😭",
    "Tu khud hi apna sabse bada distraction hai.",
    "Aaj nahi padha toh kal bhi nahi padhega, simple sa**h.",
    "Notes collect karna ≠ padhai karna.",
    "\"Mood nahi hai\" — bhai exam mood dekh ke nahi aata.",
    "IIT ke sapne, par alarm snooze ka relationship strong.",
    "Har din naya plan, par execution zero—classic.",
    "Padhle warna future tujhe roast karega bina filter ke.",
    "Tu syllabus ko avoid kar raha hai, syllabus tujhe nahi.",
    "Bhai padhai se bhaag ke kahaan jayega? Gravity se tez hai kya?",
    "Consistency > Motivation, samajh le warna gaya kaam se.",
    "Padhai ko \"baad mein\" bol bol ke life ko \"kaash\" bana dega.",
    "Tere excuses IIT ke cut-off se bhi zyada hain.",
    "Thoda sa discipline daal le warna life tujhe discipline kar degi.",
    "\"Bas aaj chill karte hain\" — roz ka dialogue hai tera.",
    "Tu padhega nahi toh competition tere liye padhega kya?",
    "Tera future tujhe abhi dekh ke facepalm kar raha hai 🤦‍♂️",
    "1 chapter padhne mein dard, par 3 ghante reels easy? Wah b**h.",
    "Tera screen time tera result predict kar raha hai.",
    "Padhai boring hai, par regret usse bhi zyada boring hota hai.",
    "Tu khud ko underestimate nahi, ignore kar raha hai.",
    "10 min padhai = \"main thak gaya\" — bhai kya kiya tune?",
    "JEE tough hai, par tera attitude usse bhi tough problem hai.",
    "Tu serious ho ja, warna life tujhe seriously le legi.",
    "Padhle bhai… warna \"kaash\" ka lifetime subscription free hai 💀"
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function displayQuote(quoteText, animate = true) {
    const quoteElement = document.getElementById('dailyQuote');
    if (!quoteElement) return;
    
    if (animate) {
        quoteElement.classList.add('quote-refreshing');
        setTimeout(() => {
            quoteElement.textContent = quoteText;
            quoteElement.classList.remove('quote-refreshing');
        }, 150);
    } else {
        quoteElement.textContent = quoteText;
    }
}

function refreshQuote() {
    const newQuote = getRandomQuote();
    displayQuote(newQuote, true);
    localStorage.setItem('buddyQuote', newQuote);
    localStorage.setItem('buddyQuoteDate', new Date().toDateString());
    showToast('✨ New reality check loaded!');
}

function setInitialQuote() {
    const quoteElement = document.getElementById('dailyQuote');
    if (!quoteElement) return;
    
    const savedQuote = localStorage.getItem('buddyQuote');
    const savedDate = localStorage.getItem('buddyQuoteDate');
    const today = new Date().toDateString();
    
    if (savedQuote && savedDate === today) {
        quoteElement.textContent = savedQuote;
    } else {
        const newQuote = getRandomQuote();
        quoteElement.textContent = newQuote;
        localStorage.setItem('buddyQuote', newQuote);
        localStorage.setItem('buddyQuoteDate', today);
    }
}

// ========== GREETING ==========
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.querySelector('.greeting-text');
    let greeting = '';
    
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 17) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    if (greetingElement) {
        greetingElement.textContent = greeting + ',';
    }
}

// ========== TOAST ==========
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ========== FEATURE NAVIGATION ==========
function openFeature(feature) {
    const featureNames = {
        timetable: 'Timetable',
        syllabus: 'Syllabus Tracker',
        dpp: 'DPP Logger'
    };
    showToast(`✨ Opening ${featureNames[feature]} - Coming soon!`);
}

// ========== PROGRESS RING ==========
function updateProgressRing(percentage) {
    const circle = document.querySelector('.progress-ring-circle');
    if (!circle) return;
    
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    
    const percentElement = document.querySelector('.stat-number .percent');
    if (percentElement) percentElement.textContent = Math.round(percentage);
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        refreshQuote();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        showToast('⌨️ Search feature coming soon!');
    }
});

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    updateGreeting();
    setInitialQuote();
    
    const refreshButton = document.getElementById('refreshQuote');
    if (refreshButton) {
        refreshButton.addEventListener('click', (e) => {
            e.preventDefault();
            refreshQuote();
        });
    }
    
    // Card hover effect for mouse tracking
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--x', `${x}%`);
            card.style.setProperty('--y', `${y}%`);
        });
    });
    
    console.log('✨ Buddy is ready! 🔥');
});

// Load saved data
const savedData = localStorage.getItem('buddyData');
if (savedData) {
    try {
        const data = JSON.parse(savedData);
        if (data.streak) {
            const streakElement = document.querySelector('.streak-badge span');
            if (streakElement) streakElement.textContent = `Streak: ${data.streak} days`;
        }
    } catch (e) {}
}