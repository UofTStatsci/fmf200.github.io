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
      navToggle.setAttribute("aria-expanded", String(isOpen));
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
     POINTER INTERACTION
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
      "rgba(255, 255, 255, 0.06)";

    ctx.lineWidth = 1;

    const spacing = 55;

    /*
      Stronger parallax movement than the
      previous version.
    */

    const offsetX =
      ((mouse.x / width) - 0.5) * 28;

    const offsetY =
      ((mouse.y / height) - 0.5) * 28;


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
     MODEL CURVE
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
      ) * 38;

    const wave2 =
      Math.sin(
        n * 23 -
        phase * 0.7
      ) * 18;

    const wave3 =
      Math.sin(
        n * 47 +
        phase * 1.4
      ) * 8;

    const wave4 =
      Math.sin(
        n * 83 -
        phase * 0.35
      ) * 4;

    const trend =
      (n - 0.5) * -65;

    return (
      wave1 +
      wave2 +
      wave3 +
      wave4 +
      trend
    );
  }


  /* ==================================================
     DRAMATIC MOUSE DISTORTION
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

    /*
      Large interaction field.
    */

    const radius = 380;

    if (distance > radius) {
      return 0;
    }

    /*
      Strongest near the cursor,
      fading smoothly outward.
    */

    const normalized =
      1 - distance / radius;

    const strength =
      normalized * normalized;


    /*
      Pull the line toward the cursor.
    */

    const attraction =
      (mouse.y - y) *
      strength *
      0.72;


    /*
      Add an elastic ripple around
      the interaction point.
    */

    const ripple =
      Math.sin(
        distance * 0.035 -
        time * 5
      ) *
      30 *
      strength;


    return (
      attraction +
      ripple
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
      ctx.shadowBlur = 22;
      ctx.shadowColor = color;
    }


    const phase =
      time * speed;

    const step = 4;


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
        Dramatic local distortion.
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
    const points = 24;

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
          time * (10 + i % 5)
        ) %
        (width + 100) -
        50;

      const base =
        height * (
          0.18 +
          (i % 8) * 0.085
        );

      let y =
        base +
        Math.sin(
          time * 0.45 +
          i * 1.7
        ) * 26;


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
          1 - distance / 260
        );


      /*
        Nearby particles are pulled
        toward the pointer as well.
      */

      if (mouse.active) {
        y +=
          (mouse.y - y) *
          nearMouse *
          0.18;
      }


      const radius =
        1.3 +
        nearMouse * 3.5;


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
          ${0.22 + nearMouse * 0.65}
        )`;

      if (nearMouse > 0.4) {
        ctx.shadowBlur = 14;
        ctx.shadowColor =
          "rgba(75, 190, 255, 0.8)";
      }

      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }


  /* ==================================================
     CURSOR FIELD
     ================================================== */

  function drawCursorField() {
    if (!mouse.active) {
      return;
    }

    ctx.save();


    /*
      Large subtle interaction halo.
    */

    const gradient =
      ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        180
      );

    gradient.addColorStop(
      0,
      "rgba(50, 197, 255, 0.13)"
    );

    gradient.addColorStop(
      0.45,
      "rgba(50, 197, 255, 0.05)"
    );

    gradient.addColorStop(
      1,
      "rgba(50, 197, 255, 0)"
    );

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      180,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
      Vertical reference line.
    */

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
      "rgba(255, 255, 255, 0.16)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /*
      Horizontal reference line.
    */

    ctx.beginPath();

    ctx.moveTo(
      0,
      mouse.y
    );

    ctx.lineTo(
      width,
      mouse.y
    );

    ctx.strokeStyle =
      "rgba(255, 255, 255, 0.07)";

    ctx.stroke();


    /*
      Outer cursor ring.
    */

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      13,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "rgba(255, 212, 0, 0.35)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /*
      Glowing cursor point.
    */

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      4.5,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "rgba(255, 212, 0, 1)";

    ctx.shadowBlur = 22;

    ctx.shadowColor =
      "rgba(255, 212, 0, 0.95)";

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
      Faster pointer response.
    */

    mouse.x +=
      (
        mouse.targetX -
        mouse.x
      ) * 0.16;

    mouse.y +=
      (
        mouse.targetY -
        mouse.y
      ) * 0.16;


    drawGrid();


    /*
      Upper model curve.
    */

    drawSeries({
      baseY: height * 0.25,
      amplitude: 48,
      frequency: 8,
      speed: 0.22,
      color:
        "rgba(78, 168, 235, 0.34)",
      width: 1.5
    });


    /*
      Middle model curve.
    */

    drawSeries({
      baseY: height * 0.42,
      amplitude: 75,
      frequency: 12,
      speed: -0.16,
      color:
        "rgba(51, 197, 255, 0.30)",
      width: 1.4
    });


    /*
      Lower model curve.
    */

    drawSeries({
      baseY: height * 0.68,
      amplitude: 58,
      frequency: 7,
      speed: 0.13,
      color:
        "rgba(160, 211, 255, 0.22)",
      width: 1.2
    });


    /*
      Additional faint model curve.
    */

    drawSeries({
      baseY: height * 0.78,
      amplitude: 35,
      frequency: 16,
      speed: -0.09,
      color:
        "rgba(91, 175, 235, 0.15)",
      width: 1
    });


    /*
      Main stochastic path.
    */

    drawSeries({
      baseY: height * 0.53,
      speed: 0.34,
      color:
        "rgba(64, 195, 255, 0.96)",
      width: 2.5,
      stochastic: true,
      glow: true
    });


    drawPoints();

    drawCursorField();


    if (!reduceMotion) {
      time += 0.014;

      animationFrame =
        requestAnimationFrame(draw);
    }
  }


  /* ==================================================
     START
     ================================================== */

  draw();


  /* ==================================================
     REDUCED MOTION
     ================================================== */

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
