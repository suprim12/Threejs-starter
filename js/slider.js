function _getClosest(item, array, getDiff) {
  var closest, diff;

  if (!Array.isArray(array)) {
    throw new Error("Get closest expects an array as second argument");
  }

  array.forEach(function (comparedItem, comparedItemIndex) {
    var thisDiff = getDiff(comparedItem, item);

    if (thisDiff >= 0 && (typeof diff == "undefined" || thisDiff < diff)) {
      diff = thisDiff;
      closest = comparedItemIndex;
    }
  });

  return closest;
}

function number(item, array) {
  return _getClosest(item, array, function (comparedItem, item) {
    return Math.abs(comparedItem - item);
  });
}

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function isMobileDevice() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  );
}
let isMobile = isMobileDevice();

class PortFolioSlider {
  constructor() {
    this.bindAll();
    this.slideEl = document.querySelector(".su-slider");
    this.sliderWrapperEl = document.querySelector(".su-slider--wrapper");
    this.slides = document.querySelectorAll(".su-slider--slide");
    this.prevEl = document.querySelector(".su-slider--nav-prev");
    this.nextEl = document.querySelector(".su-slider--nav-next");
    this.dots = document.querySelectorAll(".su-slider--dot");

    this.totalslides = this.slides.length;

    this.progress = 0;
    this.sliderWidth = 0;
    this.slideWidth = this.slides[0].getBoundingClientRect().width;
    this.ww = window.innerWidth;
    this.wh = window.innerHeight;

    this.spaceBetween = 50;

    this.centerX = this.ww / 2;
    this.currentX =
      this.centerX -
      (this.slides[0].getBoundingClientRect().x +
        this.slides[0].getBoundingClientRect().width / 2);
    this.lastX = 0;

    this.active = 0;

    this.rAF = undefined;

    this.max = 0;
    this.min = 0;
    this.on = {
      x: 0,
      y: 0,
    };
    this.off = 0;
    this.opts = {
      speed: 1.5,
      ease: 0.1,
    };

    this.dragging = false;
    this.scrolling = false;

    this.events = {
      move: isMobile ? "touchmove" : "mousemove",
      up: isMobile ? "touchend" : "mouseup",
      down: isMobile ? "touchstart" : "mousedown",
    };

    this.setBounds();
    this.init();
    this.observer();
  }

  bindAll() {
    [
      "run",
      "onMove",
      "onDown",
      "onUp",
      "resize",
      "snap",
      "onNext",
      "onPrev",
      "onScroll",
      "onKeyPress",
      "onPag",
      "onLeave",
    ].forEach((fn) => (this[fn] = this[fn].bind(this)));
  }

  setBounds() {
    this.sliderWidth =
      (this.slides[this.active].getBoundingClientRect().width +
        this.spaceBetween) *
      this.totalslides;

    this.max = -(
      this.sliderWidth -
      window.innerWidth +
      this.currentX -
      this.spaceBetween
    );
    this.min = this.currentX;
    this.sliderWrapperEl.style.transform = `translate3d(${this.currentX}px,0,0)`;
  }

  init() {
    this.run();
    this.addEvents();
  }

  addEvents() {
    const { move, up, down } = this.events;
    this.slideEl.addEventListener(move, this.onMove);
    this.slideEl.addEventListener(up, this.onUp, false);
    this.slideEl.addEventListener(down, this.onDown, false);
    this.slideEl.addEventListener("mousewheel", this.onScroll);
    window.addEventListener("keydown", this.onKeyPress);

    this.slideEl.addEventListener("mouseleave", this.onLeave);
    this.nextEl.addEventListener("click", this.onNext);
    this.prevEl.addEventListener("click", this.onPrev);

    this.dots.forEach((dot) => {
      dot.addEventListener("click", this.onPag);
    });

    window.addEventListener("resize", this.resize, false);
  }
  onPag(e) {
    this.dots.forEach((dot) => dot.classList.remove("active"));
    const target = parseInt(e.target.dataset.target);
    e.target.classList.add("active");

    this.active = target;
    const bounds = this.slides[this.active].getBoundingClientRect();
    const fromCenter = this.centerX - (bounds.x + bounds.width / 2);
    this.currentX = this.currentX + fromCenter;
    this.off = this.currentX;
    this.clamp();
  }
  onScroll(e) {
    // METHOD 1

    // if (e.deltaY > 0) {
    //   this.active =
    //     this.active >= this.totalslides - 1 ? this.active : (this.active += 1);
    // } else {
    //   this.active = this.active <= 0 ? this.active : (this.active -= 1);
    // }
    // const bounds = this.slides[this.active].getBoundingClientRect();
    // const fromCenter = this.centerX - (bounds.x + bounds.width / 2);
    // this.currentX = this.currentX + fromCenter;
    // this.off = this.currentX;

    // METHOD 2
    this.currentX -= e.deltaY;
    this.off = this.currentX;

    const numbers = [];
    this.slides.forEach((slide, index) => {
      const bounds = slide.getBoundingClientRect();
      const diff = this.currentX - this.lastX;
      const center = bounds.x + diff + bounds.width / 2;
      const fromCenter = this.centerX - center;
      numbers.push(fromCenter);
    });
    let closest = number(0, numbers);
    this.active = closest;

    this.clamp();
    // this.snap();
    e.preventDefault();
  }
  onNext() {
    if (this.active >= this.totalslides - 1) return;
    this.active = this.active + 1;
    const bounds = this.slides[this.active].getBoundingClientRect();
    const fromCenter = this.centerX - (bounds.x + bounds.width / 2);
    this.currentX = this.currentX + fromCenter;
    this.off = this.currentX;
    this.clamp();
  }
  onPrev() {
    if (this.active === 0) return;
    this.active = this.active - 1;
    const bounds = this.slides[this.active].getBoundingClientRect();
    const fromCenter = this.centerX - (bounds.x + bounds.width / 2);
    this.currentX = this.currentX + fromCenter;
    this.off = this.currentX;
    this.clamp();
  }
  onKeyPress(e) {
    if (e.keyCode === 39) {
      this.onNext();
    }
    if (e.keyCode === 37) {
      this.onPrev();
    }
  }

