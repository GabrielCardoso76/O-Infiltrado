let screens = {};

document.addEventListener('DOMContentLoaded', () => {
    screens = {
        mainMenu: document.getElementById('main-menu-screen'),
        howToPlay: document.getElementById('how-to-play-screen'),
        classicSetup: document.getElementById('classic-setup-screen'),
        customSetup: document.getElementById('custom-setup-screen'),
        questionsSetup: document.getElementById('questions-setup-screen'),
        reveal: document.getElementById('reveal-screen'),
        passPhone: document.getElementById('pass-phone-screen'),
        questionPhase: document.getElementById('question-phase-screen'),
        actionPhase: document.getElementById('action-phase-screen'),
        game: document.getElementById('game-screen'),
        end: document.getElementById('end-screen'),
    };

    // Pass Phone Elements
    const passPhoneName = document.getElementById('pass-phone-name');
    const confirmPassBtn = document.getElementById('confirm-pass-btn');
    const confirmPassNameSpan = document.getElementById('confirm-pass-name-span');

    const playerNamesInput = document.getElementById('player-names');
    const classicGameBtn = document.getElementById('classic-game-btn');
    const customSetupBtn = document.getElementById('custom-setup-btn');
    const questionsGameBtn = document.getElementById('questions-game-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const backToMenuFromHowToPlayBtn = document.getElementById('back-to-menu-from-how-to-play-btn');
    const rolesListDetailed = document.getElementById('roles-list-detailed');
    const eventsListDetailed = document.getElementById('events-list-detailed');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const backToMenuBtnTop = document.getElementById('back-to-menu-btn-top');
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
    const namelessImpostorToggle = document.getElementById('nameless-impostor-toggle');
    const twoImpostorsToggle = document.getElementById('two-impostors-toggle');
    const startCustomGameBtn = document.getElementById('start-custom-game-btn');
    const startQuestionsGameBtn = document.getElementById('start-questions-game-btn');
    const backToMenuFromQuestionsBtn = document.getElementById('back-to-menu-from-questions-btn');
    const questionsThemeSelect = document.getElementById('questions-theme-select');
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
    const playSamePlayersBtn = document.getElementById('play-same-players-btn');
    const exitBtn = document.getElementById('exit-btn');
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

    // Settings Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModalBtn = document.getElementById('close-settings-modal');

    // Questions Mode Elements
    const questionPlayerTurnTitle = document.getElementById('question-player-turn-title');
    const questionText = document.getElementById('question-text');
    const revealQuestionBtn = document.getElementById('reveal-question-btn');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const questionCard = document.getElementById('question-card');

    // Player List Elements
    const customPlayerListContainer = document.getElementById('custom-player-list-container');
    const questionsPlayerListContainer = document.getElementById('questions-player-list-container');
    const classicPlayerListContainer = document.getElementById('classic-player-list-container');
    const startClassicGameBtn = document.getElementById('start-classic-game-btn');
    const backToMenuFromClassicBtn = document.getElementById('back-to-menu-from-classic-btn');

    let globalPlayerNames = [];

    populateHowToPlayScreen(rolesListDetailed, eventsListDetailed);
    populateEventToggles(specificEventsList);
    initThemeManager();

    // Populate Themes (Question Mode)
    for (const theme in questionThemes) {
        const option = document.createElement('option');
        option.value = theme;
        option.textContent = theme;
        questionsThemeSelect.appendChild(option);
    }

    // Tutorial Logic
    if (!localStorage.getItem('tutorialSeen')) {
        const tutorialSteps = [
            { title: "Bem-vindo!", desc: "O objetivo do jogo é encontrar o Infiltrado." },
            { title: "Papéis", desc: "A Maioria recebe a mesma palavra secreta. O Infiltrado recebe uma palavra diferente (ou nenhuma)." },
            { title: "Discussão", desc: "Façam perguntas uns aos outros para tentar descobrir quem não sabe a palavra secreta da Maioria." },
            { title: "Votação", desc: "Eliminem o jogador suspeito! Se o Infiltrado sobrar, ele ganha." }
        ];

        let step = 0;
        const showTutorialStep = () => {
            if (step < tutorialSteps.length) {
                showInfoModal(tutorialSteps[step].title, tutorialSteps[step].desc, () => {
                    step++;
                    showTutorialStep();
                }, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn);
            } else {
                localStorage.setItem('tutorialSeen', 'true');
            }
        };
        // Small delay to ensure UI is ready
        setTimeout(showTutorialStep, 500);
    }

    // Settings Button Logic
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });

    closeSettingsModalBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    function updatePlayerLists() {
        renderPlayerManagement(customPlayerListContainer, globalPlayerNames, (newList) => globalPlayerNames = newList);
        renderPlayerManagement(questionsPlayerListContainer, globalPlayerNames, (newList) => globalPlayerNames = newList);
        renderPlayerManagement(classicPlayerListContainer, globalPlayerNames, (newList) => globalPlayerNames = newList);
    }

    function initPlayerListFromInput() {
        const inputVal = playerNamesInput.value.trim();
        if (inputVal) {
            const newNames = inputVal.split(' ').filter(name => name);
            newNames.forEach(name => {
                if (!globalPlayerNames.includes(name)) {
                    globalPlayerNames.push(name);
                }
            });
            playerNamesInput.value = ''; // Clear input after adding
        }
        updatePlayerLists();
    }

    classicGameBtn.addEventListener('click', () => {
        initPlayerListFromInput();
        switchScreen(screens, 'classicSetup');
    });

    startClassicGameBtn.addEventListener('click', () => {
        if (globalPlayerNames.length < 3) {
            alert('Por favor, adicione pelo menos 3 jogadores.');
            return;
        }
        gameSettings = {
            isClassic: true,
            isQuestionsMode: false,
            randomMode: false,
            bobo: false,
            cumplice: false,
            anjo: false,
            detetive: false,
            vidente: false,
            coveiro: false,
            agenteDuplo: false,
            mimico: false,
            namelessImpostor: false,
            twoImpostors: false,
            events: false,
            minActionTimer: 15,
            maxActionTimer: 15,
            discussionTime: 0.25,
            revelationMode: 'default',
            finalRevelation: 'all'
        };
        initializeGameWithNames(globalPlayerNames, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo);
    });

    backToMenuFromClassicBtn.addEventListener('click', () => switchScreen(screens, 'mainMenu'));

    customSetupBtn.addEventListener('click', () => {
        initPlayerListFromInput();
        switchScreen(screens, 'customSetup');
    });

    backToMenuBtn.addEventListener('click', () => switchScreen(screens, 'mainMenu'));
    backToMenuBtnTop.addEventListener('click', () => switchScreen(screens, 'mainMenu'));
    howToPlayBtn.addEventListener('click', () => switchScreen(screens, 'howToPlay'));
    backToMenuFromHowToPlayBtn.addEventListener('click', () => switchScreen(screens, 'mainMenu'));

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
        const val = parseFloat(e.target.value);
        if (val === 0) {
             discussionTimeValue.textContent = "Sem tempo";
        } else {
             discussionTimeValue.textContent = val + " min";
        }
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
            isQuestionsMode: false,
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
            namelessImpostor: namelessImpostorToggle.checked,
            twoImpostors: twoImpostorsToggle.checked,
            events: eventsToggle.checked,
            enabledEvents: enabledEvents,
            minActionTimer: parseInt(minActionTimerSlider.value, 10),
            maxActionTimer: parseInt(maxActionTimerSlider.value, 10),
            discussionTime: parseFloat(document.getElementById('discussion-time-slider').value),
            revelationMode: document.querySelector('input[name="revelationMode"]:checked').value,
            finalRevelation: document.querySelector('input[name="finalRevelation"]:checked').value,
        };

        const specialRolesCount = [
            gameSettings.bobo,
            gameSettings.cumplice,
            gameSettings.anjo,
            gameSettings.detetive,
            gameSettings.vidente,
            gameSettings.coveiro,
            gameSettings.agenteDuplo,
            gameSettings.mimico
        ].filter(Boolean).length;

        const baseRequired = gameSettings.twoImpostors ? 4 : 3; // 2 Infiltrados + 2 Maioria VS 1 Infiltrado + 2 Maioria
        const requiredPlayers = specialRolesCount + baseRequired;

        if (globalPlayerNames.length < requiredPlayers) {
            alert(`Você selecionou ${specialRolesCount} papéis especiais e/ou modo com 2 Infiltrados. São necessários pelo menos ${requiredPlayers} jogadores para esta configuração.`);
            return;
        }

        initializeGameWithNames(globalPlayerNames, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo);
    });

    questionsGameBtn.addEventListener('click', () => {
        initPlayerListFromInput();
        switchScreen(screens, 'questionsSetup');
    });

    backToMenuFromQuestionsBtn.addEventListener('click', () => switchScreen(screens, 'mainMenu'));

    startQuestionsGameBtn.addEventListener('click', () => {
        if (globalPlayerNames.length < 3) {
            alert('Por favor, adicione pelo menos 3 jogadores.');
            return;
        }
        gameSettings = {
            isClassic: false,
            isQuestionsMode: true,
            theme: questionsThemeSelect.value,
            revelationMode: 'default',
            discussionTime: 0, // No timer
            finalRevelation: 'all'
        };
        initializeGameWithNames(globalPlayerNames, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo);
    });

    revealQuestionBtn.addEventListener('click', () => {
        questionText.style.display = 'block';
        revealQuestionBtn.classList.add('hidden');
        nextQuestionBtn.classList.remove('hidden');
    });

    nextQuestionBtn.addEventListener('click', () => {
        handleNextQuestion(
             screens,
             questionPlayerTurnTitle,
             questionText,
             revealQuestionBtn,
             nextQuestionBtn,
             document.getElementById('discussion-timer'),
             startPlayerInfo,
             playersListDiv,
             eventTitle,
             eventDescription,
             eventModal,
             closeEventModal
        );
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

    // Pass Phone Logic
    confirmPassBtn.addEventListener('click', () => {
        setupRevealPhase(playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn);
        switchScreen(screens, 'reveal');
    });

    prevPlayerBtn.addEventListener('click', () => {
        if (currentPlayerIndex > 0) {
            currentPlayerIndex--;
            showPassPhoneScreen(screens, passPhoneName, confirmPassNameSpan, currentPlayerIndex);
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
            showPassPhoneScreen(screens, passPhoneName, confirmPassNameSpan, currentPlayerIndex);
        } else {
            startRound(
                actionPhaseTitle,
                screens,
                actionPhaseInstruction,
                actionUiContainer,
                actionPhaseMessage,
                actionPhaseContinueBtn,
                actionTimerDisplay,
                document.getElementById('discussion-timer'),
                startPlayerInfo,
                playersListDiv,
                eventTitle,
                eventDescription,
                eventModal,
                closeEventModal
            );
        }
    });

    playSamePlayersBtn.addEventListener('click', () => {
        // Reuse globalPlayerNames
        initializeGameWithNames(globalPlayerNames, screens, playerTurnTitle, roleDisplay, wordDisplay, wordCard, prevPlayerBtn, nextPlayerBtn, startPlayerInfo);
    });

    exitBtn.addEventListener('click', () => {
        globalPlayerNames = []; // Reset players on exit
        updatePlayerLists(); // Clear lists UI
        switchScreen(screens, 'mainMenu');
    });

    skipRoundBtn.addEventListener('click', () => startRound(
        actionPhaseTitle,
        screens,
        actionPhaseInstruction,
        actionUiContainer,
        actionPhaseMessage,
        actionPhaseContinueBtn,
        actionTimerDisplay,
        document.getElementById('discussion-timer'),
        startPlayerInfo,
        playersListDiv,
        eventTitle,
        eventDescription,
        eventModal,
        closeEventModal
    ));

    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showInfoModal(rules[e.target.dataset.rule].title, rules[e.target.dataset.rule].description, null, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn);
        });
    });

    confirmEliminateBtn.addEventListener('click', () => {
        if (playerToEliminate) {
            eliminatePlayer(playerToEliminate, infoModalTitle, infoModalDescription, infoModal, infoModalContinueBtn, screens, gameResultInfo, winnerMessage);
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

    infoModalContinueBtn.addEventListener('click', () => {
        const callback = infoModalContinueBtn.onclick;
        infoModal.style.display = 'none';
        infoModalContinueBtn.onclick = null;
        if (typeof callback === 'function') callback();
    });
    closeEventModal.addEventListener('click', () => {
        const callback = closeEventModal.onclick;
        eventModal.style.display = 'none';
        closeEventModal.onclick = null;
        if (typeof callback === 'function') callback();
    });
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
                case 'settings-modal':
                    settingsModal.style.display = 'none';
                    break;
                default:
                    event.target.style.display = 'none';
                    break;
            }
        }
    });
});
