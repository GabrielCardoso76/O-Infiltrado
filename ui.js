function switchScreen(screens, screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function setupRevealPhase(playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn) {
    const currentPlayer = players[currentPlayerIndex];
    playerTurnTitle.textContent = `Vez de: ${currentPlayer.name}`;
    roleDisplay.textContent = '';
    wordDisplay.textContent = 'Clique para revelar';
    wordCard.style.filter = 'blur(8px)';
    wordRevealed = false;
    prevPlayerBtn.style.visibility = currentPlayerIndex === 0 ? 'hidden' : 'visible';
    nextPlayerBtn.textContent = (currentPlayerIndex === players.length - 1) ? 'Jogar!' : '→';
}

function renderPlayerList(playersListDiv) {
    playersListDiv.innerHTML = '';
    const alivePlayers = players.filter(p => p.isAlive);

    if (activeEvent && activeEvent.id === 'pairVote') {
        const pairs = activeEvent.details.pairs;
        pairs.forEach((pair, pairIndex) => {
            pair.forEach(playerName => {
                const player = alivePlayers.find(p => p.name === playerName);
                if (player) createPlayerItem(player, `pair-color-${(pairIndex % 5) + 1}`, playersListDiv);
            });
        });
    } else {
        alivePlayers.forEach(player => createPlayerItem(player, '', playersListDiv));
    }
}

function createPlayerItem(player, pairClass = '', playersListDiv) {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    if (pairClass) playerItem.classList.add(pairClass);

    const playerNameSpan = document.createElement('span');
    playerNameSpan.className = 'player-name';
    playerNameSpan.textContent = player.name;
    playerNameSpan.onclick = () => showReRevealModal(player.role, player.word, document.getElementById('modal-role'), document.getElementById('modal-word'), document.getElementById('re-reveal-modal'));

    const eliminateBtn = document.createElement('button');
    eliminateBtn.className = 'btn btn-danger';
    eliminateBtn.textContent = 'Eliminar';
    eliminateBtn.onclick = (e) => {
        e.stopPropagation();
        promptElimination(player.name, document.getElementById('player-to-eliminate-name'), document.getElementById('confirm-elimination-modal'));
    };

    playerItem.appendChild(playerNameSpan);
    playerItem.appendChild(eliminateBtn);
    playersListDiv.appendChild(playerItem);
}

function promptElimination(playerName, playerToEliminateName, confirmEliminationModal) {
    playerToEliminate = playerName;
    playerToEliminateName.textContent = playerName;
    confirmEliminationModal.style.display = 'block';
}

function showInfoModal(title, description, callback, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn) {
    infoModalTitle.textContent = title;
    infoModalDescription.textContent = description;
    infoModal.style.display = 'block';
    infoModalContinueBtn.onclick = () => {
        infoModal.style.display = 'none';
        if (callback) callback();
    };
}

function showReRevealModal(role, word, modalRole, modalWord, reRevealModal) {
    if (gameSettings.revelationMode === 'hidden') {
        modalRole.textContent = '';
    } else {
        modalRole.textContent = role;
    }
    modalWord.textContent = word;
    modalWord.classList.add('is-hidden');
    reRevealModal.style.display = 'block';
}

function populateHowToPlayScreen(rolesListDetailed, eventsListDetailed) {
    rolesListDetailed.innerHTML = '';
    eventsListDetailed.innerHTML = '';
    const rolesToDisplay = {bobo: rules.bobo, cumplice: rules.cumplice, anjo: rules.anjo, detetive: rules.detetive, vidente: rules.vidente, coveiro: rules.coveiro, agenteDuplo: rules.agenteDuplo, mimico: rules.mimico};
    for (const key in rolesToDisplay) {
        const rule = rolesToDisplay[key];
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

    const flowTitle = document.createElement('h3');
    flowTitle.textContent = 'Fluxo de Jogo';
    rolesListDetailed.appendChild(flowTitle);

    const flowList = document.createElement('div');
    flowList.className = 'rule-item-detailed';
    flowList.innerHTML = `
        <p><strong>Configuração:</strong> Defina os jogadores e as regras da partida.</p>
        <p><strong>Revelação:</strong> Cada jogador descobre seu papel e/ou palavra secreta.</p>
        <p><strong>Discussão com Tempo:</strong> (Opcional) Um tempo definido para todos discutirem livremente.</p>
        <p><strong>Fase de Ação Secreta:</strong> Papéis especiais realizam suas ações em segredo.</p>
        <p><strong>Votação:</strong> Os jogadores votam para eliminar quem eles acham que é o Infiltrado.</p>
    `;
    rolesListDetailed.appendChild(flowList);

    const hiddenModeTitle = document.createElement('h3');
    hiddenModeTitle.textContent = 'Modo de Revelação Oculto';
    rolesListDetailed.appendChild(hiddenModeTitle);

    const hiddenModeDesc = document.createElement('div');
    hiddenModeDesc.className = 'rule-item-detailed';
    hiddenModeDesc.innerHTML = `<p>No modo de revelação oculto, os jogadores veem apenas a sua palavra, não o seu papel. Isso significa que você precisa deduzir se é da Maioria, o Infiltrado ou o Bobo com base na palavra que recebeu e nas discussões.</p>`;
    rolesListDetailed.appendChild(hiddenModeDesc);
}

function populateEventToggles(specificEventsList) {
    specificEventsList.innerHTML = '';
    randomEvents.forEach(event => {
        const item = document.createElement('div');
        item.className = 'option-item';
        item.innerHTML = `
            <label for="event-toggle-${event.id}">${event.name}</label>
            <label class="switch"><input type="checkbox" id="event-toggle-${event.id}" data-event-id="${event.id}" checked><span class="slider"></span></label>
        `;
        specificEventsList.appendChild(item);
    });
}

function startDiscussionTimer(duration, discussionTimerDisplay) {
    let timer = duration * 60;
    discussionTimerDisplay.style.display = 'block';

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        discussionTimerDisplay.textContent = `${minutes}:${seconds}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            discussionTimerDisplay.style.display = 'none';
        }
    }, 1000);
}
