function renderRoutes(data, page = 4) {
    let tableHTML = "";
    page = page - 1;
    let start = page * 10;
    let end = (start + 10 < data.length) ? start + 10 : data.length;

    for (let i = start, rowNumber = 1; i < end; i++, rowNumber++) {
        tableHTML +=
            `<tr>
              <th>${rowNumber}</th>
              <td scope="row">${data[i].name}</td>
              <td>${data[i].description}</td>
              <td>${data[i].mainObject}</td>
              <td><button>Выбрать</button></td>
            </tr>`;
    }

    document.getElementById("routes-table-body").innerHTML = tableHTML;
}

function openModal() {
    document.getElementById('myModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

function openEditModal() {
    document.getElementById('editFIO').value = document.getElementById('fio').innerText.slice(10).trim();
    document.getElementById('editRoute').value = document.getElementById('route').innerText.slice(18).trim();
    document.getElementById('editDataEcs').value = document.getElementById('dataEcs').innerText.slice(18).trim();
    document.getElementById('editTimeEcs').value = document.getElementById('timeEcs').innerText.slice(18).trim();
    document.getElementById('editDurationEcs').value = document.getElementById('durationEcs').innerText.slice(23).trim();
    document.getElementById('editPeopleCnt').value = document.getElementById('PeoplesCnt').innerText.slice(23).trim();

    document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveChanges() {
    editedFIO = document.getElementById('editFIO').value;
    editedRoute = document.getElementById('editRoute').value;
    editedData = document.getElementById('editDataEcs').value;
    editedTime = document.getElementById('editTimeEcs').value;
    editedDuration = document.getElementById('editDurationEcs').value;
    editedCnt = document.getElementById('editPeopleCnt').value;

    document.getElementById('fio').innerText = 'ФИО Гида: ' + editedFIO;
    document.getElementById('route').innerText = 'Название маршрута: ' + editedRoute;
    document.getElementById('dataEcs').innerText = 'Дата экскурсии: ' + editedData;
    document.getElementById('timeEcs').innerText = 'Время начала: ' + editedTime;
    document.getElementById('durationEcs').innerText = 'Длительность экскурсии: ' + editedDuration;
    document.getElementById('PeoplesCnt').innerText = 'Количество человек: ' + editedCnt;

    closeEditModal();
}

function openDeleteModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function deleteRow() {
    var row = document.getElementById('rowNumber');
    row.parentNode.removeChild(row);
    closeDeleteModal();
}

window.onload = onLoad;

function onLoad() {
    getRoutes();
}