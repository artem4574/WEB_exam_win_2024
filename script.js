
const State = {
    guidesPerPage: 5,
    selectedRoute: undefined,
    selectedGuide: undefined,
    filteredGuides: undefined,
}

const Actions = {
        async RouteButtonHandler(item, tableRow) {
        State.selectedRoute = item;
        UI.clearSelection('routeTableBody');
        tableRow.classList.add('table-secondary');
        let guides = document.getElementById('guide');
        guides.classList.remove('hide');
        let header = document.querySelector('.guide-route');
        header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
        await Data.getGuides(item.id);
        searchedGuides = [];
        renderGuideList();
        setLanguage();
        displayReservation();
    },
    guideBtnHandler(item, tableRow) {
        State.selectedGuide = item;
        UI.clearSelection('guideTable');
        tableRow.classList.add('table-secondary');
        displayReservation();
    },
    findRoute(form) {
        let items = JSON.parse(sessionStorage.getItem('routes'));
        let search = form.elements['search'].value.trim();
        let select = form.elements['objects'].value;
        let searched = [];
        if (search && search !== '') {
            searched = items.filter(item => item.name.includes(search));
        } else {
            searched = [...items]; 
        }
        if (select !== 'Любой') {
            searched = searched.filter(item => item.mainObject.includes(select));
        }
        sessionStorage.setItem('searched-routes', JSON.stringify(searched));
        renderRoute(1);
    },
    findGuide(form) {
        let items = JSON.parse(sessionStorage.getItem('guides'));
        let languages = form.elements['languages'].value;
        let from = +form.elements['xpFrom'].value;
        let to = +form.elements['xpTo'].value;
        let searched = [];
        if (languages !== 'Любой') {
            searched = items.filter(item => item.language.includes(languages));
        } else {
            searched = [...items];
        }
        if (from >= to) {
            dispErr(document.querySelector('.guide-error-block'), 'Значение ОТ должно быть меньше ДО');
        } else {
            searched = searched.filter(item => item.workExperience >= from && item.workExperience <= to);
        }
        searchedGuides = searched;
        if (searched.length === 0) {
            dispErr(document.querySelector('.guide-error-block'), 'Подходящие гиды не найдены, выведены доступные гиды');
        }
        renderGuideList();
    }
}

const Data = {
    routes: [],
    guides: [],
    async getRoute() {
        try {
            let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${'routes'}`);
            url.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
            let response = await fetch(url);
            let routes = [];
            let items = await response.json();
            for (let i = 0; i < items.length; i++) {
                let item = {};
                item['id'] = items[i].id;
                item['name'] = items[i].name;
                item['description'] = items[i].description;
                item['mainObject'] = items[i].mainObject;
                routes.push(item);
            }
            sessionStorage.setItem('routes', JSON.stringify(routes));
            renderRoute(1);
        } catch (error) {
            console.error('Error fetching routes:', error);
        }
    },
    async getGuides(id) {
        let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${`routes/${id}/guides`}`);
        url.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
        let response = await fetch(url);
        let items = await response.json();
        sessionStorage.setItem('guides', JSON.stringify(items));
    },
}

const UI = {
    selectors: {
        routesTable: 'routeTableBody',
        guidesTable: 'guideTable',
        order: 'order',
        guideSection: 'guide',
        languageSelect: 'languages',
        guideRouteHeader: '.guide-route',
        paginator: '.pagination',
        routeSearchForm: 'routes-form',
        guideSearchForm: 'guide-form',
        orderModal: '#orderModal',
        objectSelect: 'objects'
    },
    clearSelection(name) {
        let table = document.getElementById(name);
        for (let row of table.children) {
            row.classList.remove('table-secondary');
        }
    }
}


function setLanguage() {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let select = document.getElementById('languages');
    select.innerHTML = '';
    let uniqueLanguages = ['Любой', ...new Set(items.map(item => item.language))];
    for (let language of uniqueLanguages) {
        let option = document.createElement("option");
        option.innerHTML = language;
        option.setAttribute("value", language);
        select.appendChild(option);
    }
}

function displayReservation() {
    let reservationSection = document.getElementById('order');
    if (State.selectedRoute === undefined || State.selectedGuide === undefined) {
        reservationSection.classList.add('hide');
    } else {
        reservationSection.classList.remove('hide');
    }
}

