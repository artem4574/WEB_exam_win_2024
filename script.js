
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
        showGuide();
        setLanguage();
        showOrder();
    },
    guideBtnHandler(item, tableRow) {
        State.selectedGuide = item;
        UI.clearSelection('guideTable');
        tableRow.classList.add('table-secondary');
        showOrder();
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
        showRoute(1);
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
        showGuide();
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
            showRoute(1);
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

function showOrder() {
    let ordereBlock = document.getElementById('order');
    if (State.selectedRoute === undefined || State.selectedGuide === undefined) {
        ordereBlock.classList.add('hide');
    }
    else {
        ordereBlock.classList.remove('hide');
    }
}

function showGuide() {
    let table = document.getElementById('guideTable');
    let items = searchedGuides;
    if (items == undefined || items.length == 0) {
        items = JSON.parse(sessionStorage.getItem('guides'));
    }
    table.innerHTML = '';
    for (let i = 0; i < items.length; i++) {
        let tr = document.createElement('tr');
        if (State.selectedGuide != undefined && items[i].id == State.selectedGuide.id) {
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
            Actions.guideBtnHandler(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

function showPag(page) {
    let pages = document.querySelector('.pagination');
    pages.innerHTML = '';
    let licreate = document.createElement('li');
    licreate.classList.add('page-item');
    let Link = document.createElement('a');
    Link.innerHTML = 'Первая страница';
    Link.classList.add('page-link');
    Link.classList.add('link');
    Link.onclick = () => {
        showRoute(1);
    };

    licreate.append(Link);
    pages.append(licreate);
    let items = getRouteFromStorage();
    let start = Math.max(page - 2, 1);
    let last = Math.ceil(items.length / State.guidesPerPage);
    let end = Math.min(page + 2, last);

    for (let i = start; i <= end; i++) {
        let li = document.createElement('li');
        li.classList.add('page-item');
        let link = document.createElement('a');
        link.innerHTML = i;
        link.classList.add('page-link');
        link.classList.add('link');
        link.onclick = () => {
            showRoute(i);
        };
        li.append(link);
        if (i) {
            link.classList.add('text-white');
            link.classList.add('primary');
        }
        pages.append(li)
    }

    let li = document.createElement('li');
    li.classList.add('page-item');
    let link = document.createElement('a');
    link.innerHTML = 'Последняя страница';
    link.classList.add('page-link');
    link.classList.add('link');
    link.onclick = () => {
        showRoute(last);
    };
    li.append(link);
   pages.append(li)
}

function getRouteFromStorage() {
    let items = JSON.parse(sessionStorage.getItem('searched-routes'));
    if (items == undefined) {
        items = JSON.parse(sessionStorage.getItem('routes'));
    }
    return items;
}

function showRoute(page) {
    let table = document.getElementById('routeTableBody');
    let items = getRouteFromStorage();
    showPag(page);
    table.innerHTML = '';
    UI.clearSelection('routeTableBody');
    let end = Math.min(page * State.guidesPerPage, items.length);
    for (let i = (page - 1) * State.guidesPerPage; i < end; i++) {
        let tr = document.createElement('tr');
        if (State.selectedRoute != undefined && items[i].id == State.selectedRoute.id) {
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
            Actions.RouteButtonHandler(items[i], tr);
        };
        buttonTd.append(button);
        tr.append(buttonTd);
        table.append(tr);
    }
}

function setterObj() {
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
    let option2Price = option2 ? (isThisDayOff == 1.5) ? 0.25 : 0.3 : 0;
    btn.classList.remove('disabled');
    let price = State.selectedGuide.pricePerHour * duration * (option1Price + isThisDayOff + option2Price) + morningPrice + eveningPrice + visitorsPrice ;
    price = Math.round(price);
    modal.target.querySelector('#price').innerHTML = price;
    btn.onclick = async () => {
        let form = new FormData();
        form.append('guide_id', State.selectedGuide.id);
        form.append('route_id', State.selectedRoute.id);
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
    await Data.getRoute();
    setterObj();
    let routesForm = document.getElementById('routes-form');
    routesForm.onsubmit = (event) => {
        event.preventDefault();
        Actions.findRoute(routesForm);
    };
    let select = document.getElementById('objects');
    select.onchange = function () {
        Actions.findRoute(routesForm);
    }
    let guideForm = document.getElementById('guide-form');
    guideForm.onsubmit = (event) => {
        event.preventDefault();
        Actions.findGuide(guideForm);
    };
    document.getElementById('orderModal').addEventListener('show.bs.modal', function (event) {
        event.target.querySelector('#fullname').innerHTML = State.selectedGuide.name;
        event.target.querySelector('#route-name').innerHTML = State.selectedRoute.name;
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