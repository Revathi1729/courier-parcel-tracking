const express = require("express");
const db = require("./db");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ADD CUSTOMER
app.post("/customers", (req, res) => {
    const { name, email, phone, address } = req.body;

    const sql = `INSERT INTO customers
                 (name, email, phone, address)
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [name, email, phone, address], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error adding customer" });
        }

        res.json({
            message: "Customer registered successfully",
            customer_id: result.insertId
        });
    });
});

// GET CUSTOMERS
app.get("/customers", (req, res) => {
    const sql = "SELECT * FROM customers ORDER BY customer_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching customers" });
        }

        res.json(results);
    });
});

// GET CUSTOMERS FOR PARCEL DROPDOWN
app.get("/customer-dropdown", (req, res) => {

    const sql = "SELECT customer_id, name FROM customers";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);
    });

});

// BOOK PARCEL
app.post("/parcels", (req, res) => {

    const {
        customer_id,
        sender_address,
        receiver_name,
        receiver_phone,
        receiver_address,
        weight
    } = req.body;

    const sql = `INSERT INTO parcels
        (customer_id, sender_address, receiver_name,
        receiver_phone, receiver_address, weight,
        booking_date, status)
        VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'Booked')`;

    db.query(sql, [
        customer_id,
        sender_address,
        receiver_name,
        receiver_phone,
        receiver_address,
        weight
    ], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error booking parcel"
            });
        }

        res.json({
            message: "Parcel booked successfully!",
            parcel_id: result.insertId
        });

    });

});
// GET ALL PARCELS
app.get("/parcels", (req, res) => {
    const sql = "SELECT * FROM parcels ORDER BY parcel_id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Error fetching parcels"
            });
        }

        res.json(results);
    });
});
// GET TRACKING HISTORY
app.get("/tracking/:parcel_id", (req, res) => {
    const parcelId = req.params.parcel_id;

    const sql = `
        SELECT current_location, tracking_status, updated_at, remarks
        FROM tracking
        WHERE parcel_id = ?
        ORDER BY updated_at DESC
    `;

    db.query(sql, [parcelId], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error fetching tracking details"
            });
        }

        res.json(results);
    });
});
// ADD TRACKING UPDATE
app.post("/tracking", (req, res) => {
    const { parcel_id, current_location, tracking_status, remarks } = req.body;

    const sql = `INSERT INTO tracking
    (parcel_id, current_location, tracking_status, updated_at, remarks)
    VALUES (?, ?, ?, NOW(), ?)`;

    db.query(sql, [parcel_id, current_location, tracking_status, remarks], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating tracking" });
        }

        db.query(
            "UPDATE parcels SET status = ? WHERE parcel_id = ?",
            [tracking_status, parcel_id],
            (updateErr) => {
                if (updateErr) {
                    console.log(updateErr);
                    return res.status(500).json({ message: "Tracking saved, but parcel status update failed" });
                }

                res.json({ message: "Tracking updated successfully!" });
            }
        );
    });
});
// ADD PAYMENT
app.post("/payments", (req, res) => {
    const { parcel_id, amount, payment_method, payment_status } = req.body;

    const sql = `INSERT INTO payments
    (parcel_id, amount, payment_method, payment_status)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [parcel_id, amount, payment_method, payment_status], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error saving payment" });
        }

        res.json({ message: "Payment saved successfully!" });
    });
});

// VIEW PAYMENTS
app.get("/payments", (req, res) => {
    db.query("SELECT * FROM payments ORDER BY payment_id DESC", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Error fetching payments" });
        }

        res.json(results);
    });
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});