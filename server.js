import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// --- 1. Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyACqt6EU_HXMERYlr749oXsLd5oSibgylA",
    authDomain: "tourism-4521b.firebaseapp.com",
    projectId: "tourism-4521b",
    storageBucket: "tourism-4521b.appspot.com",
    messagingSenderId: "277991998919",
    appId: "1:277991998919:web:c16e1f63084e748ac285e2",
    measurementId: "G-9J70ZG3PJ4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// --- 2. Auth State Management ---
onAuthStateChanged(auth, (user) => {
    const userSection = document.querySelector(".login2");
    if (!user) {
        window.location.href = "Log-In.html";
    } else if (userSection) {
        userSection.innerHTML = `
            <div class="user-info">
                <i class="ri-user-line"></i>
                <span>${user.displayName || user.email}</span>
                <button id="logoutBtn">Logout</button>
            </div>`;
        document.getElementById("logoutBtn").addEventListener("click", () => {
            signOut(auth).then(() => window.location.href = "Log-In.html");
        });
    }
});

// --- 3. Event Listener for Form Submission ---
const submitbtn = document.querySelector(".submit-btn");

submitbtn.addEventListener("click", () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Please log in first!");
        return;
    }

    // Collect data
    const current_location = document.querySelector("#current_location").value;
    const destination = document.querySelector("#destination").value;
    const budget = document.querySelector("#budget").value;

    let dayValue = "";
    document.querySelectorAll("input[name='day']:checked").forEach(r => dayValue = r.value);

    let transportValue = "";
    document.querySelectorAll("input[name='transport']:checked").forEach(r => transportValue = r.value);

    let interests = [];
    document.querySelectorAll("input[name='interests']:checked").forEach(c => interests.push(c.value));

    // Construct command object
    const command = {
        current_location,
        destination,
        days: dayValue,
        budget,
        travel_mode: transportValue,
        interest: interests,
        output_format: {
            current_weather: "string",
            best_time_to_visit: "string",
            day_wise_itinerary: [{
                day: 1,
                morning: "string",
                afternoon: "string",
                evening: "string",
                travel_distance_km: 0,
                attractions: ["string"],
                hidden_gems: ["string"],
                restaurants: [{ name: "string", type: "string", approx_price: "string" }]
            }],
            hotels: [{ name: "string", description: "string", approx_price_per_night: "string" }],
            transportation_plan: { mode: "string", approx_cost: "string", travel_duration: "string" },
            travel_tips: ["string"]
        }
    };

    generate(command);
});

// --- 4. Generation Function ---

// Place your Google Gemini API key here (Get one for free at https://aistudio.google.com/app/apikey)
const GEMINI_API_KEY ="use gemini api";

