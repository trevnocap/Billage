import { checkAccessTokenAndRedirectToLogin, parseJwt } from './helperFunctions.js';

let popupWrapper;

const navbarElement = document.getElementById('navbar');

function createPopup(content) {
    navbarElement.style.filter = 'blur(7px)';
    if (popupWrapper) {
        popupWrapper.remove();
    }    

    popupWrapper = document.createElement('div');
    popupWrapper.classList.add('add-billage-popup');
  
    const popUp = document.createElement('div');
    popUp.classList.add('col-md-8', 'col-lg-6', 'col-sm-8', 'border-container', 'bg-light');

    const topRow = document.createElement('div');
    topRow.classList.add('row', 'mt-3');

    const topRowContent = document.createElement('div');
    topRowContent.classList.add('col-md-12', 'col-lg-12', 'col-sm-12');

    const logo = document.createElement('img');
    logo.src = '/images/logo.png';
    logo.classList.add('popup-logo');
    topRowContent.appendChild(logo);
    topRow.appendChild(topRowContent);
    popUp.appendChild(topRow);


    const contentRow = document.createElement('div');
    contentRow.classList.add('row');

    const contentRowContentDiv = document.createElement('div');
    contentRowContentDiv.classList.add('col-md-12', 'col-lg-12', 'col-sm-12', 'mt-3',);
    
    contentRowContentDiv.innerHTML = content;
    contentRow.appendChild(contentRowContentDiv);
    popUp.appendChild(contentRow);

    popupWrapper.appendChild(popUp);
    document.body.appendChild(popupWrapper);
}
  


function extractUUIDFromURL() {
    const path = window.location.pathname;
    const pathParts = path.split('/');
    return pathParts[pathParts.length - 2]; // Assumes the UUID is the second last part of the path
}

let buttons;
document.addEventListener("DOMContentLoaded", async () => {
    checkAccessTokenAndRedirectToLogin();
    const access_token = localStorage.getItem('access_token');
    const decodedToken = parseJwt(access_token);
    const userID = decodedToken.user_id; 
    const linkUUID = extractUUIDFromURL();
    console.log(linkUUID);

    const content = `
        <div class="row mx-2">
            <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                <h2>Do you want to join this Billage?</h2>
                <div class="form-group mt-3">
                    <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <button class='btn btn-primary w-100 mb-5 mr-2 answer-button' id='yes-button'>Yes</button>
                    <button class='btn btn-primary w-100 mb-5 answer-button'>No</button>
                </div>
            </div>
            <div class="col col-md-4 d-flex flex-column align-items-center">
                <p>• By accepting you agree to automatically split any bills that are already in place! This can be changed later</p>
            </div>
        </div>
    `;
    
    createPopup(content);

    buttons = document.querySelectorAll('.answer-button');
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            if (button.id === 'yes-button') {
                button.disabled = true;
                await joinBillage(linkUUID, userID);
            }else{
                window.location.href = 'http://127.0.0.1:8000/dashboard';
            }
        });
    });
});

async function joinBillage(linkUUID, userID) {
    const url = 'http://127.0.0.1:8000/api/join-billage/';
    const data = {
        link_uuid: linkUUID,
        user_id: userID
    };

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        const errorHandler = document.getElementById('error-message');
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse.message);
            window.location.href = 'http://127.0.0.1:8000/dashboard';
        }else if (response.status === 400){
            errorHandler.textContent = 'You cannot join a Billage that you are already in!'
            errorHandler.style.display = 'block';
            buttons.forEach(button => {
                button.disabled = true;
            });
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:8000/dashboard'
              }, 3000); 
        }else if(response.status === 410){
            errorHandler.textContent = 'This shareable link is expired!'
            errorHandler.style.display = 'block';
            buttons.forEach(button => {
                button.disabled = true;
            });
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:8000/dashboard'
              }, 3000);
        }else{
            console.error(`Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
