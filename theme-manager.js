function applyTheme(themeKey) {
    const theme = themes[themeKey] || themes['default'];

    // Apply colors
    for (const [property, value] of Object.entries(theme.colors)) {
        document.documentElement.style.setProperty(property, value);
    }

    // Apply background
    if (theme.background.includes('gradient') || theme.background.includes('url')) {
        document.body.style.backgroundImage = theme.background;
        document.body.style.backgroundColor = theme.colors["--background-color"];
    } else {
        document.body.style.backgroundImage = 'none';
        document.body.style.backgroundColor = theme.background;
    }

    // Save preference
    localStorage.setItem('infiltrado-theme', themeKey);

    // Update active state in selector
    updateThemeSelectorState(themeKey);
}

function updateThemeSelectorState(activeThemeKey) {
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === activeThemeKey) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function initThemeManager() {
    const themeSelector = document.getElementById('theme-selector');
    if (!themeSelector) return;

    themeSelector.innerHTML = ''; // Clear existing

    for (const [key, theme] of Object.entries(themes)) {
        const option = document.createElement('div');
        option.className = 'theme-option';
        option.dataset.theme = key;

        const preview = document.createElement('div');
        preview.className = 'theme-preview';

        // Preview styling
        if (theme.background.includes('gradient')) {
             preview.style.background = theme.background;
        } else {
             preview.style.backgroundColor = theme.background;
        }

        const name = document.createElement('div');
        name.className = 'theme-name';
        name.textContent = theme.name;

        option.appendChild(preview);
        option.appendChild(name);

        option.onclick = () => applyTheme(key);

        themeSelector.appendChild(option);
    }

    // Load saved theme or default
    const savedTheme = localStorage.getItem('infiltrado-theme') || 'default';
    applyTheme(savedTheme);
}
