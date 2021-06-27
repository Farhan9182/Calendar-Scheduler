let filter = false;
let filterName= "";
document.getElementById('keyword').addEventListener('keypress',function(e){
    if(e.key.localeCompare("Enter") == 0){
        document.getElementById('filter').click();
    }
})
document.getElementById('filter').addEventListener('click', () => {
    filterName = document.getElementById('keyword').value;
    if (filterName == "") {
        filter = false;
    }
    else{
        filter = true;
    }
    load();
});

document.addEventListener('DOMContentLoaded', load);


//FRONTEND SCRIPT-----------------------------------------------------------------
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const editEventModal = document.getElementById('updateEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');



let nav = 0; //to check navigation from current date

let clicked = null;
// let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];

initButtons();
function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

    document.getElementById('addMoreButton').addEventListener('click', () => addMoreModal(clicked));

    document.getElementById('saveButton').addEventListener('click', saveEvent);
    document.getElementById('cancelButton').addEventListener('click', closeModal);

    document.getElementById('closeButton').addEventListener('click', closeModal);
    document.getElementById('cancelUpdateButton').addEventListener('click', closeModal);
}

function load() {
    const dt = new Date();

    if (nav !== 0) {
        dt.setMonth(new Date().getMonth() + nav);
    }

    const day = dt.getDate();
    const month = dt.getMonth();
    const year = dt.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dateString = firstDayOfMonth.toLocaleDateString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });

    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);

    document.getElementById('monthDisplay').innerText =
        `${dt.toLocaleDateString('en-us', { month: 'long' })} ${year}`;

    calendar.innerHTML = '';
    let details = {
        month: Number(month) + 1,
        year: year
    }
    let sendData = JSON.stringify(details);

    fetch('http://localhost:5000/search/' + sendData)
        .then(response => response.json())
        .then(function (data) {
            populateEvents(data['data'], month, year, paddingDays, daysInMonth, day);
        });
}

function populateEvents(eventRows, month, year, paddingDays, daysInMonth, day) {

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;
        let eventForDay = false;
        if (i > paddingDays) {

            daySquare.innerText = i - paddingDays;
            daySquare.setAttribute('day', i - paddingDays);
            let str1 = filterName.toLocaleUpperCase().trim();
            for(let i=0; i<eventRows.length; i++){
                let element = eventRows[i];
                let str2 = element.faculty_name.toLocaleUpperCase().trim();
                var dateObj = new Date(element.date);
                dateObj = dateObj.toLocaleDateString();
                console.log("Hello");
                if (filter) {
                    if (dayString == dateObj && str1.localeCompare(str2) == 0 ){
                        
                        eventForDay = true;
                        break;
                    } 
                        
                }
                else{
                    if (dayString == dateObj) {
                        eventForDay = true;
                        break;
                    }
                }
                
            }

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = "Event Available";
                daySquare.appendChild(eventDiv);
            }

            daySquare.addEventListener('click', () => openModal(dayString, eventRows, eventForDay));

        }
        else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

async function validate(faculty_name, date, start, end) {

    let details = {
        faculty_name: faculty_name,
        date: date
    }
    let sendData = JSON.stringify(details);

    const response = await fetch('http://localhost:5000/validate/' + sendData);
    const data = await response.json();
    let bool = check(data['data'], start, end);
    return bool;
}

function check(data, start, end) {
    for (let i = 0; i < data.length; i++) {
        
        if (data[i].start == start) {
            return false;
        }
        if (data[i].start > start) {
            if (i - 1 < 0) {
                if (end <= data[i].start) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else if (data[i - 1].end <= start && end <= data[i].start) {
                return true;
            }
            else {
                return false;
            }
        }
        else{
            if(data[i].end > start){
                return false;
            }
            else{
                return true;
            }
        }

    }
    return true;
}

function editModal(id, faculty_name, batch, date, start, end) {
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    editEventModal.style.display = 'none';
    backDrop.style.display = 'none';

    let dateParts = date.split('/');
    for (let index = 0; index < dateParts.length; index++) {
        if (dateParts[index].length == 1) {
            dateParts[index] = "0" + dateParts[index];
        }

    }
    let finalDate = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];

    document.getElementById('update_schedule_facultyName').value = faculty_name;
    document.getElementById('update_schedule_batch').value = batch;
    document.getElementById('update_schedule_date').value = finalDate;
    document.getElementById('update_schedule_start').value = start;
    document.getElementById('update_schedule_end').value = end;

    document.getElementById('updateButton').onclick = () => editEvent(id,start,end);

    editEventModal.style.display = 'block';
    backDrop.style.display = 'block';

}

