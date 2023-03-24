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
    if (data.billages.length !== 0){
      console.log(data.billages);

      const container = document.getElementById('billages');
      const list = document.createElement('ul');

      data.billages.map(billage => {
        const listBillage = document.createElement('li');
        listBillage.className = ""
        listBillage.textContent = billage.billage_name + ' ' + billage.billage_members.length;

        const billageImage = document.createElement('img');
        billageImage.src = billage.billage_image;
        listBillage.appendChild(billageImage);
        list.appendChild(listBillage);
      });

      container.append(list);

    }else{
      const container = document.getElementById('billages');
      const p = document.createElement('p');
      p.textContent = "Join or create a new Billage";
      container.append(p)
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