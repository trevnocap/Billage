import { Popup, getQueryParam } from "../helper_functions.js";

const token = localStorage.getItem('access_token');

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

const billageId = getQueryParam('billage_id');

const popUp = new Popup([mainElement, navbarElement, loadingIconElement], {
    closeButton: true,
    logo: true,
});

export function handleButtons(){
  const removeButtons = document.querySelectorAll('.remove-buttons');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      popUp.elements.forEach(element => {element.style.filter = 'blur(7px)'});
      
      let h2;
      if (button.textContent === 'Leave'){
          h2 = "Are you sure you want to leave?";
      }else{
          h2 = "Are you sure you want to remove this user?";
      }

      const content = `
        <div class="row mx-2">
            <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                <h2>${h2}</h2>
                <div class="form-group mt-3">
                    <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                </div>
                    <div class="d-flex justify-content-between">
                    <button class='btn btn-warning w-100 mb-5 mr-2 answer-button' id='yes-button'">Yes</button>
                    <button class='btn btn-primary w-100 mb-5 answer-button' id='no-button'">No</button>
                </div>
            </div>
            <div class="col col-md-4 d-flex flex-column align-items-center">
                <p>• This action cannot be undone!</p>
            </div>
        </div>
    `;
      popUp.setContent(content);

      const answers = document.querySelectorAll('.answer-button');
      answers.forEach(answer => {
        answer.addEventListener('click', () => {
          if (answer.id === 'yes-button'){
            removeUser(button.id);
            popUp.shouldReload = true;
          }else{
            popUp.closePopUp();
          }
        });
      });
    });
  });
  const promoteButtons = document.querySelectorAll('.promote-buttons');
  promoteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const content = `
        <div class="row mx-2">
            <div class="col col-md-8 d-flex flex-column justify-content-center align-items-left">
                <h2>Are you sure that you want to promote this user?</h2>
                <div class="form-group mt-3">
                    <div class="mt-2 text-center" id="error-message" style="display: none; color: red;"></div>
                </div>
                    <div class="d-flex justify-content-between">
                    <button class='btn btn-warning w-100 mb-5 mr-2 answer-button' id='yes-button'">Yes</button>
                    <button class='btn btn-primary w-100 mb-5 answer-button' id='no-button'">No</button>
                </div>
            </div>
            <div class="col col-md-4 d-flex flex-column align-items-center">
                <p>• This action cannot be undone!</p>
            </div>
        </div>
    `;
      popUp.setContent(content);

      const answers = document.querySelectorAll('.answer-button');
      answers.forEach(answer => {
        answer.addEventListener('click', () => {
          if (answer.id === 'yes-button'){
            promoteUser(button.id);
            popUp.shouldReload = true;
          }else{
            popUp.closePopUp();
          }
        });
      });
    });
  });
}
  


