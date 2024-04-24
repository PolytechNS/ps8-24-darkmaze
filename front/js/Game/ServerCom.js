function saveGame() {
    // Parameters to be sent to the server
    console.log("test");
    console.log(TestGame);
    //playerNumber==0?playerNumber=1:playerNumber=0;
    // Sending a POST request using fetch API
    fetch('/api/game/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({gameId:TestGame.id,playerNumber:playerNumber})
    }).then(()=>{
        window.location.href = "http://15.188.201.4:8000/html/GameSetup.html"

    })

}
