import { billageButtonsHandler, viewUserBillsRedirect } from './buttonHandling/dashboard_handler.js';
import { checkAccessTokenAndRedirectToLogin, parseJwt, getBillageCardBootstrapClass, returnIcon, formatDate } from "./helper_functions.js";

document.addEventListener("DOMContentLoaded", () => {
  checkAccessTokenAndRedirectToLogin();
});

const baseURL = 'http://127.0.0.1:8000/'

const accessToken = localStorage.getItem('access_token');

const decodedToken = parseJwt(accessToken);

const user_id = decodedToken.user_id;

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

// Display the loading icon while the API call is being made
mainElement.style.display = 'none';
navbarElement.style.display = 'none';
loadingIconElement.style.display = 'flex';


fetch(`${baseURL}api/dashboardview/${user_id}`)
  .then(response => response.json())
  .then(data => {
    //User Data
    const usernameElement = document.getElementById("username");
    usernameElement.innerHTML = data.user.username;



    // Bill Activity Data
    const bill_activity_container = document.getElementById('bill-activity');
    const active_bills = data.active_bills

    function createBillActivityTable(rows) {
      const headers = ["Bill", "Billage", "Payment Method", "Due", ""];
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
      active_bills.forEach(bill => {
        const tr = document.createElement('tr');

        const td1 = document.createElement('td');
        const billProviderName = document.createElement('span');
        billProviderName.textContent = bill.bill_provider_name;
        
        const billTypeIcon = document.createElement('img');
        billTypeIcon.style.maxWidth = '25px';
        billTypeIcon.style.marginRight = '5px'; // Change marginLeft to marginRight
        billTypeIcon.src = returnIcon(bill.bill_type);
        
        td1.appendChild(billTypeIcon); // Move this line before appending billProviderName
        td1.appendChild(billProviderName);
        tr.appendChild(td1);

        const td2 = document.createElement('td');
        td2.textContent = bill.billage;
        tr.appendChild(td2);

        const td3 = document.createElement('td');
        const paymentMethodName = document.createElement('span');
        paymentMethodName.textContent = bill.payment_method_name;
        const paymentIcon = document.createElement('img');
        paymentIcon.style.maxWidth = '25px';
        paymentIcon.style.marginRight = '5px';
        const icon = returnIcon(bill.payment_method_type)
        paymentIcon.src = icon;
        td3.appendChild(paymentIcon);
        td3.appendChild(paymentMethodName);
        tr.appendChild(td3);

        const td4 = document.createElement('td');
        const dueAmount = document.createElement('div');
        dueAmount.textContent = `$${bill.due_amount}`;
        const dueDate = document.createElement('div');
        dueDate.textContent = formatDate(bill.bill_due_date);
        td4.appendChild(dueAmount);
        td4.appendChild(dueDate);
        tr.appendChild(td4);
        

        const td5 = document.createElement('td');
        const payButton = document.createElement('button');
        payButton.textContent = 'Pay Early';
        payButton.classList.add('btn', 'btn-primary', 'btn-sm');
        td5.appendChild(payButton);
        tr.appendChild(td5);

        tbody.appendChild(tr);
      });
      //

      table.appendChild(tbody);

      const tableWrapper = document.createElement('div');
      tableWrapper.classList.add('table-wrapper-container')

      const finalRow = document.createElement('div')
      finalRow.classList.add('row')

      const allBillsButton = document.createElement('button')
      allBillsButton.classList.add('btn-info', 'btn-sm', 'ml-4')
      allBillsButton.id = 'view-user-bills'
      allBillsButton.innerHTML = 'View All Bills'

      finalRow.appendChild(allBillsButton)
      tableWrapper.appendChild(table)

      tableWrapper.appendChild(finalRow);

      bill_activity_container.appendChild(tableWrapper);

    }
  
    if (active_bills.length === 0) {
      const messageRow = document.createElement('div')
      messageRow.classList.add('row')

      const col = document.createElement('div')
      col.classList.add('col-md-12', 'col-lg-12' , 'col-sm-12')

      const p = document.createElement('p')
      p.classList.add('text-center', 'mt-5')
      p.innerHTML = 'Your upcoming bills will appear here once Billage processes your bills'

      col.appendChild(p)
      messageRow.appendChild(col)
      bill_activity_container.appendChild(messageRow)
    }
    else{
      createBillActivityTable(active_bills)
      viewUserBillsRedirect()
    }

    
    //Billages Data
    const billageContainer = document.getElementById('billage-row')
    const billages = data.billages;

    //Billage Carousel
    function createCarousel(billages) {
      const carouselId = 'billage-carousel';
      const carousel = document.createElement('div');
      carousel.classList.add('carousel', 'slide', 'col-md-12', 'col-lg-12', 'col-sm-12');
      carousel.id = carouselId;
      carousel.setAttribute('data-ride', 'carousel');
      carousel.setAttribute('data-interval', 'false');
    
      const carouselInner = document.createElement('div');
      carouselInner.classList.add('carousel-inner');
    
      for (let i = 0; i < billages.length; i += 3) {
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (i === 0) {
          carouselItem.classList.add('active');
        }
    
        const row = document.createElement('div');
        row.classList.add('row');
    
        for (let j = i; j < i + 3 && j < billages.length; j++) {
          const billage = billages[j];
          const card = document.createElement('div');
          card.classList.add('billage_card', 'text-center', billageColClass[0], billageColClass[1], 'mt-4');

    
          const cardContent = `
            <img src="${billage.billage_image}" alt="${billage.billage_name}" class="billage-icon" />
            <h5>${billage.billage_name}</h5>
            <p>${billage.billage_members.length} members</p>
            <a class="btn btn-primary btn-sm mt-2" href = "${baseURL}manage-billage/?billage_id=${billage.billage_id}">Manage Billage</a>
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

      billageContainer.appendChild(carousel);
    }
    
    const billageColClass = getBillageCardBootstrapClass(billages)

    //Decide how and what to display in billage container
    if (billages.length === 0){
      // no billage display
      const card = document.createElement('div');
      card.classList.add('billage_card', 'text-center', billageColClass[0], billageColClass[1],);

      const cardContent = `
      <p>You do not belong to a Billage yet, create or join one!</p>
      <button class ="btn btn-primary btn-sm mt-3 create-billage-button">Create Billage</button>
      <div><button class ="btn btn-primary btn-sm mt-3 join-billage-button">Join Billage</button></div>
      `;

      card.innerHTML = cardContent;

      billageContainer.append(card)

      billageButtonsHandler();

      
    }else if (billages.length <= 3) {
      // 1-3 billages
      billages.forEach(billage => {

        const card = document.createElement('div');
        card.classList.add('billage_card', 'text-center', billageColClass[0], billageColClass[1], 'mt-4');

        const cardContent = `
        <img src="${billage.billage_image}" alt="${billage.billage_name}" class= "billage-icon" />
        <h5>${billage.billage_name}</h5>
        <p>${billage.billage_members.length} members</p>
        <a class="btn btn-primary btn-sm mt-2" href = "${baseURL}manage-billage/?billage_id=${billage.billage_id}">Manage Billage</a>
        `;

        card.innerHTML = cardContent;

        billageContainer.append(card);

      });
    }else {
      createCarousel(billages)
    }

    // Payment Details
    const paymentMethodContainer = document.getElementById("payment-methods");

    const row = document.createElement("div");
    row.classList.add('row');

    const bankCol = document.createElement('div');
    bankCol.classList.add('col-md-6', 'col-lg-6', 'text-center','mt-4');

    const cardCol = document.createElement('div');
    cardCol.classList.add('col-md-6', 'col-lg-6', 'text-center','mt-4');

    function parsePaymentDetails(type){
      const paymentMethods = data.payment_methods;
      const filteredMethod = paymentMethods.find(method => method.payment_type === type);
    
      if (!filteredMethod) {
        return null;
      }
    
      return {
        name: filteredMethod.name,
        payment_details: filteredMethod.payment_details
      };

    }

    const bankDetails = parsePaymentDetails('bank_account');
    const baseBankContent = bankDetails
      ? `
        <h5>Bank Account</h5>
        <img src="${returnIcon('bank_account')}" class="bankicon mt-2" />
        <p class="mt-2">Name: ${bankDetails.name}</p>
        <p>Account Number: ••• ${bankDetails.payment_details}</p>
        <button class="btn btn-primary btn-sm mt-2">Edit Bank</button>
      `
      : `
        <h5>Bank Account</h5>
        <img src="${returnIcon('bank_account')}" class="bankicon mt-2" />
        <p class="mt-2">Add a Bank Account!</p>
        <button class="btn btn-primary btn-sm mt-2">Add Bank</button>
      `;

    const ccDetails = parsePaymentDetails('credit_card');
    const baseCardContent = ccDetails
      ? `
        <h5>Credit Card</h5>
        <img src="${returnIcon('credit_card')}" class="ccicon mt-2" />
        <p class="mt-2">Name: ${ccDetails.name}</p>
        <p>Card Number: ••• ${ccDetails.payment_details}</p>
        <button class="btn btn-primary btn-sm mt-2">Edit Credit Card</button>
      `
      : `
        <h5>Credit Card</h5>
        <img src="${returnIcon('credit_card')}" class="ccicon mt-2" />
        <p class="mt-2">Add a Credit Card!</p>
        <button class="btn btn-primary btn-sm mt-2">Add Credit Card</button>
      `;

    bankCol.innerHTML = baseBankContent;
    cardCol.innerHTML = baseCardContent;

    row.append(bankCol);
    row.append(cardCol);

    paymentMethodContainer.appendChild(row);


  })
  .catch(error => {
    console.error('Error:', error);
    const errorElement = document.createElement('p');
    errorElement.textContent = "There was a problem loading your account data. Please clear your cookies and try again. If the problem persists, please contact us.";
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '20px';

    // Hide all other elements on the page
    mainElement.style.display = 'none';
    navbarElement.style.display = 'none';
    loadingIconElement.style.display = 'none';

    // Display the error message
    const errorMessageContainer = document.createElement('div');
    errorMessageContainer.classList.add('text-center', 'mt-5');
    errorMessageContainer.appendChild(errorElement);
    document.body.appendChild(errorMessageContainer);
  })
  
  .finally(()=> {
    mainElement.style.display = 'flex';
    navbarElement.style.display = 'flex';
    loadingIconElement.style.display = 'none';
  });
