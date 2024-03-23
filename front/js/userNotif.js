


function afficherNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerText = message;

  // Ajoutez l'élément au document
  document.body.appendChild(notification);

  // Affichez la notification avec un style
  setTimeout(() => {
      notification.classList.add('notification-show');
  }, 10); // Ajoutez un léger délai pour permettre au navigateur de rendre l'élément avant de le montrer

  // Cachez et supprimez la notification après un certain temps
  setTimeout(() => {
      notification.classList.remove('notification-show');
      notification.classList.add('notification-hide');
  }, 5000);

  // Supprimez la notification après l'animation de disparition
  notification.addEventListener('transitionend', () => {
      if (notification.classList.contains('notification-hide')) {
          notification.remove();
      }
  });
}



console.log("cooookies ",document.cookie);  
const socket = io("/api/user", {
    
  query: { 
    cookies: document.cookie
  }
}); 
const socket2 = io("/api/message", {
    
  query: { 
    cookies: document.cookie
  }
}); 

// Puis remplacez les appels console.log dans vos écouteurs d'événements socket.on par afficherNotification
socket.on('friend_request', (msg) => {
  afficherNotification('Vous avez reçu une demande d\'amitié'); // Remplacez cette ligne au lieu de console.log
});

socket2.on('new_message', (msg) => {
  afficherNotification('Vous avez reçu un nouveau message'); // Utilisez cette ligne au lieu de console.log
});
/*
socket2.on('new_message', (msg) => {
  console.log('Recieved a message : ', msg);
  // Handle the friend request notification here
});
console.log("userNotif.js");

// Add your listener here
socket.on('friend_request', (msg) => {
  console.log('Received friend request:', msg);
  // Handle the friend request notification here
});
*/