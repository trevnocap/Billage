import { returnIcon, formatDate, parseJwt, checkAccessTokenAndRedirectToLogin, updateURLParams, getQueryParam } from "./helper_functions.js"


const baseURL = 'http://127.0.0.1:8000/'
const token = localStorage.getItem('access_token');
const decodedToken = parseJwt(token);
const user_id = decodedToken.user_id;

const mainElement = document.getElementById('main');
const navbarElement = document.getElementById('navbar');
const loadingIconElement = document.getElementById('loading-icon');

const displayCount = getQueryParam('display_count')
const pageNumber = getQueryParam('page_number')



fetch(`${baseURL}api/view-user-bills/${displayCount}/${pageNumber}`, {
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
            billTypeIcon.style.marginRight = '5px';
            billTypeIcon.src = returnIcon(bill.linked_bill.bill_type);
            
            td1.appendChild(billTypeIcon);
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
            td5.textContent = formatDate(bill.bill_due_date);
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

        function populateDisplayCountDropdown() {
          const displayCountOptions = [12, 24, 36, 48, 100];

          const displayCountContainer = document.createElement('div');
          displayCountContainer.className = 'display-count-container';

          const displayCountText = document.createElement('span');
          displayCountText.textContent = 'Rows: ';
          displayCountContainer.appendChild(displayCountText);

          const displayCountDropdown = document.createElement('select');
          displayCountDropdown.id = 'display-count-dropdown';

          let optionElement;

          displayCountOptions.forEach(option => {
            optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.text = option;

            if (option.toString() === displayCount) {
              optionElement.selected = true;
            }
        
            displayCountDropdown.appendChild(optionElement);
          });
          
          displayCountDropdown.addEventListener('change', function () {
            const selectedDisplayCount = this.value;
            optionElement.text = this.value;
            updateURLParams('display_count', selectedDisplayCount);
            updateURLParams('page_number', 1);
            location.reload()
          });
        
          displayCountContainer.appendChild(displayCountDropdown);

          const tableSettingsRow = document.getElementById('table-settings-row');
          tableSettingsRow.style.display = 'flex';
          tableSettingsRow.style.alignItems = 'center';
          tableSettingsRow.insertBefore(displayCountContainer, tableSettingsRow.firstChild);
        }

        function populatePageNumberSelector(totalPages) {
          const pageNumberContainer = document.createElement('div');
          pageNumberContainer.id = 'page-number-container';

          const pageNumberText = document.createElement('span');
          pageNumberText.textContent = 'Page: ';
          pageNumberContainer.appendChild(pageNumberText);
        
          for (let i = 1; i <= totalPages; i++) {
            const pageNumberLink = document.createElement('a');
            pageNumberLink.classList.add('mx-1', 'page-link-text')
            pageNumberLink.style.cursor = 'pointer';
            pageNumberLink.textContent = i;
        
            pageNumberLink.addEventListener('click', function() {
              handlePageNumberClick(i);
            });
        
            pageNumberContainer.appendChild(pageNumberLink);
          }
        
          const tableSettingsRow = document.getElementById('table-settings-row');
          tableSettingsRow.style.display = 'flex';
          tableSettingsRow.style.alignItems = 'center';
          tableSettingsRow.style.justifyContent = 'space-between';
          tableSettingsRow.appendChild(pageNumberContainer);
        }

        function handlePageNumberClick(page) {
          if (page != pageNumber){
            updateURLParams('page_number', page);
            location.reload()
          }
        }

        const totalPages = data.total_pages;
        populateDisplayCountDropdown();
        populatePageNumberSelector(totalPages);

        createBillActivityTable(bills)

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