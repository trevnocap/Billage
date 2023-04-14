const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  }

const billageId = getQueryParam('billage_id');

// Display the loading icon while the API call is being made
mainElement.style.display = 'none';
navbarElement.style.display = 'none';
loadingIconElement.style.display = 'flex';


fetch(`http://127.0.0.1:8000/api/manage-billage/${billageId}`)
  .then(response => response.json())
  .then(data => {
    // Billage Details
    const billageDetailsContainer = document.getElementById('billage-details');
    const billageName = data.billage.billage_name;
    const billageImage = data.billage.billage_image;
    const billageMembers = data.billage.billage_members;

    const mainRow = document.createElement('div');
    mainRow.classList.add('row');

    const leftColumn = document.createElement('div');
    leftColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6');

    const nameHeader = document.createElement('h4');
    nameHeader.textContent = `Name: ${billageName}`;

    const changeNameButton = document.createElement('button');
    changeNameButton.classList.add('btn', 'btn-info', 'btn-sm');
    changeNameButton.textContent = 'Change Name';

    const imageElement = document.createElement('img');
    imageElement.src = billageImage;
    imageElement.classList.add('billage-image', 'mt-3');

    const changeImageButton = document.createElement('button');
    changeImageButton.classList.add('btn', 'btn-info', 'btn-sm', 'ml-5', 'mt-3');
    changeImageButton.textContent = 'Change Image';

    leftColumn.appendChild(nameHeader);
    leftColumn.appendChild(changeNameButton);
    leftColumn.appendChild(document.createElement('br'));
    leftColumn.appendChild(imageElement);
    leftColumn.appendChild(changeImageButton);

    const membersColumn = document.createElement('div');
    membersColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6');

    const membersHeader = document.createElement('h4');
    membersHeader.textContent = 'Members';

    membersColumn.appendChild(membersHeader);

    billageMembers.forEach(member => {
        const memberFullName = document.createElement('p');
        memberFullName.textContent = `${member.first_name} ${member.last_name}`;
        
        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-warning', 'btn-sm', 'ml-5');
        removeButton.textContent = 'Remove';
        
        memberFullName.appendChild(removeButton);
        membersColumn.appendChild(memberFullName);
    });

    mainRow.appendChild(leftColumn);
    mainRow.appendChild(membersColumn);

    const mainCol = document.createElement('div');
    mainCol.classList.add('col-lg-12', 'col-md-12', 'col-sm-12','mx-4', 'mt-3');
    mainCol.appendChild(mainRow);

    billageDetailsContainer.appendChild(mainCol);
  })

  
  .finally(()=> {
    mainElement.style.display = 'flex';
    navbarElement.style.display = 'flex';
    loadingIconElement.style.display = 'none';
  });