function renderGuideList() {
    let guideTable = document.getElementById('guideTable');
    let guideItems = searchedGuides;
    if (guideItems === undefined || guideItems.length === 0) {
        guideItems = JSON.parse(sessionStorage.getItem('guides'));
    }
    guideTable.innerHTML = '';

    for (let index = 0; index < guideItems.length; index++) {
        let row = document.createElement('tr');
        if (State.selectedGuide !== undefined && guideItems[index].id === State.selectedGuide.id) {
            row.classList.add('table-secondary');
        }

        let thumbnailCell = document.createElement('th');
        let avatarIcon = document.createElement('i');
        avatarIcon.classList.add('bi', 'bi-person-circle');
        thumbnailCell.append(avatarIcon);
        row.append(thumbnailCell);

        let nameCell = document.createElement('th');
        nameCell.textContent = guideItems[index].name;
        row.append(nameCell);

        let languageCell = document.createElement('td');
        languageCell.textContent = guideItems[index].language;
        row.append(languageCell);

        let experienceCell = document.createElement('td');
        experienceCell.textContent = guideItems[index].workExperience;
        row.append(experienceCell);

        let rateCell = document.createElement('td');
        rateCell.textContent = guideItems[index].pricePerHour + ' руб/час';
        row.append(rateCell);

        let actionCell = document.createElement('td');
        let selectButton = document.createElement('button');
        selectButton.textContent = 'Выбрать';
        selectButton.classList.add('btn', 'text-white');
        selectButton.onclick = function () {
            Actions.guideBtnHandler(guideItems[index], row);
        };
        actionCell.append(selectButton);
        row.append(actionCell);
        guideTable.append(row);
    }
}

function displayPagination(currentPage) {
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    function createPageItem(content, pageNumber = null) {
        let pageElement = document.createElement('li');
        pageElement.classList.add('page-item');

        let pageLink = document.createElement('a');
        pageLink.innerHTML = content;
        pageLink.classList.add('page-link', 'link');

        if (pageNumber !== null) {
            pageLink.onclick = () => showRoute(pageNumber);

            if (pageNumber === currentPage) {
                pageLink.classList.add('text-white', 'primary');
            }
        }

        pageElement.append(pageLink);
        return pageElement;
    }

    paginationContainer.append(createPageItem('Первая страница', 1));

    let routes = retrievePathFromSession();
    let totalPages = Math.ceil(routes.length / State.guidesPerPage);
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(currentPage + 2, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.append(createPageItem(i, i));
    }
    paginationContainer.append(createPageItem('Последняя страница', totalPages));
}


function retrievePathFromSession() {
    let cachedPaths = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (cachedPaths === null) {
        cachedPaths = JSON.parse(sessionStorage.getItem('routes'));
    }
    return cachedPaths;
}

function renderRoute(page) {
    let routeList = document.getElementById('routeTableBody');
    let routeItems = retrievePathFromSession();
    displayPagination(page);
    routeList.innerHTML = '';
    UI.clearSelection('routeTableBody');
    let pageLimit = Math.min(page * State.guidesPerPage, routeItems.length);

    for (let index = (page - 1) * State.guidesPerPage; index < pageLimit; index++) {
        let row = document.createElement('tr');

        if (State.selectedRoute != undefined && routeItems[index].id == State.selectedRoute.id) {
            row.classList.add('highlight');
        }

        let routeNameCell = document.createElement('th');
        routeNameCell.textContent = routeItems[index].name;
        row.appendChild(routeNameCell);

        let routeDescrCell = document.createElement('td');
        routeDescrCell.textContent = routeItems[index].description;
        row.appendChild(routeDescrCell);

        let mainAttractionCell = document.createElement('td');
        mainAttractionCell.textContent = routeItems[index].mainObject;
        row.appendChild(mainAttractionCell);

        let selectButtonCell = document.createElement('td');
        let selectButton = document.createElement('button');
        selectButton.textContent = 'Выбрать';
        selectButton.classList.add('btn', 'primary', 'text-white');
        selectButton.onclick = () => {
            Actions.RouteButtonHandler(routeItems[index], row);
        };
        selectButtonCell.appendChild(selectButton);
        row.appendChild(selectButtonCell);
        routeList.appendChild(row);
    }
}

function initializeObjectSelector() {
    const routeData = JSON.parse(sessionStorage.getItem('routes'));
    const selectorElement = document.getElementById('objects');
    selectorElement.innerHTML = '';
    const distinctObjects = ['Любой', ...new Set(routeData.map(route => route.mainObject))];
    for (let currentObject of distinctObjects) {
        const selectionOption = document.createElement("option");
        selectionOption.textContent = currentObject; 
        selectionOption.value = currentObject;
        selectorElement.appendChild(selectionOption);
    }
}

function dispErr(block, message) {
    const div = document.createElement('div');
    div.classList.add('alert', 'alert-danger');
    div.textContent = message;
    block.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 5000);
}

function getKbyDate(date) {
    const specialDates = ['2024-01-01', '2024-01-09', '2024-04-27', '2024-11-02', '2024-12-28'];
    const weekendDays = [6, 7];
    const holidayDates = ['2024-02-23', '2024-03-08', '2024-04-29', '2024-04-30', '2024-05-01', '2024-05-09',
                           '2024-05-10', '2024-06-12', '2024-11-04', '2024-12-30', '2024-12-31'];
    let checkDay = specialDates.includes(date) ||
                   (new Date(date).getDay() === 6 && !holidayDates.includes(date)) ||
                   weekendDays.includes(new Date(date).getDay());
    return checkDay ? 1.5 : 1;
}

