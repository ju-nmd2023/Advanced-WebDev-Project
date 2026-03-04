let currentCategory = "";

async function loadVenues() {
  let url = "/api/venues";

  if (currentCategory) {
    url += `?category=${currentCategory}`;
  }

  const res = await fetch(url);
  const venues = await res.json();

  renderVenues(venues);
}

function renderVenues(venues) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  venues.forEach((v) => {
    const rating = parseInt(v.rating) || 0;
    const stars = "⭐".repeat(rating);

    const div = document.createElement("div");

    div.innerHTML = `
<h3>${v.name}</h3>
<p>Category: ${v.category || ""}</p>
<p>Location: ${v.location || ""}</p>
<p>Address: ${v.address || ""}</p>
<p>Rating: ${stars}</p>
<p>Opening hours: ${v.opening_hours || ""}</p>

<p><a href="${v.maps_link}" target="_blank">Google Maps</a></p>

<button onclick="deleteVenue(${v.id})">Delete</button>

<hr>
`;

    list.appendChild(div);
  });
}

async function addVenue() {
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

  loadVenues();

  // clear form
  document.getElementById("name").value = "";
  document.getElementById("address").value = "";
  document.getElementById("website").value = "";
  document.getElementById("rating").value = "";
  document.getElementById("open").value = "";
  document.getElementById("close").value = "";
  document.getElementById("maps_link").value = "";
}

async function deleteVenue(id) {
  await fetch(`/api/venues/${id}`, {
    method: "DELETE",
  });

  loadVenues();
}

function filterCategory(category) {
  currentCategory = category;
  loadVenues();
}

async function applyFilters() {
  const location = document.getElementById("filterLocation").value;

  let url = "/api/venues?";

  if (currentCategory) {
    url += `category=${currentCategory}&`;
  }

  if (location) {
    url += `location=${location}`;
  }

  const res = await fetch(url);
  const venues = await res.json();

  renderVenues(venues);
}

loadVenues();
