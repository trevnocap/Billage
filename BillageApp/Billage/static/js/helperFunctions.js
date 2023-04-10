export function parseJwt (token) {
    try{
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    
        return JSON.parse(jsonPayload);
    }catch(e){
        window.location.href = `http://127.0.0.1:8000/`;
    }
    
  }

export function checkAccessTokenAndRedirectToLogin() {
  const accessToken = localStorage.getItem("access_token");

  if (!accessToken) {
    if (window.location.pathname !== "/") {
      window.location.href = "http://127.0.0.1:8000/";
    }
    return;
  }

  const decodedToken = parseJwt(accessToken);
  const currentTime = Date.now() / 1000;

  if (decodedToken.exp <= currentTime) {
    // Token is expired, remove the access_token and refresh_token from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (window.location.pathname !== "/") {
      // Redirect to the login page
      window.location.href = "http://127.0.0.1:8000/";
    }
  } else if (window.location.pathname === "/") {
    window.location.href = "http://127.0.0.1:8000/dashboard";
  }
}
