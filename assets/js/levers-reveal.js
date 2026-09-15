/* Levers enter one at a time when the row scrolls into view.
   Skipped for reduced motion or browsers without IntersectionObserver,
   in which case the levers are simply visible. */
(function(){
  var row = document.querySelector(".levers");
  if(!row || !("IntersectionObserver" in window)) return;
  if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.documentElement.classList.add("js");
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ row.classList.add("is-in"); io.disconnect(); } });
  }, {threshold:.3, rootMargin:"0px 0px -8% 0px"});
  io.observe(row);
})();
