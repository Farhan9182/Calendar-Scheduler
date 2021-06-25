const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const calendar = document.getElementById('calendar');
const newEventModal = document.getElementById('newEventModal');
const deleteEventModal = document.getElementById('deleteEventModal');
const backDrop = document.getElementById('modalBackDrop');



let nav = 0; //to check navigation from current date

let clicked = null;
let events = localStorage.getItem('events') ? JSON.parse(localStorage.getItem('events')) : [];


initButtons();
load();

function initButtons() {
    document.getElementById('nextButton').addEventListener('click', () => {
        nav++;
        load();
    });

    document.getElementById('backButton').addEventListener('click', () => {
        nav--;
        load();
    });

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

    for (let i = 1; i <= paddingDays + daysInMonth; i++) {
        const daySquare = document.createElement('div');
        daySquare.classList.add('day');

        const dayString = `${month + 1}/${i - paddingDays}/${year}`;

        if (i > paddingDays) {
            daySquare.innerText = i - paddingDays;
            const eventForDay = events.find(e => e.schedule_date === dayString);

            if (i - paddingDays === day && nav === 0) {
                daySquare.id = 'currentDay';
            }

            if (eventForDay) {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('event');
                eventDiv.innerText = eventForDay.schedule_facultyName;
                daySquare.appendChild(eventDiv);
            }

            daySquare.addEventListener('click', () => openModal(dayString));

        }
        else {
            daySquare.classList.add('padding');
        }

        calendar.appendChild(daySquare);
    }
}

function openModal(date) {
    clicked = date;

    const eventForDay = events.find(e => e.schedule_date === clicked);

    if (eventForDay) {
        document.getElementById('eventText').innerText = eventForDay.schedule_facultyName + " | " + eventForDay.schedule_date + " | " + eventForDay.schedule_batch + " | " + eventForDay.schedule_start + " | " + eventForDay.schedule_end ;
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
        document.getElementById('eventText').appendChild(edit);
        document.getElementById('eventText').appendChild(del);
        document.getElementById('deleteButton').addEventListener('click', deleteEvent);
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
    clicked = null;
    load();
}

function saveEvent() {
    const schedule_facultyName = document.getElementById('schedule_facultyName');
    const schedule_batch = document.getElementById('schedule_batch');
    const schedule_date = document.getElementById('schedule_date');
    const schedule_start = document.getElementById('schedule_start');
    const schedule_end = document.getElementById('schedule_end');

    if (schedule_facultyName.value && schedule_batch.value && schedule_date.value && schedule_start.value && schedule_end.value) {
        console.log(schedule_facultyName.value);
        console.log(schedule_batch.value);
        console.log(schedule_start.value);
        events.push({
            schedule_facultyName : schedule_facultyName.value,
            schedule_date : schedule_date.value,
            schedule_batch : schedule_batch.value,
            schedule_end : schedule_end.value,
            schedule_start : schedule_start.value
        });

        localStorage.setItem('events', JSON.stringify(events));
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

function deleteEvent() {
    events = events.filter(e => e.date !== clicked);
    localStorage.setItem('events', JSON.stringify(events));
    closeModal();
}