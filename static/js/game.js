/**
 * ═══════════════════════════════════════════════════════════════════
 * 🎮 EDUCATIONAL ROGUELIKE - GAME LOGIC (Anki Flashcard System)
 * Frontend game controller
 * ═══════════════════════════════════════════════════════════════════
 */

class RoguelikeGame {
    constructor(deckId) {
        this.deckId = deckId;
        this.currentCard = null;
        this.cardRevealed = false;
        this.gameState = null;
        this.battleLog = [];
        this.powerupsConfig = {};
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadConfig();
        await this.checkGameStatus();
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.powerupsConfig = config.powerups;
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    setupEventListeners() {
        // New game button
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.startNewGame());
        }

        // Save game button
        const saveGameBtn = document.getElementById('save-game-btn');
        if (saveGameBtn) {
            saveGameBtn.addEventListener('click', () => this.saveGame());
        }

        // Reveal button (show card back)
        const revealBtn = document.getElementById('reveal-btn');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => this.revealCard());
        }

        // Response buttons (again/hard/good/easy)
        const responseAgain = document.getElementById('response-again');
        const responseHard = document.getElementById('response-hard');
        const responseGood = document.getElementById('response-good');
        const responseEasy = document.getElementById('response-easy');

        if (responseAgain) responseAgain.addEventListener('click', () => this.submitResponse('again'));
        if (responseHard) responseHard.addEventListener('click', () => this.submitResponse('hard'));
        if (responseGood) responseGood.addEventListener('click', () => this.submitResponse('good'));
        if (responseEasy) responseEasy.addEventListener('click', () => this.submitResponse('easy'));
    }

    async startNewGame() {
        try {
            this.showLoading('Starting new game...');

            const response = await fetch(`/api/game/new/${this.deckId}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start game');
            }

            this.gameState = data.state;
            this.showGameScreen();
            this.updateUI();
            this.addBattleLog('⚔️ A new adventure begins!', 'info');

            // Display first card
            if (data.card) {
                this.displayCard(data.card);
            }

            this.hideLoading();
        } catch (error) {
            console.error('Error starting new game:', error);
            this.showNotification(error.message, 'error');
            this.hideLoading();
        }
    }

    async checkGameStatus() {
        try {
            const response = await fetch(`/api/game/status/${this.deckId}`);
            const data = await response.json();

            if (data.active && data.state) {
                this.gameState = data.state;
                this.showGameScreen();
                this.updateUI();

                // Display current card if available
                if (this.gameState.current_card) {
                    this.displayCard({
                        card: {
                            id: this.gameState.current_card.id,
                            front: this.gameState.current_card.front,
                            tags: this.gameState.current_card.tags || []
                        },
                        revealed: this.gameState.card_revealed || false
                    });
                }
            } else {
                this.showWelcomeScreen();
            }
        } catch (error) {
            console.error('Error checking game status:', error);
            this.showWelcomeScreen();
        }
    }

    displayCard(cardData) {
        const cardPanel = document.getElementById('card-panel');
        if (!cardPanel) return;

        // Show card panel
        cardPanel.classList.remove('hidden');

        const card = cardData.card;
        this.currentCard = card;
        this.cardRevealed = cardData.revealed || false;

        // Set tags
        const tagsEl = document.getElementById('card-tags');
        if (tagsEl) {
            if (card.tags && card.tags.length > 0) {
                tagsEl.textContent = '🏷️ ' + card.tags.join(', ');
            } else {
                tagsEl.textContent = '🏷️ No tags';
            }
        }

        // Set card status
        const statusEl = document.getElementById('card-status');
        if (statusEl && this.gameState && this.gameState.current_card) {
            const cardState = this.gameState.current_card;
            if (cardState.repetitions === 0) {
                statusEl.textContent = 'New Card';
            } else {
                statusEl.textContent = `Review ${cardState.repetitions}`;
            }
        }

        // Set card front (question)
        const cardFront = document.getElementById('card-front');
        if (cardFront) {
            cardFront.innerHTML = this.formatCardContent(card.front);
        }

        // Handle card back (answer)
        const cardFrontContainer = document.getElementById('card-front-container');
        const cardBackContainer = document.getElementById('card-back-container');

        if (this.cardRevealed) {
            // Show answer
            if (cardFrontContainer) cardFrontContainer.classList.add('hidden');
            if (cardBackContainer) cardBackContainer.classList.remove('hidden');

            const cardBack = document.getElementById('card-back');
            if (cardBack && this.gameState && this.gameState.current_card) {
                cardBack.innerHTML = this.formatCardContent(this.gameState.current_card.back);
            }
        } else {
            // Hide answer, show reveal button
            if (cardFrontContainer) cardFrontContainer.classList.remove('hidden');
            if (cardBackContainer) cardBackContainer.classList.add('hidden');
        }
    }

    formatCardContent(content) {
        // Basic HTML formatting for card content
        // Convert newlines to <br> and preserve basic HTML
        if (!content) return '';

        // Replace newlines with <br> if content doesn't already have HTML tags
        if (!content.includes('<')) {
            return content.replace(/\n/g, '<br>');
        }

        return content;
    }

    async revealCard() {
        try {
            this.showLoading('Revealing answer...');

            const response = await fetch(`/api/game/reveal/${this.deckId}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to reveal card');
            }

            this.cardRevealed = true;

            // Update display
            const cardFrontContainer = document.getElementById('card-front-container');
            const cardBackContainer = document.getElementById('card-back-container');

            if (cardFrontContainer) cardFrontContainer.classList.add('hidden');
            if (cardBackContainer) cardBackContainer.classList.remove('hidden');

            // Set card back content
            const cardBack = document.getElementById('card-back');
            if (cardBack) {
                cardBack.innerHTML = this.formatCardContent(data.back);
            }

            this.hideLoading();

        } catch (error) {
            console.error('Error revealing card:', error);
            this.showNotification(error.message, 'error');
            this.hideLoading();
        }
    }

    async submitResponse(response) {
        if (!this.cardRevealed) {
            this.showNotification('Please reveal the answer first!', 'error');
            return;
        }

        try {
            this.showLoading('Processing response...');

            // Disable response buttons
            this.disableResponseButtons();

            const apiResponse = await fetch(`/api/game/answer/${this.deckId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ response: response })
            });

            const result = await apiResponse.json();

            if (!apiResponse.ok) {
                throw new Error(result.error || 'Failed to submit response');
            }

            await this.processResponseResult(result, response);
            this.hideLoading();

        } catch (error) {
            console.error('Error submitting response:', error);
            this.showNotification(error.message, 'error');
            this.enableResponseButtons();
            this.hideLoading();
        }
    }

    async processResponseResult(result, response) {
        // Update game state
        this.gameState = result.state;

        // Show feedback based on response quality
        const responseLabels = {
            'again': '🔴 AGAIN',
            'hard': '🟡 HARD',
            'good': '🟢 GOOD',
            'easy': '🔵 EASY'
        };

        const responseLabel = responseLabels[response] || response.toUpperCase();

        // Log the response
        if (result.damage_dealt > 0) {
            playAnimation('correct');
            this.addBattleLog(`${responseLabel} - You dealt ${result.damage_dealt} damage!`, 'damage');
        } else {
            playAnimation('incorrect');
            this.addBattleLog(`${responseLabel} - Enemy attacks you!`, 'damage');
            if (result.damage_received > 0) {
                this.addBattleLog(`💔 You took ${result.damage_received} damage!`, 'damage');
            }
        }

        // Show powerup notification
        if (result.powerup_gained) {
            this.showPowerupNotification(result.powerup_gained);
        }

        // Check for enemy defeat
        if (result.enemy_defeated) {
            this.addBattleLog(`🎉 Enemy defeated! +${result.score_gained} points!`, 'info');
            playAnimation('victory');
        }

        // Check for player death
        if (result.player_defeated) {
            this.addBattleLog('💀 You have been defeated...', 'info');
            playAnimation('defeat');
            this.showGameOver();
            return;
        }

        // Check for game won
        if (result.game_won) {
            this.addBattleLog('🌟 Victory! You completed the dungeon!', 'info');
            playAnimation('victory');
            this.showVictory();
            return;
        }

        // Update UI
        this.updateUI();

        // Wait a moment before showing next card
        await this.sleep(1000);

        // Load next card
        if (result.next_card) {
            this.cardRevealed = false;
            this.displayCard({
                card: result.next_card,
                revealed: false
            });
            this.enableResponseButtons();
        }
    }

    disableResponseButtons() {
        const buttons = ['response-again', 'response-hard', 'response-good', 'response-easy'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = true;
        });
    }

    enableResponseButtons() {
        const buttons = ['response-again', 'response-hard', 'response-good', 'response-easy'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = false;
        });
    }

    showPowerupNotification(powerupId) {
        // Get powerup info from config
        const powerup = this.powerupsConfig[powerupId];
        if (powerup) {
            this.showNotification(`${powerup.name} obtained!`, 'success');
            this.addBattleLog(`✨ ${powerup.name} obtained!`, 'heal');
        }
    }

    updateUI() {
        if (!this.gameState) return;

        // Update player info
        if (this.gameState.player) {
            this.updatePlayer(this.gameState.player);
        }

        // Update enemy info
        if (this.gameState.enemy) {
            this.updateEnemy(this.gameState.enemy);
        }

        // Update progress
        if (this.gameState.progress) {
            this.updateProgress(this.gameState.progress);
        }

        // Update stats
        if (this.gameState.stats) {
            this.updateStats(this.gameState.stats);
        }

        // Update inventory
        if (this.gameState.inventory) {
            this.updateInventory(this.gameState.inventory);
        }
    }

    updatePlayer(player) {
        if (!player) return;

        // Reset player sprite animations to ensure visibility
        const playerSprite = document.getElementById('player-sprite');
        if (playerSprite) {
            playerSprite.style.animation = '';
            playerSprite.style.opacity = '';
            playerSprite.style.transform = '';
            playerSprite.classList.remove('attacking', 'damaged');
        }

        // Update HP
        const playerHpFill = document.getElementById('player-hp-fill');
        const playerHpText = document.getElementById('player-hp-text');

        if (playerHpFill && player.hp_percent !== undefined) {
            playerHpFill.style.width = `${player.hp_percent}%`;

            // Change color based on HP
            if (player.hp_percent < 30) {
                playerHpFill.classList.add('low');
            } else {
                playerHpFill.classList.remove('low');
            }
        }

        if (playerHpText && player.hp !== undefined && player.max_hp !== undefined) {
            playerHpText.textContent = `${player.hp}/${player.max_hp}`;
        }

        // Update shield
        const shieldIndicator = document.getElementById('player-shield');
        if (shieldIndicator && player.shield !== undefined) {
            if (player.shield > 0) {
                shieldIndicator.textContent = `🛡️ Shield: ${player.shield}`;
                shieldIndicator.classList.remove('hidden');
            } else {
                shieldIndicator.classList.add('hidden');
            }
        }

        // Update score
        const scoreEl = document.getElementById('player-score');
        if (scoreEl && player.score !== undefined) {
            scoreEl.textContent = player.score.toLocaleString();
        }
    }

    updateEnemy(enemy) {
        if (!enemy) return;

        // Update sprite
        const enemySprite = document.getElementById('enemy-sprite');
        if (enemySprite && enemy.emoji) {
            enemySprite.textContent = enemy.emoji;
            // Reset animations and styles to fix sprite visibility
            enemySprite.style.animation = '';
            enemySprite.style.opacity = '';
            enemySprite.style.transform = '';
            enemySprite.style.display = '';
            // Remove animation classes
            enemySprite.classList.remove('attacking', 'damaged');
        }

        // Update name
        const enemyName = document.getElementById('enemy-name');
        if (enemyName) {
            enemyName.textContent = enemy.name;
        }

        // Show boss indicator if this is a boss
        const bossIndicator = document.getElementById('boss-indicator');
        if (bossIndicator) {
            if (enemy.is_boss) {
                bossIndicator.classList.remove('hidden');
            } else {
                bossIndicator.classList.add('hidden');
            }
        }

        // Update HP
        const enemyHpFill = document.getElementById('enemy-hp-fill');
        const enemyHpText = document.getElementById('enemy-hp-text');

        if (enemyHpFill) {
            enemyHpFill.style.width = `${enemy.hp_percent}%`;
        }

        if (enemyHpText) {
            enemyHpText.textContent = `${enemy.hp}/${enemy.max_hp}`;
        }

        // Update damage
        const enemyDamage = document.getElementById('enemy-damage');
        if (enemyDamage) {
            enemyDamage.textContent = enemy.damage;
        }
    }

    updateProgress(progress) {
        if (!progress) return;

        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill && progress.percent !== undefined) {
            progressFill.style.width = `${progress.percent}%`;
        }

        if (progressText && progress.current_encounter !== undefined && progress.total_encounters !== undefined) {
            progressText.textContent = `Encounter ${progress.current_encounter}/${progress.total_encounters}`;
        }
    }

    updateStats(stats) {
        if (!stats) return;

        // Update accuracy
        const accuracyEl = document.getElementById('session-accuracy');
        if (accuracyEl && stats.accuracy !== undefined) {
            accuracyEl.textContent = `${stats.accuracy.toFixed(1)}%`;
        }

        // Update cards reviewed (changed from questions answered)
        const cardsReviewedEl = document.getElementById('cards-reviewed');
        if (cardsReviewedEl) {
            cardsReviewedEl.textContent = stats.cards_reviewed || 0;
        }
    }

    updateInventory(inventory) {
        const inventoryEmpty = document.getElementById('inventory-empty');
        const inventoryItems = document.getElementById('inventory-items');

        if (!inventoryItems) return;

        // Clear current items
        inventoryItems.innerHTML = '';

        if (!inventory || inventory.length === 0) {
            if (inventoryEmpty) inventoryEmpty.style.display = 'block';
            return;
        }

        if (inventoryEmpty) inventoryEmpty.style.display = 'none';

        // Group powerups by type and count
        const powerupCounts = {};
        inventory.forEach(powerupId => {
            powerupCounts[powerupId] = (powerupCounts[powerupId] || 0) + 1;
        });

        // Display each unique powerup
        Object.entries(powerupCounts).forEach(([powerupId, count]) => {
            const powerupData = this.powerupsConfig[powerupId];
            if (!powerupData) return;

            const itemEl = document.createElement('button');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <span class="powerup-name">${powerupData.name}</span>
                ${count > 1 ? `<span class="powerup-count">x${count}</span>` : ''}
            `;
            itemEl.title = `Click to use: ${this.getPowerupDescription(powerupId, powerupData)}`;
            itemEl.addEventListener('click', () => this.usePowerup(powerupId));

            inventoryItems.appendChild(itemEl);
        });
    }

    getPowerupDescription(powerupId, powerupData) {
        const descriptions = {
            'heal': `Restores ${powerupData.value} HP`,
            'shield': `Adds ${powerupData.value} shield`,
            'damage_boost': `Multiplies damage by ${powerupData.value}x`,
            'score_boost': `Multiplies score by ${powerupData.value}x`
        };
        return descriptions[powerupData.effect] || 'Unknown effect';
    }

    async usePowerup(powerupId) {
        try {
            this.showLoading('Using powerup...');

            const response = await fetch(`/api/game/use-powerup/${this.deckId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ powerup_id: powerupId })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to use powerup');
            }

            // Update game state
            if (result.state) {
                this.gameState = result.state;
                this.updateUI();
            }

            // Show notification with effects
            if (result.message) {
                this.showNotification(result.message, 'success');

                // Determinar color del log según tipo de item
                const logType = result.item_type === 'spell' ? 'damage' : 'heal';
                this.addBattleLog(`✨ ${result.message}`, logType);
            }

            // Si fue un hechizo que hizo daño, mostrar animación
            if (result.damage_dealt && result.damage_dealt > 0) {
                playAnimation('correct');
            }

            this.hideLoading();

        } catch (error) {
            console.error('Error using powerup:', error);
            this.showNotification(error.message, 'error');
            this.hideLoading();
        }
    }

    addBattleLog(message, type = 'info') {
        this.battleLog.push({ message, type, timestamp: new Date() });

        const logContainer = document.getElementById('battle-log');
        if (!logContainer) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.textContent = `> ${message}`;

        logContainer.appendChild(logEntry);

        // Auto-scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;

        // Limit log entries
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    async saveGame() {
        try {
            const saveName = prompt('Enter a name for this save:');
            if (!saveName) return;

            this.showLoading('Saving game...');

            const response = await fetch(`/api/game/save/${this.deckId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ save_name: saveName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save game');
            }

            this.showNotification('Game saved successfully!', 'success');
            this.hideLoading();

        } catch (error) {
            console.error('Error saving game:', error);
            this.showNotification(error.message, 'error');
            this.hideLoading();
        }
    }

    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const gameScreen = document.getElementById('game-screen');

        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (gameScreen) gameScreen.classList.add('hidden');
    }

    showGameScreen() {
        console.log('🎮 Showing game screen');
        const welcomeScreen = document.getElementById('welcome-screen');
        const gameScreen = document.getElementById('game-screen');

        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (gameScreen) gameScreen.classList.remove('hidden');
    }

    showGameOver() {
        setTimeout(() => {
            alert('Game Over! Your progress has been saved.');
            window.location.href = `/stats/${this.deckId}`;
        }, 2000);
    }

    showVictory() {
        setTimeout(() => {
            alert('🎉 Victory! You completed the dungeon! Check your stats.');
            window.location.href = `/stats/${this.deckId}`;
        }, 2000);
    }

    showLoading(message = 'Loading...') {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.textContent = message;
            loadingEl.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.classList.add('hidden');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        const deckId = gameContainer.dataset.deckId;
        if (deckId) {
            window.roguelikeGame = new RoguelikeGame(parseInt(deckId));
        }
    }
});
