const params = new URLSearchParams(window.location.search);
const user_id = params.get('user_id');

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

// Display the loading icon while the API call is being made
mainElement.style.display = 'none';
navbarElement.style.display = 'none';
loadingIconElement.style.display = 'flex';

//helper functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

function returnIcon(type){
  const iconLibrary = {
    bank_account: '/images/bankicon.png',
    credit_card: '/images/creditcardicon.png',
    Gas: '/images/gas.png',
    Cable: '/images/cable.png',
    Television: '/images/cable.png',
    streaming: '/images/cable.png',
    Electric: '/images/electric.png',
    Rent: '/images/rent.png',
    Water: '/images/water.png',
    Internet: '/images/internet.png',
  };

  console.log(type)
  console.log(iconLibrary[type])
  return iconLibrary[type];
}


fetch(`http://127.0.0.1:8000/api/dashboardview/${user_id}`)
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
      table.classList.add('table');

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
        billTypeIcon.style.marginRight = '15px'; // Change marginLeft to marginRight
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
        td3.appendChild(paymentMethodName);
        const paymentIcon = document.createElement('img');
        paymentIcon.style.maxWidth = '25px';
        paymentIcon.style.marginLeft = '15px';
        const icon = returnIcon(bill.payment_method_type)
        paymentIcon.src = icon;
        td3.appendChild(paymentIcon);
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
        payButton.textContent = 'Pay Bill Early';
        payButton.classList.add('btn', 'btn-secondary');
        td5.appendChild(payButton);
        tr.appendChild(td5);

        tbody.appendChild(tr);
      });
      //
      table.appendChild(tbody);

      bill_activity_container.appendChild(table);

    }
  
    createBillActivityTable(active_bills)



    
    //Billages Data
    const billageContainer = document.getElementById('billage-row')
    const billages = data.billages;

    function getBillageCardBootstrapClass(billages){
      if (billages.length <= 1) {
        return ['col-md-12', 'col-lg-12'];
      } else if (billages.length === 2) {
        return ['col-md-6', 'col-lg-6'];
      } else {
        return ['col-md-4', 'col-lg-4'];
      }
    }

    //Billage Carousel
    function createCarousel(billages) {
      const carouselId = 'billage-carousel';
      const carousel = document.createElement('div');
      carousel.classList.add('carousel', 'slide', 'fullrow');
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
          card.classList.add('billage_card');
          card.classList.add(billageColClass[0]);
          card.classList.add(billageColClass[1]);
          card.classList.add("text-center");
    
          const cardContent = `
          <img src="${billage.billage_image}" alt="${billage.billage_name}" class="billage-icon" />
          <h5>${billage.billage_name}</h5>
          <p>${billage.billage_members.length} members</p>
          <button class="btn btn-secondary mt-3">Manage Billage</button>
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
    console.log(billages.length)

    //Decide how and what to display in billage container
    if (billages.length === 0){
      // no billage display
      const card = document.createElement('div');
      card.classList.add('billage_card', 'text-center', billageColClass[0], billageColClass[1]);

      const cardContent = `
      <p>You do not belong to a Billage yet, create or join one!</p>
      <button class ="btn btn-secondary mt-3">Create Billage</button>
      <div><button class ="btn btn-secondary mt-3">Join Billage</button></div>
      `;

      card.innerHTML = cardContent;

      billageContainer.append(card)
    }

    else if (billages.length <= 3) {
      // 1-3 billages
      billages.forEach(billage => {

        const card = document.createElement('div');
        card.classList.add('billage_card', 'text-center', billageColClass[0], billageColClass[1]);

        const cardContent = `
        <img src="${billage.billage_image}" alt="${billage.billage_name}" class= "billage-icon" />
        <h5>${billage.billage_name}</h5>
        <p>${billage.billage_members.length} members</p>
        <button class ="btn btn-secondary mt-3">Manage Billage</button>
        `;

        card.innerHTML = cardContent;

        billageContainer.append(card)

      });
    }

    else {
      createCarousel(billages)
    }



    // Payment Details
    const bankRoutingElement = document.getElementById("routing_number");
    const bankAccountElement = document.getElementById("account_number");
    const cardNumberElement = document.getElementById("card_number");
    const bankButtonElement = document.getElementById("bank_button");
    const cardButtonElement = document.getElementById("card_button");
    
    if (data.payment_methods.bank_account !== null || data.payment_methods.credit_card !== null) {
        //Bank Account
        if (data.payment_methods.bank_account) {
            const userAccountNumber = data.payment_methods.bank_account.bank_account_number;
            const userRoutingNumber = data.payment_methods.bank_account.bank_routing_number;
            bankRoutingElement.innerHTML = `Routing Number: ${userRoutingNumber}`;
            bankAccountElement.innerHTML = `Account Number: ${userAccountNumber}`;
            bankButtonElement.innerHTML = `Edit Bank`;
        } else {
            bankRoutingElement.innerHTML = `Add a Bank Account!`;
            bankButtonElement.innerHTML = `Add Bank`;
        }

        //Credit Card
        if (data.payment_methods.credit_card) {
            const userCardNumber = data.payment_methods.credit_card.card_number;
            cardNumberElement.innerHTML = `Card Number: ${userCardNumber}`;
            cardButtonElement.innerHTML = `Edit Card`;
        } else {
            cardNumberElement.innerHTML = `Add a Credit Card!`;
            cardButtonElement.innerHTML = `Add Card`;
        }
    } else {
        bankRoutingElement.innerHTML = `Add a Bank Account!`;
        bankButtonElement.innerHTML = `Add Bank`;
        cardNumberElement.innerHTML = `Add a Credit Card!`;
        cardButtonElement.innerHTML = `Add Card`;
    }

  })
  .catch(error => {
    console.error('Error:', error);

  })
  
  .finally(()=> {
    mainElement.style.display = 'flex';
    navbarElement.style.display = 'flex';
    loadingIconElement.style.display = 'none';
  });