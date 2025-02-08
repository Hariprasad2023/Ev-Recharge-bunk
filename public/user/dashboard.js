// Import Firebase modules
import { auth, db } from "../firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Global variables
let map;
let searchMarker;

// ✅ Initialize OpenStreetMap with Leaflet.js
window.initMap = async function () {
    console.log("✅ OpenStreetMap is initializing...");

    const defaultLocation = [12.9716, 77.5946]; // Bangalore

    // ✅ Create a map instance and set its view
    map = L.map("map").setView(defaultLocation, 12);

    // ✅ Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ✅ Load Charging Stations & Add Markers
    await loadChargingStations();

    // ✅ Attach event to search box
    setupSearchBox();
};

// ✅ Load Charging Stations from Firestore & Add Markers
async function loadChargingStations() {
    const slotList = document.getElementById("slotList");
    slotList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "chargingStations"));

        querySnapshot.forEach((doc) => {
            const station = doc.data();

            console.log("📌 Firestore Data:", station);

            if (!station.latitude || !station.longitude || isNaN(station.latitude) || isNaN(station.longitude)) {
                console.error(`❌ Invalid coordinates for station: ${station.name}`, station);
                return;
            }

            const lat = parseFloat(station.latitude);
            const lon = parseFloat(station.longitude);

            console.log(`🛰️ Adding Marker for ${station.name} at:`, lat, lon);

            // ✅ Create a marker and add to map
            const marker = L.marker([lat, lon]).addTo(map);

            // ✅ Bind popup with station details
            marker.bindPopup(`
                <strong>${station.name}</strong><br>
                Address: ${station.address}<br>
                Slots Available: ${station.slotsAvailable}
            `);

            // ✅ Add station info to slot list in UI
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `<strong>${station.name}</strong><br>
                Address: ${station.address}<br>
                Slots Available: ${station.slotsAvailable}`;
            slotList.appendChild(listItem);
        });

        console.log("✅ Charging stations loaded successfully!");
    } catch (error) {
        console.error("❌ Error fetching stations:", error);
    }
}

// ✅ Set up Search Box (uses OpenStreetMap's Nominatim API)
// ✅ Set up Search Box (Uses OpenStreetMap's Nominatim API)
function setupSearchBox() {
    const searchBox = document.getElementById("searchBox");

    searchBox.addEventListener("keyup", async (event) => {
        if (event.key === "Enter") {
            const query = searchBox.value.trim();
            if (query.length === 0) return;

            console.log(`🔎 Searching for: ${query}`);

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
                const results = await response.json();

                if (results.length === 0) {
                    alert("❌ No location found. Try again.");
                    return;
                }

                const location = results[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);

                console.log(`📍 Found location: ${location.display_name} (${lat}, ${lon})`);

                // ✅ Move map to searched location (without adding a marker)
                map.setView([lat, lon], 14);

            } catch (error) {
                console.error("❌ Error searching location:", error);
            }
        }
    });
}


// ✅ Handle Authentication
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("userName").innerText = user.displayName || "No Name";
        document.getElementById("userEmail").innerText = user.email;
        document.getElementById("userPhoto").src = user.photoURL || "default-avatar.png";

        // ✅ Initialize Map with Stations
        initMap();
    } else {
        window.location.href = "index.html";
    }
});

// ✅ Logout Function
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
});
