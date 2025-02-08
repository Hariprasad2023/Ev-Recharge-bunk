// Import Firebase
import { auth, db } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, getDocs, addDoc, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Initialize OpenStreetMap
function initMap() {
    const map = L.map("map").setView([12.9716, 77.5946], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    loadChargingStations(map);
}

// Load Charging Stations from Firebase Firestore
async function loadChargingStationsAdmin() {
    const stationListAdmin = document.getElementById("stationListAdmin");
    stationListAdmin.innerHTML = ""; // Clear previous data

    try {
        const querySnapshot = await getDocs(collection(db, "chargingStations"));
        querySnapshot.forEach((docSnap) => {
            const station = docSnap.data();
            if (!station.latitude || !station.longitude) return;

            // Create table row
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="border border-gray-300 p-2">${station.name}</td>
                <td class="border border-gray-300 p-2">${station.address}</td>
                <td class="border border-gray-300 p-2">${station.slotsAvailable}</td>
                <td class="border border-gray-300 p-2">${station.latitude}</td>
                <td class="border border-gray-300 p-2">${station.longitude}</td>
                <td class="border border-gray-300 p-2">
                    <button class="editBtn bg-blue-500 text-white px-2 py-1 rounded" data-id="${docSnap.id}">Edit</button>
                </td>
            `;

            stationListAdmin.appendChild(row);
        });

        // Add event listeners for edit buttons
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                const stationId = btn.dataset.id;
                editChargingStation(stationId);
            });
        });

    } catch (error) {
        console.error("Error loading stations:", error);
    }
}

// Function to edit a station (Placeholder - Add actual logic)
function editChargingStation(stationId) {
    alert(`Edit feature coming soon for station ID: ${stationId}`);
}
;
// Load stations when the page loads
loadChargingStationsAdmin();


// Delete Charging Station Function
async function deleteChargingStation(stationId) {
    try {
        await deleteDoc(doc(db, "chargingStations", stationId));
        alert("Charging station deleted successfully!");
        loadChargingStations(); // Refresh list after deletion
    } catch (error) {
        console.error("Error deleting station:", error);
    }
}

// Add New Charging Station
document.getElementById("addStationBtn").addEventListener("click", async () => {
    const name = document.getElementById("stationName").value;
    const address = document.getElementById("stationAddress").value;
    const slots = document.getElementById("slotsAvailable").value;
    const lat = document.getElementById("latitude").value;
    const lng = document.getElementById("longitude").value;

    if (!name || !address || !slots || !lat || !lng) {
        alert("All fields are required!");
        return;
    }

    try {
        await addDoc(collection(db, "chargingStations"), {
            name,
            address,
            slotsAvailable: parseInt(slots),
            latitude: lat,
            longitude: lng,
        });

        alert("Charging station added successfully!");
        location.reload();
    } catch (error) {
        console.error("Error adding station:", error);
    }
});

// Logout Function
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error logging out:", error);
    }
});

// Load Recharges
async function loadRecharges() {
    const rechargeList = document.getElementById("rechargeList");
    rechargeList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "recharges"));
    querySnapshot.forEach((docSnap) => {
        const recharge = docSnap.data();
        const row = document.createElement("tr");

        row.innerHTML = `
            <td class="border border-gray-300 p-2">${recharge.userId}</td>
            <td class="border border-gray-300 p-2">₹${recharge.amount}</td>
            <td class="border border-gray-300 p-2">${recharge.stationId || "N/A"}</td>
            <td class="border border-gray-300 p-2">${recharge.status}</td>
            <td class="border border-gray-300 p-2">
                <button class="approveBtn bg-green-500 text-white px-2 py-1 rounded" data-id="${docSnap.id}" data-station="${recharge.stationId}">Approve</button>
                <button class="rejectBtn bg-red-500 text-white px-2 py-1 rounded" data-id="${docSnap.id}">Reject</button>
            </td>
        `;

        rechargeList.appendChild(row);
    });

    // Add event listeners for buttons
    document.querySelectorAll(".approveBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const rechargeId = btn.dataset.id;
            const stationId = btn.dataset.station;
            await updateRechargeStatus(rechargeId, "Approved", stationId);
        });
    });

    document.querySelectorAll(".rejectBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
            await updateRechargeStatus(btn.dataset.id, "Rejected");
        });
    });
}

// Add Recharge
document.getElementById("addRechargeBtn").addEventListener("click", async () => {
    const userId = document.getElementById("userId").value;
    const amount = document.getElementById("rechargeAmount").value;
    const stationId = document.getElementById("stationId").value;
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!userId || !amount || !stationId) {
        alert("Please fill all fields.");
        return;
    }

    await addDoc(collection(db, "recharges"), {
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        status: "Pending",
        stationId,
        timestamp: new Date()
    });

    alert("Recharge added successfully!");
    loadRecharges();
});




async function updateRechargeStatus(rechargeId, status) {
    const rechargeRef = doc(db, "recharges", rechargeId);
    const rechargeSnap = await getDoc(rechargeRef);

    if (!rechargeSnap.exists()) {
        console.error("Recharge not found!");
        return;
    }

    const rechargeData = rechargeSnap.data();
    const stationId = rechargeData.stationId;
    const amount = rechargeData.amount; // Amount paid
    const duration = Math.floor(amount / 100); // Hours to occupy slot

    await updateDoc(rechargeRef, { status });

    if (status === "Approved" && stationId) {
        const stationRef = doc(db, "chargingStations", stationId);
        const stationSnap = await getDoc(stationRef);

        if (!stationSnap.exists()) {
            console.error("Charging station not found!");
            return;
        }

        const currentSlots = stationSnap.data().slotsAvailable;

        if (currentSlots > 0) {
            // Reduce slot count immediately
            await updateDoc(stationRef, { slotsAvailable: increment(-1) });

            console.log(`Slot booked for ${duration} hours.`);

            // Schedule slot release after `duration` hours
            setTimeout(async () => {
                await updateDoc(stationRef, { slotsAvailable: increment(1) });
                console.log(`Slot freed after ${duration} hours.`);
            }, duration * 60 * 60 * 1000); // Convert hours to milliseconds
        } else {
            console.warn("No available slots left!");
            alert("No available slots at this station.");
        }
    }

    loadRecharges();
}


// Load recharges on page load
loadRecharges();
async function loadChargingStationsDropdown() {
    const stationDropdown = document.getElementById("stationId");
    stationDropdown.innerHTML = `<option value="">Select Charging Station</option>`;

    const querySnapshot = await getDocs(collection(db, "chargingStations"));
    querySnapshot.forEach((docSnap) => {
        const station = docSnap.data();
        stationDropdown.innerHTML += `<option value="${docSnap.id}">${station.name}</option>`;
    });
}

loadChargingStationsDropdown(); // Call this when the page loads


// Handle Navigation
const sections = {
    dashboardSection: document.getElementById("dashboardSection"),
    addStationSection: document.getElementById("addStationSection"),
    manageStationsSection: document.getElementById("manageStationsSection"),
    manageRechargeSection: document.getElementById("manageRechargeSection"),
};

function showSection(sectionId) {
    Object.values(sections).forEach((sec) => sec.classList.add("hidden"));
    sections[sectionId].classList.remove("hidden");
}

document.getElementById("dashboardLink").addEventListener("click", () => showSection("dashboardSection"));
document.getElementById("addStationLink").addEventListener("click", () => showSection("addStationSection"));
document.getElementById("manageStationsLink").addEventListener("click", () => showSection("manageStationsSection"));
document.getElementById("manageRechargeLink").addEventListener("click", () => showSection("manageRechargeSection"));

// Initialize Map on Page Load
initMap();
