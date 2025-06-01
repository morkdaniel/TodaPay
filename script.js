import { db } from '../../firebase/firebase-init.js';
import { auth } from '../../firebase/firebase-init.js';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';



const generateBtn = document.getElementById("generateBtn");
const passengerCount = document.getElementById("passengerCount");
const qrText = document.getElementById("qrText");
const qrContainer = document.getElementById("qrcode");
const suggestions = document.getElementById("suggestions");


const destinations = [
    { name: "Tropical", fare1: 30, fare2: 35},
    { name: "Juliana Talipapa", fare1: 35, fare2: 40},
    { name: "Valley Golf (Gate)", fare1: 60, fare2: 65},
    { name: "St. Anthony (Gate 1)", fare1: 60, fare2: 65},
    { name: "Starbucks Sierra Valley", fare1: 50, fare2: 60},    
    { name: "Simona Court", fare1: 40, fare2: 45},
    { name: "Simona Itaas", fare1: 50, fare2: 60},
    { name: "Andok's Overpass", fare1: 30, fare2: 35},
    { name: "Overpass Tawid", fare1: 35, fare2: 40},
    { name: "Waltermart", fare1: 35, fare2: 40},
    { name: "Baltao Outpost", fare1: 40, fare2: 45},
    { name: "Baltao Loob", fare1: 60, fare2: 70},
    { name: "Palmera 1 (Gate)", fare1: 50, fare2: 60},
    { name: "Tikling (KFC)", fare1: 55, fare2: 65},
    { name: "Manila East Hospital", fare1: 60, fare2: 70},
    { name: "Tikling Talipapa", fare1: 60, fare2: 70},
    { name: "Casimiro School", fare1: 70, fare2: 80},
    { name: "Golden City (Gate)", fare1: 80, fare2: 80},
    { name: "SM Taytay", fare1: 80, fare2: 80},
    { name: "Jollibee Bayan", fare1: 35, fare2: 40},
    { name: "Dolores Chapel", fare1: 35, fare2: 40},
    { name: "Generica, Mercury Drug, Kalayaan", fare1: 40, fare2: 50},
    { name: "4 Cantos", fare1: 40, fare2: 50},
    { name: "Cortez, Jagger, 7th of May", fare1: 50, fare2: 60},
    { name: "Plaza, Inc.", fare1: 60, fare2: 70},
    { name: "New Taytay Market (Front)", fare1: 70, fare2: 80},
    { name: "Miranda", fare1: 70, fare2: 80},
    { name: "Tiangge (Labas)", fare1: 80, fare2: 90},
    { name: "Tiangge (Loob)", fare1: 100, fare2: 110},
    { name: "Petron Bayan", fare1: 35, fare2: 40},
    { name: "Bulacan St", fare1: 40, fare2: 45},
    { name: "Kiss St", fare1: 40, fare2: 45},
    { name: "Maria Clara (Gitna)", fare1: 40, fare2: 50},
    { name: "Maria Clara (Dulo)", fare1: 60, fare2: 70},
    { name: "Isagani (Gitna)", fare1: 40, fare2: 50},
    { name: "Isagani (Dulo)", fare1: 60, fare2: 70},
    { name: "Brgy. Sta. Ana", fare1: 60, fare2: 70},
    { name: "Townhouse Dufax", fare1: 70, fare2: 80},
    { name: "San Isidro Elem. School", fare1: 50, fare2: 60},
    { name: "Methodist School", fare1: 60, fare2: 70},
    { name: "Taytay Doctors Hosp", fare1: 60, fare2: 70},
    { name: "Bautista (Dulo)", fare1: 60, fare2: 70},
    { name: "Townhouse I", fare1: 70, fare2: 80},
    { name: "T.E.S., Corazon Elem. School", fare1: 40, fare2: 50},
    { name: "Tibagan", fare1: 60, fare2: 70},
    { name: "NAPOCOR, GFA, PHILEC (Kanto)", fare1: 50, fare2: 60},
    { name: "PHILEC (Loob)", fare1: 60, fare2: 70},
    { name: "Nazaren, Admiral", fare1: 60, fare2: 70},
    { name: "Dolores Elem. School", fare1: 40, fare2: 50},
    { name: "Brgy. Dolores Hall", fare1: 40, fare2: 50},
    { name: "C. Valle", fare1: 40, fare2: 50},
    { name: "Little Baguio", fare1: 50, fare2: 60},
    { name: "20 To 1", fare1: 60, fare2: 70},
    { name: "Avocado", fare1: 60, fare2: 70},

    
];
// New inputs change the QR
function updateQRTextFromInputs() {
    const inputText = qrText.value.trim().toLowerCase();
    const pax = parseInt(passengerCount.value);

    const destinationPart = inputText.split(" | ")[0];

    const matched = destinations.find(dest =>
        dest.name.toLowerCase().includes(destinationPart)
    );

    if (matched) {
        const selectedFare = pax === 2 ? matched.fare2 : matched.fare1;
        qrText.value = `${matched.name} | ${pax} pax | PHP ${selectedFare}`;
    } else {
        alert("Destination not found. Please select from the suggestions.");
    }
}

// Suggestion dropdown logic
qrText.addEventListener("input", () => {
    const input = qrText.value.trim().toLowerCase();
    suggestions.innerHTML = "";

    if (input.length === 0) {
        suggestions.style.display = "none";
        return;
    }
    
    const filtered = destinations.filter(dest =>
        dest.name.toLowerCase().includes(input)
    );

    if (filtered.length === 0) {
        suggestions.style.display = "none";
        return;
    }

    filtered.forEach(dest => {
        const div = document.createElement("div");
        div.textContent = dest.name;
        div.addEventListener("click", () => {
            qrText.value = dest.name;
            suggestions.innerHTML = "";
            suggestions.style.display = "none";
            updateQRTextFromInputs();  // auto-update fare
        });
        suggestions.appendChild(div);
    });

    suggestions.style.display = "block";
});

// Hide suggestions when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-wrapper")) {
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
    }
});

// Update QR text when passenger count changes
passengerCount.addEventListener("change", updateQRTextFromInputs);

// Function to generate a unique kiosk ID
function generateUniqueKioskId() {
  return 'kiosk-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Initialize QR code generation
document.getElementById("generateBtn").addEventListener("click", async () => {
    updateQRTextFromInputs();
    const text = document.getElementById("qrText").value;
    const pax = parseInt(passengerCount.value);
    const destination = text.split(" | ")[0];
    const fare = parseInt(text.split("PHP ")[1]);
    const kioskId = generateUniqueKioskId();
    const qrContainer = document.getElementById("qrcode");

    qrContainer.innerHTML = "";
    document.getElementById("kiosk-id-display").textContent = `Kiosk ID: ${kioskId}`;

    new QRCode(qrContainer, {
        text: kioskId,
        width: 200,
        height: 200,
        correctLevel: QRCode.CorrectLevel.H
    });

    // 🔥 Save to Firestore
    try {
        await addDoc(collection(db, "kiosks"), {
            kioskId: kioskId,
            destination: destination,
            passengerCount: pax,
            fare: fare,
            createdAt: serverTimestamp(),
            used: false,
            expired: false,
        });
        console.log('Ride data saved successfully');
    } catch (err) {
        console.error('Error saving ride data:', err);
        alert('Error saving ride data. Please try again.');
    }
});
