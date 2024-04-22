const jwt = require('jsonwebtoken');
const parseCookies = require("../config/CookieParser");
require('dotenv').config(); // Load environment variables from .env file

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function authMiddleware(req, res, next) {
    // Get the token from the cookie
    let token = getCookie('jwt', req);

    if (!token) {
        // Redirect to the login page if token is missing
        const loginUrl = `http://15.188.201.4:8000/html/Auth/Login.html`; // Replace with your actual server IP

        if (!loginUrl) {
            throw new Error('Missing SERVER_IP environment variable');
        }

        res.writeHead(302, { Location: loginUrl });
        return res.end();
    }

    try {
        // Verify the token using the secret key from .env file
        const decoded = jwt.verify(token, process.env.jwt_secret);

        // Attach the decoded token to the request object
        req.user = decoded;

        // Call the next middleware or route handler
        next(req, res);
    } catch (error) {
        // Redirect to the login page if token is invalid
        const loginUrl = `http://15.188.201.4/html/Auth/Login.html`; // Replace with your actual server IP

        if (!loginUrl) {
            throw new Error('Missing SERVER_IP environment variable');
        }

        res.writeHead(302, { Location: loginUrl });
        return res.end();
    }
}

module.exports = authMiddleware;


