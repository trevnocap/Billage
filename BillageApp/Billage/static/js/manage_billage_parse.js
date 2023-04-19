import { getBillageCardBootstrapClass, returnIcon, formatDate, parseJwt, getQueryParam } from "./helperFunctions.js"
import { handleButtons, changeBillageNameButton, changeBillageImageButton } from "./buttonHandling/manage_billage_handler.js";


const token = localStorage.getItem('access_token');
const decodedToken = parseJwt(token);
const user_id = decodedToken.user_id;

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

const billageId = getQueryParam('billage_id');

// Display the loading icon while the API call is being made
mainElement.style.display = 'none';
navbarElement.style.display = 'none';
loadingIconElement.style.display = 'flex';

fetch(`http://127.0.0.1:8000/api/manage-billage/${billageId}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}).then(response => {
  if (!response.ok){
    window.location.href = 'http://127.0.0.1:8000/dashboard';
  }else{
    return response.json();
  }
}).then(data => {
    let userIdIsAdmin = false;
    // Billage Details;
    const billageDetailsContainer = document.getElementById('billage-details');
    const billageName = data.billage.billage_name;
    const billageImage = data.billage.billage_image;
    const billageMembers = data.billage.billage_members;
    const billageAdmins = data.billage.billage_admins;

    for(const id of billageAdmins) {
      if(id === user_id) {
        userIdIsAdmin = true;
      }
    }
    const mainRow = document.createElement('div');
    mainRow.classList.add('row');

    const leftColumn = document.createElement('div');
    leftColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6',);

    const nameHeader = document.createElement('h4');
    nameHeader.id = 'billage-name';
    
    const nameLabel = document.createElement('span');
    nameLabel.textContent = 'Name: ';
    
    const billageNameSpan = document.createElement('span');
    billageNameSpan.id = 'billage-name-text';
    billageNameSpan.textContent = billageName;
    
    const editNameButton = document.createElement('a');
    editNameButton.id = 'change-name'
    editNameButton.classList.add('edit-name-button');

    const editIcon = document.createElement('img');
    editIcon.src = '/images/edit_pencil.png';
    editIcon.alt = 'Edit Name';
    editIcon.classList.add('edit-name-button');

    editNameButton.appendChild(editIcon);

    const imageElement = document.createElement('img');
    imageElement.src = billageImage;
    imageElement.classList.add('billage-image', 'mt-3');

    const changeImageButton = document.createElement('button');
    changeImageButton.id = 'change-image'
    changeImageButton.classList.add('btn', 'btn-info', 'btn-sm', 'ml-5', 'mt-3');
    changeImageButton.textContent = 'Change Image';

    leftColumn.appendChild(nameHeader);
    nameHeader.appendChild(nameLabel);
    nameHeader.appendChild(billageNameSpan);
    nameHeader.appendChild(editNameButton);
    leftColumn.appendChild(document.createElement('br'));
    leftColumn.appendChild(imageElement);
    leftColumn.appendChild(changeImageButton);

    const membersColumn = document.createElement('div');
    membersColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6', 'd-flex', 'flex-column');
    
    const membersHeader = document.createElement('h4');
    membersHeader.textContent = 'Members';
    
    membersColumn.appendChild(membersHeader);
    
    billageMembers.forEach(member => {
      const memberRow = document.createElement('div');
      memberRow.classList.add('row', 'member-row', 'align-items-start', 'mt-1');
  
      const memberNameColumn = document.createElement('div');
      memberNameColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6');
  
      const memberFullName = document.createElement('p');
      memberFullName.textContent = `${member.first_name} ${member.last_name}`;
      memberNameColumn.appendChild(memberFullName);
  
      const removeButtonColumn = document.createElement('div');
      removeButtonColumn.classList.add('col-lg-6', 'col-md-6', 'col-sm-6');
  
      const removeButton = document.createElement('button');
      removeButton.classList.add('btn', 'btn-warning', 'btn-sm', 'remove-buttons');

      const promoteButton = document.createElement('button');
      promoteButton.classList.add('btn', 'btn-success', 'btn-sm', 'promote-buttons');

      if (member.id === user_id){
        removeButton.textContent = 'Leave';
        removeButton.id = member.id;
        removeButtonColumn.appendChild(removeButton);
      }else {
        if (userIdIsAdmin){
          let memberIsAdmin = false;
          for (const id of billageAdmins){
            if (id === member.id){
              memberIsAdmin = true;
            }
          }
          if (!memberIsAdmin){
            promoteButton.textContent = 'Make Admin';
            promoteButton.classList.add('mr-1')
            promoteButton.id = member.id;
            removeButtonColumn.appendChild(promoteButton);
            removeButton.textContent = 'Remove';
            removeButton.id = member.id;
            removeButtonColumn.appendChild(removeButton);
          }
        }
      }

      memberRow.appendChild(memberNameColumn);
      memberRow.appendChild(removeButtonColumn);
      membersColumn.appendChild(memberRow);

      
    });
    
    mainRow.appendChild(leftColumn);
    mainRow.appendChild(membersColumn);
    
    const mainCol = document.createElement('div');
    mainCol.classList.add('col-lg-12', 'col-md-12', 'col-sm-12','mx-4', 'mt-3');
    mainCol.appendChild(mainRow);
    
    billageDetailsContainer.appendChild(mainCol);

    // Linked Bills
    const linkedBills = data.linked_bills;

    function createCarousel(linkedBills) {
      const carouselId = 'bill-carousel';
      const carousel = document.createElement('div');
      carousel.classList.add('carousel', 'slide', 'col-md-12', 'col-lg-12', 'col-sm-12');
      carousel.id = carouselId;
      carousel.setAttribute('data-ride', 'carousel');
      carousel.setAttribute('data-interval', 'false');
    
      const carouselInner = document.createElement('div');
      carouselInner.classList.add('carousel-inner');
    
      for (let i = 0; i < linkedBills.length; i += 3) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (i === 0) {
          carouselItem.classList.add('active');
        }
    
        const row = document.createElement('div');
        row.classList.add('row');
    
        for (let j = i; j < i + 3 && j < linkedBills.length; j++) {
          const bill = linkedBills[j];
          const card = document.createElement('div');
          card.classList.add('bill_card', 'text-center', billColClass[0], billColClass[1], 'mt-4');
    
          const cardContent = `
          <img src="${returnIcon(bill.bill_type)}" alt="${bill.bill_type}" class="bill-icon" />
          <h5>${bill.bill_provider_name}</h5>
          <p>${bill.bill_type}</p>
          <button class="btn btn-warning btn-sm mt-2">Remove</button>
          `;
    
          card.innerHTML = cardContent;
          row.appendChild(card);
        }
    
        carouselItem.appendChild(row);
        carouselInner.appendChild(carouselItem);
      }
    
      carousel.appendChild(carouselInner);
    
      const carouselControls = `
      <div class="carousel-control-outer">
        <a class="carousel-control-prev" href="#${carouselId}" role="button" data-slide="prev">
          <svg class="carousel-control-prev-icon" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          <span class="sr-only">Previous</span>
        </a>
        <a class="carousel-control-next" href="#${carouselId}" role="button" data-slide="next">
          <svg class="carousel-control-next-icon" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
          </svg>
          <span class="sr-only">Next</span>
        </a>
      </div>
      `;
      carousel.insertAdjacentHTML('beforeend', carouselControls);

      linkedBillsContainer.appendChild(carousel);
    }
    
    const linkedBillsContainer = document.getElementById('linked-bills');

    const billColClass = getBillageCardBootstrapClass(linkedBills);

    if (linkedBills.length === 0) {
      // no linked bills
      const card = document.createElement('div');
      card.classList.add('billage_card', 'text-center', billColClass[0], billColClass[1],);

      const cardContent = `
      <p>This Billage does not have any linked bills yet, add one!</p>
      <button class ="btn btn-primary btn-sm mt-3 create-billage-button">Add Bill</button>
      `;

      card.innerHTML = cardContent;

      linkedBillsContainer.append(card)

    } else if (linkedBills.length <= 3) {
      // 1-3 linked bills
      linkedBills.forEach(bill => {
        const card = document.createElement('div');
        card.classList.add('bill_card', 'text-center', billColClass[0], billColClass[1], 'mt-4');

        const cardContent = `
        <img src="${returnIcon(bill.bill_type)}" alt="${bill.bill_type}" class="bill-icon" />
        <h5>${bill.bill_provider_name}</h5>
        <p>Bill Type: ${bill.bill_type}</p>
        <button class="btn btn-warning btn-sm mt-2">Remove</button>
        `;

        card.innerHTML = cardContent;

        linkedBillsContainer.append(card);
      });
    } else {
      createCarousel(linkedBills);
    }


    // Bill Activity Data
    const bill_activity_container = document.getElementById('bill-activity');
    const billage_bills = data.billage_bills;

    function createBillActivityTable(rows) {
      const headers = ["Bill", "Bill Amount", "Due Date", "Bill Status"];
      const table = document.createElement('table');
      table.classList.add('table', 'mt-3', 'px-md-3', 'px-lg-3');

      const thead = document.createElement('thead');
      const tr = document.createElement('tr');

      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tr.appendChild(th);
      });

      thead.appendChild(tr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      
      // add rows
      billage_bills.forEach(bill => {
        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        const billProviderName = document.createElement('span');
        billProviderName.textContent = bill.linked_bill;
        
        const billTypeIcon = document.createElement('img');
        billTypeIcon.style.maxWidth = '25px';
        billTypeIcon.style.marginRight = '5px';
        billTypeIcon.src = returnIcon(bill.bill_type);
        
        td1.appendChild(billTypeIcon);
        td1.appendChild(billProviderName);
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        td2.textContent = `$${bill.bill_due_amount}`;
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        td3.textContent = formatDate(bill.bill_due_date);
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        td4.textContent = bill.bill_status;
        tr.appendChild(td4);

        tbody.appendChild(tr);
      });

      table.appendChild(tbody);

      const tfoot = document.createElement('tfoot');
      const footerRow = document.createElement('tr');
      const footerCol = document.createElement('td');
      footerCol.colSpan = 4;
      
      const viewAllBillsButton = document.createElement('button');
      viewAllBillsButton.classList.add('btn', 'btn-info', 'btn-sm',);
      viewAllBillsButton.textContent = 'View All Bills';
    
      footerCol.appendChild(viewAllBillsButton);
      footerRow.appendChild(footerCol);
      tfoot.appendChild(footerRow);
      table.appendChild(tfoot);
    
      bill_activity_container.appendChild(table);
      
    }

    if (billage_bills.length === 0) {
      const messageRow = document.createElement('div');
      messageRow.classList.add('row');

      const col = document.createElement('div');
      col.classList.add('col-md-12', 'col-lg-12', 'col-sm-12');

      const p = document.createElement('p');
      p.classList.add('text-center', 'mt-5');
      p.innerHTML = 'Your bills will appear here once Billage processes them';

      col.appendChild(p);
      messageRow.appendChild(col);
      bill_activity_container.appendChild(messageRow);
    }
    else {
      createBillActivityTable(billage_bills);
    }

    handleButtons();
    changeBillageNameButton(leftColumn);
    changeBillageImageButton();

  })

  .finally(()=> {
    mainElement.style.display = 'flex';
    navbarElement.style.display = 'flex';
    loadingIconElement.style.display = 'none';
  });
