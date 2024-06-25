document.addEventListener('DOMContentLoaded', function() {
    
  var modeSlider = document.getElementById('sizeSlider');
    var modeValue = document.getElementById('sizeValue');
    modeSlider.addEventListener('input', function() {
      modeValue.textContent = modeSlider.value;
    });

    var featureSlider = document.getElementById('featureSlider');
    var featureValue = document.getElementById('featureValue');
    featureSlider.addEventListener('input', function() {
      featureValue.textContent = featureSlider.value;
    });
  });

 