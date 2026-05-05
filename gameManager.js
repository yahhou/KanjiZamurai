const gameManager = {
    stageConfigs: {
        赤ちゃん: [],
        初心者: [
            { stage: 'Novice Samurai 1', wordList: 'word_list_1.json' },
            { stage: 'Novice Samurai 2', wordList: 'word_list_2.json' },
            { stage: 'Novice Samurai 3', wordList: 'word_list_3.json' },
            { stage: 'Novice Samurai 4', wordList: 'word_list_4.json' },
            { stage: 'Novice Samurai 5', wordList: 'word_list_5.json' },
            { stage: 'Novice Samurai 6', wordList: 'word_list_6.json' }
        ],
        中級者: [],
        上級者: [
            { stage: 'Advanced Samurai', wordList: 'word_list_7.json' }
        ],
        レジェンド: []
    },

    showCategoryMenu() {
        // Implementation to display category menu
        console.log("Select a category:");
        for (const category of Object.keys(this.stageConfigs).reverse()) {
            console.log(category);
        }
    },

    showStageMenu(category) {
        // Implementation to display stage menu for a selected category
        const stages = this.stageConfigs[category];
        console.log(`Stages in ${category}:`);
        stages.forEach(stage => {
            console.log(stage.stage);
        });
    },

    goBackToCategory() {
        // Implementation to go back to category menu
        console.log("Going back to category menu...");
        this.showCategoryMenu();
    },

    showStartMessage() {
        // Updated to display categories first
        this.showCategoryMenu();
    }
};

export default gameManager;