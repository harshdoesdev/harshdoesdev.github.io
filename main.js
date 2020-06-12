const sections = document.querySelectorAll('section');

const header = document.querySelector('header');

const handle = () => {

  const currHash = window.location.hash;
  
  if(currHash) {
    
     document.querySelector('a.active').classList.remove('active');

     document.querySelector('[href="' + currHash + '"]').classList.add('active');
    
  }

};

window.addEventListener('load', handle);
window.addEventListener('hashchange', handle);

window.addEventListener('scroll', () => {

  const sy = header.offsetTop + header.offsetHeight;
    
  sections.forEach(section => {

    const y = section.offsetTop;
      
    if(sy >= y && sy <= y + section.offsetHeight) {

      document.querySelector('a.active').classList.remove('active');

      document.querySelector('[href="#' + section.id + '"]').classList.add('active');
      
      window.location.hash = '#' + section.id;

   }
  
  });

});
