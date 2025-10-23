/* ======================================
   Plusrechnen Time Quest - JavaScript Spiellogik
   Alle Funktionen ausführlich kommentiert mit Zeilenbezug
   ====================================== */

// ======================================
// Globale Spielvariablen (Zeile 7-20)
// ======================================
let gameState = {
    mana: 5,                    // Zahlenbereich 0 bis mana (Zeile 9)
    erdklumpen: 4,              // Anzahl der zu addierenden Zahlen (Zeile 10)
    currentNumbers: [],         // Aktuelle Zahlen für die Aufgabe (Zeile 11)
    correctAnswer: 0,           // Richtige Antwort der aktuellen Aufgabe (Zeile 12)
    currentTask: 1,             // Nummer der aktuellen Aufgabe (Zeile 13)
    correctCount: 0,            // Anzahl richtig gelöster Aufgaben (Zeile 14)
    startTime: null,            // Spielstart Zeit für Timer (Zeile 15)
    gameTimer: null,            // Interval für Timer Update (Zeile 16)
    sessionHighscores: []       // Highscores der aktuellen Session (Zeile 17)
};

// ======================================
// DOM Elemente Referenzen (Zeile 22-45)
// ======================================
const elements = {
    // Bildschirme
    menuScreen: document.getElementById('menu-screen'),              // Menü Bildschirm (Zeile 25)
    gameScreen: document.getElementById('game-screen'),              // Spiel Bildschirm (Zeile 26)
    gameOverScreen: document.getElementById('game-over-screen'),     // Game Over Bildschirm (Zeile 27)
    
    // Menü Elemente
    manaInput: document.getElementById('mana-input'),                // Mana Eingabefeld (Zeile 30)
    erdklumpenInput: document.getElementById('erdklumpen-input'),    // Erdklumpen Eingabefeld (Zeile 31)
    startGameBtn: document.getElementById('start-game-btn'),         // Spiel starten Button (Zeile 32)
    highscoreList: document.getElementById('highscore-list'),        // Highscore Liste (Zeile 33)
    
    // Spiel Elemente
    numbersToAdd: document.getElementById('numbers-to-add'),         // Zahlen Container (Zeile 36)
    answerInput: document.getElementById('answer-input'),            // Antwort Eingabefeld (Zeile 37)
    submitAnswerBtn: document.getElementById('submit-answer-btn'),   // Antwort prüfen Button (Zeile 38)
    feedbackArea: document.getElementById('feedback-area'),          // Feedback Bereich (Zeile 39)
    currentTaskSpan: document.getElementById('current-task'),        // Aktuelle Aufgabe Anzeige (Zeile 40)
    gameTimerSpan: document.getElementById('game-timer'),            // Timer Anzeige (Zeile 41)
    correctCountSpan: document.getElementById('correct-count'),      // Richtige Antworten Anzeige (Zeile 42)
    backToMenuBtn: document.getElementById('back-to-menu-btn')       // Zurück zum Menü Button (Zeile 43)
};

// ======================================
// Event Listeners Setup (Zeile 47-65)
// ======================================
function setupEventListeners() {
    // Spiel starten Button (Zeile 49)
    elements.startGameBtn.addEventListener('click', startGame);
    
    // Antwort prüfen Button (Zeile 52)
    elements.submitAnswerBtn.addEventListener('click', submitAnswer);
    
    // Enter Taste im Antwort Feld (Zeile 55)
    elements.answerInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
    
    // Zurück zum Menü Button (Zeile 61)
    elements.backToMenuBtn.addEventListener('click', showMenu);
    
    // Game Over Buttons werden später hinzugefügt (Zeile 64)
}

// ======================================
// Bildschirm Management Funktionen (Zeile 67-90)
// ======================================
function showScreen(screenToShow) {
    // Alle Bildschirme ausblenden (Zeile 69-73)
    elements.menuScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.gameOverScreen.classList.remove('active');
    
    // Gewünschten Bildschirm anzeigen (Zeile 75)
    screenToShow.classList.add('active');
}