  resize() {
    this.setBounds();
  }

  removeEvents() {
    const { move, up, down } = this.events;
    this.cancelAnimationFrame(this.rAF);

    this.slideEl.addEventListener(move, this.onMove, { passive: true });
    this.slideEl.addEventListener(up, this.onUp, false);
    this.slideEl.addEventListener(down, this.onDown, false);
  }

  observer() {
    let check_slide_intersection = (entries, observer) => {
      for (entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active-slide");
          entry.target.classList.remove("inactive-slide");
        } else {
          entry.target.classList.remove("active-slide");
          entry.target.classList.add("inactive-slide");
        }
      }
    };

    let observer = new IntersectionObserver(check_slide_intersection, {
      root: document.body.querySelector(".su-slider"),
      rootMargin: "50px",
      threshold: 1.0,
    });

    this.slides.forEach(function (slide) {
      observer.observe(slide);
    });
  }
  onMove(e) {
    if (!this.dragging) return;
    const { x, y } = this.getPos(e);
    const moveX = x - this.on.x;
    const moveY = y - this.on.y;
    if (Math.abs(moveX) > Math.abs(moveY) && e.cancelable) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.currentX = this.off + moveX * this.opts.speed;
    this.clamp();
  }

  onDown(e) {
    this.dragging = true;
    this.on.x = e.clientX;
    this.slideEl.classList.add("is-grabbing");
  }

  onUp() {
    this.dragging = false;
    this.snap();
    this.off = this.currentX;
    this.slideEl.classList.remove("is-grabbing");

    const numbers = [];
    this.slides.forEach((slide, index) => {
      const bounds = slide.getBoundingClientRect();
      const diff = this.currentX - this.lastX;
      const center = bounds.x + diff + bounds.width / 2;
      const fromCenter = this.centerX - center;
      numbers.push(fromCenter);
    });
    let closest = number(0, numbers);
    this.active = closest;
  }

  onLeave() {
    this.dragging = false;
    this.snap();
  }

  getPos({ changedTouches, clientX, clientY, target }) {
    const x = changedTouches ? changedTouches[0].clientX : clientX;
    const y = changedTouches ? changedTouches[0].clientY : clientY;
    return {
      x,
      y,
      target,
    };
  }

  run() {
    this.dots.forEach((dot) => dot.classList.remove("active"));
    this.dots[this.active].classList.add("active");

    this.lastX = lerp(this.lastX, this.currentX, this.opts.ease);
    this.lastX = Math.floor(this.lastX * 100) / 100;
    this.sliderWrapperEl.style.transform = `translate3d(${this.lastX}px,0,0)`;
    this.requestAnimationFrame();
  }

  requestAnimationFrame() {
    this.rAF = requestAnimationFrame(this.run);
  }
  cancelAnimationFrame() {
    cancelAnimationFrame(this.rAF);
  }
  closest() {
    const numbers = [];
    this.slides.forEach((slide, index) => {
      const bounds = slide.getBoundingClientRect();
      const diff = this.currentX - this.lastX;
      const center = bounds.x + diff + bounds.width / 2;
      const fromCenter = this.centerX - center;
      numbers.push(fromCenter);
    });
    let closest = number(0, numbers);
    closest = numbers[closest];

    return {
      closest,
    };
  }
  snap() {
    const { closest } = this.closest();
    this.currentX = this.currentX + closest;
    this.off = this.currentX;
    this.clamp();
  }
  clamp() {
    this.currentX = Math.max(Math.min(this.currentX, this.min), this.max);
  }
}

new PortFolioSlider();