async function generate(command) {
    const container = document.querySelector(".page4");
    container.style.display = "block";
    container.innerHTML = `<div class="loading">⏳ Generating your custom travel plan for ${command.destination}...</div>`;

    try {
        // --- GOOGLE GEMINI FREE API IMPLEMENTATION ---
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            throw new Error("Please set your Gemini API key in server.js (Get a free key at https://aistudio.google.com/app/apikey)");
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `You are a travel assistant. Output ONLY valid JSON using this exact structure: ${JSON.stringify(command.output_format)}. Plan a trip based on this request: ${JSON.stringify(command)}`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`Gemini API Error: ${response.status} - ${errMsg}`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) throw new Error("No response content returned from Gemini API.");

        const json = JSON.parse(responseText);

        const current = command.current_location || "";
        const des = command.destination || "";

        // Rendering logic
        container.innerHTML = `
            <div class="section">
                <h2>📅 General Info</h2>
                <p><span class="highlight">Current Weather:</span> ${json.current_weather}</p>
                <p><span class="highlight">Best Time to Visit:</span> ${json.best_time_to_visit}</p>
            </div>

            <div class="section">
                <h2>🗓️ Day-wise Itinerary</h2>
                ${(json.day_wise_itinerary || []).map(item => `
                    <div class="itinerary-day">
                        <h3>Day ${item.day}</h3>
                        <p><strong>Morning:</strong> ${item.morning}</p>
                        <p><strong>Afternoon:</strong> ${item.afternoon}</p>
                        <p><strong>Evening:</strong> ${item.evening}</p>
                        ${item.travel_distance_km ? `<p><strong>Travel Distance:</strong> ${item.travel_distance_km} km</p>` : ''}

                        ${item.attractions && item.attractions.length ? `
                            <div class="attractions">
                                <strong>Attractions:</strong>
                                <ul>${item.attractions.map(a => `<li><a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(a + ', ' + des)}/"><i class="ri-road-map-fill"></i></a> ${a}</li>`).join("")}</ul>
                            </div>
                        ` : ''}

                        ${item.hidden_gems && item.hidden_gems.length ? `
                            <div class="hidden-gems">
                                <strong>Hidden Gems:</strong>
                                <ul>${item.hidden_gems.map(h => `<li><a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(h + ', ' + des)}/"><i class="ri-road-map-fill"></i></a> ${h}</li>`).join("")}</ul>
                            </div>
                        ` : ''}

                        ${item.restaurants && item.restaurants.length ? `
                            <div class="restaurants">
                                <strong>Restaurants:</strong>
                                <ul>${item.restaurants.map(r => `<li><a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(r.name + ', ' + des)}/"><i class="ri-road-map-fill"></i></a> ${r.name} (${r.type}) - ${r.approx_price}</li>`).join("")}</ul>
                            </div>
                        ` : ''}
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <h2>🏨 Recommended Hotels</h2>
                ${(json.hotels || []).map(h => `
                    <div class="hotel">
                        <p><strong><a target="_blank" href="https://www.google.com/maps/search/${encodeURIComponent(h.name + ', ' + des)}/"><i class="ri-road-map-fill"></i></a> ${h.name}</strong></p>
                        <p>${h.description}</p>
                        <p><span class="highlight">Price:</span> ${h.approx_price_per_night} per night</p>
                    </div>
                `).join("")}
            </div>

            <div class="section">
                <h2>🚗 Transportation Plan</h2>
                <div class="transportation">
                    <p><strong>Mode:</strong> ${json.transportation_plan?.mode || 'N/A'}</p>
                    <p><strong>Cost:</strong> ${json.transportation_plan?.approx_cost || 'N/A'}</p>
                    <p><strong>Duration:</strong> ${json.transportation_plan?.travel_duration || 'N/A'}</p>
                    <p><a target="_blank" href="https://www.google.com/maps/dir/${encodeURIComponent(current)}/${encodeURIComponent(des)}/"><i class="ri-road-map-fill"></i> Here is Your way</a></p>
                </div>
            </div>

            <div class="section">
                <h2>💡 Travel Tips</h2>
                <ul class="tips">
                    ${(json.travel_tips || []).map(t => `<li>${t}</li>`).join("")}
                </ul>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="color:red;">Error: ${error.message}. Please check your API key or quota.</p>`;
    }
}// import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
// import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// // --- 1. FIREBASE SETUP ---
// const firebaseConfig = {
//   apiKey: "AIzaSyACqt6EU_HXMERYlr749oXsLd5oSibgylA",
//   authDomain: "tourism-4521b.firebaseapp.com",
//   projectId: "tourism-4521b",
//   storageBucket: "tourism-4521b.appspot.com",
//   messagingSenderId: "277991998919",
//   appId: "1:277991998919:web:c16e1f63084e748ac285e2",
//   measurementId: "G-9J70ZG3PJ4"
// };

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// // Handle Auth State Changes (UI updates only, no generation logic here)
// onAuthStateChanged(auth, (user) => {
//   const userSection = document.querySelector(".login2");

//   if (!user) return;

//   if (userSection) {
//     userSection.innerHTML = `
//       <div class="user-info">
//         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M14.2558 21.7442L12 24L9.74416 21.7442C5.30941 20.7204 2 16.7443 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 16.7443 18.6906 20.7204 14.2558 21.7442ZM6.02332 15.4163C7.49083 17.6069 9.69511 19 12.1597 19C14.6243 19 16.8286 17.6069 18.2961 15.4163C16.6885 13.9172 14.5312 13 12.1597 13C9.78821 13 7.63095 13.9172 6.02332 15.4163ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path></svg>
//         <span>${user.displayName || user.email.split('@')[0]}</span>
//         <button id="logoutBtn">Logout</button>
//       </div>
//     `;
//     document.getElementById("logoutBtn").addEventListener("click", () => {
//       signOut(auth).then(() => window.location.href = "Log-In.html");
//     });
//   }
// });

// // --- 2. FORM SUBMISSION ---
// const submitbtn = document.querySelector(".submit-btn");

// submitbtn.addEventListener("click", () => {
//   // Check auth FIRST. If not logged in, redirect immediately.
//   if (!auth.currentUser) {
//     window.location.href = "Log-In.html";
//     return;
//   }
//   let current_location = document.querySelector("#current_location").value;
//   let destination = document.querySelector("#destination").value;
//   let budget = document.querySelector("#budget").value;

//   let day = "";
//   document.querySelectorAll("input[name='day']:checked").forEach(radio => day = radio.value);

//   let transport = "";
//   document.querySelectorAll("input[name='transport']:checked").forEach(radio => transport = radio.value);

//   let interests = [];
//   document.querySelectorAll("input[name='interests']:checked").forEach(radio => interests.push(radio.value));

//   let command = {
//     current_location,
//     destination,
//     days: day,
//     budget,
//     travel_mode: transport,
//     interest: interests,
//     output_format: {
//       current_weather: "string",
//       best_time_to_visit: "string",
//       day_wise_itinerary: [{
//         day: null,
//         morning: "string",
//         afternoon: "string",
//         evening: "string",
//         travel_distance_km: null,
//         attractions: ["string"],
//         hidden_gems: ["string"],
//         restaurants: [{ name: "string", type: "string", approx_price: "string" }]
//       }],
//       hotels: [{ name: "string", description: "string", approx_price_per_night: "string" }],
//       transportation_plan: { mode: "string", approx_cost: "string", travel_duration: "string" },
//       travel_tips: ["string"]
//     }
//   };
//   generate(command);
// });

