const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent the form from submitting normally
  const username = document.getElementById('username-input').value;
  const password = document.getElementById('password-input').value;
  login(username, password);
});

async function login(username, password) {
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
  
    if (response.ok) {
      // redirect the user to a new page
      const data = await response.json();
      user_id = data.id;

      window.location.href = `http://127.0.0.1:8000/dashboard/?user_id=${user_id}`;
      
    } else {
      // handle the error
      const errorMessage = document.querySelector('.loginfailed');
      errorMessage.textContent = 'Login failed. Please try again.'
    }
  }

