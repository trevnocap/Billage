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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (window.location.pathname !== "/") {
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


export class Popup {
  constructor(elements, settings) {
    this.elements = elements;
    this.popupWrapper = null;
    this.shouldReload = false;

    if (settings === undefined) {
      this.settings = {
        closeButton: true,
        logo: true,
      };
    } else {
      this.settings = settings;
    }

    this.closePopUp = this.closePopUp.bind(this);
  }

  createPopup(content) {
    if (this.popupWrapper) {
      this.popupWrapper.remove();
    }

    this.popupWrapper = document.createElement('div');
    this.popupWrapper.classList.add('add-billage-popup');

    const popUp = document.createElement('div');
    popUp.classList.add('col-md-8', 'col-lg-6', 'col-sm-8', 'border-container', 'bg-light');

    const topRow = document.createElement('div');
    topRow.classList.add('row', 'mt-3');

    const topRowContent = document.createElement('div');
    topRowContent.classList.add('col-md-12', 'col-lg-12', 'col-sm-12');

    let closeButton;
    if (this.settings.closeButton) {
      closeButton = document.createElement('button');
      closeButton.innerHTML = '❌'
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', this.closePopUp);
    }
    if (this.settings.logo){
      const logo = document.createElement('img');
      logo.src = '/images/logo.png';
      logo.classList.add('popup-logo');
      topRowContent.appendChild(logo);
    }
    if (closeButton){
      topRowContent.appendChild(closeButton);
    }
    
    topRow.appendChild(topRowContent);
    popUp.appendChild(topRow);


    const contentRow = document.createElement('div');
    contentRow.classList.add('row');

    const contentRowContentDiv = document.createElement('div');
    contentRowContentDiv.classList.add('col-md-12', 'col-lg-12', 'col-sm-12', 'mt-3',);
    
    contentRowContentDiv.innerHTML = content;
    contentRow.appendChild(contentRowContentDiv);
    popUp.appendChild(contentRow);

    this.popupWrapper.appendChild(popUp);
    document.body.appendChild(this.popupWrapper);
  }

  closePopUp() {
    for (const element of this.elements) {
      element.style.filter = '';
      element.style.pointerEvents = '';
    }
    this.popupWrapper.remove();

    if (this.shouldReload){
      location.reload();
    }
  }

  setContent(content) {
    this.createPopup(content);
  }

}

export function getQueryParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}
