let currentCategory = "";
let selectedCategories = new Set();
let allVenues = [];

// Checking session for user, and if the admin is present
const user = JSON.parse(localStorage.getItem("user"));
const isAdmin = user && user.role === "admin";

window.addEventListener("DOMContentLoaded", () => {
  const devLink = document.getElementById("developerLink");

  if (isAdmin) {
    devLink.innerText = "Logout";

    devLink.onclick = function (e) {
      e.preventDefault();
      localStorage.removeItem("user");
      location.reload();
    };
  }

  if (!isAdmin) {
    const addSection = document.getElementById("addVenueSection");
    if (addSection) {
      addSection.style.display = "none";
    }
  }
});

function normalizeText(value) {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// LOAD VENUES
async function loadVenues() {
  let url = "/api/venues";

  if (currentCategory) {
    url += `?category=${currentCategory}`;
  }

  const res = await fetch(url);
  const venues = await res.json();

  allVenues = venues;

  renderVenues(getFilteredVenues());
}

function getFilteredVenues() {
  const search = normalizeText(
    document.getElementById("searchInput")?.value ?? ""
  );

  return allVenues.filter((v) => {
    const matchesSearch = search
      ? normalizeText(v.name).includes(search)
      : true;

    if (!matchesSearch) return false;

    if (selectedCategories.size === 0) return true; // "All categories"

    const venueCategory = normalizeText(v.category);
    return selectedCategories.has(venueCategory);
  });
}

// RENDER VENUES
function renderVenues(venues) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  venues.forEach((v) => {
    const rating = parseInt(v.rating) || 0;
    const stars = "⭐".repeat(rating);

    const div = document.createElement("div");
    div.classList.add("venue-card");

    div.innerHTML = `

<div id="view-${v.id}">

<h3>${v.name}</h3>
<p>Location: ${v.location || ""}</p>
<p>Opening hours: ${v.opening_hours || ""}</p>

<button id="toggle-${v.id}" onclick="toggleDetails(${v.id})">
Read more
</button>

${
  isAdmin
    ? `
<button onclick="startEdit(${v.id})">Edit</button>
<button onclick="deleteVenue(${v.id})">Delete</button>
`
    : ""
}
<div id="details-${v.id}" style="display:none">

<p>Category: ${v.category || ""}</p>
<p>Address: ${v.address || ""}</p>
<p>Website: <a href="${v.website}" target="_blank">Visit</a></p>
<p>Rating: ${stars}</p>
<p><a href="${v.maps_link}" target="_blank">Google Maps</a></p>

</div>

</div>


<div id="edit-${v.id}" style="display:none">

<input id="edit-name-${v.id}" value="${v.name}" />

<select id="edit-category-${v.id}">
<option value="restaurant" ${
      v.category === "restaurant" ? "selected" : ""
    }>Restaurant</option>
<option value="cafe" ${v.category === "cafe" ? "selected" : ""}>Cafe</option>
<option value="bar" ${v.category === "bar" ? "selected" : ""}>Bar</option>
<option value="venue" ${v.category === "venue" ? "selected" : ""}>Venue</option>
</select>

<select id="edit-location-${v.id}">
<option value="centrum" ${
      v.location === "centrum" ? "selected" : ""
    }>Centrum</option>
<option value="torpa" ${v.location === "torpa" ? "selected" : ""}>Torpa</option>
<option value="huskvarna" ${
      v.location === "huskvarna" ? "selected" : ""
    }>Huskvarna</option>
</select>

<input id="edit-address-${v.id}" value="${v.address || ""}" />
<input id="edit-website-${v.id}" value="${v.website || ""}" />

<input id="edit-rating-${v.id}" type="number" min="1" max="5" value="${
      v.rating || ""
    }" />

<input id="edit-open-${v.id}" value="${
      v.opening_hours ? v.opening_hours.split(" - ")[0] : ""
    }" />
<input id="edit-close-${v.id}" value="${
      v.opening_hours ? v.opening_hours.split(" - ")[1] : ""
    }" />

<input id="edit-maps-${v.id}" value="${v.maps_link || ""}" />

<button onclick="saveEdit(${v.id})">Save</button>
<button onclick="cancelEdit(${v.id})">Cancel</button>

</div>

<hr>

`;

    list.appendChild(div);
  });
}

// TOGGLE READ MORE
function toggleDetails(id) {
  const details = document.getElementById(`details-${id}`);
  const button = document.getElementById(`toggle-${id}`);

  if (details.style.display === "none") {
    details.style.display = "block";
    button.innerText = "Show less";
  } else {
    details.style.display = "none";
    button.innerText = "Read more";
  }
}

