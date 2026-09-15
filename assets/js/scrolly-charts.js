/* ============================================================
   SCROLLYTELLING CHARTS — Figures E1 and E2

   Data below was traced from the report's figure exports
   (e1 at 1-year steps, e2 as whole-number counts). Before the
   Statamic/AWS handoff, swap in the values from CCL's source
   files; nothing else needs to change.

   Each .scrolly block pairs one chart with its .step cards.
   A step becomes active when its top crosses the trigger line
   (55% of the viewport on desktop, 78% under 900px), and the
   chart moves to that step's data-state.
   ============================================================ */
(function(){
  "use strict";

  var DATA = {
    e1: {
      start: 2010,
      ref: [0.98,1,1.02,1.03,1.07,1.09,1.12,1.14,1.17,1.19,1.22,1.24,1.28,1.31,1.33,1.36,1.39,1.41,1.43,1.45,1.46,1.48,1.5,1.53,1.55,1.58,1.61,1.65,1.67,1.7,1.72,1.73,1.75,1.77,1.8,1.83,1.86,1.89,1.92,1.95,1.98,2.01,2.03,2.04,2.05,2.08,2.11,2.14,2.16,2.19,2.21,2.22,2.23,2.25,2.27,2.3,2.31,2.33,2.37,2.39,2.41,2.43,2.44,2.46,2.48,2.5,2.51,2.52,2.54,2.56,2.59,2.6,2.6,2.64,2.65,2.68,2.67,2.68,2.71,2.73,2.75,2.76,2.77,2.79,2.8,2.81,2.83,2.84,2.83,2.85,2.85],
      co2: [0.98,1,1.02,1.03,1.07,1.09,1.12,1.14,1.17,1.19,1.22,1.25,1.3,1.34,1.37,1.41,1.44,1.46,1.5,1.53,1.56,1.59,1.63,1.66,1.69,1.73,1.76,1.79,1.82,1.85,1.86,1.88,1.9,1.92,1.94,1.98,2,2.01,2.04,2.07,2.07,2.1,2.11,2.12,2.13,2.14,2.17,2.19,2.2,2.21,2.22,2.23,2.23,2.24,2.24,2.25,2.25,2.27,2.28,2.32,2.31,2.31,2.31,2.31,2.33,2.34,2.33,2.34,2.33,2.33,2.35,2.35,2.35,2.36,2.37,2.37,2.36,2.37,2.37,2.38,2.4,2.39,2.38,2.39,2.4,2.41,2.4,2.41,2.39,2.39,2.4],
      sp:  [0.98,1,1.02,1.03,1.07,1.09,1.12,1.14,1.17,1.19,1.22,1.25,1.29,1.32,1.35,1.39,1.41,1.43,1.46,1.49,1.52,1.53,1.57,1.58,1.61,1.64,1.66,1.69,1.71,1.73,1.73,1.74,1.75,1.77,1.78,1.81,1.82,1.83,1.85,1.88,1.87,1.89,1.89,1.89,1.9,1.91,1.93,1.93,1.94,1.95,1.95,1.95,1.95,1.95,1.95,1.96,1.95,1.97,1.97,1.99,1.99,1.99,1.98,1.98,1.99,2.01,1.98,1.97,1.97,1.97,1.98,1.97,1.98,1.99,1.98,1.97,1.96,1.96,1.97,1.97,1.98,1.97,1.96,1.98,1.99,1.97,1.97,1.97,1.96,1.95,1.95]
    },
    e2: {
      gases: ["bc","fg","ch4","n2o","o3"],
      /* per level: black carbon, F-gases, methane, nitrous oxide, tropospheric ozone */
      counts: [[1,1,10,0,1],[1,1,10,1,0],[9,2,8,6,3],[4,7,11,6,0],[19,22,15,11,9],[17,1,6,7,15]],
      names: [["Concept &","Research"],["Proof of","Concept"],["Demonstration","& Early","Deployment"],["Early","Adoption"],["Scaling &","Commercialization"],["Optimization &","System","Integration"]]
    }
  };

  var NS = "http://www.w3.org/2000/svg";
  var motionOK = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var uid = 0;

  function svgEl(name, attrs, parent){
    var n = document.createElementNS(NS, name);
    for(var k in attrs){ if(attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]); }
    if(parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, str, attrs){
    var a = attrs || {}; a.x = x; a.y = y;
    var t = svgEl("text", a, parent); t.textContent = str; return t;
  }
  /* Axis titles as set in the report: caps, gray. Rotated on wide
     charts; run along the top on narrow ones where height is short. */
  function axisTitle(parent, label, narrow, m, ph){
    var str = label.toUpperCase();
    if(narrow) return txt(parent, 0, 11, str, {"class":"axt"});
    return txt(parent, 0, 0, str, {"class":"axt", "text-anchor":"middle", transform:"translate(13," + (m.t + ph / 2) + ") rotate(-90)"});
  }
  function ease(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }

  /* ---------------- Figure E1 · line chart ---------------- */
  function LineChart(body, keyItems){
    this.body = body; this.keys = keyItems; this.state = 0;
    this.prog = {ref:0, co2:0, sp:0};
    this.id = "e1c" + (++uid);
    this.anim = null;
    this.render();
  }
  LineChart.prototype.vis = {
    ref: [0, 1, 1, .32, .55],
    co2: [0, 0, 1, .32, .55],
    sp:  [0, 0, 0, 1, 1]
  };
  LineChart.prototype.render = function(){
    var D = DATA.e1, self = this;
    var W = this.body.clientWidth, H = this.body.clientHeight;
    if(W < 10 || H < 10) return;
    var narrow = W < 620;
    var m = {t:narrow ? 26 : 8, r:narrow ? 74 : 158, b:26, l:narrow ? 38 : 70};
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var y0 = .9, y1 = 3, n = D.ref.length;
    function x(i){ return m.l + i / (n - 1) * pw; }
    function y(v){ return m.t + (y1 - v) / (y1 - y0) * ph; }
    this.pw = pw;

    this.body.querySelectorAll("svg").forEach(function(s){ s.remove(); });
    var svg = svgEl("svg", {width:W, height:H, viewBox:"0 0 "+W+" "+H, "aria-hidden":"true", focusable:"false"});
    var defs = svgEl("defs", {}, svg);

    var grid = svgEl("g", {"class":"grid"}, svg);
    [1, 1.5, 2, 2.5, 3].forEach(function(v){
      svgEl("line", {x1:m.l, x2:m.l+pw, y1:y(v), y2:y(v)}, grid);
      txt(grid, m.l - 8, y(v) + 4, v.toFixed(2), {"text-anchor":"end"});
    });
    svgEl("line", {"class":"base", x1:m.l, x2:m.l+pw, y1:m.t+ph, y2:m.t+ph}, grid);
    axisTitle(grid, "Temperature change (in degrees C vs 1850-1900)", narrow, m, ph);
    for(var yr = 2010; yr <= 2100; yr += narrow ? 20 : 10){
      var xi = x(yr - D.start);
      svgEl("line", {x1:xi, x2:xi, y1:m.t+ph, y2:m.t+ph+4}, grid);
      txt(grid, xi, m.t + ph + 19, String(yr), {"text-anchor": yr === 2010 ? "start" : (yr === 2100 ? "end" : "middle")});
    }

    var styles = {
      ref: {c:"var(--c-ref)", w:2, dash:"6 4"},
      co2: {c:"var(--c-co2)", w:2, dash:"6 4"},
      sp:  {c:"var(--c-sp)",  w:3, dash:null}
    };
    this.g = {}; this.clip = {};
    ["ref","co2","sp"].forEach(function(k){
      var cp = svgEl("clipPath", {id:self.id + k}, defs);
      self.clip[k] = svgEl("rect", {x:m.l - 6, y:0, height:H, width:0}, cp);
      var g = svgEl("g", {"class":"series", "clip-path":"url(#"+self.id+k+")"}, svg);
      g.style.opacity = self.vis[k][self.state];
      var d = D[k].map(function(v, i){ return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); }).join("");
      svgEl("path", {d:d, fill:"none", stroke:styles[k].c, "stroke-width":styles[k].w, "stroke-dasharray":styles[k].dash, "stroke-linejoin":"round"}, g);
      svgEl("circle", {cx:x(n-1), cy:y(D[k][n-1]), r:3.5, fill:styles[k].c}, g);
      self.g[k] = g;
      self.setClip(k);
    });

    /* annotation: where the CO2-only line drops below the reference */
    var ci = -1;
    for(var i = 30; i < n - 1; i++){ if(D.co2[i] > D.ref[i] && D.co2[i+1] <= D.ref[i+1]){ ci = i; break; } }
    this.crossG = svgEl("g", {"class":"anno"}, svg);
    if(ci > -1){
      var a = D.co2[ci] - D.ref[ci], b = D.co2[ci+1] - D.ref[ci+1], f = a / (a - b);
      var cx = x(ci + f), cy = y(D.ref[ci] + (D.ref[ci+1] - D.ref[ci]) * f);
      svgEl("circle", {cx:cx, cy:cy, r:7, fill:"none", stroke:"var(--ink)", "stroke-width":1.25}, this.crossG);
      if(narrow){
        svgEl("line", {x1:cx + 5, y1:cy + 5, x2:cx + 12, y2:cy + 14, stroke:"var(--ink)", "stroke-width":1}, this.crossG);
        txt(this.crossG, cx + 4, cy + 28, "Cross ~2060", {"text-anchor":"start", "class":"halo", "font-size":11});
      } else {
        svgEl("line", {x1:cx - 5, y1:cy - 5, x2:cx - 16, y2:cy - 16, stroke:"var(--ink)", "stroke-width":1}, this.crossG);
        txt(this.crossG, cx - 20, cy - 20, "Lines cross around 2060", {"text-anchor":"end", "class":"halo"});
      }
    }

    /* annotation: the 0.9 C gap at 2100, split at the CO2-only line */
    this.gapG = svgEl("g", {"class":"anno"}, svg);
    var bx = m.l + pw + 12, yr1 = y(D.ref[n-1]), yc = y(D.co2[n-1]), ys = y(D.sp[n-1]);
    svgEl("path", {d:"M"+(bx-5)+" "+yr1+"H"+bx+"V"+ys+"H"+(bx-5)+"M"+(bx-5)+" "+yc+"H"+(bx+4), fill:"none", stroke:"var(--ink)", "stroke-width":1.25}, this.gapG);
    var lx = bx + 10, fs = narrow ? 11 : 12;
    function pair(cyMid, a, b){
      var t = txt(self.gapG, lx, cyMid - 2, a, {"font-size":fs});
      var s = txt(self.gapG, lx, cyMid + fs + 1, b, {"font-size":fs - 1});
      s.style.fill = "var(--ink-2)"; s.style.fontWeight = 500;
    }
    if(narrow){ pair((yr1 + yc)/2, "CO\u2082", "~half"); pair((yc + ys)/2, "Super-", "pollutants"); }
    else { pair((yr1 + yc)/2, "CO\u2082 cuts", "about half"); pair((yc + ys)/2, "Superpollutant cuts", "about half"); }

    this.body.insertBefore(svg, this.body.firstChild);
    this.paintAnno();
  };
  LineChart.prototype.setClip = function(k){
    if(this.clip[k]) this.clip[k].setAttribute("width", Math.max(0, (this.pw + 18) * this.prog[k]));
  };
  LineChart.prototype.paintAnno = function(){
    if(this.crossG) this.crossG.style.opacity = this.state === 2 ? 1 : 0;
    if(this.gapG) this.gapG.style.opacity = this.state === 4 ? 1 : 0;
    var s = this.state;
    this.keys.forEach(function(li){
      var k = li.getAttribute("data-key");
      li.classList.toggle("is-on", (k === "ref" && s >= 1) || (k === "co2" && s >= 2) || (k === "sp" && s >= 3));
    });
  };
  LineChart.prototype.setState = function(s){
    if(s === this.state) return;
    this.state = s;
    var self = this, grow = [];
    ["ref","co2","sp"].forEach(function(k){
      var o = self.vis[k][s];
      if(self.g[k]) self.g[k].style.opacity = o;
      if(o > 0 && self.prog[k] < 1) grow.push(k);
      if(o === 0 && self.prog[k] > 0){
        setTimeout(function(){ if(self.vis[k][self.state] === 0){ self.prog[k] = 0; self.setClip(k); } }, 520);
      }
    });
    this.paintAnno();
    if(!grow.length) return;
    if(!motionOK){ grow.forEach(function(k){ self.prog[k] = 1; self.setClip(k); }); return; }
    var from = {}, t0 = null, dur = 1500;
    grow.forEach(function(k){ from[k] = self.prog[k]; });
    if(this.anim) cancelAnimationFrame(this.anim);
    function step(ts){
      if(t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = ease(p);
      grow.forEach(function(k){
        if(self.vis[k][self.state] > 0){ self.prog[k] = from[k] + (1 - from[k]) * e; self.setClip(k); }
      });
      if(p < 1) self.anim = requestAnimationFrame(step); else self.anim = null;
    }
    this.anim = requestAnimationFrame(step);
  };

  /* ---------------- Figure E2 · stacked bars ---------------- */
  function BarChart(body, keyItems){
    this.body = body; this.keys = keyItems; this.state = 0;
    this.render();
  }
  BarChart.prototype.render = function(){
    var D = DATA.e2, self = this;
    var W = this.body.clientWidth, H = this.body.clientHeight;
    if(W < 10 || H < 10) return;
    var bw = (W - 32 - 6) / 6, narrow = bw < 84;
    var m = {t:narrow ? 34 : 22, r:6, b:narrow ? 44 : 92, l:narrow ? 32 : 56}, yMax = 90;
    var pw = W - m.l - m.r, ph = H - m.t - m.b, band = pw / 6, barW = band * (narrow ? .6 : .52);
    function y(v){ return Math.round(m.t + ph - v / yMax * ph); }
    function bx(i){ return m.l + band * i + (band - barW) / 2; }

    this.body.querySelectorAll("svg").forEach(function(s){ s.remove(); });
    var svg = svgEl("svg", {width:W, height:H, viewBox:"0 0 "+W+" "+H, "aria-hidden":"true", focusable:"false"});
    var grid = svgEl("g", {"class":"grid"}, svg);
    [0, 20, 40, 60, 80].forEach(function(v){
      svgEl("line", {"class": v === 0 ? "base" : null, x1:m.l, x2:m.l+pw, y1:y(v), y2:y(v)}, grid);
      txt(grid, m.l - 8, y(v) + 4, String(v), {"text-anchor":"end"});
    });
    axisTitle(grid, "Number of mitigation measures", narrow, m, ph);
    txt(grid, m.l + pw / 2, H - 4, "MATURITY LEVEL", {"class":"axt", "text-anchor":"middle"});

    this.bars = []; this.segs = [];
    D.counts.forEach(function(row, i){
      var g = svgEl("g", {"class":"bar"}, svg), acc = 0, cx = bx(i) + barW / 2;
      row.forEach(function(v, j){
        if(!v) return;
        var top = y(acc + v), r = svgEl("rect", {x:bx(i).toFixed(1), y:top, width:barW.toFixed(1), height:Math.max(0, y(acc) - top + (acc ? .5 : 0)), "class":"seg", "shape-rendering":"crispEdges"}, g);
        r.setAttribute("data-gas", D.gases[j]);
        self.segs.push(r); acc += v;
      });
      txt(g, cx, y(acc) - 7, String(acc), {"text-anchor":"middle", "class":"total"});
      var lab = svgEl("g", {}, svg);
      var t = txt(lab, cx, m.t + ph + 17, String(i + 1), {"text-anchor":"middle"});
      t.style.fill = "var(--ink-2)";
      if(!narrow){
        D.names[i].forEach(function(line, k){
          var s = txt(lab, cx, m.t + ph + 32 + k * 13, line, {"text-anchor":"middle", "font-size":10.5});
        });
      }
      self.bars.push({g:g, lab:lab, total:acc});
    });

    /* brackets over the mature and still-maturing groups */
    function bracket(from, to, label){
      var g = svgEl("g", {"class":"anno"}, svg);
      var top = 0; for(var i = from; i <= to; i++) top = Math.max(top, self.bars[i].total);
      var by = y(top) - 26, x1 = bx(from), x2 = bx(to) + barW;
      svgEl("path", {d:"M"+x1+" "+(by+6)+"V"+by+"H"+x2+"V"+(by+6), fill:"none", stroke:"var(--ink)", "stroke-width":1.25}, g);
      txt(g, (x1 + x2) / 2, by - 8, label, {"text-anchor":"middle", "class":"halo"});
      return g;
    }
    this.matureG = bracket(4, 5, narrow ? "60%" : "60% mature, ready to scale");
    this.earlyG  = bracket(0, 3, narrow ? "40% maturing" : "40% still maturing");

    this.body.insertBefore(svg, this.body.firstChild);
    this.paint(false);
  };
  BarChart.prototype.paint = function(animate){
    var s = this.state, self = this;
    this.bars.forEach(function(b, i){
      if(!animate) b.g.style.transition = "none";
      b.g.style.transform = s >= 1 ? "scaleY(1)" : "scaleY(0)";
      var dim = (s === 3 && i < 4) || (s === 4 && i >= 4);
      b.g.style.opacity = dim ? .22 : 1;
      b.lab.style.opacity = dim ? .45 : 1;
      if(!animate){ b.g.getBoundingClientRect(); b.g.style.transition = ""; }
    });
    this.segs.forEach(function(r){
      r.style.fill = s >= 2 ? "var(--c-" + r.getAttribute("data-gas") + ")" : "var(--c-mute)";
    });
    this.matureG.style.opacity = s === 3 ? 1 : 0;
    this.earlyG.style.opacity  = s === 4 ? 1 : 0;
    this.keys.forEach(function(li){ li.classList.toggle("is-on", s >= 2); });
  };
  BarChart.prototype.setState = function(s){
    if(s === this.state) return;
    this.state = s; this.paint(motionOK);
  };

  /* ---------------- scroll controller ---------------- */
  var blocks = [];
  Array.prototype.forEach.call(document.querySelectorAll(".scrolly"), function(el){
    var body = el.querySelector(".chart-body");
    var keys = Array.prototype.slice.call(el.querySelectorAll(".chart-key li"));
    var Chart = el.getAttribute("data-chart") === "e1" ? LineChart : BarChart;
    blocks.push({
      el: el,
      steps: Array.prototype.slice.call(el.querySelectorAll(".step")),
      chart: new Chart(body, keys)
    });
  });
  if(!blocks.length) return;

  var ticking = false;
  function update(){
    ticking = false;
    var vh = window.innerHeight, narrow = window.innerWidth <= 900;
    var trigger = vh * (narrow ? .78 : .55);
    blocks.forEach(function(b){
      var r = b.el.getBoundingClientRect();
      if(r.bottom < -vh || r.top > vh * 2) return;
      var active = -1;
      b.steps.forEach(function(st, i){ if(st.getBoundingClientRect().top <= trigger) active = i; });
      var state = active > -1 ? +b.steps[active].getAttribute("data-state") : (r.top < vh * .85 ? 1 : 0);
      b.steps.forEach(function(st, i){ st.classList.toggle("is-active", i === Math.max(active, 0)); });
      b.chart.setState(state);
    });
  }
  function queue(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", queue, {passive:true});

  var rt = null;
  window.addEventListener("resize", function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ blocks.forEach(function(b){ b.chart.render(); }); queue(); }, 140);
  });
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(function(){ blocks.forEach(function(b){ b.chart.render(); }); }); }
  update();
})();
