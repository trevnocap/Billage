const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');

export function createBillageButtonHandler() {
  const createBillageButtons = document.querySelectorAll('.create-billage-button');

  createBillageButtons.forEach(button => {
    button.addEventListener('click', () => {
      mainElement.style.filter = 'blur(7px)';
      navbarElement.style.filter = 'blur(7px)';
      mainElement.style.pointerEvents = 'none';
      navbarElement.style.pointerEvents = 'none';

      const popUp = document.createElement('div');
      popUp.classList.add('col-md-8', 'col-lg-6', 'col-sm-8', 'border-container', 'bg-light');

      const topRow = document.createElement('div');
      topRow.classList.add('row', 'mt-3');

      const topRowContent = document.createElement('div');
      topRowContent.classList.add('col-md-12', 'col-lg-12', 'col-sm-12');

      const closeButton = document.createElement('button');
      closeButton.innerHTML = '❌'
      closeButton.classList.add('close-button');
      closeButton.addEventListener('click', () =>{
        mainElement.style.filter = '';
        navbarElement.style.filter = '';
        mainElement.style.pointerEvents = '';
        navbarElement.style.pointerEvents = '';
        popupWrapper.remove();
      });

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
      const contentRowContent = `
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
    

      contentRowContentDiv.innerHTML = contentRowContent;
      contentRow.appendChild(contentRowContentDiv);
      popUp.appendChild(contentRow);

 
      const popupWrapper = document.createElement('div');
      popupWrapper.classList.add('add-billage-popup');

      popupWrapper.appendChild(popUp);
      document.body.appendChild(popupWrapper);

      handleSubmitButton(popupWrapper);
    });
  });
}

function handleSubmitButton(popupWrapper){
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
                    console.log('Billage created successfully!');
                    const responseData = await response.json();
                    console.log('Response data:', responseData);
                    mainElement.style.filter = '';
                    navbarElement.style.filter = '';
                    mainElement.style.pointerEvents = '';
                    navbarElement.style.pointerEvents = '';
                    popupWrapper.remove();
                    location.reload();
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