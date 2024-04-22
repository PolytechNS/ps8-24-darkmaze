const jwt = require('jsonwebtoken');
const parseCookies = require("../config/CookieParser");
require('dotenv').config(); // Load environment variables from .env file

function authMiddleware(req, res, next) {
    // Get the token from the request headers
    let token;
    if (req.headers.cookie) {
        const cookies = parseCookies(req.headers.cookie);
        token = cookies.jwt;
    } else {
        res.writeHead(302, {
            Location: "http://15.188.201.4:8000/html/Auth/Login.html",
        });
        return res.end();
    }

    if (!token) {
        // Redirect to the login page if token is missing

        res.writeHead(302, { 'Location': 'http://15.188.201.4:8000/html/Auth/Login.html' });
        return res.end();
    }

    try {

        // Verify the token using the secret key from .env file
        const decoded = jwt.verify(token, process.env.jwt_secret);

        // Attach the decoded token to the request object
        req.user = decoded;

        // Call the next middleware or route handler
        next(req,res);
    } catch (error) {
        // Redirect to the login page if token is invalid
        res.writeHead(302, { 'Location': 'http://15.188.201.4:8000/html/Auth/Login.html' });
        return res.end();
    }
}

module.exports = authMiddleware;