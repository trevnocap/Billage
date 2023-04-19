import { parseJwt, checkAccessTokenAndRedirectToLogin } from "./helper_functions.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAccessTokenAndRedirectToLogin();
});

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const username = document.getElementById('username-input').value;
  const password = document.getElementById('password-input').value;
  login(username, password);
});

async function login(username, password) {
  const response = await fetch("http://127.0.0.1:8000/api/auth/jwt/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);

    const decodedToken = parseJwt(data.access);
    const user_id = decodedToken.user_id;
    console.log(user_id);

    window.location.href = `http://127.0.0.1:8000/dashboard/`;
  } else {
    const errorMessage = document.querySelector(".loginfailed");
    errorMessage.textContent = "Login failed. Please try again.";
  }
}


