function assignRolesAndWords(names) {
    currentWordPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    const { majority: majorityWord, infiltrator: infiltratorWord, category: pairCategory } = currentWordPair;

    let availablePlayers = [...names];
    players = [];
    let rolesToAssign = [];

    rolesToAssign.push({ role: 'Infiltrado', word: infiltratorWord });
    if (gameSettings.bobo) {
        const filteredBoboWords = boboWords.filter(bw => bw.category !== pairCategory);
        const randomBoboEntry = filteredBoboWords[Math.floor(Math.random() * filteredBoboWords.length)];
        rolesToAssign.push({ role: 'Bobo', word: randomBoboEntry.word });
    }
    if (gameSettings.cumplice) rolesToAssign.push({ role: 'Cúmplice', word: infiltratorWord });
    if (gameSettings.anjo) rolesToAssign.push({ role: 'Anjo da Guarda', word: majorityWord });
    if (gameSettings.detetive) rolesToAssign.push({ role: 'Detetive', word: majorityWord });
    if (gameSettings.vidente) rolesToAssign.push({ role: 'Vidente', word: majorityWord });
    if (gameSettings.coveiro) rolesToAssign.push({ role: 'Coveiro', word: majorityWord });
    if (gameSettings.agenteDuplo) rolesToAssign.push({ role: 'Agente Duplo', word: majorityWord });
    if (gameSettings.mimico) rolesToAssign.push({ role: 'Mímico', word: '' });

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

function showActionUIForPlayer(player, screens, actionUiContainer, actionPhaseMessage, actionPhaseContinueBtn) {
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
        const chances = [0.25, 0.15, 0.10];
        const chance = (roundNumber <= chances.length) ? chances[roundNumber - 1] : 0.05;

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

    if (actionPhase.activeRoles.includes('coveiro') && player.role === 'Coveiro' && eliminatedPlayers.length > 0) {
        hasAction = true;
        const lastEliminated = eliminatedPlayers[eliminatedPlayers.length - 1];
        const title = document.createElement('h4');
        title.textContent = `O Coveiro informa: ${lastEliminated.name} era ${lastEliminated.role}.`;
        actionUiContainer.appendChild(title);
    }

    if (actionPhase.activeRoles.includes('agenteDuplo') && player.role === 'Infiltrado') {
        const agenteDuplo = players.find(p => p.role === 'Agente Duplo');
        if (agenteDuplo && agenteDuplo.isAlive) {
            hasAction = true;
            const title = document.createElement('h4');
            title.textContent = `Ativar o Agente Duplo? (${agenteDuplo.name})`;
            actionUiContainer.appendChild(title);

            const activateBtn = document.createElement('button');
            activateBtn.textContent = 'Ativar';
            activateBtn.className = 'btn';
            activateBtn.onclick = () => {
                agenteDuplo.role = 'Cúmplice';
                title.textContent = `${agenteDuplo.name} foi ativado e agora é um Cúmplice.`;
                actionUiContainer.removeChild(activateBtn);
            };
            actionUiContainer.appendChild(activateBtn);
        }
    }

    if (actionPhase.activeRoles.includes('mimico') && player.role === 'Mímico' && roundNumber === 1) {
        hasAction = true;
        const infiltrado = players.find(p => p.role === 'Infiltrado');
        const title = document.createElement('h4');
        title.textContent = `O Mímico vê: ${infiltrado.name} é o Infiltrado.`;
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
            runPlayerActionTurn(screens, document.getElementById('action-phase-instruction'), document.getElementById('action-ui-container'), document.getElementById('action-phase-message'), document.getElementById('action-phase-continue-btn'), document.getElementById('action-timer-display'));
        } else {
            processAllActions();
            triggerPreDiscussionEvent(
                document.getElementById('discussion-timer'),
                document.getElementById('start-player-info'),
                document.getElementById('players-list'),
                screens,
                document.getElementById('event-title'),
                document.getElementById('event-description'),
                document.getElementById('event-modal'),
                document.getElementById('close-event-modal')
            );
        }
    };
}
