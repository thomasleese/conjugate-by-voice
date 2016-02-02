(function() {

  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

  var $flags = document.querySelectorAll('.flags [data-country]');
  var $status = document.querySelector('#app-status');
  var $conjugator = document.querySelector('#conjugator');

  var currentCountry = localStorage.getItem('country');
  var recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    $status.textContent = 'Listening for dem verbs.';
  };

  recognition.onresult = function(event) {
    var result = event.results[event.resultIndex];

    if (result.isFinal) {
      var verb = result[0].transcript;
      $status.textContent = verb;
      conjugate(verb);
    } else {
      $status.textContent = '…';
    }
  };

  recognition.onnomatch = function(event) {
    $status.textContent = "I don't understand.";
  };

  recognition.onerror = function(event) {
    $status.textContent = 'Speak clearer dude.';
  };

  recognition.onend = function() {
    $status.textContent = "I've stopped listening to you.";
  };

  var conjugate = function(verb) {
    console.log('Conjugating:', verb);

    var url;
    if (currentCountry === 'france') {
      verb = accents.removeDiacritics(verb);
      url = 'http://www.conjugation-fr.com/conjugate.php?verb=' + encodeURIComponent(verb) + '&x=0&y=0';
    } else if (currentCountry === 'germany') {
      url = 'http://www.verbix.com/webverbix/German/' + encodeURIComponent(verb) + '.html';
    }

    $conjugator.src = url;
  };

  var updateFlagStatus = function($flag) {
    var country = $flag.dataset.country;

    var isActive = currentCountry === country;
    if (isActive) {
      $flag.classList.add('active');
    } else {
      $flag.classList.remove('active');
    }
  };

  var changeCountry = function(newCountry) {
    console.log('Changing country to:', newCountry);
    localStorage.setItem('country', newCountry);
    currentCountry = newCountry;

    for (var i = 0; i < $flags.length; i++) {
      updateFlagStatus($flags[i]);
    }

    setCountry(newCountry);
  };

  var setCountry = function(newCountry) {
    console.log('Setting country to:', newCountry);

    recognition.stop();

    var oldOnEnd = recognition.onend;

    recognition.onend = function() {
      if (newCountry === 'france') {
        recognition.lang = 'fr-FR';
      } else if (newCountry === 'germany') {
        recognition.lang = 'de-DE';
      }

      recognition.start();

      recognition.onend = oldOnEnd;
    };

    if (recognition.lang.length == 0) {
      recognition.onend();
    }
  };

  if (currentCountry === null) {
    changeCountry('france');
  } else {
    setCountry(currentCountry);
  }

  var configureFlag = function($flag) {
    var country = $flag.dataset.country;
    updateFlagStatus($flag);
    $flag.onclick = function() {
      changeCountry(country);
    };
  };

  for (var i = 0; i < $flags.length; i++) {
    configureFlag($flags[i]);
  }

}());
