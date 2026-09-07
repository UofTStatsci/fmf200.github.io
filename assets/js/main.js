/* ==================================================
   FMF200
   Interactive Mathematical Finance Hero
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     MOBILE NAVIGATION
     ================================================== */

  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {

    navToggle.addEventListener("click", () => {

      const isOpen = mainNav.classList.toggle("is-open");

      navToggle.classList.toggle("is-open", isOpen);

      navToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );

    });

  }


  /* ==================================================
     ACTIVE NAVIGATION
     ================================================== */

  const currentFile =
    location.pathname.split("/").pop() || "index.html";

  document
    .querySelectorAll(".main-nav a[data-page]")
    .forEach((link) => {

      if (link.dataset.page === currentFile) {
        link.classList.add("active");
      }

    });


  /* ==================================================
     FINANCE HERO CANVAS
     ================================================== */

  const canvas = document.getElementById("finance-canvas");

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");

  const hero = canvas.closest(".hero");

  if (!ctx || !hero) {
    return;
  }


  /* ==================================================
     SETTINGS
     ================================================== */

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let animationFrame = null;

  let time = 0;

  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false
  };


  /* ==================================================
     RESIZE CANVAS
     ================================================== */

  function resizeCanvas() {

    const rect = hero.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    if (!mouse.active) {
      mouse.x = width * 0.72;
      mouse.y = height * 0.5;

      mouse.targetX = mouse.x;
      mouse.targetY = mouse.y;
    }

  }


  resizeCanvas();

  window.addEventListener(
    "resize",
    resizeCanvas
  );


  /* ==================================================
     MOUSE INTERACTION
     ================================================== */

  hero.addEventListener(
    "pointermove",
    (event) => {

      const rect = hero.getBoundingClientRect();

      mouse.targetX =
        event.clientX - rect.left;

      mouse.targetY =
        event.clientY - rect.top;

      mouse.active = true;

    }
  );


  hero.addEventListener(
    "pointerleave",
    () => {

      mouse.targetX = width * 0.72;
      mouse.targetY = height * 0.5;

      mouse.active = false;

    }
  );


  /* ==================================================
     GRID
     ================================================== */

  function drawGrid() {

    ctx.save();

    ctx.strokeStyle =
      "rgba(255, 255, 255, 0.055)";

    ctx.lineWidth = 1;

    const spacing = 55;

    /*
      Mouse creates a very subtle parallax
      movement in the grid.
    */

    const offsetX =
      ((mouse.x / width) - 0.5) * 12;

    const offsetY =
      ((mouse.y / height) - 0.5) * 12;


    for (
      let x = -spacing;
      x < width + spacing;
      x += spacing
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x + offsetX,
        0
      );

      ctx.lineTo(
        x + offsetX,
        height
      );

      ctx.stroke();

    }


    for (
      let y = -spacing;
      y < height + spacing;
      y += spacing
    ) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y + offsetY
      );

      ctx.lineTo(
        width,
        y + offsetY
      );

      ctx.stroke();

    }


    ctx.restore();

  }


  /* ==================================================
     MATHEMATICAL MODEL CURVE
     ================================================== */

  function modelCurve(
    x,
    phase,
    amplitude,
    frequency
  ) {

    const normalized =
      x / width;

    return (
      Math.sin(
        normalized * frequency +
        phase
      ) * amplitude
    );

  }


  /* ==================================================
     STOCHASTIC-LIKE SERIES
     ================================================== */

  function stochasticCurve(
    x,
    phase
  ) {

    const n =
      x / width;

    const wave1 =
      Math.sin(
        n * 10 +
        phase
      ) * 32;

    const wave2 =
      Math.sin(
        n * 23 -
        phase * 0.7
      ) * 14;

    const wave3 =
      Math.sin(
        n * 47 +
        phase * 1.4
      ) * 6;

    const trend =
      (n - 0.5) * -55;

    return (
      wave1 +
      wave2 +
      wave3 +
      trend
    );

  }


  /* ==================================================
     MOUSE DISTORTION
     ================================================== */

  function mouseInfluence(
    x,
    y
  ) {

    const dx =
      x - mouse.x;

    const dy =
      y - mouse.y;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    const radius = 190;

    if (distance > radius) {
      return 0;
    }

    const strength =
      1 - distance / radius;

    return (
      dy *
      strength *
      0.12
    );

  }


  /* ==================================================
     DRAW SERIES
     ================================================== */

  function drawSeries({
    baseY,
    amplitude,
    frequency,
    speed,
    color,
    width: lineWidth,
    stochastic = false,
    glow = false
  }) {

    ctx.save();

    ctx.beginPath();

    ctx.lineWidth =
      lineWidth;

    ctx.strokeStyle =
      color;

    ctx.lineJoin =
      "round";

    ctx.lineCap =
      "round";


    if (glow) {

      ctx.shadowBlur = 18;

      ctx.shadowColor =
        color;

    }


    const phase =
      time * speed;

    const step = 5;


    for (
      let x = -10;
      x <= width + 10;
      x += step
    ) {

      let offset;

      if (stochastic) {

        offset =
          stochasticCurve(
            x,
            phase
          );

      } else {

        offset =
          modelCurve(
            x,
            phase,
            amplitude,
            frequency
          );

      }


      let y =
        baseY +
        offset;


      /*
        Curves gently react around
        the mouse cursor.
      */

      y += mouseInfluence(
        x,
        y
      );


      if (x === -10) {

        ctx.moveTo(
          x,
          y
        );

      } else {

        ctx.lineTo(
          x,
          y
        );

      }

    }


    ctx.stroke();

    ctx.restore();

  }


  /* ==================================================
     FLOATING DATA POINTS
     ================================================== */

  function drawPoints() {

    const points = 18;

    for (
      let i = 0;
      i < points;
      i++
    ) {

      const seed =
        i * 137.5;

      const x =
        (
          seed * 7 +
          time * (8 + i % 4)
        ) %
        (width + 100) -
        50;

      const base =
        height * (
          0.22 +
          (i % 7) * 0.09
        );

      const y =
        base +
        Math.sin(
          time * 0.35 +
          i * 1.7
        ) * 22;


      const dx =
        x - mouse.x;

      const dy =
        y - mouse.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      const nearMouse =
        Math.max(
          0,
          1 - distance / 180
        );


      const radius =
        1.2 +
        nearMouse * 2.6;


      ctx.beginPath();

      ctx.arc(
        x,
        y,
        radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(
          110,
          205,
          255,
          ${0.22 + nearMouse * 0.55}
        )`;

      ctx.fill();

    }

  }


  /* ==================================================
     CURSOR INDICATOR
     ================================================== */

  function drawCursorIndicator() {

    if (!mouse.active) {
      return;
    }


    ctx.save();


    /* vertical reference line */

    ctx.beginPath();

    ctx.moveTo(
      mouse.x,
      0
    );

    ctx.lineTo(
      mouse.x,
      height
    );

    ctx.strokeStyle =
      "rgba(255, 255, 255, 0.12)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /* glowing cursor point */

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(255, 212, 0, 0.95)";

    ctx.shadowBlur = 16;

    ctx.shadowColor =
      "rgba(255, 212, 0, 0.8)";

    ctx.fill();


    ctx.restore();

  }


  /* ==================================================
     DRAW FRAME
     ================================================== */

  function draw() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    /*
      Smooth mouse movement.
    */

    mouse.x +=
      (
        mouse.targetX -
        mouse.x
      ) * 0.08;

    mouse.y +=
      (
        mouse.targetY -
        mouse.y
      ) * 0.08;


    drawGrid();


    /*
      Background mathematical curves
    */

    drawSeries({
      baseY: height * 0.28,
      amplitude: 44,
      frequency: 8,
      speed: 0.18,
      color:
        "rgba(78, 168, 235, 0.30)",
      width: 1.5
    });


    drawSeries({
      baseY: height * 0.45,
      amplitude: 70,
      frequency: 12,
      speed: -0.12,
      color:
        "rgba(51, 197, 255, 0.25)",
      width: 1.2
    });


    drawSeries({
      baseY: height * 0.64,
      amplitude: 50,
      frequency: 7,
      speed: 0.1,
      color:
        "rgba(160, 211, 255, 0.18)",
      width: 1
    });


    /*
      Main stochastic-like path
    */

    drawSeries({
      baseY: height * 0.52,
      speed: 0.28,
      color:
        "rgba(64, 195, 255, 0.92)",
      width: 2.2,
      stochastic: true,
      glow: true
    });


    drawPoints();

    drawCursorIndicator();


    if (!reduceMotion) {

      time += 0.012;

      animationFrame =
        requestAnimationFrame(draw);

    }

  }


  /* ==================================================
     START
     ================================================== */

  draw();


  /*
    If reduced motion is enabled,
    redraw only when the user interacts.
  */

  if (reduceMotion) {

    hero.addEventListener(
      "pointermove",
      draw
    );

    window.addEventListener(
      "resize",
      draw
    );

  }


  /* ==================================================
     CLEANUP
     ================================================== */

  window.addEventListener(
    "beforeunload",
    () => {

      if (animationFrame) {
        cancelAnimationFrame(
          animationFrame
        );
      }

    }
  );

});
