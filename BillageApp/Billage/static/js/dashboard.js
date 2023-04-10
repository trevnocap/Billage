const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
let popupWrapper;

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
    contentRowContentDiv.classList.add('col-md-12', 'col-lg-12', 'col-sm-12', 'mt-3', /*'d-flex' ,'justify-content-center', 'align-items-center'*/);
    
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
    location.reload();
}


export function billageButtonsHandler() {
    const createBillageButtons = document.querySelectorAll('.create-billage-button');
    const joinBillageButton = document.getElementById('join-billage-button');

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
                        <button class='btn btn-secondary mt-3 mb-5' id='submit-button'>Create Billage</button>
                    </div>
                    <div class="col col-md-4 d-flex flex-column align-items-center">
                        <p>• Creating a Billage will allow you to add members and link bills which we will spilt up for you! </p>
                    </div>
                </div>
            `;
            createPopup(content)

            handleSubmitButton();
        });
    });

    joinBillageButton.addEventListener('click', () => {
        mainElement.style.filter = 'blur(7px)';
        navbarElement.style.filter = 'blur(7px)';
        mainElement.style.pointerEvents = 'none';
        navbarElement.style.pointerEvents = 'none';

        const params = new URLSearchParams(window.location.search);
        const user_id = params.get('user_id');

        content = `
            <div class="row mx-2">
                <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                    <h2>Join a Billage!</h2>
                    <div class="form-group mt-3">
                        <label for="joinBillageID">Billage ID:</label>
                        <input type="text" class="form-control" id="joinBillageID" placeholder="Enter Billage ID">
                        <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                    </div>
                    <button class='btn btn-secondary mt-3 mb-5' id='join-billage-button'>Join Billage</button>
                </div>
                <div class="col col-md-4 d-flex flex-column align-items-center">
                    <p>• Enter the Billage ID provided by your friend to join their Billage and start sharing bills!</p>
                </div>
            </div>
        `

        createPopup(content);
    });
}

function handleSubmitButton(){
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get('user_id');

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

function showNewBillageData(responseData){
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