import { Popup, getQueryParam } from "../helperFunctions.js";

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
  
        handleAnswer();
        function handleAnswer() {
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
        }
      });
    });
    const promoteButtons = document.querySelectorAll('.promote-buttons');
    promoteButtons.forEach(button => {
      button.addEventListener('click', () => {
        promoteUser(button.id)
      });
    });
  }
  
  async function removeUser(userID) {
    const errorMessage = document.getElementById('error-message');
    console.log(userID);
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
            errorMessage.textContent = "User has been removed successfully."
            setTimeout(() => {
                popUp.closePopUp();
            }, 3000); 
        }else if (response.status === 401){
            errorMessage.style.color = 'red';
            errorMessage.style.display = 'block';
            errorMessage.textContent = "User does is not in the Billage!"
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
  
  function promoteUser(id) {
  
  }