(function(){
  "use strict";

  var announce = document.getElementById('sr-announce');
  function say(msg){ announce.textContent = msg; }

  /* ---- date ---- */
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  /* ---- balance mask/unmask (only ever renders masked or the balance figure —
     full account numbers are never placed in the DOM at all, see markup) ---- */
  document.querySelectorAll('[data-toggle-balance]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.acct-card');
      var amt = card.querySelector('.bal');
      var hidden = btn.getAttribute('aria-pressed') === 'true';
      if (hidden){
        amt.textContent = amt.dataset.real;
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Show','Hide'));
        say('Balance shown');
      } else {
        amt.textContent = amt.dataset.masked;
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace('Hide','Show'));
        say('Balance hidden');
      }
    });
  });

  /* ---- animate bars + rings on load ---- */
  window.addEventListener('load', function(){
    requestAnimationFrame(function(){
      document.querySelectorAll('#bars .fill').forEach(function(el){
        el.style.height = el.dataset.h;
      });
      var r1 = document.getElementById('ring-1'); // 100%
      var r2 = document.getElementById('ring-2'); // 100%
      var r3 = document.getElementById('ring-3'); // 82%
      r1.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.9,.2,1)';
      r2.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.9,.2,1) .12s';
      r3.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.2,.9,.2,1) .24s';
      r1.style.strokeDashoffset = 0;
      r2.style.strokeDashoffset = 0;
      r3.style.strokeDashoffset = (263.9 * (1 - 0.82));
    });
  });

  /* ---- transaction filter ---- */
  var filterBtns = document.querySelectorAll('.tx-filters button');
  var rows = document.querySelectorAll('#tx-body tr');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      var f = btn.dataset.filter;
      var shown = 0;
      rows.forEach(function(r){
        var show = (f === 'all' || r.dataset.type === f);
        r.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      say(shown + ' transactions shown');
    });
  });

  /* ---- idle session timeout, debounced reset ---- */
  var SESSION_SECONDS = 300;
  var remaining = SESSION_SECONDS;
  var timerEl = document.getElementById('session-timer');
  var resetDebounce = null;
  var warned = false;

  function render(){
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;
    timerEl.textContent = (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
  }
  render();

  function tick(){
    remaining--;
    if (remaining <= 0){
      remaining = 0;
      render();
      say('Session expired due to inactivity. Please sign in again.');
      clearInterval(intervalId);
      return;
    }
    if (remaining === 30 && !warned){
      warned = true;
      say('Your session will expire in 30 seconds due to inactivity.');
    }
    render();
  }
  var intervalId = setInterval(tick, 1000);

  function resetSession(){
    remaining = SESSION_SECONDS;
    warned = false;
    render();
  }

  ['mousemove','keydown','click','touchstart'].forEach(function(evt){
    document.addEventListener(evt, function(){
      clearTimeout(resetDebounce);
      resetDebounce = setTimeout(resetSession, 200);
    }, { passive:true });
  });

  /* ---- nav switching (visual only, single-page demo) ---- */
  document.querySelectorAll('.nav-item').forEach(function(item){
    item.addEventListener('click', function(){
      document.querySelectorAll('.nav-item').forEach(function(n){ n.removeAttribute('aria-current'); });
      item.setAttribute('aria-current', 'page');
    });
  });

})();