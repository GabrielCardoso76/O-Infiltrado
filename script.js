document.addEventListener('DOMContentLoaded', () => {
    const wordPairs = [
        { majority: 'Carro', infiltrator: 'Moto', category: 'Veículo' }, 
        { majority: 'Futebol', infiltrator: 'Basquete', category: 'Esporte' },
        { majority: 'Praia', infiltrator: 'Piscina', category: 'Lugar' }, 
        { majority: 'Cachorro', infiltrator: 'Gato', category: 'Animal' },
        { majority: 'Filme', infiltrator: 'Série', category: 'Entretenimento' }, 
        { majority: 'Pizza', infiltrator: 'Hambúrguer', category: 'Comida' },
        { majority: 'Sol', infiltrator: 'Lua', category: 'Astro' }, 
        { majority: 'Computador', infiltrator: 'Celular', category: 'Tecnologia' },
        { majority: 'Violão', infiltrator: 'Guitarra', category: 'Instrumento Musical' }, 
        { majority: 'Café', infiltrator: 'Chá', category: 'Bebida' },
        { majority: 'Verão', infiltrator: 'Inverno', category: 'Estação do Ano' }, 
        { majority: 'Brasil', infiltrator: 'Argentina', category: 'País' },
        { majority: 'Médico', infiltrator: 'Enfermeiro', category: 'Profissão' }, 
        { majority: 'Livro', infiltrator: 'Revista', category: 'Leitura' },
        { majority: 'Casa', infiltrator: 'Apartamento', category: 'Moradia' }, 
        { majority: 'Rio', infiltrator: 'Mar', category: 'Geografia' },
        { majority: 'Pintura', infiltrator: 'Desenho', category: 'Arte' }, 
        { majority: 'Ouro', infiltrator: 'Prata', category: 'Metal' },
        { majority: 'Garfo', infiltrator: 'Colher', category: 'Utensílio' }, 
        { majority: 'Cama', infiltrator: 'Sofá', category: 'Móvel' }
    ];
    const boboWords = ['Foguete', 'Dragão', 'Unicórnio', 'Pudim', 'Meia', 'Lâmpada', 'Nuvem', 'Tapete'];

    const rules = {
        bobo: { title: 'O Bobo', description: 'Recebe uma palavra aleatória. Seu objetivo é ser eliminado. Se conseguir, vence sozinho!' },
        cumplice: { title: 'O Cúmplice', description: 'Aliado do Infiltrado, recebe a mesma palavra e vence junto com ele. O Infiltrado não sabe quem é o Cúmplice.' },
        anjo: { title: 'Anjo da Guarda', description: 'A cada rodada, escolhe secretamente um jogador para proteger. Se o jogador protegido for o mais votado, a eliminação é cancelada. O Anjo não pode proteger a mesma pessoa duas vezes seguidas.' },
        detetive: { title: 'O Detetive', description: 'A cada rodada, investiga secretamente um jogador. No modo "Rápido", o resultado sai na hora. No modo "Lento", o resultado chega apenas na rodada seguinte.' },
        vidente: { title: 'O Vidente', description: 'A cada rodada, tem uma pequena chance de descobrir secretamente o nome de outro jogador que também está do lado da Maioria.'},
        eventos: { title: 'Eventos Aleatórios', description: 'Se ativado, um evento surpresa pode acontecer após uma eliminação, mudando as regras da próxima rodada.' }
    };

    const randomEvents = [
        { name: 'Voto em Dupla', description: 'Nesta rodada, a votação será em duplas! Os jogadores com a mesma cor na borda devem discutir e votar juntos em uma única pessoa.', type: 'pre-discussion' },
        { name: 'Palavra e Papel Revelados', description: 'A palavra e o papel de um jogador eliminado aleatoriamente serão revelados a todos, dando uma nova pista!', type: 'post-elimination' },
        { name: 'Palavra Misteriosa Revelada', description: 'A palavra de um jogador eliminado aleatoriamente será revelada, mas não o seu papel. Usem a informação com sabedoria!', type: 'post-elimination' },
        { name: 'Rodada Silenciosa', description: 'Proibido falar! A discussão desta rodada deve ser feita apenas com mímica e gestos.', type: 'pre-discussion' },
        { name: 'Voto Aberto', description: 'Sem segredos! Nesta rodada, todos devem anunciar seu voto abertamente, um de cada vez, em sentido horário.', type: 'pre-discussion' }
    ];

    let players = [];
    let currentPlayerIndex = 0;
    let wordRevealed = false;
    let playerToEliminate = null;
    let gameSettings = {};
    let activeEvent = null;
    let eliminatedPlayers = [];
    let roundNumber = 0;
    let actionPhase = {
        activeRoles: [],
        currentPlayerIndex: 0,
        lastProtected: null,
        pendingInvestigation: null,
        protectionChoice: null,
        investigationChoice: null,
        videnteSaw: null
    };
    let currentWordPair = {};
    let timerInterval;

    const screens = {
        mainMenu: document.getElementById('main-menu-screen'),
        howToPlay: document.getElementById('how-to-play-screen'),
        customSetup: document.getElementById('custom-setup-screen'),
        reveal: document.getElementById('reveal-screen'),
        actionPhase: document.getElementById('action-phase-screen'),
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
    const anjoToggle = document.getElementById('anjo-toggle');
    const detetiveToggle = document.getElementById('detetive-toggle');
    const videnteToggle = document.getElementById('vidente-toggle');
    const detectiveModeOption = document.getElementById('detective-mode-option');
    const eventsToggle = document.getElementById('events-toggle');
    const actionTimerSlider = document.getElementById('action-timer-slider');
    const actionTimerValue = document.getElementById('action-timer-value');
    const startCustomGameBtn = document.getElementById('start-custom-game-btn');
    const playerTurnTitle = document.getElementById('player-turn-title');
    const roleDisplay = document.getElementById('role-display');
    const wordDisplay = document.getElementById('word-display');
    const wordCard = document.getElementById('word-card');
    const prevPlayerBtn = document.getElementById('prev-player-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    const actionPhaseTitle = document.getElementById('action-phase-title');
    const actionPhaseInstruction = document.getElementById('action-phase-instruction');
    const actionTimerDisplay = document.getElementById('action-timer-display');
    const actionUiContainer = document.getElementById('action-ui-container');
    const actionPhaseMessage = document.getElementById('action-phase-message');
    const actionPhaseContinueBtn = document.getElementById('action-phase-continue-btn');
    const startPlayerInfo = document.getElementById('start-player-info');
    const playersListDiv = document.getElementById('players-list');
    const skipRoundBtn = document.getElementById('skip-round-btn');
    const winnerMessage = document.getElementById('winner-message');
    const gameResultInfo = document.getElementById('game-result-info');
    const playAgainBtn = document.getElementById('play-again-btn');
    const infoModal = document.getElementById('info-modal');
    const infoModalTitle = document.getElementById('info-modal-title');
    const infoModalDescription = document.getElementById('info-modal-description');
    const infoModalContinueBtn = document.getElementById('info-modal-continue-btn');
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
        let requiredPlayers = 3;
        if (gameSettings.bobo || gameSettings.cumplice || gameSettings.anjo || gameSettings.detetive || gameSettings.vidente) requiredPlayers = 4;
        if (names.length < requiredPlayers) {
            alert(`São necessários pelo menos ${requiredPlayers} jogadores para esta configuração.`);
            return;
        }

        assignRolesAndWords(names);
        currentPlayerIndex = 0;
        eliminatedPlayers = [];
        roundNumber = 0;
        actionPhase.lastProtected = null;
        actionPhase.pendingInvestigation = null;
        startPlayerInfo.textContent = '';
        setupRevealPhase();
        switchScreen('reveal');
    }

    function assignRolesAndWords(names) {
        currentWordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
        const { majority: majorityWord, infiltrator: infiltratorWord } = currentWordPair;

        let availablePlayers = [...names];
        players = [];
        let rolesToAssign = [];

        rolesToAssign.push({ role: 'Infiltrado', word: infiltratorWord });
        if (gameSettings.bobo) rolesToAssign.push({ role: 'Bobo', word: boboWords[Math.floor(Math.random() * boboWords.length)] });
        if (gameSettings.cumplice) rolesToAssign.push({ role: 'Cúmplice', word: infiltratorWord });
        if (gameSettings.anjo) rolesToAssign.push({ role: 'Anjo da Guarda', word: majorityWord });
        if (gameSettings.detetive) rolesToAssign.push({ role: 'Detetive', word: majorityWord });
        if (gameSettings.vidente) rolesToAssign.push({ role: 'Vidente', word: majorityWord });

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

    function startRound() {
        roundNumber++;
        activeEvent = null;
        const actionRoles = [];
        if (gameSettings.anjo) actionRoles.push('anjo');
        if (gameSettings.detetive) actionRoles.push('detetive');
        if (gameSettings.vidente) actionRoles.push('vidente');

        if (actionRoles.length > 0) {
            startActionPhase(actionRoles);
        } else {
            triggerPreDiscussionEvent();
        }
    }

    function startActionPhase(actionTypes) {
        actionPhase.activeRoles = actionTypes;
        actionPhase.currentPlayerIndex = 0;
        actionPhase.protectionChoice = null;
        actionPhase.investigationChoice = null;
        
        actionPhaseTitle.textContent = 'Fase de Ação Secreta';
        switchScreen('actionPhase');
        runPlayerActionTurn();
    }

    function runPlayerActionTurn() {
        const player = players[actionPhase.currentPlayerIndex];
        actionPhaseInstruction.textContent = `Passe o celular para ${player.name}`;
        actionUiContainer.innerHTML = '';
        actionPhaseMessage.style.display = 'block';
        actionPhaseMessage.textContent = 'Clique em "Pronto" quando receber o celular.';
        actionPhaseContinueBtn.textContent = 'Pronto';
        actionPhaseContinueBtn.disabled = false;
        actionTimerDisplay.textContent = gameSettings.actionTimer;
        
        actionPhaseContinueBtn.onclick = () => {
            actionPhaseInstruction.textContent = 'Ação Secreta';
            actionPhaseMessage.style.display = 'none';
            
            let timeLeft = gameSettings.actionTimer;
            actionTimerDisplay.textContent = timeLeft;
            actionPhaseContinueBtn.disabled = true;
            actionPhaseContinueBtn.textContent = `Aguarde ${timeLeft}s`;

            timerInterval = setInterval(() => {
                timeLeft--;
                actionTimerDisplay.textContent = timeLeft;
                actionPhaseContinueBtn.textContent = `Aguarde ${timeLeft}s`;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    actionPhaseContinueBtn.disabled = false;
                    actionPhaseContinueBtn.textContent = 'Concluir Ação';
                }
            }, 1000);

            showActionUIForPlayer(player);
        };
    }

    function showActionUIForPlayer(player) {
        actionUiContainer.innerHTML = '';
        let hasAction = false;
        let defaultMessage = 'Processando...';
        
        const isGoodGuy = (p) => p.role !== 'Infiltrado' && p.role !== 'Cúmplice' && p.role !== 'Bobo';

        if (actionPhase.activeRoles.includes('anjo') && player.role === 'Anjo da Guarda') {
            hasAction = true;
            const title = document.createElement('h4');
            title.textContent = 'Escolha um jogador para proteger:';
            actionUiContainer.appendChild(title);
            const list = document.createElement('div');
            list.className = 'player-list-action';
            players.filter(p => p.isAlive && p.name !== player.name).forEach(target => {
                const targetEl = document.createElement('div');
                targetEl.textContent = target.name;
                targetEl.className = 'player-name';
                if (target.name === actionPhase.lastProtected) {
                    targetEl.classList.add('disabled');
                } else {
                    targetEl.onclick = () => {
                        actionPhase.protectionChoice = target.name;
                        title.textContent = `${target.name} será protegido(a).`;
                        list.innerHTML = '';
                    };
                }
                list.appendChild(targetEl);
            });
            actionUiContainer.appendChild(list);
        }
        
        if (actionPhase.activeRoles.includes('detetive') && player.role === 'Detetive') {
            hasAction = true;
            const title = document.createElement('h4');
            actionUiContainer.appendChild(title);
            
            if (gameSettings.detectiveMode === 'lento' && actionPhase.pendingInvestigation && actionPhase.pendingInvestigation.investigator === player.name) {
                const target = actionPhase.pendingInvestigation.target;
                const targetPlayer = players.find(p => p.name === target);
                const result = isGoodGuy(targetPlayer) ? 'É da Maioria' : 'NÃO é da Maioria';
                title.textContent = `Resultado sobre ${target}: ${result}.`;
                actionPhase.pendingInvestigation = null;
            }
            
            const listTitle = document.createElement('h4');
            listTitle.textContent = 'Escolha um jogador para investigar:';
            actionUiContainer.appendChild(listTitle);

            const list = document.createElement('div');
            list.className = 'player-list-action';
            players.filter(p => p.isAlive && p.name !== player.name).forEach(target => {
                const targetEl = document.createElement('div');
                targetEl.textContent = target.name;
                targetEl.className = 'player-name';
                targetEl.onclick = () => {
                    actionPhase.investigationChoice = target.name;
                    if (gameSettings.detectiveMode === 'rapido') {
                        const targetPlayer = players.find(p => p.name === target.name);
                        const result = isGoodGuy(targetPlayer) ? 'É da Maioria' : 'NÃO é da Maioria';
                        listTitle.textContent = `Resultado sobre ${target.name}: ${result}.`;
                    } else {
                         listTitle.textContent = `Investigação sobre ${target.name} iniciada. O resultado virá na próxima rodada.`;
                    }
                    list.innerHTML = '';
                };
                list.appendChild(targetEl);
            });
            actionUiContainer.appendChild(list);
        }
        
        if (actionPhase.activeRoles.includes('vidente') && player.role === 'Vidente') {
            hasAction = true;
            const title = document.createElement('h4');
            const chances = [0.12, 0.08, 0.05];
            const chance = (roundNumber <= chances.length) ? chances[roundNumber - 1] : 0.01;

            if (Math.random() < chance) {
                const goodGuys = players.filter(p => p.isAlive && p.name !== player.name && isGoodGuy(p));
                if (goodGuys.length > 0) {
                    const ally = goodGuys[Math.floor(Math.random() * goodGuys.length)];
                    title.textContent = `Você teve uma visão: ${ally.name} também é do bem.`;
                } else {
                    title.textContent = 'Você tentou ter uma visão, mas a névoa está muito densa.';
                }
            } else {
                title.textContent = 'Nenhuma visão para você nesta rodada.';
            }
            actionUiContainer.appendChild(title);
        }

        if (!hasAction) {
            actionPhaseMessage.style.display = 'block';
            actionPhaseMessage.textContent = defaultMessage;
        }

        actionPhaseContinueBtn.onclick = () => {
            clearInterval(timerInterval);
            actionPhase.currentPlayerIndex++;
            if (actionPhase.currentPlayerIndex < players.length) {
                runPlayerActionTurn();
            } else {
                processAllActions();
                triggerPreDiscussionEvent();
            }
        };
    }

    function processAllActions() {
        if (actionPhase.protectionChoice) {
            actionPhase.lastProtected = actionPhase.protectionChoice;
        }
        if (actionPhase.investigationChoice) {
            const detective = players.find(p => p.role === 'Detetive');
            if (gameSettings.detectiveMode === 'lento') {
                actionPhase.pendingInvestigation = { investigator: detective.name, target: actionPhase.investigationChoice };
            }
        }
    }

    function triggerPreDiscussionEvent() {
        if (!gameSettings.events || Math.random() > 0.4) {
            startDiscussionPhase();
            return;
        }

        const alivePlayersCount = players.filter(p => p.isAlive).length;
        let possibleEvents = randomEvents.filter(e => e.type === 'pre-discussion');

        if (alivePlayersCount < 5) {
            possibleEvents = possibleEvents.filter(event => event.action !== 'pairVote');
        }

        if (possibleEvents.length === 0) {
            startDiscussionPhase();
            return;
        }

        const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        activeEvent = { name: event.name, description: event.description, action: event.action, details: {} };

        if (event.action === 'pairVote') {
            let alivePlayerNames = players.filter(p => p.isAlive).map(p => p.name);
            alivePlayerNames.sort(() => Math.random() - 0.5);
            const pairs = [];
            for (let i = 0; i < alivePlayerNames.length; i += 2) {
                if (i + 1 < alivePlayerNames.length) pairs.push([alivePlayerNames[i], alivePlayerNames[i + 1]]);
                else pairs.push([alivePlayerNames[i]]);
            }
            activeEvent.details.pairs = pairs;
        }

        eventTitle.textContent = activeEvent.name;
        eventDescription.textContent = activeEvent.description;
        eventModal.style.display = 'block';
        closeEventModal.onclick = () => {
            eventModal.style.display = 'none';
            startDiscussionPhase();
        };
    }

    function startDiscussionPhase() {
        if (!startPlayerInfo.textContent) {
            const startingPlayerIndex = Math.floor(Math.random() * players.length);
            startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa!`;
        }
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
                    if (player) createPlayerItem(player, `pair-color-${(pairIndex % 5) + 1}`);
                });
            });
        } else {
            alivePlayers.forEach(player => createPlayerItem(player));
        }
    }

    function createPlayerItem(player, pairClass = '') {
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        if (pairClass) playerItem.classList.add(pairClass);

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
        if (playerName === actionPhase.lastProtected) {
            showInfoModal('Anjo em Ação!', `${playerName} foi o mais votado, mas foi salvo pelo Anjo da Guarda! Ninguém foi eliminado.`, startRound);
            return;
        }
        
        const playerIndex = players.findIndex(p => p.name === playerName);
        if (playerIndex > -1) {
            players[playerIndex].isAlive = false;
            eliminatedPlayers.push(players[playerIndex]);
        }

        showInfoModal("Eliminação", `${playerName} foi eliminado(a)!`, () => checkEndGame(players[playerIndex]));
    }
    
    function checkEndGame(eliminatedPlayer) {
        const alivePlayers = players.filter(p => p.isAlive);
        const aliveInfiltrators = alivePlayers.filter(p => p.role === 'Infiltrado' || p.role === 'Cúmplice');
        const aliveGoodGuys = alivePlayers.filter(p => p.role !== 'Infiltrado' && p.role !== 'Cúmplice' && p.role !== 'Bobo');

        if (eliminatedPlayer.role === 'Bobo') {
            endGame('bobo', eliminatedPlayer);
            return;
        }
        if (aliveInfiltrators.length === 0) {
            endGame('majority');
            return;
        }
        if (aliveGoodGuys.length === 0) {
            endGame('infiltrators');
            return;
        }
        if (alivePlayers.length <= 2) {
            endGame('infiltrators');
            return;
        }

        triggerPostEliminationEvent();
    }

    function triggerPostEliminationEvent() {
        if (!gameSettings.events || Math.random() > 0.4) {
            startRound();
            return;
        }

        let possibleEvents = randomEvents.filter(e => e.type === 'post-elimination');
        if (eliminatedPlayers.length === 0) {
            startRound();
            return;
        }

        const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
        activeEvent = { name: event.name, description: event.description, action: event.action, details: {} };

        const randomEliminated = eliminatedPlayers[Math.floor(Math.random() * eliminatedPlayers.length)];
        let revealText = (event.action === 'revealWordAndRole')
            ? `A palavra de ${randomEliminated.name} (${randomEliminated.role}) era: "${randomEliminated.word}"`
            : `A palavra de um jogador eliminado era: "${randomEliminated.word}"`;
        activeEvent.description = event.description + `\n\n${revealText}`;
        
        eventTitle.textContent = activeEvent.name;
        eventDescription.textContent = activeEvent.description;
        eventModal.style.display = 'block';
        closeEventModal.onclick = () => {
            eventModal.style.display = 'none';
            startRound();
        };
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
    
    function showInfoModal(title, description, callback) {
        infoModalTitle.textContent = title;
        infoModalDescription.textContent = description;
        infoModal.style.display = 'block';
        infoModalContinueBtn.onclick = () => {
            infoModal.style.display = 'none';
            if (callback) callback();
        };
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
        const rolesToDisplay = {bobo: rules.bobo, cumplice: rules.cumplice, anjo: rules.anjo, detetive: rules.detetive, vidente: rules.vidente};
        for (const key in rolesToDisplay) {
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
        gameSettings = { bobo: false, cumplice: false, anjo: false, detetive: false, vidente: false, events: false, actionTimer: 10 };
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

    detetiveToggle.addEventListener('change', () => {
        detectiveModeOption.classList.toggle('hidden', !detetiveToggle.checked);
    });

    actionTimerSlider.addEventListener('input', (e) => {
        actionTimerValue.textContent = e.target.value;
    });

    startCustomGameBtn.addEventListener('click', () => {
        gameSettings = {
            bobo: boboToggle.checked,
            cumplice: cumpliceToggle.checked,
            anjo: anjoToggle.checked,
            detetive: detetiveToggle.checked,
            vidente: videnteToggle.checked,
            detectiveMode: document.querySelector('input[name="detectiveMode"]:checked').value,
            events: eventsToggle.checked,
            actionTimer: parseInt(actionTimerSlider.value, 10),
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
            startRound();
        }
    });

    playAgainBtn.addEventListener('click', () => {
        playerNamesInput.value = '';
        switchScreen('mainMenu');
    });

    skipRoundBtn.addEventListener('click', startRound);

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const ruleKey = e.target.dataset.rule;
            showInfoModal(rules[ruleKey].title, rules[ruleKey].description);
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
    
    const allCloseBtns = [closeInfoModal, closeEventModal, closeRevealModalBtn, closeConfirmModalBtn];
    allCloseBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => btn.closest('.modal').style.display = 'none');
    });

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});