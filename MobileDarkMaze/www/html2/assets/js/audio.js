document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById("backgroundAudio");
    var isAudioEnabled = true; // Variable pour suivre l'état du son
    
    // Fonction pour mettre en pause le son
    function pauseSound() {
        audio.pause();
    }

    // Fonction pour jouer le son
    function playSound() {
        audio.play();
    }

    // Vérifier si le son est activé ou désactivé dans le stockage local
    var audioEnabled = localStorage.getItem('audioEnabled');
    if (audioEnabled === 'false') {
        isAudioEnabled = false; // Mettre à jour l'état du son
        pauseSound(); // Mettre en pause l'audio si désactivé dans les paramètres
    } else {
        isAudioEnabled = true; // Mettre à jour l'état du son
        playSound(); // Jouer l'audio si activé dans les paramètres
    }

    // Écouter les messages des autres pages pour arrêter ou démarrer l'audio
    window.addEventListener('message', function(event) {
        if (event.data.soundOn) {
            isAudioEnabled = true; // Mettre à jour l'état du son
            playSound();
        } else {
            isAudioEnabled = false; // Mettre à jour l'état du son
            pauseSound();
        }
    });

    // Gérer la relecture de l'audio lors de l'actualisation de la page
    window.addEventListener('beforeunload', function() {
        // Enregistrer l'état du son dans le stockage local
        localStorage.setItem('audioEnabled', isAudioEnabled.toString());
    });

    // Relancer la lecture de l'audio après le chargement de la page
    window.addEventListener('load', function() {
        if (isAudioEnabled) {
            playSound();
        }
    });
});
