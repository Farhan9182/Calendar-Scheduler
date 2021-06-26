
//BACKEND SCRIPT-----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', load);

// function start() {
//     fetch('http://localhost:5000/getAll')
//         .then(response => response.json())
//         .then((data) => {
//             load(data['data']);
//             // let localDate = new Date(data['data'][0].date);
//             // console.log(localDate.toLocaleDateString());
//         });
// }


//FRONTEND SCRIPT-----------------------------------------------------------------
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
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
            populateEvents(data['data'],month,year,paddingDays,daysInMonth,day); 
        });
}

function populateEvents(eventRows,month,year,paddingDays,daysInMonth,day){

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;
        let eventForDay = false;
        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;
            daySquare.setAttribute('day',i - paddingDays);
            eventRows.forEach(element => {
                var dateObj = new Date(element.date);
                dateObj = dateObj.toLocaleDateString();
                if(dayString == dateObj){
                    eventForDay = true;
                }
            });

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = "Event Available";
                daySquare.appendChild(eventDiv);
            }

            daySquare.addEventListener('click', () => openModal(dayString,eventRows,eventForDay));

        }
        else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

function addMoreModal(date) {
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    schedule_facultyName.value = '';

    newEventModal.style.display = 'block';
    document.getElementById('schedule_date').value = date;
    backDrop.style.display = 'block';
}

function openModal(date,eventRows,eventForDay) {
    clicked = date;

    if (eventForDay) {

        eventRows.forEach(element => {
            var dateObj = new Date(element.date);
            dateObj = dateObj.toLocaleDateString();
            
            if(date == dateObj){
                let div = document.createElement('div');
                div.id = "eventText";
                div.innerText = element.faculty_name + " | " + element.batch + " | " + dateObj + " | " + element.start + " | " + element.end;
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
                
                del.addEventListener('click', () => deleteEvent(element.id,date,eventRows,eventForDay));
                // edit.addEventListener('click', editEvent(element.id));
                document.getElementById('eventsContainer').appendChild(div);
            }
        });

       deleteEventModal.style.display = 'block';

    } else {
        newEventModal.style.display = 'block';
        document.getElementById('schedule_date').value = clicked;
    }


    backDrop.style.display = 'block';
}

function closeModal() {
    schedule_facultyName.classList.remove('error');
    newEventModal.style.display = 'none';
    deleteEventModal.style.display = 'none';
    backDrop.style.display = 'none';
    schedule_facultyName.value = '';
    document.getElementById('eventsContainer').textContent = '';
    clicked = null;
    load();
}

function saveEvent() {
    const schedule_facultyName = document.getElementById('schedule_facultyName');
    const schedule_batch = document.getElementById('schedule_batch');
    const schedule_date_local_format = document.getElementById('schedule_date').value;
    const schedule_start = document.getElementById('schedule_start');
    const schedule_end = document.getElementById('schedule_end');
    let temp_schedule_date = new Date(schedule_date_local_format);
    const schedule_date = new Date(temp_schedule_date.getTime() - (temp_schedule_date.getTimezoneOffset() * 60000))
        .toISOString()
        .split("T")[0];

    console.log(schedule_date);
    if (schedule_facultyName.value && schedule_batch.value && schedule_date && schedule_start.value && schedule_end.value) {

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
            .then(data => console.log(data['data']));

        schedule_facultyName.value = "";
        schedule_batch.value = "";
        schedule_date.value = "";
        schedule_start.value = "";
        schedule_end.value = "";
        closeModal();
    } else {
        alert("Event not saved ! Please fill out all the fields.")
    }
}

function deleteEvent(id,date,eventRows,eventForDay) {
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
            }, 500);
            
        }
    });
    
}