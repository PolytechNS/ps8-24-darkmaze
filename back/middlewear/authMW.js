const jwt = require('jsonwebtoken');
const cookie = require('cookie-parser');

require('dotenv').config(); // Load environment variables from .env file

function authMiddleware(req, res, next) {
    // Get the token from the request headers


    
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies.jwt;

    if (!token) {
        // Redirect to the login page if token is missing

        res.writeHead(302, { 'Location': 'http://localhost:8000/html/Auth/Login.html' }); 
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
        res.writeHead(302, { 'Location': 'http://localhost:8000/html/Auth/Login.html' }); 
        return res.end();
    }
}
function parseCookies(cookieHeader) {
    const cookies = {};
  
    // Split the cookie header by semicolons
    cookieHeader.split(';').forEach(cookie => {
      // Split each cookie by the equal sign to get key-value pair
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const value = decodeURI(parts.join('=').trim()); // Decode URI encoded characters
  
      // Assign key-value pair to cookies object
      cookies[key] = value;
    });
  
    return cookies;
  }
module.exports = authMiddleware;
