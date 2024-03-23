document.addEventListener('DOMContentLoaded', function() {
    const modalContainer = document.querySelector('.modal-container');
    const modal = modalContainer.querySelector('.modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalClose = modal.querySelector('.modal-close');
    const messagesButton = document.querySelector('.messages-button');

    // Open modal
    function openModal() {
        modalContainer.style.display = 'block';
        setTimeout(() => modal.classList.add('open'), 50); // Delay for transition
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('open');
        setTimeout(() => modalContainer.style.display = 'none', 300); // Delay for transition
    }

    // Add event listener to close modal button
    modalClose.addEventListener('click', closeModal);

    // Function to fetch friends with messages
    function fetchFriendsWithMessages() {
        // Assuming you have an API endpoint to fetch friends with messages
        console.log("get frieeeeeends")
        fetch('/api/user/friends')
        .then(response => response.json())
        .then(friends => {
            // Create HTML content for modal dialog
            let htmlContent = "<h2>Friends</h2>";
            htmlContent += "<ul>";

            // Loop through friends and create clickable list items
            friends.forEach(friend => {
                htmlContent += `<li><a href="#" class="friend" data-id="${friend.id}">${friend.username}</a></li>`;
            });

            htmlContent += "</ul>";

            // Set HTML content in modal dialog
            modalContent.innerHTML = htmlContent;

            // Open the modal after content is set
            openModal();

            // Add event listener to each friend link
            const friendLinks = modalContent.querySelectorAll('.friend');
            friendLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const friendId = this.getAttribute('data-id');
                    // Open messaging box for the selected friend
                    openMessagingBox(friendId);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching friends with messages:', error);
            alert('Error fetching friends with messages. Please try again later.');
        });
    }

    // Function to open messaging box for a specific friend
    function openMessagingBox(friendId) {
        // Fetch messages for the conversation with the selected friend
        fetch(`/api/conversation/messages/${friendId}`)
        .then(response => response.json())
        .then(messages => {
            // Create HTML content for messaging box
            let htmlContent = "<h2>Messages</h2>";
            htmlContent += "<div id='messages-container'>";
    
            // Display messages
            messages.forEach(message => {
                htmlContent += `<div>${message.sender}: ${message.content}</div>`;
            });
    
            htmlContent += "</div>";
    
            // Create form for sending messages
            htmlContent += `<form id="message-form">`;
            htmlContent += `<input type="hidden" name="recipientId" value="${friendId}">`;
            htmlContent += "<input type='text' id='message-input' name='content' placeholder='Write your message...'>";
            htmlContent += "<button type='submit'>Send</button>";
            htmlContent += "</form>";
    
            // Set HTML content in the modal
            modalContent.innerHTML = htmlContent;
    
            // Attach event listener to form submit event
            document.getElementById("message-form").addEventListener("submit", function(event) {
                event.preventDefault(); // Prevent default form submission behavior
                sendMessage(); // Call function to send message
            });
        })
        .catch(error => {
            console.error('Error fetching messages:', error);
            alert('Error fetching messages. Please try again later.');
        });
    }
    
    function sendMessage() {
        const friendId = document.querySelector("input[name='recipientId']").value;
        const messageContent = document.getElementById('message-input').value.trim();
    
        if (messageContent === '') {
            alert('Please enter a message.');
            return;
        }
    
        const messageData = {
            recipientId: friendId,
            content: messageContent
        };
    
        fetch("http://localhost:8000/api/conversation/send-message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(messageData)
        }) 
        .then(response => {
            if (response.ok) {
                console.log("Message sent successfully");
                // Optionally, you can update the UI to reflect the sent message
                document.getElementById('message-input').value = ''; // Clear input field after sending message
            } else {
                console.error("Failed to send message");
                alert("Failed to send message. Please try again later.");
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again later.');
        });
    }
    
    
    // Add event listener to Messages button
    messagesButton.addEventListener('click', fetchFriendsWithMessages);
});
