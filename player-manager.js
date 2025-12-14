
function renderPlayerManagement(container, playersList, updateCallback) {
    container.innerHTML = '';

    // List existing players
    const listDiv = document.createElement('div');
    listDiv.className = 'player-mgmt-list';

    playersList.forEach((name, index) => {
        const item = document.createElement('div');
        item.className = 'player-mgmt-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.className = 'btn-delete-player';
        deleteBtn.onclick = () => {
            playersList.splice(index, 1);
            updateCallback(playersList);
            renderPlayerManagement(container, playersList, updateCallback);
        };

        item.appendChild(nameSpan);
        item.appendChild(deleteBtn);
        listDiv.appendChild(item);
    });

    container.appendChild(listDiv);

    // Add new player input
    const addContainer = document.createElement('div');
    addContainer.className = 'player-mgmt-add';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nome do jogador';
    input.className = 'player-mgmt-input';

    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.className = 'btn-add-player';

    const addHandler = () => {
        const newName = input.value.trim();
        if (newName) {
            playersList.push(newName);
            updateCallback(playersList);
            renderPlayerManagement(container, playersList, updateCallback);
            input.focus();
        }
    };

    addBtn.onclick = addHandler;
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addHandler();
    });

    addContainer.appendChild(input);
    addContainer.appendChild(addBtn);
    container.appendChild(addContainer);
}
