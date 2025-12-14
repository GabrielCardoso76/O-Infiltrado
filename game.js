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
let questionModeData = {
    currentPlayerIndex: 0,
    questions: []
};


function initializeGame(playerNamesInput, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo) {
    const names = playerNamesInput.value.trim().split(' ').filter(name => name);
    initializeGameWithNames(names, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo);
}

function initializeGameWithNames(names, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo) {
    let requiredPlayers = 3;

    if(gameSettings.randomMode) {
        randomizeRoles(names.length);
    }

    if (gameSettings.bobo || gameSettings.cumplice || gameSettings.anjo || gameSettings.detetive || gameSettings.vidente || gameSettings.coveiro || gameSettings.agenteDuplo || gameSettings.mimico) requiredPlayers = 4;
    if (names.length < requiredPlayers) {
        alert(`São necessários pelo menos ${requiredPlayers} jogadores para esta configuração.`);
        return;
    }

    if (gameSettings.isQuestionsMode) {
        assignRolesAndWordsForQuestions(names);
    } else {
        assignRolesAndWords(names);
    }

    currentPlayerIndex = 0;
    eliminatedPlayers = [];
    roundNumber = 0;
    actionPhase.lastProtected = null;
    actionPhase.pendingInvestigation = null;
    startPlayerInfo.textContent = '';
    setupRevealPhase(playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn);
    switchScreen(screens, 'reveal');
}

function randomizeRoles(playerCount) {
    const allRoles = ['bobo', 'cumplice', 'anjo', 'detetive', 'vidente', 'coveiro', 'agenteDuplo', 'mimico'];
    gameSettings.bobo = false;
    gameSettings.cumplice = false;
    gameSettings.anjo = false;
    gameSettings.detetive = false;
    gameSettings.vidente = false;
    gameSettings.coveiro = false;
    gameSettings.agenteDuplo = false;
    gameSettings.mimico = false;

    if (playerCount < 4) return;

    const maxRoles = Math.min(allRoles.length, playerCount - 3);
    const numToActivate = Math.floor(Math.random() * (maxRoles + 1));

    const shuffledRoles = allRoles.sort(() => 0.5 - Math.random());
    const rolesToActivate = shuffledRoles.slice(0, numToActivate);

    rolesToActivate.forEach(role => {
        gameSettings[role] = true;
    });
}

function startRound(actionPhaseTitle, screens, actionPhaseInstruction, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn, actionTimerDisplay, discussionTimerDisplay, startPlayerInfo, playersListDiv, eventTitle, eventDescription, eventModal, closeEventModal) {
    roundNumber++;
    activeEvent = null;

    if (gameSettings.isQuestionsMode) {
        // In Questions Mode, we go to Question Phase first
        startQuestionPhase(screens, document.getElementById('question-player-turn-title'), document.getElementById('question-text'), document.getElementById('reveal-question-btn'), document.getElementById('next-question-btn'));
        return;
    }

    const actionRoles = [];
    if (gameSettings.anjo) actionRoles.push('anjo');
    if (gameSettings.detetive) actionRoles.push('detetive');
    if (gameSettings.vidente) actionRoles.push('vidente');
    if (gameSettings.coveiro) actionRoles.push('coveiro');
    if (gameSettings.agenteDuplo) actionRoles.push('agenteDuplo');
    if (gameSettings.mimico) actionRoles.push('mimico');

    if (actionRoles.length > 0) {
        startActionPhase(actionRoles, actionPhaseTitle, screens, actionPhaseInstruction, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn, actionTimerDisplay);
    } else {
        triggerPreDiscussionEvent(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens, eventTitle, eventDescription, eventModal, closeEventModal);
    }
}

function startQuestionPhase(screens, titleElement, textElement, revealBtn, nextBtn) {
    // Generate questions for this round
    const themeKey = gameSettings.theme === 'random' ? Object.keys(questionThemes)[Math.floor(Math.random() * Object.keys(questionThemes).length)] : gameSettings.theme;
    const themeData = questionThemes[themeKey];
    // Simple shuffle questions
    const shuffledQuestions = [...themeData.questions].sort(() => 0.5 - Math.random());

    questionModeData.currentPlayerIndex = 0;
    // Assign a unique question to each alive player
    const alivePlayers = players.filter(p => p.isAlive);
    alivePlayers.forEach((player, index) => {
        player.currentQuestion = shuffledQuestions[index % shuffledQuestions.length];
    });

    // Setup UI for first player
    setupQuestionUI(alivePlayers[0], titleElement, textElement, revealBtn, nextBtn);
    switchScreen(screens, 'questionPhase');
}

function setupQuestionUI(player, titleElement, textElement, revealBtn, nextBtn) {
    titleElement.textContent = `Pergunta para: ${player.name}`;
    textElement.textContent = player.currentQuestion;
    textElement.style.display = 'none';
    revealBtn.classList.remove('hidden');
    nextBtn.classList.add('hidden');
    // nextBtn text check
    const alivePlayers = players.filter(p => p.isAlive);
    if (questionModeData.currentPlayerIndex === alivePlayers.length - 1) {
        nextBtn.textContent = 'Ir para Discussão';
    } else {
        nextBtn.textContent = 'Próximo';
    }
}

function handleNextQuestion(screens, titleElement, textElement, revealBtn, nextBtn, discussionTimerDisplay, startPlayerInfo, playersListDiv, eventTitle, eventDescription, eventModal, closeEventModal) {
    const alivePlayers = players.filter(p => p.isAlive);
    questionModeData.currentPlayerIndex++;

    if (questionModeData.currentPlayerIndex < alivePlayers.length) {
        setupQuestionUI(alivePlayers[questionModeData.currentPlayerIndex], titleElement, textElement, revealBtn, nextBtn);
    } else {
         startDiscussionPhase(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens);
    }
}

