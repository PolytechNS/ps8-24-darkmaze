function saveGame() {
    // Parameters to be sent to the server
    console.log("test");
    const gameData = {
        playerName: "John Doe",
        score: 100,
        level: 5
    };

    // Sending a POST request using fetch API
    fetch('/save-game', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
    })
    .then(response => {
        if (response.ok) {
            console.log('Game saved successfully!');
            // You can add any additional actions here upon successful save
        } else {
            console.error('Failed to save game.');
        }
    })
    .catch(error => {
        console.error('Error saving game:', error);
    });
}