async function removeUser(userID) {
  const errorMessage = document.getElementById('error-message');

  await fetch(`http://127.0.0.1:8000/api/manage-billage/${billageId}/remove-user/${userID}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':  `Bearer ${token}`
    }
  }).then(response => {
      if (response.status === 200) {
          errorMessage.style.color = 'green';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "User was successfully removed."
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else if (response.status === 404){
        errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "User is not in the Billage!"
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else if (response.status === 500){
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "Internal server error, try again later."
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else{
          return response.json()
      }
  }).catch(error => {
    console.error(error);
  });
}

async function promoteUser(id) {
  const errorMessage = document.getElementById('error-message');
  await fetch(`http://127.0.0.1:8000/api/manage-billage/${billageId}/promote-user/${id}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':  `Bearer ${token}`
    }
  }).then(response => {
      if (response.status === 200) {
          errorMessage.style.color = 'green';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "User was promoted to admin."
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else if (response.status === 400){
        errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "User is already an admin!"
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else if (response.status === 404){
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "User is not in the Billage!"
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else if (response.status === 500){
          errorMessage.style.color = 'red';
          errorMessage.style.display = 'block';
          errorMessage.textContent = "Internal server error, try again later."
          setTimeout(() => {
              popUp.closePopUp();
          }, 3000); 
      }else{
          return response.json()
      }
  }).catch(error => {
    console.error(error);
  });
}

/// Change Billage Name
export function changeBillageNameButton(leftColumn) {
  const editNameButton = document.getElementById('change-name');
  const billageNameSpan = document.getElementById('billage-name-text');

  const errorMessage = document.createElement('div');
  errorMessage.classList.add('alert', 'alert-danger', 'mt-2', 'error-message');
  errorMessage.style.display = 'none';
  editNameButton.parentNode.insertBefore(errorMessage, billageNameSpan.nextSibling);

  editNameButton.addEventListener('click', () => {
    const originalName = billageNameSpan.textContent;
    // Make the nameHeader editable
    billageNameSpan.contentEditable = 'true';
    billageNameSpan.focus();

    billageNameSpan.addEventListener('input', () => {
      if (billageNameSpan.textContent.length > 20) {
        billageNameSpan.textContent = billageNameSpan.textContent.slice(0, 20);
        // Move the caret to the end of the content
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(billageNameSpan);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });

    // Create Save and Cancel buttons
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('btn', 'btn-success', 'btn-sm', 'ml-2');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('btn', 'btn-warning', 'btn-sm', 'ml-1');

    billageNameSpan.parentNode.insertBefore(saveButton, billageNameSpan.nextSibling);
    billageNameSpan.parentNode.insertBefore(cancelButton, saveButton.nextSibling);
    editNameButton.style.display = 'none';
    

    // Save the changes when the user clicks the Save button
    saveButton.addEventListener('click', () => {
      const newName = billageNameSpan.textContent;

      if (newName.length < 3) {
        errorMessage.textContent = 'The name must be at least 3 characters long.';
        errorMessage.style.display = 'block';
        return;
      } else {
        errorMessage.style.display = 'none';
      }

      // Send a PUT request with the updated name
      changeBillageName(billageId, newName);

      // Remove Save and Cancel buttons
      saveButton.remove();
      cancelButton.remove();
      errorMessage.style.display = 'none';
      editNameButton.style.display = '';
    });

    // Cancel the changes when the user clicks the Cancel button
    cancelButton.addEventListener('click', () => {
      billageNameSpan.contentEditable = 'false';
      editNameButton.style.display = '';

      billageNameSpan.textContent = originalName;

      // Remove Save and Cancel buttons
      saveButton.remove();
      cancelButton.remove();
      errorMessage.style.display = 'none';
    });
  });
}

function changeBillageName(billageID, newName){
  fetch(`http://127.0.0.1:8000/api/manage-billage/change-name/${billageID}/${newName}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      billage_id: billageID,
      new_name: newName,
    })
  })
    .catch((error) => {
      console.error('Error updating billage name:', error);
    });
}

/// Change image
export function changeBillageImageButton() {
  const changeImageButton = document.getElementById('change-image');
  const imageElement = document.querySelector('.billage-image');

  let errorMessage;

  changeImageButton.addEventListener('click', () => {
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }

    changeImageButton.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    errorMessage = document.createElement('div');
    errorMessage.classList.add('alert', 'alert-danger', 'mt-2', 'error-message');
    errorMessage.style.display = 'none';
    changeImageButton.parentNode.insertBefore(errorMessage, changeImageButton.nextSibling);


    errorMessage.addEventListener('click', () => { // Add this event listener to clear the error message on click
      errorMessage.style.display = 'none';
    });


    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('btn', 'btn-success', 'btn-sm', 'ml-2');

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('btn', 'btn-warning', 'btn-sm', 'ml-1');

    changeImageButton.parentNode.insertBefore(saveButton, errorMessage.nextSibling);
    changeImageButton.parentNode.insertBefore(cancelButton, saveButton.nextSibling);

    let originalSrc = imageElement.src;

    input.addEventListener('change', (event) => {
      const imageFile = event.target.files[0];
      const validImageTypes = ['image/jpeg', 'image/png'];

      errorMessage.style.display = 'none';

      // Check if the file type is an allowed image type
      if (imageFile && validImageTypes.includes(imageFile.type)) {
        // Display a preview of the selected image
        const reader = new FileReader();
        reader.onload = (e) => {
          imageElement.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
        errorMessage.style.display = 'none';
      } else if (imageFile) {
        errorMessage.textContent = 'Please select a valid image file (JPEG or PNG)';
        errorMessage.style.display = 'block';
        saveButton.remove()
        cancelButton.remove()
        changeImageButton.style.display = '';
      }
    });

    saveButton.addEventListener('click', () => {
      const imageFile = input.files[0];
      if (imageFile) {
        changeBillageImage(imageFile);
      }
      saveButton.remove();
      cancelButton.remove();
      errorMessage.remove();
      changeImageButton.style.display = '';

    });

    cancelButton.addEventListener('click', () => {
      imageElement.src = originalSrc;
      errorMessage.style.display = 'none';
      saveButton.remove();
      cancelButton.remove();
      changeImageButton.style.display = '';

    });

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}


function changeBillageImage(imageFile) {
  const formData = new FormData();
  formData.append('billage_id', billageId);
  formData.append('billage_image', imageFile);

  fetch(`http://127.0.0.1:8000/api/manage-billage/change-image/${billageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  })
  .catch((error) => {
    console.error('Error updating billage image:', error);
  });
}

