document.addEventListener('DOMContentLoaded', () => {
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
        { majority: 'Garfo', infiltrator: 'Colher' }, { majority: 'Cama', infiltrator: 'Sofá' }
    ];
    const boboWords = ['Foguete', 'Dragão', 'Unicórnio', 'Pudim', 'Meia', 'Lâmpada', 'Nuvem', 'Tapete'];

    const rules = {
        bobo: { title: 'O Bobo (ou Louco)', description: 'Recebe uma palavra totalmente aleatória. Seu objetivo é fazer com que os outros jogadores o eliminem. Se for eliminado, ele vence o jogo sozinho!' },
        cumplice: { title: 'O Cúmplice', description: 'É um aliado do Infiltrado. Ele recebe a mesma palavra do Infiltrado e vence se o Infiltrado vencer. O Infiltrado não sabe quem é o Cúmplice.' },
        eventos: { title: 'Eventos Aleatórios', description: 'Se ativado, um evento surpresa pode acontecer após uma eliminação, mudando as regras da próxima rodada.' }
    };

    const randomEvents = [
        { name: 'Voto em Dupla', description: 'Nesta rodada, a votação será em duplas! Os jogadores com a mesma cor na borda devem discutir e votar juntos em uma única pessoa.', action: 'pairVote' },
        { name: 'Palavra e Papel Revelados', description: 'A palavra e o papel de um jogador eliminado aleatoriamente serão revelados a todos, dando uma nova pista!', action: 'revealWordAndRole' },
        { name: 'Palavra Misteriosa Revelada', description: 'A palavra de um jogador eliminado aleatoriamente será revelada, mas não o seu papel. Usem a informação com sabedoria!', action: 'revealWordOnly' },
        { name: 'Rodada Silenciosa', description: 'Proibido falar! A discussão desta rodada deve ser feita apenas com mímica e gestos. Quem falar está sujeito a penalidades sociais!', action: 'silentRound' },
        { name: 'Voto Aberto', description: 'Sem segredos! Nesta rodada, todos devem anunciar seu voto abertamente, um de cada vez, em sentido horário.', action: 'openVote' }
    ];

    let players = [];
    let currentPlayerIndex = 0;
    let wordRevealed = false;
    let playerToEliminate = null;
    let gameSettings = { bobo: false, cumplice: false, events: false };
    let activeEvent = null;
    let eliminatedPlayers = [];

    const screens = {
        mainMenu: document.getElementById('main-menu-screen'),
        howToPlay: document.getElementById('how-to-play-screen'),
        customSetup: document.getElementById('custom-setup-screen'),
        reveal: document.getElementById('reveal-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen'),
    };

    const playerNamesInput = document.getElementById('player-names');
    const classicGameBtn = document.getElementById('classic-game-btn');
    const customSetupBtn = document.getElementById('custom-setup-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const backToMenuFromHowToPlayBtn = document.getElementById('back-to-menu-from-how-to-play-btn');
    const rolesListDetailed = document.getElementById('roles-list-detailed');
    const eventsListDetailed = document.getElementById('events-list-detailed');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const boboToggle = document.getElementById('bobo-toggle');
    const cumpliceToggle = document.getElementById('cumplice-toggle');
    const eventsToggle = document.getElementById('events-toggle');
    const startCustomGameBtn = document.getElementById('start-custom-game-btn');
    const playerTurnTitle = document.getElementById('player-turn-title');
    const roleDisplay = document.getElementById('role-display');
    const wordDisplay = document.getElementById('word-display');
    const wordCard = document.getElementById('word-card');
    const prevPlayerBtn = document.getElementById('prev-player-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    const startPlayerInfo = document.getElementById('start-player-info');
    const playersListDiv = document.getElementById('players-list');
    const winnerMessage = document.getElementById('winner-message');
    const gameResultInfo = document.getElementById('game-result-info');
    const playAgainBtn = document.getElementById('play-again-btn');
    const rulesModal = document.getElementById('rules-modal');
    const ruleTitle = document.getElementById('rule-title');
    const ruleDescription = document.getElementById('rule-description');
    const closeRulesModal = document.getElementById('close-rules-modal');
    const eventModal = document.getElementById('event-modal');
    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const closeEventModal = document.getElementById('close-event-modal');
    const reRevealModal = document.getElementById('re-reveal-modal');
    const modalRole = document.getElementById('modal-role');
    const modalWord = document.getElementById('modal-word');
    const closeRevealModalBtn = document.getElementById('close-reveal-modal');
    const confirmEliminationModal = document.getElementById('confirm-elimination-modal');
    const playerToEliminateName = document.getElementById('player-to-eliminate-name');
    const confirmEliminateBtn = document.getElementById('confirm-eliminate-btn');
    const cancelEliminateBtn = document.getElementById('cancel-eliminate-btn');
    const closeConfirmModalBtn = document.getElementById('close-confirm-modal');

    function switchScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.remove('active'));
        screens[screenName].classList.add('active');
    }

    function initializeGame() {
        const names = playerNamesInput.value.trim().split(' ').filter(name => name);
        if (names.length < 4 && (gameSettings.bobo || gameSettings.cumplice)) {
            alert('São necessários pelo menos 4 jogadores para os papéis especiais.');
            return;
        }
        if (names.length < 3) {
            alert('É necessário ter pelo menos 3 jogadores.');
            return;
        }

        assignRolesAndWords(names);
        currentPlayerIndex = 0;
        eliminatedPlayers = [];
        setupRevealPhase();
        switchScreen('reveal');
    }

    function assignRolesAndWords(names) {
        const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
        const majorityWord = pair.majority;
        const infiltratorWord = pair.infiltrator;

        let availablePlayers = [...names];
        players = [];
        let rolesToAssign = [];

        rolesToAssign.push({ role: 'Infiltrado', word: infiltratorWord });
        if (gameSettings.bobo && availablePlayers.length >= 4) {
            rolesToAssign.push({ role: 'Bobo', word: boboWords[Math.floor(Math.random() * boboWords.length)] });
        }
        if (gameSettings.cumplice && availablePlayers.length >= 4) {
            rolesToAssign.push({ role: 'Cúmplice', word: infiltratorWord });
        }

        availablePlayers.sort(() => Math.random() - 0.5);

        players = availablePlayers.map(name => {
            const assignedRole = rolesToAssign.shift();
            if (assignedRole) {
                return { name, ...assignedRole, isAlive: true, hasRevealedOnce: false };
            }
            return { name, role: 'Maioria', word: majorityWord, isAlive: true, hasRevealedOnce: false };
        });

        players.sort(() => Math.random() - 0.5);
    }

    function setupRevealPhase() {
        const currentPlayer = players[currentPlayerIndex];
        playerTurnTitle.textContent = `Vez de: ${currentPlayer.name}`;
        roleDisplay.textContent = '';
        wordDisplay.textContent = 'Clique para revelar';
        wordCard.style.filter = 'blur(8px)';
        wordRevealed = false;
        prevPlayerBtn.style.visibility = currentPlayerIndex === 0 ? 'hidden' : 'visible';
        nextPlayerBtn.textContent = (currentPlayerIndex === players.length - 1) ? 'Jogar!' : '→';
    }

    function startMainGame() {
        const startingPlayerIndex = Math.floor(Math.random() * players.length);
        startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa!`;
        activeEvent = null;
        renderPlayerList();
        switchScreen('game');
    }

    function renderPlayerList() {
        playersListDiv.innerHTML = '';
        const alivePlayers = players.filter(p => p.isAlive);

        if (activeEvent && activeEvent.action === 'pairVote') {
            const pairs = activeEvent.details.pairs;
            pairs.forEach((pair, pairIndex) => {
                pair.forEach(playerName => {
                    const player = alivePlayers.find(p => p.name === playerName);
                    if (player) {
                        createPlayerItem(player, `pair-color-${(pairIndex % 5) + 1}`);
                    }
                });
            });
        } else {
            alivePlayers.forEach(player => createPlayerItem(player));
        }
    }

    function createPlayerItem(player, pairClass = '') {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        if (pairClass) {
            playerItem.classList.add(pairClass);
        }

        const playerNameSpan = document.createElement('span');
        playerNameSpan.className = 'player-name';
        playerNameSpan.textContent = player.name;
        playerNameSpan.onclick = () => showReRevealModal(player.role, player.word);

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
    }

    function promptElimination(playerName) {
        playerToEliminate = playerName;
        playerToEliminateName.textContent = playerName;
        confirmEliminationModal.style.display = 'block';
    }

    function eliminatePlayer(playerName) {
        const playerIndex = players.findIndex(p => p.name === playerName);
        if (playerIndex > -1) {
            players[playerIndex].isAlive = false;
            eliminatedPlayers.push(players[playerIndex]);
        }

        const eliminatedPlayer = players[playerIndex];
        const alivePlayers = players.filter(p => p.isAlive);
        const aliveInfiltrators = alivePlayers.filter(p => p.role === 'Infiltrado' || p.role === 'Cúmplice');
        const aliveMajority = alivePlayers.filter(p => p.role === 'Maioria');

        if (eliminatedPlayer.role === 'Bobo') {
            endGame('bobo', eliminatedPlayer);
            return;
        }
        if (aliveInfiltrators.length === 0) {
            endGame('majority');
            return;
        }
        if (aliveMajority.length === 0) {
            endGame('infiltrators');
            return;
        }
        if (alivePlayers.length <= 2) {
            endGame('infiltrators');
            return;
        }

        if (gameSettings.events && Math.random() < 0.4) {
            triggerRandomEvent();
        } else {
            activeEvent = null;
            renderPlayerList();
        }
    }

    function triggerRandomEvent() {
        const alivePlayersCount = players.filter(p => p.isAlive).length;
        let possibleEvents = [...randomEvents];

        if (alivePlayersCount < 5) {
            possibleEvents = possibleEvents.filter(event => event.action !== 'pairVote');
        }
        if (eliminatedPlayers.length === 0) {
            possibleEvents = possibleEvents.filter(event => event.action !== 'revealWordAndRole' && event.action !== 'revealWordOnly');
        }

        if (possibleEvents.length === 0) {
            activeEvent = null;
            renderPlayerList();
            return;
        }

        const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        activeEvent = { name: event.name, description: event.description, action: event.action, details: {} };

        if (event.action === 'pairVote') {
            let alivePlayerNames = players.filter(p => p.isAlive).map(p => p.name);
            alivePlayerNames.sort(() => Math.random() - 0.5);
            const pairs = [];
            for (let i = 0; i < alivePlayerNames.length; i += 2) {
                if (i + 1 < alivePlayerNames.length) {
                    pairs.push([alivePlayerNames[i], alivePlayerNames[i + 1]]);
                } else {
                    pairs.push([alivePlayerNames[i]]);
                }
            }
            activeEvent.details.pairs = pairs;
        } else if (event.action === 'revealWordAndRole' || event.action === 'revealWordOnly') {
            const randomEliminated = eliminatedPlayers[Math.floor(Math.random() * eliminatedPlayers.length)];
            let revealText = (event.action === 'revealWordAndRole')
                ? `A palavra de ${randomEliminated.name} (${randomEliminated.role}) era: "${randomEliminated.word}"`
                : `A palavra de um jogador eliminado era: "${randomEliminated.word}"`;
            activeEvent.description = event.description + `\n\n${revealText}`;
        }

        eventTitle.textContent = activeEvent.name;
        eventDescription.textContent = activeEvent.description;
        eventModal.style.display = 'block';
        renderPlayerList();
    }

    function endGame(winnerType, winningPlayer = null) {
        switchScreen('end');
        let resultText = '';
        players.forEach(p => {
            resultText += `${p.name} era ${p.role} com a palavra "${p.word}".\n`;
        });
        gameResultInfo.textContent = resultText;

        if (winnerType === 'bobo') {
            winnerMessage.textContent = `${winningPlayer.name} (O Bobo) VENCEU!`;
            winnerMessage.style.color = 'var(--bobo-color)';
        } else if (winnerType === 'infiltrators') {
            winnerMessage.textContent = 'O INFILTRADO E SEUS ALIADOS VENCERAM!';
            winnerMessage.style.color = 'var(--cumplice-color)';
        } else {
            winnerMessage.textContent = 'A MAIORIA VENCEU!';
            winnerMessage.style.color = 'var(--majority-color)';
        }
    }

    function showReRevealModal(role, word) {
        modalRole.textContent = role;
        modalWord.textContent = word;
        modalWord.classList.add('is-hidden');
        reRevealModal.style.display = 'block';
    }

    function populateHowToPlayScreen() {
        rolesListDetailed.innerHTML = '';
        eventsListDetailed.innerHTML = '';

        for (const key in rules) {
            const rule = rules[key];
            const item = document.createElement('div');
            item.className = 'rule-item-detailed';
            item.innerHTML = `<strong>${rule.title}</strong><p>${rule.description}</p>`;
            rolesListDetailed.appendChild(item);
        }
        
        randomEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'rule-item-detailed';
            item.innerHTML = `<strong>${event.name}</strong><p>${event.description}</p>`;
            eventsListDetailed.appendChild(item);
        });
    }

    populateHowToPlayScreen();

    classicGameBtn.addEventListener('click', () => {
        gameSettings = { bobo: false, cumplice: false, events: false };
        initializeGame();
    });

    customSetupBtn.addEventListener('click', () => {
        const names = playerNamesInput.value.trim().split(' ').filter(name => name);
        if (names.length < 3) {
            alert('Por favor, digite os nomes de pelo menos 3 jogadores antes de personalizar a partida.');
            return;
        }
        switchScreen('customSetup');
    });
    
    backToMenuBtn.addEventListener('click', () => switchScreen('mainMenu'));
    howToPlayBtn.addEventListener('click', () => switchScreen('howToPlay'));
    backToMenuFromHowToPlayBtn.addEventListener('click', () => switchScreen('mainMenu'));

    startCustomGameBtn.addEventListener('click', () => {
        gameSettings = {
            bobo: boboToggle.checked,
            cumplice: cumpliceToggle.checked,
            events: eventsToggle.checked,
        };
        initializeGame();
    });

    wordCard.addEventListener('click', () => {
        if (!wordRevealed) {
            const currentPlayer = players[currentPlayerIndex];
            roleDisplay.textContent = currentPlayer.role;
            wordDisplay.textContent = currentPlayer.word;
            wordCard.style.filter = 'none';
            wordRevealed = true;
            currentPlayer.hasRevealedOnce = true;
        }
    });

    prevPlayerBtn.addEventListener('click', () => {
        if (currentPlayerIndex > 0) {
            currentPlayerIndex--;
            setupRevealPhase();
        }
    });

    nextPlayerBtn.addEventListener('click', () => {
        const currentPlayer = players[currentPlayerIndex];
        if (!currentPlayer.hasRevealedOnce) {
            alert("Por favor, revele seu papel e palavra antes de continuar!");
            return;
        }
        if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            setupRevealPhase();
        } else {
            startMainGame();
        }
    });

    playAgainBtn.addEventListener('click', () => {
        playerNamesInput.value = '';
        switchScreen('mainMenu');
    });

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const ruleKey = e.target.dataset.rule;
            ruleTitle.textContent = rules[ruleKey].title;
            ruleDescription.textContent = rules[ruleKey].description;
            rulesModal.style.display = 'block';
        });
    });

    confirmEliminateBtn.addEventListener('click', () => {
        if (playerToEliminate) {
            eliminatePlayer(playerToEliminate);
        }
        confirmEliminationModal.style.display = 'none';
    });

    modalWord.addEventListener('click', () => modalWord.classList.toggle('is-hidden'));
    closeRevealModalBtn.addEventListener('click', () => reRevealModal.style.display = 'none');
    cancelEliminateBtn.addEventListener('click', () => confirmEliminationModal.style.display = 'none');
    closeConfirmModalBtn.addEventListener('click', () => confirmEliminationModal.style.display = 'none');
    closeRulesModal.addEventListener('click', () => rulesModal.style.display = 'none');
    closeEventModal.addEventListener('click', () => eventModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target == reRevealModal) reRevealModal.style.display = 'none';
        if (event.target == confirmEliminationModal) confirmEliminationModal.style.display = 'none';
        if (event.target == rulesModal) rulesModal.style.display = 'none';
        if (event.target == eventModal) eventModal.style.display = 'none';
    });
});