function showMenu() {
    // Zurück zum Menü und Timer stoppen (Zeile 79)
    stopGameTimer();
    updateHighscoreDisplay();
    showScreen(elements.menuScreen);
}

function showGame() {
    // Spiel Bildschirm anzeigen (Zeile 85)
    showScreen(elements.gameScreen);
}

function showGameOver() {
    // Game Over Bildschirm anzeigen (Zeile 89)
    showScreen(elements.gameOverScreen);
}

// ======================================
// Spiel Initialisierung (Zeile 93-120)
// ======================================
function startGame() {
    // Einstellungen aus dem Menü übernehmen (Zeile 95-96)
    gameState.mana = parseInt(elements.manaInput.value);
    gameState.erdklumpen = parseInt(elements.erdklumpenInput.value);
    
    // Spielstatus zurücksetzen (Zeile 99-103)
    gameState.currentTask = 1;
    gameState.correctCount = 0;
    gameState.startTime = Date.now();
    
    // UI Elemente aktualisieren (Zeile 106-108)
    elements.currentTaskSpan.textContent = gameState.currentTask;
    elements.correctCountSpan.textContent = gameState.correctCount;
    
    // Timer starten (Zeile 111)
    startGameTimer();
    
    // Erste Aufgabe generieren (Zeile 114)
    generateNewTask();
    
    // Zum Spiel Bildschirm wechseln (Zeile 117)
    showGame();
    
    // Fokus auf Antwort Feld setzen (Zeile 120)
    elements.answerInput.focus();
}

// ======================================
// Timer Funktionen (Zeile 123-145)
// ======================================
function startGameTimer() {
    // Timer alle 100ms aktualisieren für flüssige Anzeige (Zeile 125)
    gameState.gameTimer = setInterval(updateTimer, 100);
}

function updateTimer() {
    // Verstrichene Zeit berechnen (Zeile 129)
    const elapsedTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    
    // Timer Anzeige aktualisieren (Zeile 132)
    elements.gameTimerSpan.textContent = elapsedTime + 's';
}

function stopGameTimer() {
    // Timer stoppen wenn vorhanden (Zeile 136)
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
}

function getElapsedTime() {
    // Verstrichene Spielzeit zurückgeben (Zeile 143)
    return Math.floor((Date.now() - gameState.startTime) / 1000);
}

// ======================================
// Aufgaben Generierung (Zeile 148-180)
// ======================================
function generateNewTask() {
    // Neue zufällige Zahlen generieren (Zeile 150)
    gameState.currentNumbers = [];
    
    // Erdklumpen Anzahl an Zahlen erstellen (Zeile 153-157)
    for (let i = 0; i < gameState.erdklumpen; i++) {
        // Zufällige Zahl von 0 bis mana (inkl. 0 und mana) (Zeile 155)
        const randomNumber = Math.floor(Math.random() * (gameState.mana + 1));
        gameState.currentNumbers.push(randomNumber);
    }
    
    // Richtige Antwort berechnen (Zeile 160)
    gameState.correctAnswer = gameState.currentNumbers.reduce((sum, num) => sum + num, 0);
    
    // Zahlen im UI anzeigen (Zeile 163)
    displayNumbers();
    
    // Antwort Feld leeren und fokussieren (Zeile 166-167)
    elements.answerInput.value = '';
    elements.answerInput.focus();
    
    // Feedback Bereich leeren (Zeile 170)
    elements.feedbackArea.innerHTML = '';
    
    console.log('Neue Aufgabe:', gameState.currentNumbers.join(' + '), '=', gameState.correctAnswer); // Debug (Zeile 173)
}

function displayNumbers() {
    // Zahlen Container leeren (Zeile 177)
    elements.numbersToAdd.innerHTML = '';
    
    // Jede Zahl als Bubble anzeigen mit + Zeichen dazwischen (Zeile 180-192)
    gameState.currentNumbers.forEach((number, index) => {
        // Zahlen Bubble erstellen (Zeile 182)
        const numberBubble = document.createElement('div');
        numberBubble.className = 'number-bubble';
        numberBubble.textContent = number;
        elements.numbersToAdd.appendChild(numberBubble);
        
        // Plus Zeichen hinzufügen (außer beim letzten Element) (Zeile 188-192)
        if (index < gameState.currentNumbers.length - 1) {
            const plusSign = document.createElement('div');
            plusSign.className = 'plus-sign';
            plusSign.textContent = '+';
            elements.numbersToAdd.appendChild(plusSign);
        }
    });
}

