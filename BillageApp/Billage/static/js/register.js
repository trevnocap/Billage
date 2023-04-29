
const baseURL = 'http://127.0.0.1:8000/'

const loginForm = document.getElementById('register-form');

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const username = document.getElementById('username-input').value;
  const first_name = document.getElementById('firstname-input').value;
  const last_name = document.getElementById('lastname-input').value;
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;


const response = await fetch(`${baseURL}api/register/`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, first_name, last_name, email, password })
});

if (response.ok) {
    // redirect the user to a new page
    window.location.href = `${baseURL}login/`;
} else {
    // handle the error
    const errorMessage = document.querySelector('.registerfailed');
    errorMessage.textContent = 'Registration failed. Please try again.';

    }
});
