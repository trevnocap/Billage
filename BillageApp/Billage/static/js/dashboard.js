import { parseJwt, checkAccessTokenAndRedirectToLogin } from "./helperFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
    checkAccessTokenAndRedirectToLogin();
});

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
let popupWrapper;
let shouldReload = false;

function createPopup(content) {

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

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '❌'
    closeButton.classList.add('close-button');
    closeButton.addEventListener('click', closePopUp);

    const logo = document.createElement('img');
    logo.src = '/images/logo.png';
    logo.classList.add('popup-logo');
    topRowContent.appendChild(logo);
    topRowContent.appendChild(closeButton);
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
  
function closePopUp() {
    mainElement.style.filter = '';
    navbarElement.style.filter = '';
    mainElement.style.pointerEvents = '';
    navbarElement.style.pointerEvents = '';
    popupWrapper.remove();
    if (shouldReload){
        location.reload();
    }
}


export function billageButtonsHandler() {
    const createBillageButtons = document.querySelectorAll('.create-billage-button');
    const joinBillageButtons = document.querySelectorAll('.join-billage-button');

    createBillageButtons.forEach(button => {
        button.addEventListener('click', () => {

            mainElement.style.filter = 'blur(7px)';
            navbarElement.style.filter = 'blur(7px)';
            mainElement.style.pointerEvents = 'none';
            navbarElement.style.pointerEvents = 'none';

            const content = `
                <div class="row mx-2">
                <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                    <h2>Create a New Billage!</h2>
                    <div class="form-group mt-3">
                        <label for="billageName">Billage Name:</label>
                        <input type="text" class="form-control" id="billageName" placeholder="Enter Billage Name">
                        <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                    </div>
                        <button class='btn btn-primary mt-3 mb-5' id='submit-button'>Create Billage</button>
                    </div>
                    <div class="col col-md-4 d-flex flex-column align-items-center">
                        <p>• Creating a Billage will allow you to add members and link bills which we will spilt up for you! </p>
                    </div>
                </div>
            `;
            createPopup(content)

            handleCreateSubmission();
        });
    });

    joinBillageButtons.forEach(button => {        
        button.addEventListener('click', () => {
            mainElement.style.filter = 'blur(7px)';
            navbarElement.style.filter = 'blur(7px)';
            mainElement.style.pointerEvents = 'none';
            navbarElement.style.pointerEvents = 'none';

            const content = `
                <div class="row mx-2">
                    <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                        <h2>Join a Billage!</h2>
                        <div class="form-group mt-3">
                            <label for="join-billage-id">Billage ID:</label>
                            <input type="text" class="form-control" id="join-billage-id" placeholder="Enter Billage ID">
                            <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                        </div>
                        <button class='btn btn-primary mt-3 mb-5' id='submit-billage-id'>Join Billage</button>
                    </div>
                    <div class="col col-md-4 d-flex flex-column align-items-center">
                        <p>• Enter the Billage ID provided by your friend to join their Billage and start sharing bills!</p>
                    </div>
                </div>
            `

            createPopup(content);

            handleJoinSubmission();
        });
    });
}

function handleCreateSubmission(){
    const accessToken = localStorage.getItem('access_token');
    const decodedToken = parseJwt(accessToken);
    const user_id = decodedToken.user_id;

    const submitButton = document.getElementById('submit-button');
    
    submitButton.addEventListener('click', async () =>{
        submitButton.disabled = true;

        const errorHandler = document.getElementById('error-message');
        const billageNameInputField = document.getElementById('billageName');
        let billageName = billageNameInputField.value;

        if (billageName.length < 5 || billageName.length > 20){
            errorHandler.textContent = 'Length must be between 5 and 20 characters!';
            errorHandler.style.display = 'block';
            submitButton.disabled = false;
        }else{

            let newBillage = {
                'billage_name': billageName,
                'billage_members' : [
                    user_id
                ]
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/create-join-billage/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newBillage)
                });
        
                if (response.status === 201) {
                    errorHandler.style.display = 'none';
                    const responseData = await response.json();
                    showNewBillageData(responseData);
                } else {
                    errorHandler.textContent = 'An error occurred while creating your billage! Please try again later.'
                    errorHandler.style.display = 'block';
                    console.error('Error creating Billage:', response.status, response.statusText);
                    submitButton.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                submitButton.disabled = false;
            }

        }
    
    });
}

function handleJoinSubmission(){
    const accessToken = localStorage.getItem('access_token');
    const decodedToken = parseJwt(accessToken);
    const user_id = decodedToken.user_id;

    const joinButton = document.getElementById('submit-billage-id');

    joinButton.addEventListener('click', async () =>{
        joinButton.disabled = true;

        const errorHandler = document.getElementById('error-message');
        const billageIDField = document.getElementById('join-billage-id');
        let billageID = billageIDField.value;

        if (billageID.length !== 8){
            errorHandler.textContent = 'ID must be the correct format!';
            errorHandler.style.display = 'block';
            joinButton.disabled = false;
        }else{

            let newMember = {
                'billage_id': billageID,
                'user_id': user_id
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/create-join-billage/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newMember)
                });
        
                if (response.status === 200) {
                    shouldReload = true;
                    errorHandler.style.color = 'green';
                    errorHandler.textContent = 'The Billage was successfully joined!'
                    errorHandler.style.display = 'block';
                    setTimeout(() => {
                        closePopUp();
                    }, 2500);   
                }else if (response.status === 404) {
                    errorHandler.textContent = 'Billage ID not found!'
                    errorHandler.style.display = 'block';
                    joinButton.disabled = false;
                }else if (response.status === 400){
                    errorHandler.textContent = 'You cannot join the same Billage twice!'
                    errorHandler.style.display = 'block';
                    joinButton.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
            }

        }
    
    });
}

function showNewBillageData(responseData){
    shouldReload = true;
    const billageID = responseData['billage_id'];
    
    const content = `
        <div class="row mx-2">
            <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                <h2>Billage Successfully Created!</h2>
                <div class="form-group mt-3">
                    <label for="billageID">Billage ID:</label>
                    <input type="text" class="form-control" id="billageID" value="${billageID}" readonly>
                </div>
                <p class="mt-3">Share this Billage ID with your friends, so they can join your Billage!</p>
            </div>
            <div class="col col-md-4 d-flex flex-column align-items-center">
            <p>• Your friends can join your Billage by entering the Billage ID when joining a Billage.</p>
            </div>
        </div>
    `;

    createPopup(content);
}

billageButtonsHandler();