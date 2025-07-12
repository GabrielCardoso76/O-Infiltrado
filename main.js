document.addEventListener('DOMContentLoaded', () => {
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
    const randomModeToggle = document.getElementById('random-mode-toggle');
    const manualRolesContainer = document.getElementById('manual-roles-container');
    const boboToggle = document.getElementById('bobo-toggle');
    const cumpliceToggle = document.getElementById('cumplice-toggle');
    const anjoToggle = document.getElementById('anjo-toggle');
    const detetiveToggle = document.getElementById('detetive-toggle');
    const videnteToggle = document.getElementById('vidente-toggle');
    const coveiroToggle = document.getElementById('coveiro-toggle');
    const agenteDuploToggle = document.getElementById('agente-duplo-toggle');
    const mimicoToggle = document.getElementById('mimico-toggle');
    const detectiveModeOption = document.getElementById('detective-mode-option');
    const eventsToggle = document.getElementById('events-toggle');
    const eventsConfigContainer = document.getElementById('events-config-container');
    const specificEventsList = document.getElementById('specific-events-list');
    const minActionTimerSlider = document.getElementById('min-action-timer-slider');
    const maxActionTimerSlider = document.getElementById('max-action-timer-slider');
    const minTimerValue = document.getElementById('min-timer-value');
    const maxTimerValue = document.getElementById('max-timer-value');
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

    populateHowToPlayScreen();
    populateEventToggles();

    classicGameBtn.addEventListener('click', () => {
        gameSettings = {
            isClassic: true,
            randomMode: false,
            bobo: false,
            cumplice: false,
            anjo: false,
            detetive: false,
            vidente: false,
            coveiro: false,
            agenteDuplo: false,
            mimico: false,
            events: false,
            minActionTimer: 5,
            maxActionTimer: 15,
            discussionTime: 3,
            revelationMode: 'default',
            finalRevelation: 'all'
        };
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

    randomModeToggle.addEventListener('change', () => {
        manualRolesContainer.classList.toggle('hidden', randomModeToggle.checked);
    });

    eventsToggle.addEventListener('change', () => {
        eventsConfigContainer.classList.toggle('hidden', !eventsToggle.checked);
    });

    detetiveToggle.addEventListener('change', () => {
        detectiveModeOption.classList.toggle('hidden', !detetiveToggle.checked);
    });

    minActionTimerSlider.addEventListener('input', (e) => {
        minTimerValue.textContent = e.target.value;
        if (parseInt(e.target.value) > parseInt(maxActionTimerSlider.value)) {
            maxActionTimerSlider.value = e.target.value;
            maxTimerValue.textContent = e.target.value;
        }
    });

    maxActionTimerSlider.addEventListener('input', (e) => {
        maxTimerValue.textContent = e.target.value;
        if (parseInt(e.target.value) < parseInt(minActionTimerSlider.value)) {
            minActionTimerSlider.value = e.target.value;
            minTimerValue.textContent = e.target.value;
        }
    });

    const discussionTimeSlider = document.getElementById('discussion-time-slider');
    const discussionTimeValue = document.getElementById('discussion-time-value');
    discussionTimeSlider.addEventListener('input', (e) => {
        discussionTimeValue.textContent = e.target.value;
    });

    startCustomGameBtn.addEventListener('click', () => {
        const enabledEvents = [];
        if (eventsToggle.checked) {
            document.querySelectorAll('#specific-events-list input[type="checkbox"]:checked').forEach(checkbox => {
                enabledEvents.push(checkbox.dataset.eventId);
            });
        }

        gameSettings = {
            isClassic: false,
            randomMode: randomModeToggle.checked,
            bobo: boboToggle.checked,
            cumplice: cumpliceToggle.checked,
            anjo: anjoToggle.checked,
            detetive: detetiveToggle.checked,
            vidente: videnteToggle.checked,
            coveiro: coveiroToggle.checked,
            agenteDuplo: agenteDuploToggle.checked,
            mimico: mimicoToggle.checked,
            detectiveMode: document.querySelector('input[name="detectiveMode"]:checked').value,
            events: eventsToggle.checked,
            enabledEvents: enabledEvents,
            minActionTimer: parseInt(minActionTimerSlider.value, 10),
            maxActionTimer: parseInt(maxActionTimerSlider.value, 10),
            discussionTime: parseInt(document.getElementById('discussion-time-slider').value, 10),
            revelationMode: document.querySelector('input[name="revelationMode"]:checked').value,
            finalRevelation: document.querySelector('input[name="finalRevelation"]:checked').value,
        };
        initializeGame();
    });

    wordCard.addEventListener('click', () => {
        if (!wordRevealed) {
            const currentPlayer = players[currentPlayerIndex];
            if (gameSettings.revelationMode !== 'hidden') {
                roleDisplay.textContent = currentPlayer.role;
            }
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
            showInfoModal(rules[e.target.dataset.rule].title, rules[e.target.dataset.rule].description);
        });
    });

    confirmEliminateBtn.addEventListener('click', () => {
        if (playerToEliminate) {
            eliminatePlayer(playerToEliminate);
        }
        confirmEliminationModal.style.display = 'none';
    });

    modalWord.addEventListener('click', () => modalWord.classList.toggle('is-hidden'));

    const handleInfoModalClose = () => {
        const callback = infoModalContinueBtn.onclick;
        infoModal.style.display = 'none';
        infoModalContinueBtn.onclick = null;
        if (typeof callback === 'function') callback();
    };

    const handleEventModalClose = () => {
        const callback = closeEventModal.onclick;
        eventModal.style.display = 'none';
        closeEventModal.onclick = null;
        if (typeof callback === 'function') callback();
    };

    closeInfoModal.addEventListener('click', handleInfoModalClose);
    infoModalContinueBtn.addEventListener('click', handleInfoModalClose);
    closeEventModal.addEventListener('click', handleEventModalClose);
    closeRevealModalBtn.addEventListener('click', () => reRevealModal.style.display = 'none');
    closeConfirmModalBtn.addEventListener('click', () => confirmEliminationModal.style.display = 'none');
    cancelEliminateBtn.addEventListener('click', () => confirmEliminationModal.style.display = 'none');

    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            switch (event.target.id) {
                case 'event-modal':
                    handleEventModalClose();
                    break;
                case 'info-modal':
                    handleInfoModalClose();
                    break;
                default:
                    event.target.style.display = 'none';
                    break;
            }
        }
    });
});
