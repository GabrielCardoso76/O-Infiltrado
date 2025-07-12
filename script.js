document.addEventListener('DOMContentLoaded', () => {

    // --- LISTA DE PALAVRAS ---
    const wordPairs = [
        { majority: 'Carro', infiltrator: 'Moto' }, { majority: 'Futebol', infiltrator: 'Basquete' },
        { majority: 'Praia', infiltrator: 'Piscina' }, { majority: 'Cachorro', infiltrator: 'Gato' },
        { majority: 'Filme', infiltrator: 'Série' }, { majority: 'Pizza', infiltrator: 'Hambúrguer' },
        { majority: 'Sol', infiltrator: 'Lua' }, { majority: 'Computador', infiltrator: 'Celular' },
        { majority: 'Violão', infiltrator: 'Guitarra' }, { majority: 'Café', infiltrator: 'Chá' },
        { majority: 'Verão', infiltrator: 'Inverno' }, { majority: 'Brasil', infiltrator: 'Argentina' },
        { majority: 'Médico', infiltrator: 'Enfermeiro' }, { majority: 'Livro', infiltrator: 'Revista' },
        { majority: 'Casa', infiltrator: 'Apartamento' }, { majority: 'Rio', infiltrator: 'Mar' },
        { majority: 'Pintura', infiltrator: 'Desenho' }, { majority: 'Ouro', infiltrator: 'Prata' },
        { majority: 'Garfo', infiltrator: 'Colher' }, { majority: 'Cama', infiltrator: 'Sofá' },
        { majority: 'Maçã', infiltrator: 'Banana' }, { majority: 'Água', infiltrator: 'Refrigerante' },
        { majority: 'Dançar', infiltrator: 'Cantar' }, { majority: 'Policial', infiltrator: 'Bombeiro' },
        { majority: 'Tênis', infiltrator: 'Sapato' }, { majority: 'Professor', infiltrator: 'Aluno' },
        { majority: 'Leão', infiltrator: 'Tigre' }, { majority: 'Dia', infiltrator: 'Noite' },
        { majority: 'Mágico', infiltrator: 'Palhaço' }, { majority: 'Chuva', infiltrator: 'Neve' },
        { majority: 'Fone de ouvido', infiltrator: 'Caixa de som' }, { majority: 'Calor', infiltrator: 'Frio' },
        { majority: 'Amor', infiltrator: 'Amizade' }, { majority: 'Moto', infiltrator: 'Carro' },
        { majority: 'Gato', infiltrator: 'Cachorro' }, { majority: 'Piscina', infiltrator: 'Praia' },
        { majority: 'Série', infiltrator: 'Filme' }, { majority: 'Celular', infiltrator: 'Computador' },
        { majority: 'Chá', infiltrator: 'Café' }, { majority: 'Apartamento', infiltrator: 'Casa' },
        { majority: 'Basquete', infiltrator: 'Futebol' }
    ];
    
    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let players = [];
    let infiltrator = null;
    let majorityWord = '';
    let infiltratorWord = '';
    let currentPlayerIndex = 0;
    let wordRevealed = false;
    let playerToEliminate = null;

    // --- ELEMENTOS DO DOM ---
    const screens = { setup: document.getElementById('setup-screen'), reveal: document.getElementById('reveal-screen'), game: document.getElementById('game-screen'), end: document.getElementById('end-screen') };
    const playerNamesInput = document.getElementById('player-names');
    const startGameBtn = document.getElementById('start-game-btn');
    const playerTurnTitle = document.getElementById('player-turn-title');
    const wordCard = document.getElementById('word-card');
    const wordDisplay = document.getElementById('word-display');
    const prevPlayerBtn = document.getElementById('prev-player-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    const startPlayerInfo = document.getElementById('start-player-info');
    const playersListDiv = document.getElementById('players-list');
    const winnerMessage = document.getElementById('winner-message');
    const gameResultInfo = document.getElementById('game-result-info');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // Modal de Revelar Palavra
    const reRevealModal = document.getElementById('re-reveal-modal');
    const modalWord = document.getElementById('modal-word');
    const closeRevealModalBtn = document.getElementById('close-reveal-modal');
    
    // Modal de Confirmação de Eliminação
    const confirmEliminationModal = document.getElementById('confirm-elimination-modal');
    const playerToEliminateName = document.getElementById('player-to-eliminate-name');
    const confirmEliminateBtn = document.getElementById('confirm-eliminate-btn');
    const cancelEliminateBtn = document.getElementById('cancel-eliminate-btn');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal');

    // --- FUNÇÕES DO JOGO ---

    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    startGameBtn.addEventListener('click', () => {
        const names = playerNamesInput.value.trim().split(' ').filter(name => name);
        if (names.length < 3) {
            alert('É necessário ter pelo menos 3 jogadores!');
            return;
        }
        const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
        majorityWord = pair.majority;
        infiltratorWord = pair.infiltrator;
        const infiltratorIndex = Math.floor(Math.random() * names.length);
        infiltrator = names[infiltratorIndex];
        players = names.map(name => ({ name: name, word: name === infiltrator ? infiltratorWord : majorityWord, isInfiltrator: name === infiltrator, isAlive: true }));
        currentPlayerIndex = 0;
        setupRevealPhase();
        switchScreen('reveal');
    });

    function setupRevealPhase() {
        const currentPlayer = players[currentPlayerIndex];
        playerTurnTitle.textContent = `Vez de: ${currentPlayer.name}`;
        wordDisplay.textContent = 'Clique para revelar';
        wordCard.style.filter = 'blur(8px)';
        wordRevealed = false;
        prevPlayerBtn.style.visibility = currentPlayerIndex === 0 ? 'hidden' : 'visible';
        nextPlayerBtn.textContent = (currentPlayerIndex === players.length - 1) ? 'Jogar!' : '→';
    }

    wordCard.addEventListener('click', () => {
        if (!wordRevealed) {
            const currentPlayer = players[currentPlayerIndex];
            wordDisplay.textContent = currentPlayer.word;
            wordCard.style.filter = 'none';
            wordRevealed = true;
        }
    });
    
    prevPlayerBtn.addEventListener('click', () => {
        if (currentPlayerIndex > 0) {
            currentPlayerIndex--;
            setupRevealPhase();
        }
    });

    nextPlayerBtn.addEventListener('click', () => {
        if (!wordRevealed) {
            alert("Por favor, revele a palavra antes de continuar!");
            return;
        }
        if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            setupRevealPhase();
        } else {
            startMainGame();
        }
    });

    function startMainGame() {
        const startingPlayerIndex = Math.floor(Math.random() * players.length);
        startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa!`;
        renderPlayerList();
        switchScreen('game');
    }

    function renderPlayerList() {
        playersListDiv.innerHTML = '';
        players.filter(p => p.isAlive).forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            const playerNameSpan = document.createElement('span');
            playerNameSpan.className = 'player-name';
            playerNameSpan.textContent = player.name;
            playerNameSpan.onclick = () => showReRevealModal(player.word);
            
            const eliminateBtn = document.createElement('button');
            eliminateBtn.className = 'btn btn-danger';
            eliminateBtn.textContent = 'Eliminar';
            eliminateBtn.onclick = (e) => {
                e.stopPropagation();
                promptElimination(player.name);
            };
            
            playerItem.appendChild(playerNameSpan);
            playerItem.appendChild(eliminateBtn);
            playersListDiv.appendChild(playerItem);
        });
    }
    
    function showReRevealModal(word) {
        modalWord.textContent = word;
        modalWord.classList.add('is-hidden');
        reRevealModal.style.display = 'block';
    }

    function promptElimination(playerName) {
        playerToEliminate = playerName;
        playerToEliminateName.textContent = playerName;
        confirmEliminationModal.style.display = 'block';
    }

    function eliminatePlayer(playerName) {
        const player = players.find(p => p.name === playerName);
        if (player) {
            player.isAlive = false;
        }
        const alivePlayers = players.filter(p => p.isAlive);
        const infiltratorIsAlive = alivePlayers.some(p => p.isInfiltrator);
        if (player.isInfiltrator) {
            endGame('majority');
        } else if (alivePlayers.length <= 2 && infiltratorIsAlive) {
            endGame('infiltrator');
        } else {
            renderPlayerList();
        }
    }

    function endGame(winner) {
        switchScreen('end');
        if (winner === 'majority') {
            winnerMessage.textContent = 'A MAIORIA VENCEU!';
            winnerMessage.style.color = '#2575fc';
            gameResultInfo.textContent = `O infiltrado era ${infiltrator} com a palavra "${infiltratorWord}". A palavra da maioria era "${majorityWord}".`;
        } else {
            winnerMessage.textContent = 'O INFILTRADO VENCEU!';
            winnerMessage.style.color = '#cb1111';
            gameResultInfo.textContent = `${infiltrator} conseguiu se esconder até o final! A palavra era "${infiltratorWord}".`;
        }
    }

    playAgainBtn.addEventListener('click', () => {
        playerNamesInput.value = '';
        switchScreen('setup');
    });

    // --- EVENTOS DOS MODAIS ---
    
    // Modal de Revelar Palavra
    modalWord.addEventListener('click', () => {
        modalWord.classList.toggle('is-hidden');
    });
    closeRevealModalBtn.addEventListener('click', () => {
        reRevealModal.style.display = 'none';
    });
    
    // Modal de Confirmação de Eliminação
    confirmEliminateBtn.addEventListener('click', () => {
        if (playerToEliminate) {
            eliminatePlayer(playerToEliminate);
        }
        confirmEliminationModal.style.display = 'none';
    });
    cancelEliminateBtn.addEventListener('click', () => {
        confirmEliminationModal.style.display = 'none';
    });
    closeConfirmModalBtn.addEventListener('click', () => {
        confirmEliminationModal.style.display = 'none';
    });

    // Fechar modal clicando fora
    window.addEventListener('click', (event) => {
        if (event.target == reRevealModal) {
            reRevealModal.style.display = 'none';
        }
        if (event.target == confirmEliminationModal) {
            confirmEliminationModal.style.display = 'none';
        }
    });
});
