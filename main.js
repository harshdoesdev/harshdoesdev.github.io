function handle() {

  var currHash = window.location.hash;
  
  if(currHash) {
    
     document.querySelector('a.active').classList.remove('active');

     document.querySelector('[href="' + currHash + '"]').classList.add('active');
    
  }

};

window.addEventListener('load', handle);
window.addEventListener('hashchange', handle);
