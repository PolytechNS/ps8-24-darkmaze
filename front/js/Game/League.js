async function fetchLeagues() {
    try {
        const response = await fetch('http://localhost:8000/api/league/list', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication token if needed
                // 'Authorization': 'Bearer ' + authToken
            }
        });
        const leagues = await response.json();

        // Return the list of leagues
        return leagues;
    } catch (error) {
        console.error('Error fetching leagues:', error);
        throw error;
    }
}

async function fetchUsersForLeague(leagueId) {
    try {
        const response = await fetch(`http://localhost:8000/api/league/users/${leagueId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include authentication token if needed
                // 'Authorization': 'Bearer ' + authToken
            }
        });
        const users = await response.json();

        // Return the list of users
        return users;
    } catch (error) {
        console.error('Error fetching users for league:', error);
        throw error;
    }
}

async function populateLeagueList() {
    try {
        const leagues = await fetchLeagues();
        const leagueList = document.getElementById('leagueList');

        leagues.forEach(league => {
            const button = document.createElement('button');
            button.textContent = league.name; // Assuming 'name' is the property containing the league name

            // Attach a click event listener to fetch users for the league
            button.addEventListener('click', async () => {
                try {
                    const users = await fetchUsersForLeague(league._id);
                    displayUsers(users);
                } catch (error) {
                    console.error('Error fetching users for league:', error);
                    // Handle error if needed
                }
            });

            leagueList.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching leagues:', error);
        // Handle error if needed
    }
}

function displayUsers(users) {
    // Display the users in a list below the leagues
    const userList = document.getElementById('userList');
    userList.innerHTML = ''; // Clear previous users

    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = `${user.username} - Elo: ${user.elo}`;
        userList.appendChild(listItem);
    });
}

window.onload = populateLeagueList;
