import { parseJwt, checkAccessTokenAndRedirectToLogin, Popup } from "./helperFunctions.js";

document.addEventListener("DOMContentLoaded", () => {
    checkAccessTokenAndRedirectToLogin();
});

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');

const elements = [mainElement, navbarElement];

const popUp = new Popup(elements);

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
            popUp.setContent(content);

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

            popUp.setContent(content);

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
                const response = await fetch('http://127.0.0.1:8000/api/create-billage/', {
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
                const response = await fetch('http://127.0.0.1:8000/api/join-billage/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newMember)
                });
        
                if (response.status === 200) {
                    popUp.shouldReload = true;
                    errorHandler.style.color = 'green';
                    errorHandler.textContent = 'The Billage was successfully joined!'
                    errorHandler.style.display = 'block';
                    setTimeout(() => {
                        popUp.closePopUp();
                    }, 2500);   
                }else if (response.status === 404) {
                    errorHandler.textContent = 'Billage ID not found!'
                    errorHandler.style.display = 'block';
                    joinButton.disabled = false;
                }else if (response.status === 400){
                    errorHandler.textContent = 'You cannot join a Billage that you are already in!'
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
    popUp.shouldReload = true;
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
            <button class="btn btn-outline-secondary mt-3" id="on-create-share-button"><i class="fas fa-share-alt"></i> Share</button>
        </div>
    </div>
    `;

    popUp.setContent(content);

    handleShareButton(billageID);
}

function handleShareButton(billageID){
    const shareButton = document.getElementById('on-create-share-button');

    shareButton.addEventListener('click', async () => {
        console.log('Share button clicked');
        const token = localStorage.getItem('access_token');
        const response = await fetch(`/api/create_shareable_link/${billageID}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',  // Include user's credentials (cookies) in the request
        });
        if (response.ok){
            const data = await response.json();
            const shareLink = data.shareable_link;

            const content = `
            <div class="share-popup">
                <p>Share this link with your friends to join your Billage:</p>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" id="share-link" value="${shareLink}" readonly>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" id="copy-link-button">Copy</button>
                    </div>
                </div>
                <p>This link will expire in 1 hour.</p>
            </div>
            <script>
                document.getElementById('copy-link-button').addEventListener('click', function () {
                    // Get the input field that contains the text you want to copy
                    const shareLinkInput = document.getElementById('share-link');

                    // Select the text in the input field
                    shareLinkInput.select();
                    shareLinkInput.setSelectionRange(0, 99999); // For mobile devices

                    // Copy the selected text to the clipboard
                    navigator.clipboard.writeText(shareLinkInput.value)
                        .then(() => {
                            document.getElementById('copy-link-button').textContent = 'Copied!';
                        })
                        .catch((err) => {
                            console.error('Could not copy text to clipboard', err);
                        });
                });
            </script>
            `;

            popUp.setContent(content);
            const script = document.createElement('script');
            script.textContent = `
                document.getElementById('copy-link-button').addEventListener('click', function () {
                    const shareLinkInput = document.getElementById('share-link');
                    shareLinkInput.select();
                    shareLinkInput.setSelectionRange(0, 99999);
                    navigator.clipboard.writeText(shareLinkInput.value)
                        .then(() => {
                            document.getElementById('copy-link-button').textContent = 'Copied!';
                        })
                        .catch((err) => {
                            console.error('Could not copy text to clipboard', err);
                        });
                });
            `;
            popUp.popupWrapper.appendChild(script);

        }

    });
}
 
function signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refrsh_token');
    // Clear the cache
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      });
    }
  
    window.location.href = 'http://127.0.0.1:8000/'
}

function signOutButtonHandler(){
    const signOutButton = document.getElementById('sign-out-button');
    signOutButton.addEventListener('click', () => {
        signOut();
    });
}

billageButtonsHandler();
signOutButtonHandler();
