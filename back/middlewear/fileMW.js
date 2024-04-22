function checkSameServer(req, res, next) {
    // Check if Referer header exists and matches the server URL (origin)
    const referer = req.headers.referer;
    const serverUrl = `http://${process.env.SERVER_IP}:8000`; // No trailing slash for better comparison

    if (referer && referer.startsWith(serverUrl)) {
        // Request is likely from the same server (origin)
        console.log("File MW IN");
        next(req, res);
    } else {
        // Request may be from an external source, investigate further
        console.warn('Request might be from an external source:', referer);
        res.status(403).send('Access Forbidden');
    }
}

module.exports = checkSameServer;