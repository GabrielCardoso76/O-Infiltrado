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

function initializeGame() {
    const names = playerNamesInput.value.trim().split(' ').filter(name => name);
    let requiredPlayers = 3;

    if(gameSettings.randomMode) {
        randomizeRoles(names.length);
    }

    if (gameSettings.bobo || gameSettings.cumplice || gameSettings.anjo || gameSettings.detetive || gameSettings.vidente || gameSettings.coveiro || gameSettings.agenteDuplo || gameSettings.mimico) requiredPlayers = 4;
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

function startRound() {
    roundNumber++;
    activeEvent = null;
    const actionRoles = [];
    if (gameSettings.anjo) actionRoles.push('anjo');
    if (gameSettings.detetive) actionRoles.push('detetive');
    if (gameSettings.vidente) actionRoles.push('vidente');
    if (gameSettings.coveiro) actionRoles.push('coveiro');
    if (gameSettings.agenteDuplo) actionRoles.push('agenteDuplo');
    if (gameSettings.mimico) actionRoles.push('mimico');

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

        showActionUIForPlayer(player);
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

function startDiscussionPhase() {
    if (gameSettings.discussionTime > 0) {
        startDiscussionTimer(gameSettings.discussionTime);
    }
    if (!startPlayerInfo.textContent) {
        const startingPlayerIndex = Math.floor(Math.random() * players.length);
        startPlayerInfo.textContent = `${players[startingPlayerIndex].name} começa!`;
    }
    renderPlayerList();
    switchScreen('game');
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

function endGame(winnerType, winningPlayer = null) {
    switchScreen('end');
    let resultText = '';
    const infiltrator = players.find(p => p.role === 'Infiltrado');

    if (gameSettings.finalRevelation === 'infiltratorOnly') {
        resultText = `O Infiltrado era ${infiltrator.name}.`;
    } else if (gameSettings.finalRevelation === 'infiltratorAndAccomplice') {
        const accomplice = players.find(p => p.role === 'Cúmplice');
        resultText = `O Infiltrado era ${infiltrator.name}.`;
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
