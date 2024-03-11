// Function to handle searching for users

function searchUser() {
    const popupDiv = document.getElementById('userPopup');
    if(popupDiv)document.body.removeChild(popupDiv); // Close the popup when "Go Back" button is clicked
    const searchInput = document.getElementById('friendUsername').value;
    console.log(searchInput);
    // Assuming you have an API endpoint to search for users
    fetch(`/api/user/list/${searchInput}`)
        .then(response => response.json())
        .then(data => displayUsersPopup(data, addFriend))
        .catch(error => console.error('Error searching for users:', error));
}

// Function to display search results
// Function to handle displaying users in a popup
function displayUsersPopup(users, addFriendFunction) {
    // Create a div element to hold the popup content
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
    popupDiv.id = 'userPopup'; 

    // Create a div element to display the users
    const usersDiv = document.createElement('div');
    usersDiv.classList.add('user-list');

    // Create an unordered list to list the users
    const userList = document.createElement('ul');

    // Add each user to the list
    users.forEach(user => {
        const listItem = document.createElement('li');
        const addButton = document.createElement('button');
        addButton.textContent = 'Add Friend';
        addButton.addEventListener('click', () => {
            // Call the addFriendFunction with the username as an argument
            addFriendFunction(user.username);
        });
        listItem.textContent = user.username;
        listItem.appendChild(addButton);
        userList.appendChild(listItem);
    });

    // Append the list to the usersDiv
    usersDiv.appendChild(userList);

    // Create a "Go Back" button
    const goBackButton = document.createElement('button');
    goBackButton.textContent = 'Go Back';
    goBackButton.addEventListener('click', () => {
        document.body.removeChild(popupDiv); // Close the popup when "Go Back" button is clicked
    });

    // Append the usersDiv and goBackButton to the popupDiv
    popupDiv.appendChild(usersDiv);
    popupDiv.appendChild(goBackButton);

    // Append the popupDiv to the body
    document.body.appendChild(popupDiv);
}


function addFriend(username) {
    console.log('Adding friend:', username);

    // Make a fetch request to trigger the route
    fetch(`/api/user/AddFriend/${username}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to add friend');
            }
        })
        .then(data => {
            // Display a message containing the result
            alert(data.message);
        })
        .catch(error => {
            console.error('Error adding friend:', error);
            // Display an error message
            alert('Failed to add friend');
        });

    const popupDiv = document.getElementById('userPopup');
    document.body.removeChild(popupDiv); // Close the popup when "Go Back" button is clicked
}

function listFriendRequests() {
    // Assuming you have an API endpoint to retrieve friend requests
    fetch(`/api/user/friendRequests`)
        .then(response => response.json())
        .then(data => displayFriendRequestsPopup(data))
        .catch(error => console.error('Error fetching friend requests:', error));
}

function displayFriendRequestsPopup(requests) {
    // Create a div element to hold the popup content
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
    popupDiv.id = 'friendRequestsPopup'; 

    // Create a div element to display the friend requests
    const requestsDiv = document.createElement('div');
    requestsDiv.classList.add('friend-requests-list');

    // Create an unordered list to list the friend requests
    const requestsList = document.createElement('ul');

    // Add each friend request to the list
    requests.forEach(request => {
        const listItem = document.createElement('li');
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.addEventListener('click', () => {
            // Call the acceptFriendRequest function with the request ID as an argument
            acceptFriendRequest(request._id);
        });
        listItem.textContent = request.username;
        listItem.appendChild(acceptButton);
        requestsList.appendChild(listItem);
    });

    // Append the list to the requestsDiv
    requestsDiv.appendChild(requestsList);

    // Create a "Close" button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupDiv); // Close the popup when "Close" button is clicked
    });

    // Append the requestsDiv and closeButton to the popupDiv
    popupDiv.appendChild(requestsDiv);
    popupDiv.appendChild(closeButton);

    // Append the popupDiv to the body
    document.body.appendChild(popupDiv);
}

function acceptFriendRequest(requestId) {
    // Assuming you have an API endpoint to accept friend requests
    fetch(`/api/user/friend_Requests/${requestId}/accept`, {
        method: 'GET',
        // Add any necessary headers or body data here
    })
    .then(response => {
        // Handle the response accordingly
        if (response.ok) {
            console.log('Friend request accepted successfully.');
            // Optionally, you can update the UI to reflect the acceptance of the request
        } else {
            console.error('Failed to accept friend request:', response.statusText);
        }
    })
    .catch(error => console.error('Error accepting friend request:', error));
}
