function handle() {

  var currHash = window.location.hash;
  
  if(currHash) {
    
     document.querySelector('a.active').classList.remove('active');

     document.querySelector('[href="' + currHash + '"]').classList.add('active');
    
  }

};

window.addEventListener('load', handle);
window.addEventListener('hashchange', handle);

const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {

  const sy = window.scrollY;
    
  sections.forEach(section => {

    const y = section.offsetTop;
      
    if(sy >= y && sy <= y + section.offsetHeight - 100) {

      document.querySelector('a.active').classList.remove('active');

      document.querySelector('[href="#' + section.id + '"]').classList.add('active');

   }
  
  });

});
