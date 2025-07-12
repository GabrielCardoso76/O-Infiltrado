document.addEventListener('DOMContentLoaded', () => {

    // --- LISTA DE PALAVRAS ---
    // --- LISTA DE PALAVRAS ---
    // Lista completa e atualizada com mais de 40 opções.
    const wordPairs = [
        // Lista Original
        { majority: 'Carro', infiltrator: 'Moto' },
        { majority: 'Futebol', infiltrator: 'Basquete' },
        { majority: 'Praia', infiltrator: 'Piscina' },
        { majority: 'Cachorro', infiltrator: 'Gato' },
        { majority: 'Filme', infiltrator: 'Série' },
        { majority: 'Pizza', infiltrator: 'Hambúrguer' },
        { majority: 'Sol', infiltrator: 'Lua' },
        { majority: 'Computador', infiltrator: 'Celular' },
        { majority: 'Violão', infiltrator: 'Guitarra' },
        { majority: 'Café', infiltrator: 'Chá' },
        { majority: 'Verão', infiltrator: 'Inverno' },
        { majority: 'Brasil', infiltrator: 'Argentina' },
        { majority: 'Médico', infiltrator: 'Enfermeiro' },

        // Novos Pares Adicionados
        { majority: 'Livro', infiltrator: 'Revista' },
        { majority: 'Casa', infiltrator: 'Apartamento' },
        { majority: 'Rio', infiltrator: 'Mar' },
        { majority: 'Pintura', infiltrator: 'Desenho' },
        { majority: 'Ouro', infiltrator: 'Prata' },
        { majority: 'Garfo', infiltrator: 'Colher' },
        { majority: 'Cama', infiltrator: 'Sofá' },
        { majority: 'Maçã', infiltrator: 'Banana' },
        { majority: 'Água', infiltrator: 'Refrigerante' },
        { majority: 'Dançar', infiltrator: 'Cantar' },
        { majority: 'Policial', infiltrator: 'Bombeiro' },
        { majority: 'Tênis', infiltrator: 'Sapato' },
        { majority: 'Professor', infiltrator: 'Aluno' },
        { majority: 'Leão', infiltrator: 'Tigre' },
        { majority: 'Dia', infiltrator: 'Noite' },
        { majority: 'Mágico', infiltrator: 'Palhaço' },
        { majority: 'Chuva', infiltrator: 'Neve' },
        { majority: 'Fone de ouvido', infiltrator: 'Caixa de som' },
        { majority: 'Calor', infiltrator: 'Frio' },
        { majority: 'Amor', infiltrator: 'Amizade' },
        
        // Pares Invertidos (como solicitado)
        { majority: 'Moto', infiltrator: 'Carro' },
        { majority: 'Gato', infiltrator: 'Cachorro' },
        { majority: 'Piscina', infiltrator: 'Praia' },
        { majority: 'Série', infiltrator: 'Filme' },
        { majority: 'Celular', infiltrator: 'Computador' },
        { majority: 'Chá', infiltrator: 'Café' },
        { majority: 'Apartamento', infiltrator: 'Casa' },
        { majority: 'Basquete', infiltrator: 'Futebol' }
    ];
    // --- VARIÁVEIS DE ESTADO DO JOGO ---
    let players = [];
    let infiltrator = null;
    let majorityWord = '';
    let infiltratorWord = '';
    let currentPlayerIndex = 0;

    // --- ELEMENTOS DO DOM (AS TELAS E BOTÕES) ---
    const screens = {
        setup: document.getElementById('setup-screen'),
        reveal: document.getElementById('reveal-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen'),
    };

    const playerNamesInput = document.getElementById('player-names');
    const startGameBtn = document.getElementById('start-game-btn');
    
    const playerTurnTitle = document.getElementById('player-turn-title');
    const wordCard = document.getElementById('word-card');
    const wordDisplay = document.getElementById('word-display');
    const showWordBtn = document.getElementById('show-word-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');

    const startPlayerInfo = document.getElementById('start-player-info');
    const playersListDiv = document.getElementById('players-list');
    
    const winnerMessage = document.getElementById('winner-message');
    const gameResultInfo = document.getElementById('game-result-info');
    const playAgainBtn = document.getElementById('play-again-btn');

    // --- FUNÇÕES DO JOGO ---

    // Muda para a tela especificada
    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    // Inicia o Jogo
    startGameBtn.addEventListener('click', () => {
        const names = playerNamesInput.value.trim().split(' ').filter(name => name);
        
        if (names.length < 3) {
            alert('É necessário ter pelo menos 3 jogadores!');
            return;
        }

        // 1. Escolhe um par de palavras aleatoriamente
        const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
        majorityWord = pair.majority;
        infiltratorWord = pair.infiltrator;

        // 2. Escolhe um infiltrado aleatoriamente
        const infiltratorIndex = Math.floor(Math.random() * names.length);
        infiltrator = names[infiltratorIndex];

        // 3. Cria a lista de jogadores com seus papéis
        players = names.map(name => ({
            name: name,
            word: name === infiltrator ? infiltratorWord : majorityWord,
            isInfiltrator: name === infiltrator,
            isAlive: true,
        }));
        
        // 4. Inicia a fase de revelação
        currentPlayerIndex = 0;
        setupRevealPhase();
        switchScreen('reveal');
    });

    // Prepara a tela para cada jogador ver sua palavra
    function setupRevealPhase() {
        if (currentPlayerIndex >= players.length) {
            startMainGame();
            return;
        }

        const currentPlayer = players[currentPlayerIndex];
        playerTurnTitle.textContent = `Vez de: ${currentPlayer.name}`;
        wordDisplay.textContent = 'Clique no botão abaixo';
        wordCard.style.filter = 'blur(8px)';
        showWordBtn.style.display = 'inline-block';
        nextPlayerBtn.style.display = 'none';
    }

    // Mostra a palavra do jogador atual
    showWordBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        wordDisplay.textContent = currentPlayer.word;
        wordCard.style.filter = 'none';
        showWordBtn.style.display = 'none';
        nextPlayerBtn.style.display = 'inline-block';
    });

    // Passa para o próximo jogador
    nextPlayerBtn.addEventListener('click', () => {
        currentPlayerIndex++;
        // Adiciona um pequeno delay para a transição
        setTimeout(setupRevealPhase, 300);
    });

    // Inicia a fase principal do jogo (discussão e eliminação)
    function startMainGame() {
        // Sorteia quem começa
        const startingPlayerIndex = Math.floor(Math.random() * players.length);
        startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa! O jogo segue em sentido horário.`;
        
        renderPlayerList();
        switchScreen('game');
    }

    // Mostra a lista de jogadores vivos com o botão de eliminar
    function renderPlayerList() {
        playersListDiv.innerHTML = '';
        players.filter(p => p.isAlive).forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            const playerName = document.createElement('span');
            playerName.textContent = player.name;
            
            const eliminateBtn = document.createElement('button');
            eliminateBtn.className = 'btn btn-danger';
            eliminateBtn.textContent = 'Eliminar';
            eliminateBtn.onclick = () => eliminatePlayer(player.name);
            
            playerItem.appendChild(playerName);
            playerItem.appendChild(eliminateBtn);
            playersListDiv.appendChild(playerItem);
        });
    }

    // Lógica para eliminar um jogador
    function eliminatePlayer(playerName) {
        const player = players.find(p => p.name === playerName);
        if (player) {
            player.isAlive = false;
        }

        // Verifica condição de vitória/derrota
        const alivePlayers = players.filter(p => p.isAlive);
        const infiltratorIsAlive = alivePlayers.some(p => p.isInfiltrator);

        if (player.isInfiltrator) {
            // Se o infiltrado for eliminado, a maioria vence.
            endGame('majority');
        } else if (alivePlayers.length <= 2 && infiltratorIsAlive) {
            // Se restarem 2 e um deles for o infiltrado, ele vence.
            endGame('infiltrator');
        } else {
            // Se não, o jogo continua.
            renderPlayerList();
        }
    }

    // Finaliza o jogo e mostra o vencedor
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

    // Reinicia o jogo
    playAgainBtn.addEventListener('click', () => {
        playerNamesInput.value = '';
        switchScreen('setup');
    });

});