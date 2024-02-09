
function parseCookies(cookieHeader) {
    const cookies = {};
  
    // Split the cookie header by semicolons
    cookieHeader.split(";").forEach((cookie) => {
      // Split each cookie by the equal sign to get key-value pair
      const parts = cookie.split("=");
      const key = parts.shift().trim();
      const value = decodeURI(parts.join("=").trim()); // Decode URI encoded characters
  
      // Assign key-value pair to cookies object
      cookies[key] = value;
    });
  
    return cookies;
  }

module.exports = parseCookies;