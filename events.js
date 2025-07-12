const randomEvents = [
    { id: 'pairVote', name: 'Voto em Dupla', description: 'Nesta rodada, a votação será em duplas! Os jogadores com a mesma cor na borda devem discutir e votar juntos em uma única pessoa.', type: 'pre-discussion' },
    { id: 'revealWordAndRole', name: 'Palavra e Papel Revelados', description: 'A palavra e o papel de um jogador eliminado aleatoriamente serão revelados a todos, dando uma nova pista!', type: 'post-elimination' },
    { id: 'revealWordOnly', name: 'Palavra Misteriosa Revelada', description: 'A palavra de um jogador eliminado aleatoriamente será revelada, mas não o seu papel. Usem a informação com sabedoria!', type: 'post-elimination' },
    { id: 'silentRound', name: 'Rodada Silenciosa', description: 'Proibido falar! A discussão desta rodada deve ser feita apenas com mímica e gestos.', type: 'pre-discussion' },
    { id: 'openVote', name: 'Voto Aberto', description: 'Sem segredos! Nesta rodada, todos devem anunciar seu voto abertamente, um de cada vez, em sentido horário.', type: 'pre-discussion' },
    { id: 'wordSwap', name: 'Troca de Palavras', description: 'Todos os jogadores da Maioria recebem uma nova palavra (da mesma categoria da original). O Infiltrado e o Bobo mantêm suas palavras.', type: 'post-elimination' },
    { id: 'fastRound', name: 'Rodada Rápida', description: 'O tempo para discussão e votação é limitado a um cronômetro na tela.', type: 'pre-discussion' }
];

function triggerPreDiscussionEvent(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens, eventTitle, eventDescription, eventModal, closeEventModal) {
    if (!gameSettings.events || Math.random() > 0.20) {
        startDiscussionPhase(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens);
        return;
    }

    const alivePlayersCount = players.filter(p => p.isAlive).length;
    let possibleEvents = gameSettings.enabledEvents.filter(id => {
        const eventData = randomEvents.find(e => e.id === id);
        return eventData && eventData.type === 'pre-discussion';
    });

    if (alivePlayersCount < 5) {
        possibleEvents = possibleEvents.filter(id => id !== 'pairVote');
    }

    if (possibleEvents.length === 0) {
        startDiscussionPhase(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens);
        return;
    }

    const eventId = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    const event = randomEvents.find(e => e.id === eventId);
    activeEvent = { id: event.id, name: event.name, description: event.description, details: {} };

    if (event.id === 'pairVote') {
        let alivePlayerNames = players.filter(p => p.isAlive).map(p => p.name);
        alivePlayerNames.sort(() => Math.random() - 0.5);
        const pairs = [];
        for (let i = 0; i < alivePlayerNames.length; i += 2) {
            if (i + 1 < alivePlayerNames.length) pairs.push([alivePlayerNames[i], alivePlayerNames[i + 1]]);
            else pairs.push([alivePlayerNames[i]]);
        }
        activeEvent.details.pairs = pairs;
    }

    if (event.id === 'fastRound') {
        startDiscussionTimer(gameSettings.discussionTime, discussionTimerDisplay);
    }

    eventTitle.textContent = activeEvent.name;
    eventDescription.textContent = activeEvent.description;
    eventModal.style.display = 'block';
    closeEventModal.onclick = () => {
        eventModal.style.display = 'none';
        startDiscussionPhase(discussionTimerDisplay, startPlayerInfo, playersListDiv, screens);
    };
}

function triggerPostEliminationEvent() {
    if (!gameSettings.events || Math.random() > 0.20) {
        startRound();
        return;
    }

    let possibleEvents = gameSettings.enabledEvents.filter(id => {
        const eventData = randomEvents.find(e => e.id === id);
        return eventData && eventData.type === 'post-elimination';
    });

    if (eliminatedPlayers.length === 0 || possibleEvents.length === 0) {
        startRound();
        return;
    }

    const eventId = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    const event = randomEvents.find(e => e.id === eventId);
    activeEvent = { id: event.id, name: event.name, description: event.description, details: {} };

    const randomEliminated = eliminatedPlayers[Math.floor(Math.random() * eliminatedPlayers.length)];
    let revealText = '';

    if (event.id === 'wordSwap') {
        const newWordPair = wordPairs.find(wp => wp.category === currentWordPair.category && wp.majority !== currentWordPair.majority);
        if (newWordPair) {
            currentWordPair = newWordPair;
            players.forEach(p => {
                if (p.role === 'Maioria' || p.role === 'Anjo da Guarda' || p.role === 'Detetive' || p.role === 'Vidente' || p.role === 'Coveiro' || p.role === 'Agente Duplo') {
                    p.word = newWordPair.majority;
                }
            });
            revealText = 'As palavras da maioria foram trocadas!';
        } else {
            revealText = 'As palavras da maioria não puderam ser trocadas.';
        }
    } else {
        revealText = (event.id === 'revealWordAndRole')
            ? `A palavra de ${randomEliminated.name} (${randomEliminated.role}) era: "${randomEliminated.word}"`
            : `A palavra de um jogador eliminado era: "${randomEliminated.word}"`;
    }
    activeEvent.description = event.description + `\n\n${revealText}`;

    eventTitle.textContent = activeEvent.name;
    eventDescription.textContent = activeEvent.description;
    eventModal.style.display = 'block';
    closeEventModal.onclick = () => {
        eventModal.style.display = 'none';
        startRound();
    };
}
