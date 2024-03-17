// matchmaking.js

class Matchmaking {
    constructor() {
      this.queue = []; // File d'attente des joueurs
      this.maxPlayersPerGame = 2; // Nombre maximal de joueurs par partie
    }
  
    // Méthode pour ajouter un joueur à la file d'attente
    enqueue(player) {
      this.queue.push(player);
      this.matchPlayers(); // Essayer de créer une partie dès qu'un joueur rejoint la file d'attente
    }
  



    
    // Méthode pour retirer un joueur de la file d'attente
    dequeue(playerId) {
      this.queue = this.queue.filter(player => player.id !== playerId);
    }
  
    // Méthode pour essayer de créer une partie avec les joueurs en attente
    matchPlayers() {
      if (this.queue.length >= this.maxPlayersPerGame) {
        // Créer une nouvelle partie avec les premiers joueurs de la file d'attente
        const playersInGame = this.queue.splice(0, this.maxPlayersPerGame);
        this.createGame(playersInGame);
      }
    }
  
    // Méthode pour créer une nouvelle partie avec les joueurs spécifiés
    createGame(players) {
      // Ici, vous pouvez implémenter la logique pour créer une nouvelle partie
      console.log('New game created with players:', players);
    }
  }
  
  module.exports = new Matchmaking();
  