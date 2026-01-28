
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ⚠️ 중요: 이곳에 당신의 Firebase 프로젝트 설정을 입력해야 채팅이 작동합니다!
// Firebase 콘솔 -> 프로젝트 설정 -> 내 앱 -> SDK 설정 및 구성에서 복사하세요.
const firebaseConfig = {
    apiKey: "AIzaSyDr_uKuTvWZmzZ6OgzOzaWAyuXXqB8JUoc",
    authDomain: "dongukwebtest.firebaseapp.com",
    databaseURL: "https://dongukwebtest-default-rtdb.firebaseio.com",
    projectId: "dongukwebtest",
    storageBucket: "dongukwebtest.firebasestorage.app",
    messagingSenderId: "838549957143",
    appId: "1:838549957143:web:0d533db3ef9597ba5d0a52",
    measurementId: "G-TQNJ0PC2FF"
};

class ChatManager {
    constructor() {
        this.messagesElement = document.getElementById('chat-messages');
        this.formElement = document.getElementById('chat-form');
        this.inputElement = document.getElementById('chat-input');
        
        // Simple user ID for this session to distinguish "my" messages
        this.userId = 'user_' + Math.random().toString(36).substr(2, 9);
        
        this.init();
    }

    init() {
        try {
            const app = initializeApp(firebaseConfig);
            this.db = getDatabase(app);
            this.messagesRef = ref(this.db, 'messages');
            
            this.formElement.addEventListener('submit', (e) => this.sendMessage(e));
            this.listenMessages();
        } catch (error) {
            console.error("Firebase init error:", error);
            this.appendSystemMessage("채팅 연결 실패. 콘솔에서 Realtime Database를 생성했는지 확인해주세요.");
        }
    }

    sendMessage(e) {
        e.preventDefault();
        const text = this.inputElement.value.trim();
        if (!text) return;

        push(this.messagesRef, {
            text: text,
            userId: this.userId,
            timestamp: serverTimestamp()
        });

        this.inputElement.value = '';
        this.scrollToBottom();
    }

    listenMessages() {
        onChildAdded(this.messagesRef, (snapshot) => {
            const data = snapshot.val();
            this.appendMessage(data);
        });
    }

    appendMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        
        if (data.userId === this.userId) {
            messageDiv.classList.add('mine');
        } else {
            messageDiv.classList.add('others');
        }
        
        messageDiv.textContent = data.text;
        this.messagesElement.appendChild(messageDiv);
        this.scrollToBottom();
    }

    appendSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'system');
        messageDiv.textContent = text;
        this.messagesElement.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesElement.scrollTop = this.messagesElement.scrollHeight;
    }
}

class SudokuGenerator {
    constructor() {
        this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    }

    generate(difficulty = 'medium') {
        // 1. Fill diagonal 3x3 boxes (independent of each other)
        this.fillDiagonal();

        // 2. Fill remaining blocks
        this.fillRemaining(0, 3);

        // 3. Remove digits to make it a puzzle
        const attempts = {
            'easy': 30,
            'medium': 45,
            'hard': 55
        }[difficulty] || 40;

        return this.removeDigits(attempts);
    }

    fillDiagonal() {
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
    }

    fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!this.isSafeInBox(row, col, num));
                this.grid[row + i][col + j] = num;
            }
        }
    }

    isSafeInBox(rowStart, colStart, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.grid[rowStart + i][colStart + j] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    isSafe(row, col, num) {
        return (
            this.isSafeInRow(row, num) &&
            this.isSafeInCol(col, num) &&
            this.isSafeInBox(row - (row % 3), col - (col % 3), num)
        );
    }

    isSafeInRow(row, num) {
        for (let j = 0; j < 9; j++) {
            if (this.grid[row][j] === num) return false;
        }
        return true;
    }

    isSafeInCol(col, num) {
        for (let i = 0; i < 9; i++) {
            if (this.grid[i][col] === num) return false;
        }
        return true;
    }

    fillRemaining(i, j) {
        if (j >= 9 && i < 8) {
            i = i + 1;
            j = 0;
        }
        if (i >= 9 && j >= 9) return true;

        if (i < 3) {
            if (j < 3) j = 3;
        } else if (i < 6) {
            if (j === (Math.floor(i / 3) * 3)) j = j + 3;
        } else {
            if (j === 6) {
                i = i + 1;
                j = 0;
                if (i >= 9) return true;
            }
        }

        for (let num = 1; num <= 9; num++) {
            if (this.isSafe(i, j, num)) {
                this.grid[i][j] = num;
                if (this.fillRemaining(i, j + 1)) return true;
                this.grid[i][j] = 0;
            }
        }
        return false;
    }

    removeDigits(attempts) {
        // Deep copy the full solution first
        const solution = this.grid.map(row => [...row]);
        const puzzle = this.grid.map(row => [...row]);

        let count = attempts;
        while (count > 0) {
            let cellId = Math.floor(Math.random() * 81);
            let i = Math.floor(cellId / 9);
            let j = cellId % 9;
            if (puzzle[i][j] !== 0) {
                puzzle[i][j] = 0;
                count--;
            }
        }
        
        return { solution, puzzle };
    }
}

