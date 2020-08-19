/**
 * Logic for manipulating the UI based on events should go in this file.
 * 
 * Wrap this module so nothing bleeds into global scope
 */

// we want these in the global scope
var startCountDownEnded = new Event('start-countdown-ended');
var showEndCountdownEvent = new Event('show-end-countdown');



(() => {
  const recordButton = document.getElementById('record-start');
  const stopButton = document.getElementById('record-stop');
  const blinker = document.getElementById('recording-status-blink');
  const timer = document.getElementById('recording-status-timer');

  /**
   * Event handlers
   */
  recordButton.addEventListener('click', startVideoCountdown);
  recordButton.addEventListener('click', hideThanksMessage);
  
  window.addEventListener('recorder-started', showRecordingState);
  window.addEventListener('recorder-stopped', showNotRecordingState);
  window.addEventListener('recorder-stopped', hideEndVideoCountdown);
  window.addEventListener('recorder-stopped', showThanksMessage);
  
  window.addEventListener('start-countdown-ended', hideStartVideoCountdown);
  window.addEventListener('show-end-countdown', startEndCountdown);

  function showNotRecordingState() {
    console.log('not recording')
    if (recordButton.hasAttribute('hidden')) {
      recordButton.removeAttribute('hidden')
    }

    stopButton.setAttribute('hidden', true);

    resetTimer();
    stopBlinker();
  }

  function showRecordingState() {
    if (stopButton.hasAttribute('hidden')) {
      stopButton.removeAttribute('hidden');
    }

    recordButton.setAttribute('hidden', true);

    startTimer();
    startBlinker();
  }

  // countdown is a signal so we can stop the countdown
  let countdown = true;

  /**
   * Count down from 30 to 0. Stop the recording if you hit 0.
   */
  async function startTimer() {
    countdown = true;
    let time = 30;
    while (countdown) {
      await new Promise(r => setTimeout(r, 1000));
      // handles case where you stop recording during a pending promise
      // otherwise it randomly sets the timer to e.g. 23
      if (!countdown) break; 
      time--;

      if (time == 5) {
        window.dispatchEvent(showEndCountdownEvent);
      }
      timer.innerHTML = time;
    }
  } 

  /**
   * Reset the countdown to 30
   */
  function resetTimer() {
    countdown = false;
    timer.innerHTML = '30'
  }

  /**
   * blink is used as a signal to startBlinker to stop it from blinking.
   */
  let blink = true

  /**
   * Make the little red dot flash
   */
  async function startBlinker() {
    blink = true;
    flipFlop = true;
    
    while (blink) {
      await new Promise(r => setTimeout(r, 500));
      // handles case where you stop recording during a pending promise
      if (!blink) break; 

      if (flipFlop) {
        blinker.style.opacity = 0;
      } else {
        blinker.style.opacity = 1;
      }
      flipFlop = !flipFlop
    }
  }

  /**
   * Stop the little red dot from flashing
   */
  function stopBlinker() {
    blink = false;
    blinker.style.opacity = 0;
  }


  /**
   * Start video countdown
   */
  async function startVideoCountdown() {
    hidePrompt();
    const d = document.getElementById('start-countdown');
    d.removeAttribute('hidden');

    if (!recordButton.hasAttribute('hidden')) {
      recordButton.setAttribute('hidden', '')
    }

    for (i = 3; i > 0; i--) {
      d.childNodes[3].innerHTML = i
      await new Promise(r => setTimeout(r, 1000));
    } 

    // start recorder
    window.dispatchEvent(startCountDownEnded);
  }

  function hideStartVideoCountdown() {
    const d = document.getElementById('start-countdown');
    d.setAttribute('hidden', true);
  }

  /**
   * Countdown to video ending
   */
  async function startEndCountdown() {
    console.log('start end countdown');
    const d = document.getElementById('end-countdown');
    d.removeAttribute('hidden');

    for (i=5; i >= 0; i--) {
      d.childNodes[3].innerHTML = i;
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  function hideEndVideoCountdown(){
    const d = document.getElementById('end-countdown');
    d.setAttribute('hidden', true)
  }

  /**
   * Thanks message
   */
  async function showThanksMessage() {
    const d = document.getElementById('thanks');
    d.removeAttribute('hidden');
    await new Promise(r => setTimeout(r, 3000));
    hideThanksMessage();
    showPrompt();
  }

  function hideThanksMessage() {
    const d = document.getElementById('thanks');
    d.setAttribute('hidden', true);
  }


  /**
   * Prompt
   */

  function hidePrompt() {
    const d = document.getElementById('prompt');
    d.setAttribute('hidden', true);
  }

  function showPrompt() {
    const d = document.getElementById('prompt');
    d.removeAttribute('hidden');
  }

})();