// // --- 3. GEMINI API GENERATION ---
// async function generate(command) {
//   let current = command.current_location;
//   let des = command.destination;

//   const container = document.querySelector(".page4");
//   container.style.display = "block";
//   container.textContent = "⏳ Generating structured travel plan. Please wait...";

//   try {
//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=AIzaSyCIPoPO6CXjH-7jvJ94jE0y6W_kndfMq9o",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: `You are a travel assistant that outputs ONLY valid JSON.
// Follow this exact structure:
// ${JSON.stringify(command.output_format, null, 2)}
// Generate travel plan for:
// ${JSON.stringify(command, null, 2)}`
//             }]
//           }],
//           generationConfig: { temperature: 0.7 }
//         })
//       }
//     );

//     if (!response.ok) {
//       if (response.status === 429) throw new Error("Too Many Requests! Please wait a minute and try again.");
//       throw new Error(`API Error: ${response.status}`);
//     }

//     const data = await response.json();

//     if (!data.candidates || data.candidates.length === 0) {
//       throw new Error("Gemini returned an empty response.");
//     }

//     let text = data.candidates[0].content.parts[0].text;
//     text = text.replace(/```json|```/g, "").trim();

//     let json = JSON.parse(text);
//     container.innerHTML = "";

//     //  Weather & Best Time
//     const weatherSection = `
//       <div class="section">
//         <h2>📅 General Info</h2>
//         <p><span class="highlight">Current Weather:</span> ${json.current_weather || "N/A"}</p>
//         <p><span class="highlight">Best Time to Visit:</span> ${json.best_time_to_visit || "N/A"}</p>
//       </div>
//     `;

//     //  Itinerary 
//     const itinerary = json.day_wise_itinerary || [];
//     const itinerarySection = `
//       <div class="section">
//         <h2>🗓️ Day-wise Itinerary</h2>
//         ${itinerary.map(day => `
//           <div class="itinerary-day">
//             <h3>Day ${day.day}</h3>
//             <p><strong>Morning:</strong> ${day.morning}</p>
//             <p><strong>Afternoon:</strong> ${day.afternoon}</p>
//             <p><strong>Evening:</strong> ${day.evening}</p>
//             <p><strong>Travel Distance:</strong> ${day.travel_distance_km} km</p>

//             <div class="attractions">
//               <strong>Attractions:</strong>
//               <ul>${(day.attractions || []).map(a => `<li>${a}</li>`).join("")}</ul>
//             </div>

//             <div class="hidden-gems">
//               <strong>Hidden Gems:</strong>
//               <ul>${(day.hidden_gems || []).map(h => `<li>${h}</li>`).join("")}</ul>
//             </div>

//             <div class="restaurants">
//               <strong>Restaurants:</strong>
//               <ul>
//                 ${(day.restaurants || []).map(r => `
//                   <li>
//                     <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + des)}">📍</a>
//                     ${r.name} (${r.type}) - ${r.approx_price}
//                   </li>
//                 `).join("")}
//               </ul>
//             </div>
//           </div>
//         `).join("")}
//       </div>
//     `;

//     //  Hotels
//     const hotels = json.hotels || [];
//     const hotelsSection = `
//       <div class="section">
//         <h2>🏨 Recommended Hotels</h2>
//         ${hotels.map(h => `
//           <div class="hotel">
//             <p>
//               <strong>
//                 <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' hotel ' + des)}">📍</a>
//                 ${h.name}
//               </strong>
//             </p>
//             <p>${h.description}</p>
//             <p><span class="highlight">Price:</span> ${h.approx_price_per_night} per night</p>
//           </div>
//         `).join("")}
//       </div>
//     `;

//     //  Transportation
//     const trans = json.transportation_plan || {};
//     const transportSection = `
//       <div class="section">
//         <h2>🚗 Transportation Plan</h2>
//         <div class="transportation">
//           <p><strong>Mode:</strong> ${trans.mode || "N/A"}</p>
//           <p><strong>Cost:</strong> ${trans.approx_cost || "N/A"}</p>
//           <p><strong>Duration:</strong> ${trans.travel_duration || "N/A"}</p>
//           <a target="_blank" href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(current)}&destination=${encodeURIComponent(des)}">
//             📍 Here is Your Way
//           </a>
//         </div>
//       </div>
//     `;

//     //  Travel Tips
//     const tips = json.travel_tips || [];
//     const tipsSection = `
//       <div class="section">
//         <h2>💡 Travel Tips</h2>
//         <ul class="tips">
//           ${tips.map(t => `<li>${t}</li>`).join("")}
//         </ul>
//       </div>
//     `;

//     container.innerHTML = weatherSection + itinerarySection + hotelsSection + transportSection + tipsSection;

//   } catch (error) {
//     console.error("Gemini Error:", error);
//     document.querySelector(".page4").innerHTML = `
//       <div style="color: red; padding: 20px;">
//         <h3>❌ Failed to generate travel plan.</h3>
//         <p>${error.message}</p>
//       </div>`;
//   }

// }
