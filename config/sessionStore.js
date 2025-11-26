const session = require("express-session");
const connectPg = require("connect-pg-simple");
const pg = require("pg");

const PgStore = connectPg(session);

const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const sessionMiddleware = session({
    store: new PgStore({
        pool: pgPool,
        tableName: "sessions",
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000,
        secure: false,
        httpOnly: true
    }
});

module.exports = sessionMiddleware;