// ADD VENUE
async function addVenue() {
  if (!isAdmin) {
    alert("Only admins can add venues.");
    return;
  }

  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const address = document.getElementById("address").value;
  const website = document.getElementById("website").value;

  const rating = parseInt(document.getElementById("rating").value) || 0;

  const open = document.getElementById("open").value;
  const close = document.getElementById("close").value;

  const maps_link = document.getElementById("maps_link").value;

  const opening_hours = open && close ? `${open} - ${close}` : "";

  await fetch("/api/venues", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      category,
      location,
      address,
      website,
      rating,
      opening_hours,
      maps_link,
    }),
  });

  // clear form
  document.getElementById("name").value = "";
  document.getElementById("address").value = "";
  document.getElementById("website").value = "";
  document.getElementById("rating").value = "";
  document.getElementById("open").value = "";
  document.getElementById("close").value = "";
  document.getElementById("maps_link").value = "";

  loadVenues();
}

// START EDIT
function startEdit(id) {
  document.getElementById(`view-${id}`).style.display = "none";
  document.getElementById(`edit-${id}`).style.display = "block";
}

// CANCEL EDIT
function cancelEdit(id) {
  document.getElementById(`view-${id}`).style.display = "block";
  document.getElementById(`edit-${id}`).style.display = "none";
}

// SAVE EDIT
async function saveEdit(id) {
  if (!isAdmin) {
    alert("Only admins can edit venues.");
    return;
  }

  const name = document.getElementById(`edit-name-${id}`).value;
  const category = document.getElementById(`edit-category-${id}`).value;
  const location = document.getElementById(`edit-location-${id}`).value;
  const address = document.getElementById(`edit-address-${id}`).value;
  const website = document.getElementById(`edit-website-${id}`).value;
  const rating = document.getElementById(`edit-rating-${id}`).value;

  const open = document.getElementById(`edit-open-${id}`).value;
  const close = document.getElementById(`edit-close-${id}`).value;

  const maps_link = document.getElementById(`edit-maps-${id}`).value;

  let opening_hours = "";

  if (open && close) {
    opening_hours = `${open} - ${close}`;
  }

  await fetch(`/api/venues/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      name,
      category,
      location,
      address,
      website,
      rating,
      opening_hours,
      maps_link,
    }),
  });

  loadVenues();
}

// DELETE VENUE
async function deleteVenue(id) {
  if (!isAdmin) {
    alert("Only admins can delete venues.");
    return;
  }

  await fetch(`/api/venues/${id}`, {
    method: "DELETE",
  });

  loadVenues();
}

// FILTER CATEGORY
function filterCategory(category, btn) {
  if (category === "") {
    // "All categories" clears category filters
    selectedCategories.clear();
  } else {
    const key = normalizeText(category);
    if (selectedCategories.has(key)) {
      selectedCategories.delete(key);
    } else {
      selectedCategories.add(key);
    }
  }

  updateCategoryButtonStyles();
  renderVenues(getFilteredVenues());
}

function updateCategoryButtonStyles() {
  const buttons = document.querySelectorAll(
    ".category-buttons .category-btn[data-category]"
  );

  buttons.forEach((b) => {
    b.classList.remove("active");
    b.classList.remove("all-selected");

    const cat = b.dataset.category ?? "";
    if (cat !== "" && selectedCategories.has(normalizeText(cat))) {
      b.classList.add("active");
    }
  });

  const allBtn = document.querySelector(
    '.category-buttons .category-btn[data-category=""]'
  );

  if (allBtn && selectedCategories.size === 0) {
    allBtn.classList.add("all-selected");
  }
}

function toggleMoreCategories() {
  const container = document.querySelector(".category-buttons");

  if (!container) return;

  container.classList.toggle("show-more");

  const moreBtn = document.getElementById("moreButton");
  if (moreBtn) {
    moreBtn.textContent = container.classList.contains("show-more")
      ? "Less"
      : "More";
  }
}

// LOCATION FILTER
async function applyFilters() {
  const location = document.getElementById("filterLocation").value;
  const category = document.getElementById("filterCategory").value;
  const openNow = document.getElementById("filterOpenNow").checked;

  let url = "/api/venues?";

  if (location) {
    url += `location=${location}&`;
  }

  if (category) {
    url += `category=${category}&`;
  }

  const res = await fetch(url);
  let venues = await res.json();

  if (openNow) {
    const now = new Date();
    const currentTime =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    venues = venues.filter((v) => {
      if (!v.opening_hours) return false;

      const [open, close] = v.opening_hours.split(" - ");

      return currentTime >= open && currentTime <= close;
    });
  }

  renderVenues(venues);
}

function searchVenues() {
  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allVenues.filter((v) =>
    v.name.toLowerCase().includes(search)
  );

  renderVenues(filtered);
}

// INITIAL LOAD
window.addEventListener("DOMContentLoaded", () => {
  // Default: no category filters => "All categories" appears selected
  updateCategoryButtonStyles();
  loadVenues();
});
