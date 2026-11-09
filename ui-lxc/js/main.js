/* Agent 视界 · 翻页交互 */
(function () {
  var deck = document.getElementById('deck');
  var screens = Array.prototype.slice.call(deck.querySelectorAll('.screen'));
  var indicator = document.getElementById('indicator');
  var total = screens.length;
  var current = 0;
  var locked = false;

  /* 根据屏数生成指示器 */
  var dots = screens.map(function (_, i) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.dataset.index = i;
    dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 页');
    dot.addEventListener('click', function () { goTo(i); });
    indicator.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    if (index < 0 || index >= total || index === current || locked) return;
    locked = true;
    current = index;
    render();
    setTimeout(function () { locked = false; }, 950);
  }

  function render() {
    deck.style.transform = 'translateY(' + (-current * 100) + '%)';
    screens.forEach(function (screen, i) {
      screen.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
    runCounters(screens[current]);
  }

  /* 数字滚动:进入对应屏时从零计到目标值 */
  function runCounters(screen) {
    var counters = screen.querySelectorAll('.count');
    Array.prototype.forEach.call(counters, function (el) {
      var target = parseFloat(el.dataset.target);
      var decimals = parseInt(el.dataset.decimal || '0', 10);
      var prefix = el.dataset.prefix || '';
      var suffix = el.dataset.suffix || '';
      var start = Date.now() + 400;
      var duration = 1400;

      el.textContent = prefix + (0).toFixed(decimals) + suffix;

      var timer = setInterval(function () {
        var t = Math.min(Math.max((Date.now() - start) / duration, 0), 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (t >= 1) clearInterval(timer);
      }, 16);
    });
  }

  /* 触摸滑动 */
  var touchStartY = 0;
  var touchStartX = 0;

  document.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var dy = e.changedTouches[0].clientY - touchStartY;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dy) < 48 || Math.abs(dy) < Math.abs(dx)) return;
    goTo(dy < 0 ? current + 1 : current - 1);
  }, { passive: true });

  /* 鼠标滚轮 */
  var wheelAcc = 0;
  var wheelTimer = null;

  document.addEventListener('wheel', function (e) {
    if (locked) return;
    wheelAcc += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { wheelAcc = 0; }, 220);
    if (Math.abs(wheelAcc) > 60) {
      goTo(wheelAcc > 0 ? current + 1 : current - 1);
      wheelAcc = 0;
    }
  }, { passive: true });

  /* 键盘 */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    }
  });

  /* 阻止弹性滚动穿透 */
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  /* CTA 点击反馈 */
  var cta = document.querySelector('.cta-button');
  cta.addEventListener('click', function () {
    cta.textContent = '已预约 · 等待确认';
    cta.style.pointerEvents = 'none';
  });

  /* 支持 #s3 形式的锚点直达对应屏 */
  function readHash() {
    var match = /^#s(\d+)$/.exec(location.hash);
    return match ? Math.min(Number(match[1]) - 1, total - 1) : 0;
  }

  window.addEventListener('hashchange', function () {
    goTo(readHash());
  });

  current = readHash();
  render();
})();
