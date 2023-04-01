const params = new URLSearchParams(window.location.search);
const user_id = params.get('user_id');

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

// Display the loading icon while the API call is being made
mainElement.style.display = 'none';
navbarElement.style.display = 'none';
loadingIconElement.style.display = 'flex';

fetch(`http://127.0.0.1:8000/api/dashboardview/${user_id}`)
  .then(response => response.json())
  .then(data => {
    //User Data
    const usernameElement = document.getElementById("username");
    usernameElement.innerHTML = data.user.username;
    
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

    const billageColClass = getBillageCardBootstrapClass(billages)
    console.log(billages.length)


    if (billages.length === 0){
      // no billage display
      const card = document.createElement('div');
      card.classList.add('billage_card');
      card.classList.add(billageColClass[0]);
      card.classList.add(billageColClass[1]);
      card.classList.add("text-center");

      const cardContent = `
      <p>You do not belong to a Billage yet, create or join one!</p>
      <button class ="btn btn-secondary mt-3">Create Billage</button>
      <div><button class ="btn btn-secondary mt-3">Join Billage</button></div>
      `;

      card.innerHTML = cardContent;

      billageContainer.append(card)
    }
    else {
      // 1-3 billages
      billages.forEach(billage => {

        const card = document.createElement('div');
        card.classList.add('billage_card');
        card.classList.add(billageColClass[0]);
        card.classList.add(billageColClass[1]);
        card.classList.add("text-center");

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