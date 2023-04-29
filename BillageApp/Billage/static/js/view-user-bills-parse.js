import { getBillageCardBootstrapClass, returnIcon, formatDate, parseJwt, checkAccessTokenAndRedirectToLogin } from "./helper_functions.js"


const baseURL = 'http://127.0.0.1:8000/'
const token = localStorage.getItem('access_token');
const decodedToken = parseJwt(token);
const user_id = decodedToken.user_id;

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');




fetch(`${baseURL}api/view-user-bills/10/1`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
}).then(response => {
    if (!response.ok){
        error;
      }else{
        return response.json();
      }
}).then(data => {
    console.log(data);
    const tableWrapper = document.getElementById('table-wrapper');
    const bills = data.user_bills;

    function createBillActivityTable(rows) {
        const headers = ["Bill", "Billage", "Payment Method", "Due Amount", "Due Date", "Your Split", "Status" ];
        const table = document.createElement('table');
        table.classList.add('table',);
  
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
        bills.forEach(bill => {
            const tr = document.createElement('tr');

            const td1 = document.createElement('td');
            const billProviderName = document.createElement('span');
            billProviderName.textContent = bill.linked_bill.bill_provider_name;
            
            const billTypeIcon = document.createElement('img');
            billTypeIcon.style.maxWidth = '25px';
            billTypeIcon.style.marginRight = '5px'; // Change marginLeft to marginRight
            billTypeIcon.src = returnIcon(bill.linked_bill.bill_type);
            
            td1.appendChild(billTypeIcon); // Move this line before appending billProviderName
            td1.appendChild(billProviderName);
            tr.appendChild(td1);

            const td2 = document.createElement('td');
            td2.textContent = bill.linked_bill.billage;
            tr.appendChild(td2);

            const td3 = document.createElement('td');
            const paymentMethodName = document.createElement('span');
            paymentMethodName.textContent = bill.payment_method.name;
            const paymentIcon = document.createElement('img');
            paymentIcon.style.maxWidth = '25px';
            paymentIcon.style.marginRight = '5px';
            const icon = returnIcon(bill.payment_method.payment_type)
            paymentIcon.src = icon;
            td3.appendChild(paymentIcon);
            td3.appendChild(paymentMethodName);
            tr.appendChild(td3);

            const td4 = document.createElement('td');
            td4.textContent = `$${bill.due_amount}`;
            tr.appendChild(td4);

            const td5 = document.createElement('td');
            td5.textContent = bill.bill_due_date;
            tr.appendChild(td5);

            const td6 = document.createElement('td');
            const split = bill.linked_bill.split_percentage * 100
            td6.textContent = `${split}%`;
            tr.appendChild(td6);

            const td7 = document.createElement('td');
            td7.textContent = bill.bill_status;
            tr.appendChild(td7);

            tbody.appendChild(tr);
        });
        //

        table.appendChild(tbody);
        tableWrapper.appendChild(table)

        }

        createBillActivityTable(bills)



//main goes here


}).catch(error => {
    console.error('Error:', error);
    const errorElement = document.createElement('p');
    errorElement.textContent = "There was a problem loading your bills. Please clear your cookies and try again. If the problem persists, please contact us.";
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

  }).finally(()=> {
    mainElement.style.display = 'flex';
    navbarElement.style.display = 'flex';
    loadingIconElement.style.display = 'none';
});