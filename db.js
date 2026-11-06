const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Revathi@1729",
    database: "courier_management"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("MySQL Database Connected Successfully!");
});

module.exports = db;