# 🌤️ Vanilla JS Weather App

An interactive, responsive Weather Dashboard built using modern Vanilla JavaScript (ES6+), HTML5, and CSS3. 

This project teaches students how to fetch asynchronous data from third-party REST APIs using `async`/`await`, parse JSON payloads, and gracefully manage UI loading and network error states.

---

## 🎯 Key Technical Concepts Learned

- **Asynchronous JavaScript (`async`/`await`):** Handling asynchronous network requests without callback hell or messy `.then()` promise chains.
- **Fetch API & HTTP Status Codes:** Making `fetch()` requests and checking `response.ok` or response status codes (e.g., HTTP 404 City Not Found).
- **DOM Manipulation & Media Injection:** Injecting dynamic text, calculated temperature conversions, and updating image `src` paths for weather condition icons.
- **State & UI Flow Management:** Toggling CSS utility classes (e.g., `.hidden`) to transition smoothly between loading spinners, error alerts, and populated weather cards.
- **Defensive API Error Handling:** Wrapping network requests in `try/catch/finally` blocks to guarantee loader cleanup even when network errors occur.

---

## 📂 Project Structure

weather-app/
├── index.html        # Main layout, search form, weather display cards
├── style.css         # Responsive weather dashboard styling & condition visuals
├── script.js         # Fetch API calls, async/await handlers, DOM rendering
└── README.md         # Project documentation & overview

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   git clone https://github.com/YOUR-ORG-NAME/vanilla-js-weather-app.git

2. **Navigate into the directory:**
   cd vanilla-js-weather-app

3. **Open `index.html` in your browser:**
   Double-click `index.html` or use the VS Code Live Server extension.

---

## 🗺️ Git Commit Roadmap

1. `feat: setup HTML layout, search input, and weather card skeleton`
2. `style: add responsive weather card layout and visual styles`
3. `feat: implement asynchronous weather data fetching logic`
4. `feat: render live weather data and dynamic icons to DOM`
5. `feat: add robust error handling and loading indicators`
6. `feat: add unit conversion toggle and final UI polish`