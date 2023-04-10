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
      closeButton.addEventListener('click', () => {
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
          </div>
          <button class='btn btn-secondary mt-3 mb-5'>Create Billage</button>
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
    });
  });
}
