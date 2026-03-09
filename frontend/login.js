async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

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

  const data = await res.json();

  if (data.success) {
    localStorage.setItem(
      "user",
      JSON.stringify({
        username: data.username,
        role: data.role,
      })
    );

    window.location.href = "/";
  } else {
    document.getElementById("message").innerText = "Login failed";
  }
}
