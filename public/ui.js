/**
 * Logic for manipulating the UI based on events should go in this file.
 * 
 * Wrap this module so nothing bleeds into global scope
 */
(() => {
  const recordButton = document.getElementById('record-start');
  const stopButton = document.getElementById('record-stop');
  const blinker = document.getElementById('recording-status-blink');
  const timer = document.getElementById('recording-status-timer');
  /**
   * Event handlers
   */
  
  window.addEventListener('recorder-started', showRecordingState);
  window.addEventListener('recorder-stopped', showNotRecordingState);

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
      if (time < 0) {
        console.log("STOP!");
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
      if (flipFlop) {
        blinker.style.backgroundColor = 'red'
      } else {
        blinker.style.backgroundColor = 'black'
      }
      flipFlop = !flipFlop
    }
  }

  /**
   * Stop the little red dot from flashing
   */
  function stopBlinker() {
    blink = false;
    blinker.style.backgroundColor = 'black';
  }

})();