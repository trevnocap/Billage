
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
            popUp.classList.add('col-md-12', 'col-lg-6', 'col-sm-12', 'border-container', 'bg-light');
            popUp.innerHTML = 'test';

            const popupWrapper = document.createElement('div');
            popupWrapper.style.position = 'fixed';
            popupWrapper.style.top = '0';
            popupWrapper.style.left = '0';
            popupWrapper.style.width = '100vw';
            popupWrapper.style.height = '100vh';
            popupWrapper.style.display = 'flex';
            popupWrapper.style.justifyContent = 'center';
            popupWrapper.style.alignItems = 'center';

            popupWrapper.appendChild(popUp);
            document.body.appendChild(popupWrapper);
        });
    });
}
