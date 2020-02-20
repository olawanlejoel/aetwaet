// Attach event listener to the floating button
document.querySelector('.float__btn').addEventListener('click', function(){
  document.querySelector('.tweets__entry').classList.add('show-modal');
});

// Attach event listener to the close button on the form modal container
document.querySelector('#close-form').addEventListener('click', function(){
  document.querySelector('.tweets__entry').classList.remove('show-modal');
});

function toggleSpinner(state){
  if(state === true){
    document.querySelector('.spinner__modal').classList.add('show-modal');
  } else {
    document.querySelector('.spinner__modal').classList.remove('show-modal');
  }
}

window.addEventListener('load', function(){
  toggleSpinner(true);
});