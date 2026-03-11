// Sending the username and password to the backend API to check for user
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Sending post request to backend API
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  // Converts request from the server into JSON
  const data = await res.json();

  // Login success :
  // It stores the information in localstorage to remember user across pages
  if (data.success) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        role: data.role,
      })
    );

    // Redirect to main page
    window.location.href = "/";

    // Login failed:
  } else {
    document.getElementById("message").innerText = "Login failed";
  }
}
