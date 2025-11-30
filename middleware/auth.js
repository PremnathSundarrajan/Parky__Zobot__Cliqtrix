// function isAuthenticated(req, res, next) {
//     if (req.session && req.session.user) return next();
//     return res.status(401).json({ message: "Unauthorized" });
// }

const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
    const token = req.cookies.botToken; // read from cookie!

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = { isAuthenticated };

