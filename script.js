'use strict';

let currentPage = 1;
let perPage = 5;
let selectedRoute;
let selectedGuide;
let searchedGuides;

function clearSelection(name) {
    let table = document.getElementById(name);
    for (let row of table.children) {
        row.classList.remove('table-secondary');
    }
}

function setLanguages() {
    let items = JSON.parse(sessionStorage.getItem('guides'));
    let select = document.getElementById('languages');
    select.innerHTML = '';
    let uniqueLanguages = ['Any', ...new Set(items.map(item => item.language))];
    for (let language of uniqueLanguages) {
        let option = document.createElement("option");
        option.innerHTML = language;
        option.setAttribute("value", language);
        select.appendChild(option);
    }
}

function showOrder() {
    let orderBlock = document.getElementById('order');
    if (selectedRoute === undefined || selectedGuide === undefined) {
        orderBlock.classList.add('hide');
    }
    else {
        orderBlock.classList.remove('hide');
    }
}

async function fetchRoutes() {
    try {
        let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${'routes'}`);
        url.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
        let response = await fetch(url);
        let routes = [];
        let items = await response.json();
        for (let i = 0; i < items.length; i++) {
            let route = {};
            route['id'] = items[i].id;
            route['name'] = items[i].name;
            route['description'] = items[i].description;
            route['mainObject'] = items[i].mainObject;
            routes.push(route);
        }
        sessionStorage.setItem('routes', JSON.stringify(routes));
        showRouteTable(1);
    } catch (error) {
        console.error('Error fetching routes:', error);
    }
}

function getGuidesArray() {
    let items = searchedGuides;
    if (items == undefined || items.length == 0) {
        items = JSON.parse(sessionStorage.getItem('guides'));
    }
    return items;
}

async function handleRouteButtonClick(item, tableRow) {
    selectedRoute = item;
    clearSelection('routeTableBody');
    tableRow.classList.add('table-secondary');
    let guides = document.getElementById('guide');
    guides.classList.remove('hide');
    let header = document.querySelector('.guide-route');
    header.innerHTML = `Доступные гиды по маршруту ${item.name}`;
    await fetchGuides(item.id);
    searchedGuides = [];
    showGuideTable();
    setLanguages();
    showOrder();
}

function handleGuideButtonClick(item, tableRow) {
    selectedGuide = item;
    clearSelection('guideTable');
    tableRow.classList.add('table-secondary');
    showOrder();
}

function showGuideTable() {
    let table = document.getElementById('guideTable');
    let items = getGuidesArray();
    table.innerHTML = '';
    for (let i = 0; i < items.length; i++) {
        let tr = document.createElement('tr');
        if (selectedGuide != undefined && items[i].id == selectedGuide.id) {
            tr.classList.add('table-secondary');
        }
        let img = document.createElement('th');
        let icon = document.createElement('i');
        icon.classList.add('bi');
        icon.classList.add('bi-person-circle');
        img.append(icon);
        tr.append(img);

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let language = document.createElement('td');
        language.innerHTML = items[i].language;
        tr.append(language);

        let workExperience = document.createElement('td');
        workExperience.innerHTML = items[i].workExperience;
        tr.append(workExperience);

        let price = document.createElement('td');
        price.innerHTML = items[i].pricePerHour + ' руб/час';
        tr.append(price);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn');
        button.classList.add('primary');
        button.classList.add('text-white');
        button.onclick = () => {
            handleGuideButtonClick(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

async function fetchGuides(routeId) {
    let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${`routes/${routeId}/guides`}`);
    url.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
    let response = await fetch(url);
    let items = await response.json();
    sessionStorage.setItem('guides', JSON.stringify(items));
}

function createListItem(name, value, active) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = name;
    link.classList.add('page-link');
    link.classList.add('link');
    link.onclick = () => {
        showRoute(value);
    };
    li.append(link);
    if (active) {
        link.classList.add('text-white');
        link.classList.add('primary');
    }
    return li;
}

function showPagination(page) {
    let pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';

    pagination.append(createListItem('Первая страница', 1));

    let items = getRoutesFromStorage();
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / perPage);
    let end = Math.min(page + 2, last);

    for (let i = start; i <= end; i++) {
        pagination.append(createListItem(i, i, page === i));
    }

    pagination.append(createListItem('Последняя страница', last));
}

function getRoutesFromStorage() {
    let items = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (items == undefined) {
        items = JSON.parse(sessionStorage.getItem('routes'));
    }
    return items;
}