function addMoreModal(date) {
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';

    let dateParts = date.split('/');
    for (let index = 0; index < dateParts.length; index++) {
        if (dateParts[index].length == 1) {
            dateParts[index] = "0" + dateParts[index];
        }

    }
    let finalDate = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];
    document.getElementById('schedule_date').value = finalDate;
    newEventModal.style.display = 'block';
    backDrop.style.display = 'block';
}

function openModal(date, eventRows, eventForDay) {
    clicked = date;

    if (eventForDay) {

        let str1 = filterName.toLocaleUpperCase().trim();
            for(let i=0; i<eventRows.length; i++){
                let element = eventRows[i];
                let str2 = element.faculty_name.toLocaleUpperCase().trim();
                var dateObj = new Date(element.date);
                dateObj = dateObj.toLocaleDateString();
                console.log("Hello");

                if (filter) {
                    if (date == dateObj && str1.localeCompare(str2) == 0 ){
                        let dateParts = dateObj.split('/');
                        let finalDate = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2];
        
                        let div = document.createElement('div');
                        div.id = "eventText";
                        div.innerText = element.faculty_name + " | " + element.batch + " | " + finalDate + " | " + element.start + " | " + element.end;
                        let del = document.createElement('button');
                        del.id = "deleteButton";
                        del.innerText = "X";
                        let edit = document.createElement('button');
                        edit.id = "editButton";
                        let inpt = document.createElement('input');
                        inpt.type = 'image';
                        inpt.style.height = "15px";
                        inpt.style.width = "20px";
                        inpt.src = "../Assets/edit-button.png";
                        edit.appendChild(inpt);
                        div.appendChild(edit);
                        div.appendChild(del);
        
                        del.addEventListener('click', () => deleteEvent(element.id, date, eventRows, eventForDay));
                        edit.addEventListener('click', () => editModal(element.id, element.faculty_name, element.batch, finalDate, element.start, element.end));
                        document.getElementById('eventsContainer').appendChild(div);
                    }
                }
                else{
                    if (date == dateObj) {
                        let dateParts = dateObj.split('/');
                        let finalDate = dateParts[1] + "/" + dateParts[0] + "/" + dateParts[2];
        
                        let div = document.createElement('div');
                        div.id = "eventText";
                        div.innerText = element.faculty_name + " | " + element.batch + " | " + finalDate + " | " + element.start + " | " + element.end;
                        let del = document.createElement('button');
                        del.id = "deleteButton";
                        del.innerText = "X";
                        let edit = document.createElement('button');
                        edit.id = "editButton";
                        let inpt = document.createElement('input');
                        inpt.type = 'image';
                        inpt.style.height = "15px";
                        inpt.style.width = "20px";
                        inpt.src = "../Assets/edit-button.png";
                        edit.appendChild(inpt);
                        div.appendChild(edit);
                        div.appendChild(del);
        
                        del.addEventListener('click', () => deleteEvent(element.id, date, eventRows, eventForDay));
                        edit.addEventListener('click', () => editModal(element.id, element.faculty_name, element.batch, finalDate, element.start, element.end));
                        document.getElementById('eventsContainer').appendChild(div);
                    }
                }
            
        }

        deleteEventModal.style.display = 'block';

    } else {
        newEventModal.style.display = 'block';

        let dateParts = date.split('/');
        for (let index = 0; index < dateParts.length; index++) {
            if (dateParts[index].length == 1) {
                dateParts[index] = "0" + dateParts[index];
            }

        }
        let finalDate = dateParts[2] + "-" + dateParts[0] + "-" + dateParts[1];
        document.getElementById('schedule_date').value = finalDate;
        document.getElementById('schedule_date').setAttribute('disabled', 'true');
    }


    backDrop.style.display = 'block';
}

