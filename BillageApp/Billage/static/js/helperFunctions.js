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

//dashboard functions

export function getBillageCardBootstrapClass(list){
  if (list.length <= 1) {
    return ['col-md-12', 'col-lg-12'];
  } else if (list.length === 2) {
    return ['col-md-6', 'col-lg-6'];
  } else {
    return ['col-md-4', 'col-lg-4'];
  }
}

function iconGenorator(type){
  const iconLibrary = {
    bank_account: '/images/bankicon.png',
    credit_card: '/images/creditcardicon.png',
    Gas: '/images/gas.png',
    Cable: '/images/cable.png',
    streaming: '/images/cable.png',
    Electric: '/images/electric.png',
    Rent: '/images/rent.png',
    Water: '/images/water.png',
    Internet: '/images/internet.png',
    generalBill: '/images/bill.png',
  };

  if (type in iconLibrary) {
    return iconLibrary[type];
  } else {
    throw new Error(`Unknown icon type: ${type}`);
  }

}

export function returnIcon(type){
  try{
    return(iconGenorator(type))
  }
  catch (error){
    return returnIcon('generalBill')
  }
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}