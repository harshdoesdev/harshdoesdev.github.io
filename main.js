function handle {

  document.querySelector('a.active').classList.remove('active');

  document.querySelector('[href=' + window.location.hash + ']').classList.add('active');

};

window.addEventListener('load', handle);
window.addEventListener('hashchange', handle);
