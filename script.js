
document.addEventListener("DOMContentLoaded", () => {

    // ==================================
    // 1. CUSTOMER MANAGEMENT
    // ==================================

    const customerForm = document.getElementById("customerForm");
    const customerTable = document.getElementById("customerTable");

    // LOAD CUSTOMERS
    async function loadCustomers() {

        if (!customerTable) return;

        try {
            const response = await fetch("/customers");

            if (!response.ok) {
                throw new Error("Failed to load customers");
            }

            const data = await response.json();

            customerTable.innerHTML = "";

            data.forEach(customer => {

                customerTable.innerHTML += `
                    <tr>
                        <td>${customer.customer_id}</td>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td>${customer.address}</td>
                    </tr>
                `;

            });

        } catch (error) {
            console.log("Customer loading error:", error);
        }
    }

    // REGISTER CUSTOMER
    if (customerForm) {

        customerForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const customer = {
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                address: document.getElementById("address").value.trim()
            };

            try {

                const response = await fetch("/customers", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(customer)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Registration failed");
                }

                alert(data.message);

                customerForm.reset();

                loadCustomers();

            } catch (error) {
                alert(error.message);
                console.log(error);
            }

        });

        loadCustomers();
    }


    // ==================================
    // 2. PARCEL BOOKING
    // ==================================

    const customerSelect = document.getElementById("customer_id");
    const parcelForm = document.getElementById("parcelForm");

    // LOAD CUSTOMER DROPDOWN
    if (customerSelect) {

        fetch("/customer-dropdown")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Unable to load customers");
                }
                return response.json();
            })
            .then(data => {

                data.forEach(customer => {

                    const option = document.createElement("option");

                    option.value = customer.customer_id;

                    option.textContent =
                        customer.customer_id + " - " + customer.name;

                    customerSelect.appendChild(option);

                });

            })
            .catch(error => console.log(error));

    }

    // BOOK PARCEL
    if (parcelForm) {

        parcelForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const parcel = {
                customer_id: customerSelect.value,
                sender_address: document.getElementById("sender_address").value,
                receiver_name: document.getElementById("receiver_name").value,
                receiver_phone: document.getElementById("receiver_phone").value,
                receiver_address: document.getElementById("receiver_address").value,
                weight: document.getElementById("weight").value
            };

            try {

                const response = await fetch("/parcels", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(parcel)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Booking failed");
                }

                alert(data.message);

                if (data.parcel_id) {
                    parcelForm.reset();
                }

            } catch (error) {
                alert(error.message);
                console.log(error);
            }

        });

    }
// LOAD PARCELS
const parcelTable = document.getElementById("parcelTable");

if (parcelTable) {
    fetch("/parcels")
        .then(response => response.json())
        .then(data => {
            parcelTable.innerHTML = "";

            data.forEach(parcel => {
                parcelTable.innerHTML += `
                    <tr>
                        <td>${parcel.parcel_id}</td>
                        <td>${parcel.customer_id}</td>
                        <td>${parcel.receiver_name}</td>
                        <td>${parcel.receiver_phone}</td>
                        <td>${parcel.receiver_address}</td>
                        <td>${parcel.weight}</td>
                        <td>${parcel.booking_date}</td>
                        <td>${parcel.status}</td>
                    </tr>
                `;
            });
        })
        .catch(error => console.log("Error loading parcels:", error));
    }
    // TRACK PARCEL
const trackingSearchForm = document.getElementById("trackingSearchForm");

if (trackingSearchForm) {
    trackingSearchForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const parcelId = document.getElementById("trackParcelId").value;
        const trackingTable = document.getElementById("trackingTable");

        try {
            const response = await fetch(`/tracking/${parcelId}`);
            const data = await response.json();

            trackingTable.innerHTML = "";

            if (data.length === 0) {
                trackingTable.innerHTML = `
                    <tr>
                        <td colspan="4">No tracking updates available.</td>
                    </tr>
                `;
                return;
            }

            data.forEach(item => {
                trackingTable.innerHTML += `
                    <tr>
                        <td>${item.current_location}</td>
                        <td>${item.tracking_status}</td>
                        <td>${item.updated_at}</td>
                        <td>${item.remarks}</td>
                    </tr>
                `;
            });

        } catch (error) {
            alert("Error fetching tracking details");
            console.log(error);
        }
    });
}
// LOAD PARCEL IDS INTO TRACKING DROPDOWN
const trackParcelId = document.getElementById("trackParcelId");

if (trackParcelId) {
    fetch("/parcels")
        .then(response => response.json())
        .then(data => {
            data.forEach(parcel => {
                const option = document.createElement("option");
                option.value = parcel.parcel_id;
                option.textContent = "Parcel ID: " + parcel.parcel_id;
                trackParcelId.appendChild(option);
            });
        })
        .catch(error => console.log("Error loading parcel IDs:", error));
}
// LOAD PARCEL DROPDOWN FOR TRACKING UPDATE
const updateParcelId = document.getElementById("updateParcelId");

if (updateParcelId) {
    fetch("/parcels")
        .then(res => res.json())
        .then(data => {
            data.forEach(parcel => {
                const option = document.createElement("option");
                option.value = parcel.parcel_id;
                option.textContent = "Parcel ID: " + parcel.parcel_id;
                updateParcelId.appendChild(option);
            });
        });
}

// SAVE TRACKING UPDATE
const updateTrackingForm = document.getElementById("updateTrackingForm");

if (updateTrackingForm) {
    updateTrackingForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const response = await fetch("/tracking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parcel_id: updateParcelId.value,
                current_location: document.getElementById("current_location").value,
                tracking_status: document.getElementById("tracking_status").value,
                remarks: document.getElementById("remarks").value
            })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) updateTrackingForm.reset();
    });
}
// LOAD PARCELS INTO PAYMENT DROPDOWN
const paymentParcelId = document.getElementById("paymentParcelId");

if (paymentParcelId) {
    fetch("/parcels")
        .then(res => res.json())
        .then(data => {
            data.forEach(parcel => {
                const option = document.createElement("option");
                option.value = parcel.parcel_id;
                option.textContent = "Parcel ID: " + parcel.parcel_id;
                paymentParcelId.appendChild(option);
            });
        });
}

// LOAD PAYMENTS
const paymentTable = document.getElementById("paymentTable");

function loadPayments() {
    if (!paymentTable) return;

    fetch("/payments")
        .then(res => res.json())
        .then(data => {
            paymentTable.innerHTML = "";

            data.forEach(payment => {
                paymentTable.innerHTML += `
                    <tr>
                        <td>${payment.payment_id}</td>
                        <td>${payment.parcel_id}</td>
                        <td>${payment.amount}</td>
                        <td>${payment.payment_method}</td>
                        <td>${payment.payment_status}</td>
                    </tr>
                `;
            });
        });
}

if (paymentTable) loadPayments();

// SAVE PAYMENT
const paymentForm = document.getElementById("paymentForm");

if (paymentForm) {
    paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const response = await fetch("/payments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                parcel_id: paymentParcelId.value,
                amount: document.getElementById("amount").value,
                payment_method: document.getElementById("payment_method").value,
                payment_status: document.getElementById("payment_status").value
            })
        });

        const data = await response.json();
        alert(data.message);

        if (response.ok) {
            paymentForm.reset();
            loadPayments();
        }
    });
}

});