// ======================================
// Antwort Validierung (Zeile 197-245)
// ======================================
function submitAnswer() {
    // Eingabe lesen und zu Zahl konvertieren (Zeile 199)
    const userAnswer = parseInt(elements.answerInput.value);
    
    // Leere oder ungültige Eingabe abfangen (Zeile 202-204)
    if (isNaN(userAnswer)) {
        showFeedback('Bitte gib eine Zahl ein! 🔢', 'feedback-wrong');
        return;
    }
    
    // Antwort prüfen (Zeile 208-226)
    if (userAnswer === gameState.correctAnswer) {
        // Richtige Antwort (Zeile 210)
        gameState.correctCount++;
        elements.correctCountSpan.textContent = gameState.correctCount;
        
        // Positive Feedback Animation (Zeile 214)
        showFeedback('Richtig! 🎉 Super gemacht!', 'feedback-correct');
        
        // Sound für richtige Antwort (Zeile 217)
        playSound('correct');
        
        // Nächste Aufgabe nach kurzer Pause (Zeile 220)
        setTimeout(() => {
            gameState.currentTask++;
            elements.currentTaskSpan.textContent = gameState.currentTask;
            generateNewTask();
        }, 1500);
        
    } else {
        // Falsche Antwort (Zeile 228)
        
        // Negative Feedback Animation (Zeile 230)
        showFeedback(`Falsch! 😔 Die richtige Antwort ist ${gameState.correctAnswer}`, 'feedback-wrong');
        
        // Sound für falsche Antwort (Zeile 233)
        playSound('wrong');
        
        // Gleiche Aufgabe nochmal nach Pause (Zeile 236)
        setTimeout(() => {
            elements.answerInput.value = '';
            elements.answerInput.focus();
            elements.feedbackArea.innerHTML = '';
        }, 2000);
    }
}

// ======================================
// Feedback und Animationen (Zeile 248-270)
// ======================================
function showFeedback(message, cssClass) {
    // Feedback Bereich leeren (Zeile 250)
    elements.feedbackArea.innerHTML = '';
    
    // Feedback Element erstellen (Zeile 253)
    const feedbackElement = document.createElement('div');
    feedbackElement.textContent = message;
    feedbackElement.className = cssClass;
    
    // Feedback anzeigen (Zeile 258)
    elements.feedbackArea.appendChild(feedbackElement);
    
    // Satisfied Animation bei mehreren richtigen Antworten (Zeile 261-267)
    if (cssClass === 'feedback-correct' && gameState.correctCount > 0 && gameState.correctCount % 5 === 0) {
        setTimeout(() => {
            showFeedback('🌟 FANTASTISCH! Du bist auf Feuer! 🔥', 'feedback-satisfied');
            playSound('satisfied');
        }, 800);
    }
}

// ======================================
// Sound System (Zeile 272-295)
// ======================================
function playSound(type) {
    // Web Audio API für einfache Töne verwenden (Zeile 274)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    let frequency;
    let duration;
    
    // Verschiedene Töne je nach Typ (Zeile 280-289)
    switch(type) {
        case 'correct':
            frequency = 523.25; // C5 Note - fröhlicher Ton (Zeile 282)
            duration = 0.3;
            break;
        case 'wrong':
            frequency = 220.00; // A3 Note - tieferer Ton (Zeile 285)
            duration = 0.5;
            break;
        case 'satisfied':
            frequency = 659.25; // E5 Note - hoher Erfolgs-Ton (Zeile 288)
            duration = 0.8;
            break;
    }
    
    // Ton generieren und abspielen (Zeile 293-310)
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
}