class SudokuUI {
    constructor() {
        this.boardElement = document.getElementById('game-board');
        this.numpadElement = document.getElementById('numpad');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.statusMessage = document.getElementById('status-message');
        this.timerElement = document.getElementById('timer');
        this.mistakesElement = document.getElementById('mistakes');
        
        this.selectedCell = null; // {row, col, element}
        this.solution = [];
        this.currentBoard = [];
        this.initialBoard = [];
        
        this.mistakes = 0;
        this.maxMistakes = 3;
        this.timerSeconds = 0;
        this.timerInterval = null;
        this.isGameOver = false;

        this.init();
    }

    init() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', () => this.startNewGame());
        this.numpadElement.addEventListener('click', (e) => this.handleNumpad(e));
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        this.startNewGame();
    }

    startNewGame() {
        const difficulty = this.difficultySelect.value;
        const generator = new SudokuGenerator();
        const { solution, puzzle } = generator.generate(difficulty);
        
        this.solution = solution;
        this.initialBoard = puzzle.map(row => [...row]);
        this.currentBoard = puzzle.map(row => [...row]);
        
        this.mistakes = 0;
        this.isGameOver = false;
        this.boardElement.style.opacity = '1';
        this.boardElement.style.pointerEvents = 'auto';
        this.updateMistakesDisplay();
        this.startTimer();
        
        this.renderBoard();
        this.selectCell(null);
        this.statusMessage.textContent = '게임 시작! 빈 칸을 채워보세요.';
        this.statusMessage.style.color = '#7f8c8d';
    }

    startTimer() {
        this.stopTimer();
        this.timerSeconds = 0;
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            this.timerSeconds++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerSeconds / 60);
        const seconds = this.timerSeconds % 60;
        this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateMistakesDisplay() {
        this.mistakesElement.textContent = `오류: ${this.mistakes}/${this.maxMistakes}`;
    }

    renderBoard() {
        this.boardElement.innerHTML = '';
        // ... (rest of renderBoard implementation remains implicitly same, this replace handles the logic flow)
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                const value = this.currentBoard[i][j];
                if (value !== 0) {
                    cell.textContent = value;
                    if (this.initialBoard[i][j] !== 0) {
                        cell.classList.add('fixed');
                    } else {
                        cell.classList.add('editable');
                    }
                }

                cell.addEventListener('click', () => this.selectCell(cell, i, j));
                this.boardElement.appendChild(cell);
            }
        }
    }

    // ... (selectCell remains same)

    handleNumpad(e) {
        if (this.isGameOver) return;
        if (!e.target.classList.contains('num-btn')) return;
        // ... (rest of handleNumpad logic)
        if (!this.selectedCell) {
            this.statusMessage.textContent = '먼저 셀을 선택해주세요.';
            this.statusMessage.style.color = '#e74c3c';
            return;
        }

        const { row, col, element } = this.selectedCell;

        // Cannot edit fixed cells
        if (this.initialBoard[row][col] !== 0) {
            this.shakeElement(element);
            return;
        }

        const action = e.target.dataset.action;
        const num = action === 'erase' ? 0 : parseInt(e.target.dataset.num);

        this.updateCell(row, col, num);
    }

    handleKeydown(e) {
        if (this.isGameOver) return;
        if (!this.selectedCell) return;
        // ... (rest of handleKeydown logic)
        const key = e.key;
        const { row, col, element } = this.selectedCell;

        // Navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
            return;
        }

        // Editing
        if (this.initialBoard[row][col] !== 0) return;

        if (key >= '1' && key <= '9') {
            this.updateCell(row, col, parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            this.updateCell(row, col, 0);
        }
    }
    
    // ... (moveSelection remains same)
    
    // Explicitly including renderBoard and selectCell etc is messy in replace block without full file.
    // I will replace methods individually to be safe and clean.


    renderBoard() {
        this.boardElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                const value = this.currentBoard[i][j];
                if (value !== 0) {
                    cell.textContent = value;
                    if (this.initialBoard[i][j] !== 0) {
                        cell.classList.add('fixed');
                    } else {
                        cell.classList.add('editable');
                    }
                }

                cell.addEventListener('click', () => this.selectCell(cell, i, j));
                this.boardElement.appendChild(cell);
            }
        }
    }

    selectCell(cell, row, col) {
        // Clear previous selection
        document.querySelectorAll('.cell.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.cell.highlighted').forEach(el => el.classList.remove('highlighted'));
        document.querySelectorAll('.cell.same-number').forEach(el => el.classList.remove('same-number'));

        if (!cell) {
            this.selectedCell = null;
            return;
        }

        this.selectedCell = { row, col, element: cell };
        cell.classList.add('selected');

        // Highlight row, col, box
        const cells = document.querySelectorAll('.cell');
        cells.forEach(el => {
            const r = parseInt(el.dataset.row);
            const c = parseInt(el.dataset.col);
            
            // Box calculation
            const boxStartRow = Math.floor(row / 3) * 3;
            const boxStartCol = Math.floor(col / 3) * 3;
            const inBox = (r >= boxStartRow && r < boxStartRow + 3) && (c >= boxStartCol && c < boxStartCol + 3);

            if (r === row || c === col || inBox) {
                if (el !== cell) el.classList.add('highlighted');
            }

            // Highlight same numbers
            const val = this.currentBoard[row][col];
            if (val !== 0 && this.currentBoard[r][c] === val) {
                el.classList.add('same-number');
            }
        });
    }

    handleNumpad(e) {
        if (this.isGameOver) return;
        if (!e.target.classList.contains('num-btn')) return;
        if (!this.selectedCell) {
            this.statusMessage.textContent = '먼저 셀을 선택해주세요.';
            this.statusMessage.style.color = '#e74c3c';
            return;
        }

        const { row, col, element } = this.selectedCell;

        // Cannot edit fixed cells
        if (this.initialBoard[row][col] !== 0) {
            this.shakeElement(element);
            return;
        }

        const action = e.target.dataset.action;
        const num = action === 'erase' ? 0 : parseInt(e.target.dataset.num);

        this.updateCell(row, col, num);
    }

    handleKeydown(e) {
        if (this.isGameOver) return;
        if (!this.selectedCell) return;

        const key = e.key;
        const { row, col, element } = this.selectedCell;

        // Navigation
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            this.moveSelection(key);
            return;
        }

        // Editing
        if (this.initialBoard[row][col] !== 0) return;

        if (key >= '1' && key <= '9') {
            this.updateCell(row, col, parseInt(key));
        } else if (key === 'Backspace' || key === 'Delete') {
            this.updateCell(row, col, 0);
        }
    }

    moveSelection(key) {
        let { row, col } = this.selectedCell;
        
        if (key === 'ArrowUp') row = Math.max(0, row - 1);
        if (key === 'ArrowDown') row = Math.min(8, row + 1);
        if (key === 'ArrowLeft') col = Math.max(0, col - 1);
        if (key === 'ArrowRight') col = Math.min(8, col + 1);

        const index = row * 9 + col;
        const nextCell = this.boardElement.children[index];
        this.selectCell(nextCell, row, col);
    }

    updateCell(row, col, num) {
        this.currentBoard[row][col] = num;
        const cell = this.selectedCell.element;
        
        cell.textContent = num === 0 ? '' : num;
        cell.className = 'cell selected editable'; // Reset classes, keep selection

        if (num !== 0) {
            // Check for errors
            if (num !== this.solution[row][col]) {
                cell.classList.add('error');
                this.mistakes++;
                this.updateMistakesDisplay();
                
                if (this.mistakes >= this.maxMistakes) {
                    this.gameOver();
                }
            } else {
                // Check win condition
                this.checkWin();
            }
        }
        
        // Re-apply highlighting to show same numbers
        this.selectCell(cell, row, col);
    }

    gameOver() {
        this.isGameOver = true;
        this.stopTimer();
        this.statusMessage.textContent = '게임 오버! 3번의 실수를 하셨습니다.';
        this.statusMessage.style.color = '#e74c3c';
        this.statusMessage.style.fontWeight = 'bold';
        
        // Disable board interaction visually
        this.boardElement.style.opacity = '0.7';
        this.boardElement.style.pointerEvents = 'none';
    }

    shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; /* trigger reflow */
        element.style.animation = 'shake 0.3s';
        
        // Add keyframe if not exists (simple inline way)
        if (!document.getElementById('shake-style')) {
            const style = document.createElement('style');
            style.id = 'shake-style';
            style.textContent = `
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                    100% { transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    checkWin() {
        let isFull = true;
        let isCorrect = true;

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.currentBoard[i][j] === 0) {
                    isFull = false;
                    break;
                }
                if (this.currentBoard[i][j] !== this.solution[i][j]) {
                    isCorrect = false;
                }
            }
        }

        if (isFull && isCorrect) {
            this.stopTimer();
            this.statusMessage.textContent = `축하합니다! ${this.timerElement.textContent} 만에 퍼즐을 완성했습니다! 🎉`;
            this.statusMessage.style.color = '#27ae60';
            this.statusMessage.style.fontWeight = 'bold';
            // Confetti effect could go here
        }
    }
}

// Initialize the game
new SudokuUI();
// Initialize Chat
new ChatManager();
