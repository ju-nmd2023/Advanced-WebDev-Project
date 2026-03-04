let currentCategory = "";

async function loadVenues() {
  const res = await fetch("/api/venues");
  const venues = await res.json();

  renderVenues(venues);
}

function renderVenues(venues) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  venues.forEach((v) => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${v.name}</h3>
      <p>${v.category || ""}</p>
      <p>${v.location || ""}</p>
      <p>${v.address || ""}</p>
      ${v.website ? `<a href="${v.website}" target="_blank">Website</a>` : ""}
      <hr/>
    `;

    list.appendChild(div);
  });
}

async function filterCategory(category) {
  currentCategory = category;

  let url = "/api/venues";

  if (category) {
    url += `?category=${category}`;
  }

  const res = await fetch(url);
  const venues = await res.json();

  renderVenues(venues);
}

async function addVenue() {
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;
  const address = document.getElementById("address").value;
  const website = document.getElementById("website").value;

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
    }),
  });

  loadVenues();
}

loadVenues();
