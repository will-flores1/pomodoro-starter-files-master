// timers
    const timer = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4,
        sessions: 0,
    };

    let interval;

    const buttonSound = new Audio('button-sound.mp3');  // create new audio object
    const mainButton = document.getElementById('js-btn');   // selects 'start' button HTML element
    mainButton.addEventListener('click', () => {    // eventListener to detect a click on 'start' button
        buttonSound.play(); // play the sound if the timer is started or stopped
        const { action } = mainButton.dataset;  // the value of data-action attribute on the button is stored in an action variable
        if (action === 'start') {   // checked to see if it's equal to 'start'
            startTimer();   // the countdown begins
        } else {
            stopTimer();    // execute stopTimer() when data-action is set to 'stop'
        }
    });

// eventListener to detect a click on any mode buttons
// once a click is detected, handleMode() function is invoked
    const modeButtons = document.querySelector('#js-mode-buttons');
    modeButtons.addEventListener('click', handleMode);

// the value of data-mode attribute is received from target element (html element)
// if target exists (mode buttons) switchMode() function is invoked
    function handleMode(event) {
        const { mode } = event.target.dataset;  // creates an object containing {pomodoro, shortBreak, longBreak}

        if(!mode) return;

        switchMode(mode);
        stopTimer();    // stop the timer when the mode is changed by clicking any of the three mode buttons
    }


// adds two new properties to the timer object
// first, a mode property is set to the current mode (pomodoro, shortBreak, longBreak)
// second, a remainingTime property is set on the timer
    function switchMode(mode) {
        timer.mode = mode;
        timer.remainingTime = {
            total: timer[mode] * 60,    // the total number of seconds remaining
            minutes: timer[mode],       // the number of minutes for the mode
            seconds: 0,                 // the seconds is always set to zero at the start of each session
        };

        document
            .querySelectorAll('button[data-mode]')   // selects read-only property of the HTML element attribute data-set 
            .forEach(e => e.classList.remove('active'));    // the active class is removed from all the mode buttons
        document.querySelector(`[data-mode="${mode}"`).classList.add('active'); // sets on the one that was clicked
        document.body.style.backgroundColor = `var(--${mode})`; // background color is the page is updated using CSS properties
        document
            .getElementById('js-progress')
            .setAttribute('max', timer.remainingTime.total);

        updateClock();  // updateClock() function is invoked
    }

// updates the countdown portion of the application
    function updateClock() {
        const { remainingTime } = timer;    // extracts the value of properties on remainingTime object
        const minutes = `${remainingTime.minutes}`.padStart(2, '0');    // pads properties with zero where necessary
        const seconds = `${remainingTime.seconds}`.padStart(2, '0');

        const min = document.getElementById('js-minutes');  // selects countdown timer elements
        const sec = document.getElementById('js-seconds');
        min.textContent = minutes;  // updates countdown timer by changing text content
        sec.textContent = seconds;

        const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
        document.title = `${minutes}:${seconds} - ${text}`; // change the title of the page to countdown and status of the timer

        const progress = document.getElementById('js-progress');
        progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;    // each time updateClock() is invoked, the value attribute of the <progress> element is updated to the result of the remaining amount of time

    }

    function startTimer() {
        let { total } = timer.remainingTime;
        const endTime = Date.parse(new Date()) + total * 1000;  // exact time in the future when the timer will end

        if (timer.mode === 'pomodoro') timer.sessions++;    // checks if the current mode is pomodoro and increments timer.sessions property by 1

        mainButton.dataset.action = 'stop'; // updates 'stop' to action property
        mainButton.textContent = 'stop';    // the 'start' button text changes to 'stop'
        mainButton.classList.add('active'); // active class is added to the button causing it to become depressed like a hardware button

        interval = setInterval(function () {
            timer.remainingTime = getRemainingTime(endTime);    // return value of getRemainingTime() is stored in property
            updateClock();    //updateClock() funciton is invoked

            total = timer.remainingTime.total;  // updated value of the total property in timer.remainingTime is extracted
            if (total <= 0) {   // checked to see if it is less than or equal to zero
                clearInterval(interval);    // if so, clearInterval() method is called, this causes setInterval() function to be cancelled and countdown ends

                switch (timer.mode) {   // auto switch to the next session on completion of the current one
                    case 'pomodoro':
                        if (timer.sessions % timer.longBreakInterval === 0) {   // checks if timer.sessions is divisible by timer.longBreakInterval without a remainder and switches to long break mode if so
                            switchMode('longBreak');
                        } else {    // else if there is a remainder, a short break session is triggered
                            switchMode('shortBreak');
                        }
                        break;
                    default:    // executed if a break session is ending which causes a new pomodoro session to begin
                        switchMode('pomodoro');
                }

                if (Notification.permission === 'granted') {
                    const text =
                        timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
                    new Notification(text);
                }

                document.querySelector(`[data-sound="${timer.mode}"]`).play();  // select the appropriate html audio element and play it during the transition

                startTimer();   // auto start countdown on auto switch to the next session on completion of the current one
            }
        }, 1000)
    }  

// takes a timestamp arguments and find the difference between the current time and the end time in ms (1000)
    function getRemainingTime(endTime) {
        const currentTime = Date.parse(new Date());
        const difference = endTime - currentTime;

        const total = Number.parseInt(difference / 1000, 10);   // computes the total number of seconds left by dividing by 1000
        const minutes = Number.parseInt((total / 60) % 60, 10); // computes the whole minutes left
        const seconds = Number.parseInt(total % 60, 10);        // computes the number of seconds left

        return {    // object containing total, minutes, seconds is returned
            total,
            minutes,
            seconds,
        };
    }

    document.addEventListener('DOMContentLoaded', () => {
        if ('Notification' in window) { // check it the browser supports notifications
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {    // if permissions have neither been granted or denied
                Notification.requestPermission().then(function(permission) {    // ask the user for permission
                    if (permission === 'granted') { // if permission is  granted
                        new Notification(   // create new notification
                            'Awesome! You will be notified at the start of each session'
                        );
                    }
                });
            }
        }

        switchMode('pomodoro');
    });

    function stopTimer() {
        clearInterval(interval);

        mainButton.dataset.action = 'start';    // updates 'start' to action property
        mainButton.textContent = 'start';       // the 'stop' button text changes to 'start'
        mainButton.classList.remove('active');  // active class is removed from the button causing it to become undepressed
    }