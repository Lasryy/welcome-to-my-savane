const session = require("express-session");

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

const sessionMiddleware = session({
  name: "connect.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // JavaScript in the browser cannot read this cookie.
    httpOnly: true,
    sameSite: "lax",
    // In production, the cookie is sent only over HTTPS.
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
  },
});

module.exports = sessionMiddleware;