// ======================================
// Highscore System (Zeile 313-350)
// ======================================
function saveHighscore() {
    // Aktuelles Spiel Statistik erstellen (Zeile 315-321)
    const gameStats = {
        time: getElapsedTime(),
        correctAnswers: gameState.correctCount,
        tasksCompleted: gameState.currentTask - 1,
        mana: gameState.mana,
        erdklumpen: gameState.erdklumpen,
        timestamp: new Date().toLocaleTimeString()
    };
    
    // Zur Session Highscore Liste hinzufügen (Zeile 324)
    gameState.sessionHighscores.push(gameStats);
    
    // Liste nach Zeit sortieren (schnellste zuerst) (Zeile 327)
    gameState.sessionHighscores.sort((a, b) => a.time - b.time);
    
    // Nur die besten 5 behalten (Zeile 330)
    if (gameState.sessionHighscores.length > 5) {
        gameState.sessionHighscores = gameState.sessionHighscores.slice(0, 5);
    }
    
    console.log('Highscore gespeichert:', gameStats); // Debug (Zeile 335)
}

function updateHighscoreDisplay() {
    // Highscore Liste im UI aktualisieren (Zeile 339)
    if (gameState.sessionHighscores.length === 0) {
        elements.highscoreList.innerHTML = 'Noch keine Spiele gespielt...';
        return;
    }
    
    // Highscores als HTML formatieren (Zeile 345-355)
    let highscoreHtml = '';
    gameState.sessionHighscores.forEach((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
        highscoreHtml += `
            <div style="margin-bottom: 8px; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 8px;">
                ${medal} ${score.time}s - ${score.correctAnswers} richtig - ${score.timestamp}
            </div>
        `;
    });
    
    elements.highscoreList.innerHTML = highscoreHtml;
}

// ======================================
// Game Over System (Zeile 358-395)
// ======================================
function endGame() {
    // Timer stoppen (Zeile 360)
    stopGameTimer();
    
    // Highscore speichern (Zeile 363)
    saveHighscore();
    
    // Finale Statistiken anzeigen (Zeile 366-369)
    document.getElementById('final-time').textContent = getElapsedTime() + 's';
    document.getElementById('final-correct').textContent = gameState.correctCount;
    document.getElementById('final-tasks').textContent = gameState.currentTask - 1;
    
    // Game Over Bildschirm anzeigen (Zeile 372)
    showGameOver();
    
    // Game Over Button Events hinzufügen (falls noch nicht vorhanden) (Zeile 375-385)
    const playAgainBtn = document.getElementById('play-again-btn');
    const newSettingsBtn = document.getElementById('new-settings-btn');
    
    if (playAgainBtn && !playAgainBtn.hasAttribute('data-listener')) {
        playAgainBtn.addEventListener('click', () => {
            startGame(); // Gleiche Einstellungen
        });
        playAgainBtn.setAttribute('data-listener', 'true');
    }
    
    if (newSettingsBtn && !newSettingsBtn.hasAttribute('data-listener')) {
        newSettingsBtn.addEventListener('click', () => {
            showMenu(); // Zurück zu Einstellungen
        });
        newSettingsBtn.setAttribute('data-listener', 'true');
    }
}

// ======================================
// Initialisierung beim Laden der Seite (Zeile 398-410)
// ======================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Plusrechnen Time Quest wird initialisiert...'); // Debug (Zeile 400)
    
    // Event Listeners registrieren (Zeile 403)
    setupEventListeners();
    
    // Menü anzeigen (Zeile 406)
    showMenu();
    
    console.log('Spiel bereit! 🎮'); // Debug (Zeile 409)
});

// ======================================
// Zusätzliche Utility Funktionen (Zeile 413-430)
// ======================================
// Cheat für Testing (kann später entfernt werden)
function revealAnswer() {
    console.log('🕵️ Debug: Richtige Antwort ist', gameState.correctAnswer);
}

// Tastenkombination für Entwickler (Strg + Shift + R)
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        revealAnswer();
    }
});

// Globale Funktion für manuelle Spielende (für Testing)
window.debugEndGame = function() {
    console.log('🔧 Debug: Spiel manuell beendet');
    endGame();
};