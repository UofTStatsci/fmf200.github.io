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
     CANVAS
     ================================================== */

  const canvas = document.getElementById("finance-canvas");

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");

  if (!ctx || !hero) return;


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
    active: false,
    strength: 0
  };


  /* ==================================================
     DETERMINISTIC RANDOM
     ================================================== */

  /*
    Gives us irregular price paths that remain
    consistent between frames instead of flickering.
  */

  function seededRandom(seed) {
    const value = Math.sin(seed * 12.9898) * 43758.5453;
    return value - Math.floor(value);
  }


  /* ==================================================
     CREATE PRICE SERIES
     ================================================== */

  const seriesDefinitions = [
    {
      seed: 11,
      base: 0.24,
      volatility: 0.065,
      trend: 0.05,
      color: "rgba(81, 174, 240, 0.34)",
      lineWidth: 1.4
    },
    {
      seed: 27,
      base: 0.38,
      volatility: 0.075,
      trend: -0.025,
      color: "rgba(61, 196, 255, 0.45)",
      lineWidth: 1.5
    },
    {
      seed: 43,
      base: 0.53,
      volatility: 0.09,
      trend: 0.065,
      color: "rgba(74, 201, 255, 0.95)",
      lineWidth: 2.5,
      glow: true
    },
    {
      seed: 68,
      base: 0.67,
      volatility: 0.06,
      trend: -0.035,
      color: "rgba(151, 211, 255, 0.28)",
      lineWidth: 1.2
    },
    {
      seed: 91,
      base: 0.78,
      volatility: 0.055,
      trend: 0.03,
      color: "rgba(97, 177, 235, 0.20)",
      lineWidth: 1
    }
  ];


  /* ==================================================
     RESIZE
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

  window.addEventListener("resize", resizeCanvas);


  /* ==================================================
     POINTER
     ================================================== */

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();

    mouse.targetX = event.clientX - rect.left;
    mouse.targetY = event.clientY - rect.top;

    mouse.active = true;
  });


  hero.addEventListener("pointerleave", () => {
    mouse.active = false;
  });


  /* ==================================================
     GRID
     ================================================== */

  function drawGrid() {
    ctx.save();

    const spacingX = 65;
    const spacingY = 55;

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.055)";


    /*
      Only a tiny amount of idle/parallax movement.
    */

    const offsetX =
      mouse.active
        ? ((mouse.x / width) - 0.5) * 8
        : 0;

    const offsetY =
      mouse.active
        ? ((mouse.y / height) - 0.5) * 8
        : 0;


    for (
      let x = -spacingX;
      x <= width + spacingX;
      x += spacingX
    ) {
      ctx.beginPath();

      ctx.moveTo(x + offsetX, 0);
      ctx.lineTo(x + offsetX, height);

      ctx.stroke();
    }


    for (
      let y = -spacingY;
      y <= height + spacingY;
      y += spacingY
    ) {
      ctx.beginPath();

      ctx.moveTo(0, y + offsetY);
      ctx.lineTo(width, y + offsetY);

      ctx.stroke();
    }

    ctx.restore();
  }


  /* ==================================================
     PRICE PATH
     ================================================== */

  function getPricePath(definition) {
    const points = [];

    /*
      Wider spacing creates more rigid/angular
      financial-chart geometry.
    */

    const segments = 34;

    const stepX = width / segments;

    let value =
      height * definition.base;

    /*
      Extremely slow movement while idle.
    */

    const drift =
      Math.sin(
        time * 0.12 +
        definition.seed
      ) * 4;


    for (let i = 0; i <= segments; i++) {
      const x = i * stepX;

      if (i > 0) {
        const random =
          seededRandom(
            definition.seed * 1000 +
            i * 17
          );

        const move =
          (random - 0.5) *
          height *
          definition.volatility;

        value += move;
      }


      /*
        Long-term slope.
      */

      const trend =
        definition.trend *
        height *
        (i / segments);


      /*
        Small slow drift, rather than continuous
        wave motion.
      */

      const localDrift =
        Math.sin(
          time * 0.08 +
          i * 0.32 +
          definition.seed
        ) * 2;


      points.push({
        x,
        y:
          value +
          trend +
          drift +
          localDrift
      });
    }

    return points;
  }


  /* ==================================================
     CURSOR CONVERGENCE
     ================================================== */

  function distortPoint(point) {
    if (mouse.strength <= 0.001) {
      return point;
    }

    /*
      Horizontal distance determines how strongly
      this section of the line converges.
    */

    const dx =
      point.x - mouse.x;

    const radius =
      Math.min(
        360,
        width * 0.32
      );


    if (Math.abs(dx) > radius) {
      return point;
    }


    const normalized =
      1 -
      Math.abs(dx) / radius;


    /*
      Cubic falloff means the attraction becomes
      dramatically stronger near the cursor.
    */

    const attraction =
      normalized *
      normalized *
      normalized *
      mouse.strength;


    /*
      Almost all series meet at the cursor,
      but retain a tiny amount of separation
      so individual lines remain visible.
    */

    const targetY =
      mouse.y +
      Math.sin(
        point.x * 0.03
      ) * 2;


    const y =
      point.y +
      (targetY - point.y) *
      attraction *
      0.96;


    /*
      Slight horizontal pull creates a visual
      funnel into the cursor.
    */

    const horizontalPull =
      (mouse.x - point.x) *
      attraction *
      0.055;


    return {
      x:
        point.x +
        horizontalPull,

      y
    };
  }


  /* ==================================================
     DRAW PRICE SERIES
     ================================================== */

  function drawPriceSeries(definition) {
    const points =
      getPricePath(definition);

    ctx.save();

    ctx.beginPath();

    ctx.strokeStyle =
      definition.color;

    ctx.lineWidth =
      definition.lineWidth;

    ctx.lineJoin = "miter";
    ctx.lineCap = "round";


    if (definition.glow) {
      ctx.shadowBlur = 16;
      ctx.shadowColor =
        "rgba(64,195,255,0.8)";
    }


    points.forEach((point, index) => {
      const distorted =
        distortPoint(point);

      if (index === 0) {
        ctx.moveTo(
          distorted.x,
          distorted.y
        );
      } else {
        /*
          Straight line segments instead of
          curves give us the stock-chart look.
        */

        ctx.lineTo(
          distorted.x,
          distorted.y
        );
      }
    });


    ctx.stroke();
    ctx.restore();
  }


  /* ==================================================
     DATA POINTS
     ================================================== */

  function drawDataPoints() {
    seriesDefinitions.forEach(
      (definition, seriesIndex) => {

        const points =
          getPricePath(definition);

        /*
          Only show occasional nodes.
        */

        points.forEach(
          (point, index) => {

            if (index % 5 !== 0) {
              return;
            }

            const distorted =
              distortPoint(point);


            const dx =
              distorted.x - mouse.x;

            const dy =
              distorted.y - mouse.y;

            const distance =
              Math.sqrt(
                dx * dx +
                dy * dy
              );


            const proximity =
              mouse.active
                ? Math.max(
                    0,
                    1 - distance / 180
                  )
                : 0;


            ctx.beginPath();

            ctx.arc(
              distorted.x,
              distorted.y,
              1.2 + proximity * 2.2,
              0,
              Math.PI * 2
            );

            ctx.fillStyle =
              `rgba(
                120,
                210,
                255,
                ${0.15 + proximity * 0.65}
              )`;

            ctx.fill();
          }
        );
      }
    );
  }


  /* ==================================================
     CURSOR FOCUS
     ================================================== */

  function drawCursorFocus() {
    if (mouse.strength < 0.05) {
      return;
    }

    ctx.save();


    /*
      Vertical time marker.
    */

    ctx.beginPath();

    ctx.moveTo(mouse.x, 0);
    ctx.lineTo(mouse.x, height);

    ctx.strokeStyle =
      `rgba(
        255,
        255,
        255,
        ${0.12 * mouse.strength}
      )`;

    ctx.lineWidth = 1;

    ctx.stroke();


    /*
      Horizontal value marker.
    */

    ctx.beginPath();

    ctx.moveTo(0, mouse.y);
    ctx.lineTo(width, mouse.y);

    ctx.strokeStyle =
      `rgba(
        255,
        255,
        255,
        ${0.07 * mouse.strength}
      )`;

    ctx.stroke();


    /*
      Interaction halo.
    */

    const gradient =
      ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        150
      );

    gradient.addColorStop(
      0,
      `rgba(
        61,
        197,
        255,
        ${0.13 * mouse.strength}
      )`
    );

    gradient.addColorStop(
      1,
      "rgba(61,197,255,0)"
    );


    ctx.fillStyle = gradient;

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      150,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
      Yellow focal point.
    */

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      5,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      `rgba(
        255,
        212,
        0,
        ${mouse.strength}
      )`;

    ctx.shadowBlur = 24;

    ctx.shadowColor =
      "rgba(255,212,0,0.9)";

    ctx.fill();


    /*
      Outer ring.
    */

    ctx.shadowBlur = 0;

    ctx.beginPath();

    ctx.arc(
      mouse.x,
      mouse.y,
      13,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      `rgba(
        255,
        212,
        0,
        ${0.35 * mouse.strength}
      )`;

    ctx.stroke();


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
      Smooth cursor tracking.
    */

    mouse.x +=
      (mouse.targetX - mouse.x) *
      0.18;

    mouse.y +=
      (mouse.targetY - mouse.y) *
      0.18;


    /*
      Fade the convergence in/out rather
      than switching instantly.
    */

    const targetStrength =
      mouse.active ? 1 : 0;

    mouse.strength +=
      (
        targetStrength -
        mouse.strength
      ) * 0.09;


    drawGrid();


    seriesDefinitions.forEach(
      drawPriceSeries
    );


    drawDataPoints();

    drawCursorFocus();


    /*
      Much slower idle animation.
    */

    if (!reduceMotion) {
      time += 0.004;

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

    hero.addEventListener(
      "pointerleave",
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