function startActionPhase(actionTypes, actionPhaseTitle, screens, actionPhaseInstruction, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn, actionTimerDisplay) {
    actionPhase.activeRoles = actionTypes;
    actionPhase.currentPlayerIndex = 0;
    actionPhase.protectionChoice = null;
    actionPhase.investigationChoice = null;

    actionPhaseTitle.textContent = 'Fase de Ação Secreta';
    switchScreen(screens, 'actionPhase');
    runPlayerActionTurn(screens, actionPhaseInstruction, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn, actionTimerDisplay);
}

function runPlayerActionTurn(screens, actionPhaseInstruction, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn, actionTimerDisplay) {
    const player = players[actionPhase.currentPlayerIndex];
    actionPhaseInstruction.textContent = `Passe o celular para ${player.name}`;
    actionUiContainer.innerHTML = '';
    actionPhaseMessage.style.display = 'block';
    actionPhaseMessage.textContent = 'Clique em "Pronto" quando receber o celular.';
    actionPhaseContinueBtn.textContent = 'Pronto';
    actionPhaseContinueBtn.disabled = false;

    const minTime = gameSettings.minActionTimer;
    const maxTime = gameSettings.maxActionTimer;
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    actionTimerDisplay.textContent = randomTime;

    actionPhaseContinueBtn.onclick = () => {
        actionPhaseInstruction.textContent = 'Ação Secreta';
        actionPhaseMessage.style.display = 'none';

        let timeLeft = randomTime;
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

        showActionUIForPlayer(player, screens, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn);
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

function startDiscussionPhase(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens) {
    if (gameSettings.discussionTime > 0) {
        startDiscussionTimer(gameSettings.discussionTime, discussionTimerDisplay);
    }
    if (!startPlayerInfo.textContent) {
        const startingPlayerIndex = Math.floor(Math.random() * players.length);
        startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa!`;
    }
    renderPlayerList(playersListDiv);
    switchScreen(screens, 'game');
}

function eliminatePlayer(playerName, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn, screens, gameResultInfo, winnerMessage) {
    const startRoundCb = () => startRound(
        document.getElementById('action-phase-title'),
        screens,
        document.getElementById('action-phase-instruction'),
        document.getElementById('action-ui-container'),
        document.getElementById('action-phase-message'),
        document.getElementById('action-phase-continue-btn'),
        document.getElementById('action-timer-display'),
        document.getElementById('discussion-timer'),
        document.getElementById('start-player-info'),
        document.getElementById('players-list'),
        document.getElementById('event-title'),
        document.getElementById('event-description'),
        document.getElementById('event-modal'),
        document.getElementById('close-event-modal')
    );

    if (playerName === actionPhase.lastProtected) {
        showInfoModal('Anjo em Ação!', `${playerName} foi o mais votado, mas foi salvo pelo Anjo da Guarda! Ninguém foi eliminado.`, startRoundCb, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn);
        return;
    }

    const playerIndex = players.findIndex(p => p.name === playerName);
    if (playerIndex > -1) {
        players[playerIndex].isAlive = false;
        eliminatedPlayers.push(players[playerIndex]);
    }

    showInfoModal("Eliminação", `${playerName} foi eliminado(a)!`, () => checkEndGame(players[playerIndex], screens, gameResultInfo, winnerMessage), infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn);
}

function checkEndGame(eliminatedPlayer, screens, gameResultInfo, winnerMessage) {
    const alivePlayers = players.filter(p => p.isAlive);
    const aliveInfiltrators = alivePlayers.filter(p => p.role === 'Infiltrado' || p.role === 'Cúmplice');
    const aliveGoodGuys = alivePlayers.filter(p => p.role !== 'Infiltrado' && p.role !== 'Cúmplice' && p.role !== 'Bobo');

    if (eliminatedPlayer.role === 'Bobo') {
        endGame('bobo', eliminatedPlayer, screens, gameResultInfo, winnerMessage);
        return;
    }
    if (aliveInfiltrators.length === 0) {
        endGame('majority', null, screens, gameResultInfo, winnerMessage);
        return;
    }
    if (aliveGoodGuys.length === 0) {
        endGame('infiltrators', null, screens, gameResultInfo, winnerMessage);
        return;
    }

    // Condition for Infiltrators win when ratio is met (e.g. 2 impostors vs 2 good guys)
    if (aliveInfiltrators.length >= aliveGoodGuys.length) {
         endGame('infiltrators', null, screens, gameResultInfo, winnerMessage);
         return;
    }

    triggerPostEliminationEvent();
}

function endGame(winnerType, winningPlayer = null, screens, gameResultInfo, winnerMessage) {
    switchScreen(screens, 'end');
    let resultText = '';
    const infiltrators = players.filter(p => p.role === 'Infiltrado');

    if (gameSettings.finalRevelation === 'infiltratorOnly') {
        resultText = `Infiltrado(s): ${infiltrators.map(i => i.name).join(', ')}.`;
    } else if (gameSettings.finalRevelation === 'infiltratorAndAccomplice') {
        const accomplice = players.find(p => p.role === 'Cúmplice');
        resultText = `Infiltrado(s): ${infiltrators.map(i => i.name).join(', ')}.`;
        if (accomplice) {
            resultText += `\nO Cúmplice era ${accomplice.name}.`;
        }
    } else if (gameSettings.finalRevelation === 'all') {
        players.forEach(p => {
            resultText += `${p.name} era ${p.role} com a palavra "${p.word}".\n`;
        });
    } else {
        resultText = `O jogo acabou.`;
    }

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
