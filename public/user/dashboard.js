import { auth, db } from "..firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Wait for authentication state change
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is logged in, update UI
        document.getElementById("userName").innerText = user.displayName || "No Name";
        document.getElementById("userEmail").innerText = user.email;
        document.getElementById("userPhoto").src = user.photoURL || "default-avatar.png";

        // Load EV charging slots
        loadChargingStations();
    } else {
        window.location.href = "index.html";
    }
});

// Logout function
document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Logged out successfully!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
});

// Load charging stations
async function loadChargingStations() {
    const slotList = document.getElementById("slotList");
    slotList.innerHTML = "";

    try {
        const querySnapshot = await getDocs(collection(db, "chargingStations"));
        querySnapshot.forEach((doc) => {
            const station = doc.data();
            const listItem = document.createElement("li");
            listItem.classList.add("list-group-item");
            listItem.innerHTML = `<strong>${station.name}</strong><br>
                Address: ${station.address}<br>
                Slots Available: ${station.slotsAvailable}`;
            slotList.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching stations:", error);
    }
}

// Google Maps integration
function initMap() {
    const searchBox = new google.maps.places.SearchBox(document.getElementById("searchBox"));
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 12.9716, lng: 77.5946 }, // Default location (Bangalore)
        zoom: 12
    });

    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0].geometry.location;
        map.setCenter(place);
        new google.maps.Marker({ position: place, map });
    });
}

window.initMap = initMap;