function closeModal() {
    schedule_facultyName.classList.remove('error');
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    editEventModal.style.display = 'none';
    backDrop.style.display = 'none';

    document.getElementById('eventsContainer').textContent = '';
    clicked = null;
    load();
}

function saveEvent() {
    const schedule_facultyName = document.getElementById('schedule_facultyName');
    const schedule_batch = document.getElementById('schedule_batch');
    const scheduleDate = document.getElementById('schedule_date');
    const schedule_date_local_format = document.getElementById('schedule_date').value;
    const schedule_start = document.getElementById('schedule_start');
    const schedule_end = document.getElementById('schedule_end');
    let temp_schedule_date = new Date(schedule_date_local_format);
    const schedule_date = new Date(temp_schedule_date.getTime() - (temp_schedule_date.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];


    if (schedule_facultyName.value && schedule_batch.value && schedule_date && schedule_start.value && schedule_end.value) {
        let validation = validate(schedule_facultyName.value, schedule_date, schedule_start.value + ":00", schedule_end.value + ":00");
        validation.then((bool) => {
            if (bool) {
                fetch('http://localhost:5000/insert', {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        schedule_facultyName: schedule_facultyName.value,
                        schedule_date: schedule_date,
                        schedule_batch: schedule_batch.value,
                        schedule_end: schedule_end.value,
                        schedule_start: schedule_start.value
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.data) {
                            schedule_facultyName.value = "";
                            schedule_batch.value = "";
                            scheduleDate.value = "";
                            schedule_start.value = "";
                            schedule_end.value = "";
                            closeModal();
                        }
                    });
            }
            else {
                alert("This is an overlapping schedule !!! Please reconsider.")
            }
        });



    } else {
        alert("Event not saved ! Please fill out all the fields.");
    }
}

function deleteEvent(id, date) {
    fetch('http://localhost:5000/delete/' + id, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeModal();
                setTimeout(() => {
                    let day = date.split('/')[1];
                    document.querySelector("[day='" + CSS.escape(day) + "']").click();
                }, 100);

            }
        });

}

function editEvent(id,start,end) {
    
    const schedule_facultyName = document.getElementById('update_schedule_facultyName');
    const schedule_batch = document.getElementById('update_schedule_batch');
    const scheduleDate = document.getElementById('update_schedule_date');
    const schedule_date_local_format = document.getElementById('update_schedule_date').value;
    const schedule_start = document.getElementById('update_schedule_start');
    const schedule_end = document.getElementById('update_schedule_end');
    let temp_schedule_date = new Date(schedule_date_local_format);
    const schedule_date = new Date(temp_schedule_date.getTime() - (temp_schedule_date.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];

    if (schedule_facultyName.value && schedule_batch.value && schedule_date && schedule_start.value && schedule_end.value) {
        if(start.localeCompare(schedule_start.value) == 0 && end.localeCompare(schedule_end.value) == 0){
            fetch('http://localhost:5000/update', {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        schedule_facultyName: schedule_facultyName.value,
                        schedule_date: schedule_date,
                        schedule_batch: schedule_batch.value,
                        schedule_end: schedule_end.value,
                        schedule_start: schedule_start.value
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            schedule_facultyName.value = "";
                            schedule_batch.value = "";
                            scheduleDate.value = "";
                            schedule_start.value = "";
                            schedule_end.value = "";

                            closeModal();
                        }
                    });
        }
        else{
            let validation = validate(schedule_facultyName.value, schedule_date, schedule_start.value + ":00", schedule_end.value + ":00");
        validation.then((bool) => {
            if (bool) {
                fetch('http://localhost:5000/update', {
                    method: 'PATCH',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: id,
                        schedule_facultyName: schedule_facultyName.value,
                        schedule_date: schedule_date,
                        schedule_batch: schedule_batch.value,
                        schedule_end: schedule_end.value,
                        schedule_start: schedule_start.value
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            schedule_facultyName.value = "";
                            schedule_batch.value = "";
                            scheduleDate.value = "";
                            schedule_start.value = "";
                            schedule_end.value = "";

                            closeModal();
                        }
                    });
            }
            else {
                alert("This is an overlapping schedule !!! Please reconsider.")
            }
            });
        }
        

    }
    else {
                alert("Event not saved ! Please fill out all the fields.");
            }
}

