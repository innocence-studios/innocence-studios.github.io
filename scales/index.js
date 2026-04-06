
fetch('./scales.json')
    .then((response) => response.json())
    .then((scales) => {
      for (let i in scales) {
        if (scales[i] == '') {
          let option = document.createElement('option');
          option.text = i;
          option.disabled = true;
          document.getElementById('scale-select').appendChild(option);
          continue;
        }
        let option = document.createElement('option');
        option.text = /*'    ' + */i;
        option.value = scales[i];
        document.getElementById('scale-select').appendChild(option);
      }
    });