function showRouteTable(page) {
    let table = document.getElementById('routeTableBody');
    let items = getRoutesFromStorage();
    showPagination(page);
    table.innerHTML = '';
    clearSelection('routeTableBody');
    let end = Math.min(page * perPage, items.length);
    for (let i = (page - 1) * perPage; i < end; i++) {
        let tr = document.createElement('tr');
        if (selectedRoute != undefined && items[i].id == selectedRoute.id) {
            tr.classList.add('table-secondary');
        }

        let name = document.createElement('th');
        name.innerHTML = items[i].name;
        tr.append(name);

        let descr = document.createElement('td');
        descr.innerHTML = items[i].description;
        tr.append(descr);

        let obj = document.createElement('td');
        obj.innerHTML = items[i].mainObject;
        tr.append(obj);

        let buttonTd = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Выбрать';
        button.classList.add('btn');
        button.classList.add('primary');
        button.classList.add('text-white');
        button.onclick = () => {
            handleRouteButtonClick(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

function setObjectOptions() {
    let items = JSON.parse(sessionStorage.getItem('routes'));
    let select = document.getElementById('objects');
    select.innerHTML = '';
    let uniqueObjects = ['Любой', ...new Set(items.map(item => item.mainObject))];
    for (let obj of uniqueObjects) {
        let option = document.createElement("option");
        option.innerHTML = obj;
        option.setAttribute("value", obj);
        select.appendChild(option);
    }
}

function searchRoute(form) {
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
    showRouteTable(1);
}

function displayError(block, message) {
    const div = document.createElement('div');
    div.classList.add('alert', 'alert-danger');
    div.textContent = message;
    block.appendChild(div);
    setTimeout(() => {
        div.remove();
    }, 5000);
}

function searchGuide(form) {
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
        displayError(document.querySelector('.guide-error-block'), 'Значение ОТ должно быть меньше ДО');
    } else {
        searched = searched.filter(item => item.workExperience >= from && item.workExperience <= to);
    }
    searchedGuides = searched;
    if (searched.length === 0) {
        displayError(document.querySelector('.guide-error-block'), 'Подходящие гиды не найдены, выведены доступные гиды');
    }
    showGuideTable();
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

function formUpd(modal) {
    let duration = modal.target.querySelector('#duration').value;
    let count = modal.target.querySelector('#count').value;
    let time = modal.target.querySelector('#time').value;
    let date = modal.target.querySelector('#date').value;
    let option1 = modal.target.querySelector('#option1').checked;
    let option2 = modal.target.querySelector('#option2').checked;
    let btn = modal.target.querySelector('#modal-submit');
    let hour = +time.split(':')[0];
    let minutes = +time.split(':')[1];
    if (!(hour >= 9 && hour <= 23 && (minutes == 0 || minutes == 30))) {
        dispErr(modal.target.querySelector('#modal-errors'), 'Доступно только время с 9 до 23 часов, каждые 30 минут!');
        btn.classList.add('disabled');
        return;
    }
    if (date == '' || time == '') {
        dispErr(modal.target.querySelector('#modal-errors'), 'Необходимо указать время и дату!');
        btn.classList.add('disabled');
        return;
    }
    
    let isThisDayOff = getKbyDate(date);
    let morningPrice = hour >= 9 || hour < 12 ? 400 : 0;
    let eveningPrice = hour >= 20 || hour < 23 ? 1000 : 0;
    let visitorsPrice = count < 5 ? 0 : count < 10 ? 1000 : 1500;
    let option1Price = option1 ? 0.3 : 0;
    let option2Price = option2 ? (isThisDayOff == 1)? 0.3 : 0.25 : 0;
    btn.classList.remove('disabled');
    let price = selectedGuide.pricePerHour * duration * (option1Price + isThisDayOff + option2Price) + morningPrice + eveningPrice + visitorsPrice;
    price = Math.round(price);
    modal.target.querySelector('#price').innerHTML = price;
    btn.onclick = async () => {
        let form = new FormData();
        form.append('guide_id', selectedGuide.id);
        form.append('route_id', selectedRoute.id);
        form.append('date', date);
        form.append('time', time);
        form.append('duration', duration);
        form.append('persons', count);
        form.append('price', price);
        form.append('optionFirst', +option1);
        form.append('optionSecond', +option2);
        try {
            let url = new URL(`http://exam-2023-1-api.std-900.ist.mospolytech.ru/api/${'orders'}`);
            url.searchParams.set("api_key", "64f8482f-218a-424a-bc2f-1eb33bd034fd");
            let response = await fetch(url, {
                method: 'POST',
                body: form
            });

            if (!response.ok) {
                dispErr(modal.target.querySelector('#modal-errors'), 'Ошибка сервера!');
            } else {
                document.querySelector('#modal-close').click();
                btn.classList.remove('disabled');
            }
        } catch (error) {
            console.error('Error submitting the form:', error);
            dispErr(modal.target.querySelector('#modal-errors'), 'Ошибка при отправке заказа!');
        }
    };
}

window.onload = async () => {
    await fetchRoutes();
    setObjectOptions();
    let routesForm = document.getElementById('routes-form');
    routesForm.onsubmit = (event) => {
        event.preventDefault();
        findRoute(routesForm);
    };
    let select = document.getElementById('objects');
    select.onchange = function () {
        findRoute(routesForm);
    }
    let guideForm = document.getElementById('guide-form');
    guideForm.onsubmit = (event) => {
        event.preventDefault();
        findGuide(guideForm);
    };
    document.getElementById('orderModal').addEventListener('show.bs.modal', function (event) {
        event.target.querySelector('#fullname').innerHTML = selectedGuide.name;
        event.target.querySelector('#route-name').innerHTML = selectedRoute.name;
        event.target.querySelector('#time').value = '09:00';
        event.target.querySelector('#date').value = Date.now();

        event.target.querySelector('#duration').onchange = () => formUpd(event);
        event.target.querySelector('#count').oninput = () => formUpd(event);
        event.target.querySelector('#time').onchange = () => formUpd(event);
        event.target.querySelector('#date').onchange = () => formUpd(event);
        event.target.querySelector('#option1').onchange = () => formUpd(event);
        event.target.querySelector('#option2').onchange = () => formUpd(event);
    });
}