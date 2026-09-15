(function(){
  "use strict";

  /* Sticky bar, scroll progress, section accent, current-section state.
     The scrollytelling charts live in scrolly-charts.js and the lever
     reveal in levers-reveal.js. */
  var bar = document.getElementById("topbar");
  var prog = document.getElementById("progress");
  var sections = Array.prototype.slice.call(document.querySelectorAll(".chapter"));
  var navById = {};
  Array.prototype.forEach.call(document.querySelectorAll(".navlinks a[href^='#']"), function(a){
    navById[a.getAttribute("href").slice(1)] = a;
  });
  var ticking = false;

  function onScroll(){
    var y = window.scrollY || window.pageYOffset;
    bar.classList.toggle("is-shown", y > window.innerHeight * 0.72);
    var doc = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (doc > 0 ? Math.min(100, (y / doc) * 100) : 0) + "%";

    var mid = y + window.innerHeight * 0.4, accent = null, activeId = null;
    for(var i=0;i<sections.length;i++){
      var c = sections[i], top = c.offsetTop;
      if(mid >= top && mid < top + c.offsetHeight){
        accent = getComputedStyle(c).getPropertyValue("--accent");
        if(c.id) activeId = c.id;
      }
    }
    bar.style.setProperty("--accent", accent && accent.trim() ? accent : "var(--green)");
    for(var id in navById){
      var on = (id === activeId);
      navById[id].classList.toggle("is-current", on);
      if(on) navById[id].setAttribute("aria-current","true");
      else navById[id].removeAttribute("aria-current");
    }
    ticking = false;
  }

  window.addEventListener("scroll", function(){
    if(!ticking){ ticking = true; window.requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();
})();
