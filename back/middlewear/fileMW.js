function checkSameServer(req, res, next) {
    // Check if Referer header exists and matches the server URL
    const referer = req.headers;
    const serverUrl = `http://15.188.201.4:8000/api`; // Replace with your server URL
    console.log(referer, serverUrl);
    if (1==1) {
      // Request is from the same server
      console.log("file MW IN");
      next(req, res);
    } else {
      // Request is from an external source, block access
      res.status(403).send('Access Forbidden');
    }
  }

  module.exports = checkSameServer;