function updateForm(dialog) {
    let timeSpan = dialog.target.querySelector('#duration').value;
    let visitorCount = dialog.target.querySelector('#count').value;
    let selectedTime = dialog.target.querySelector('#time').value;
    let chosenDate = dialog.target.querySelector('#date').value;
    let additionalOption1 = dialog.target.querySelector('#option1').checked;
    let additionalOption2 = dialog.target.querySelector('#option2').checked;
    let submitButton = dialog.target.querySelector('#modal-submit');
    let selectedHour = +selectedTime.split(':')[0];
    let selectedMinutes = +selectedTime.split(':')[1];
    let errorContainer = dialog.target.querySelector('#modal-errors');
   
    if (!(selectedHour >= 9 && selectedHour <= 23 && (selectedMinutes == 0 || selectedMinutes == 30))) {
        dispErr(errorContainer, 'Доступно только время с 9 до 23 часов, каждые 30 минут!');
        submitButton.classList.add('disabled');
        return;
    }
    if (chosenDate == '' || selectedTime == '') {
        dispErr(errorContainer, 'Необходимо указать время и дату!');
        submitButton.classList.add('disabled');
        return;
    }
    
    let holidayMultiplier = getKbyDate(chosenDate);
    let morningExtraCharge = (selectedHour >= 9 && selectedHour < 12) ? 400 : 0;
    let eveningExtraCharge = (selectedHour >= 20 && selectedHour < 23) ? 1000 : 0;
    let largeGroupExtraCharge = visitorCount < 5 ? 0 : visitorCount < 10 ? 1000 : 1500;
    let option1ExtraRate = additionalOption1 ? 0.3 : 0;
    let option2ExtraRate = additionalOption2 ? (holidayMultiplier == 1.5) ? 0.25 : 0.3 : 0;
    submitButton.classList.remove('disabled');
    let finalPrice = calculatePrice(State.selectedGuide.pricePerHour, timeSpan, holidayMultiplier, option1ExtraRate, option2ExtraRate, morningExtraCharge, eveningExtraCharge, largeGroupExtraCharge);
    dialog.target.querySelector('#price').textContent = finalPrice;
    setupFormSubmission(submitButton, {
        guideId: State.selectedGuide.id,
        routeId: State.selectedRoute.id,
        date: chosenDate,
        time: selectedTime,
        duration: timeSpan,
        numberPersons: visitorCount,
        totalPrice: finalPrice,
        firstOption: additionalOption1,
        secondOption: additionalOption2
    });
}

function calculatePrice(rate, duration, holidayRate, option1Rate, option2Rate, morningCharge, eveningCharge, groupCharge) {
    let initialPrice = rate * duration * (1 + option1Rate + option2Rate + holidayRate);
    let totalPrice = initialPrice + morningCharge + eveningCharge + groupCharge;
    return Math.round(totalPrice);
}

function setupFormSubmission(button, formDataValues) {
    button.onclick = async () => {
        let form = new FormData();
        form.append('guide_id', formDataValues.guideId);
        form.append('route_id', formDataValues.routeId);
        form.append('date', formDataValues.date);
        form.append('time', formDataValues.time);
        form.append('duration', formDataValues.duration);
        form.append('persons', formDataValues.numberPersons);
        form.append('price', formDataValues.totalPrice);
        form.append('option1', +formDataValues.firstOption);
        form.append('option2', +formDataValues.secondOption);
        let errorContainer = document.querySelector('#modal-errors');

        try {
            let orderUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/orders');
            orderUrl.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
            let response = await sendForm(orderUrl, form);
            if (!response.ok) {
                dispErr(errorContainer, 'Ошибка сервера!');
            } else {
                document.querySelector('#modal-close').click();
                button.classList.remove('disabled');
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
            dispErr(errorContainer, 'Ошибка при отправке заказа!');
        }  
    };
}

async function sendForm(url, formData) {
    return fetch(url, {
        method: 'POST',
        body: formData
    });
}


window.onload = async () => {
    await Data.getRoute();
    initializeObjectSelector();

    let formRoutes = document.getElementById('routes-form');
    formRoutes.onsubmit = (e) => {
        e.preventDefault();
        Actions.findRoute(formRoutes);
    };

    let objectSelectElement = document.getElementById('objects');
    objectSelectElement.onchange = () => {
        Actions.findRoute(formRoutes);
    };

    let formGuide = document.getElementById('guide-form');
    formGuide.onsubmit = (e) => {
        e.preventDefault();
        Actions.findGuide(formGuide);
    };

    document.getElementById('orderModal').addEventListener('show.bs.modal', function (modalEvent) {
        let modal = modalEvent.target;
        modal.querySelector('#fullname').textContent = State.selectedGuide.name;
        modal.querySelector('#route-name').textContent = State.selectedRoute.name;
        modal.querySelector('#time').value = '09:00';
        modal.querySelector('#date').value = Date.now();

        const updateModalForm = (updateEvent) => updateForm(updateEvent);

        modal.querySelector('#duration').onchange = updateModalForm;
        modal.querySelector('#count').oninput = updateModalForm;
        modal.querySelector('#time').onchange = updateModalForm;
        modal.querySelector('#date').onchange = updateModalForm;
        modal.querySelector('#option1').onchange = updateModalForm;
        modal.querySelector('#option2').onchange = updateModalForm;
    });
}
