/* ==================================================
   FMF200
   Interactive Mathematical Finance Hero
   Smooth Prism Convergence Effect
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


  let width = 0;
  let height = 0;
  let dpr = 1;

  let series = [];

  let animationFrame = null;


  const mouse = {
    x: 0,
    y: 0,
    active: false,

    /*
      0 = original plots
      1 = full cursor convergence
    */

    strength: 0,
    targetStrength: 0
  };


  /* ==================================================
     SERIES
     ================================================== */

  const seriesDefinitions = [

    {
      seed: 17,
      base: 0.20,
      volatility: 0.045,
      trend: 0.08,
      color: "rgba(81,174,240,0.34)",
      lineWidth: 1.3
    },

    {
      seed: 31,
      base: 0.34,
      volatility: 0.055,
      trend: -0.025,
      color: "rgba(61,196,255,0.48)",
      lineWidth: 1.5
    },

    {
      seed: 49,
      base: 0.50,
      volatility: 0.065,
      trend: 0.055,
      color: "rgba(74,201,255,0.95)",
      lineWidth: 2.4,
      glow: true
    },

    {
      seed: 73,
      base: 0.66,
      volatility: 0.05,
      trend: -0.04,
      color: "rgba(151,211,255,0.32)",
      lineWidth: 1.2
    },

    {
      seed: 101,
      base: 0.79,
      volatility: 0.04,
      trend: 0.025,
      color: "rgba(97,177,235,0.24)",
      lineWidth: 1
    }

  ];


  /* ==================================================
     SEEDED RANDOM
     ================================================== */

  function seededRandom(seed) {

    const value =
      Math.sin(seed * 12.9898) *
      43758.5453;

    return value - Math.floor(value);

  }


  /* ==================================================
     BUILD STATIC FINANCIAL PATHS
     ================================================== */

  function buildSeries() {

    series = [];


    seriesDefinitions.forEach((definition) => {

      const points = [];

      const segments = 64;

      const stepX =
        width / segments;


      let y =
        height * definition.base;


      for (
        let i = 0;
        i <= segments;
        i++
      ) {

        const x =
          i * stepX;


        if (i > 0) {

          const random =
            seededRandom(
              definition.seed * 1000 +
              i * 37
            );


          let move =
            (random - 0.5) *
            height *
            definition.volatility;


          const jump =
            seededRandom(
              definition.seed * 3000 +
              i * 79
            );


          if (jump > 0.94) {

            const direction =
              seededRandom(
                definition.seed * 5000 +
                i * 131
              ) > 0.5
                ? 1
                : -1;


            move +=
              direction *
              height *
              definition.volatility *
              0.8;

          }


          y += move;

        }


        const trend =
          definition.trend *
          height *
          (i / segments);


        const finalY =
          Math.max(
            40,
            Math.min(
              height - 40,
              y + trend
            )
          );


        points.push({
          x,
          y: finalY
        });

      }


      series.push({
        ...definition,
        points
      });

    });

  }


  /* ==================================================
     RESIZE
     ================================================== */

  function resizeCanvas() {

    const rect =
      hero.getBoundingClientRect();


    width =
      rect.width;

    height =
      rect.height;


    dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );


    canvas.width =
      Math.round(
        width * dpr
      );


    canvas.height =
      Math.round(
        height * dpr
      );


    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    buildSeries();

    draw();

  }


  resizeCanvas();

  window.addEventListener(
    "resize",
    resizeCanvas
  );


  /* ==================================================
     POINTER
     ================================================== */

  hero.addEventListener(
    "pointerenter",
    (event) => {

      const rect =
        hero.getBoundingClientRect();


      mouse.x =
        event.clientX -
        rect.left;


      mouse.y =
        event.clientY -
        rect.top;


      mouse.active = true;

      mouse.targetStrength = 1;

      startAnimation();

    }
  );


  hero.addEventListener(
    "pointermove",
    (event) => {

      const rect =
        hero.getBoundingClientRect();


      mouse.x =
        event.clientX -
        rect.left;


      mouse.y =
        event.clientY -
        rect.top;


      mouse.active = true;

      mouse.targetStrength = 1;

      /*
        Draw immediately so the prism
        follows the cursor responsively.
      */

      draw();

    }
  );


  hero.addEventListener(
    "pointerleave",
    () => {

      mouse.active = false;

      /*
        Instead of snapping back,
        gradually ease strength to zero.
      */

      mouse.targetStrength = 0;

      startAnimation();

    }
  );


  /* ==================================================
     PRISM / FOCAL DISTORTION
     ================================================== */

  function distortPoint(
    point,
    seriesIndex
  ) {

    if (mouse.strength <= 0.001) {
      return point;
    }


    const dx =
      point.x -
      mouse.x;


    const radius =
      Math.min(
        430,
        width * 0.38
      );


    const distance =
      Math.abs(dx);


    if (distance >= radius) {
      return point;
    }


    const normalized =
      1 -
      distance / radius;


    /*
      Prism-shaped convergence.
    */

    const convergence =
      Math.pow(
        normalized,
        2.15
      ) *
      mouse.strength;


    /*
      Tiny separation at the focal point.
    */

    const focalSpread = 1.7;


    const seriesOffset =
      (
        seriesIndex -
        (series.length - 1) / 2
      ) *
      focalSpread;


    const focalY =
      mouse.y +
      seriesOffset;


    const distortedY =
      point.y +
      (
        focalY -
        point.y
      ) *
      convergence *
      0.995;


    const distortedX =
      point.x +
      (
        mouse.x -
        point.x
      ) *
      convergence *
      0.018;


    return {
      x: distortedX,
      y: distortedY
    };

  }


  /* ==================================================
     GRID
     ================================================== */

  function drawGrid() {

    ctx.save();


    const spacingX = 65;
    const spacingY = 55;


    ctx.lineWidth = 1;


    ctx.strokeStyle =
      "rgba(255,255,255,0.055)";


    for (
      let x = 0;
      x <= width;
      x += spacingX
    ) {

      ctx.beginPath();

      ctx.moveTo(
        x,
        0
      );

      ctx.lineTo(
        x,
        height
      );

      ctx.stroke();

    }


    for (
      let y = 0;
      y <= height;
      y += spacingY
    ) {

      ctx.beginPath();

      ctx.moveTo(
        0,
        y
      );

      ctx.lineTo(
        width,
        y
      );

      ctx.stroke();

    }


    ctx.restore();

  }


  /* ==================================================
     DRAW SERIES
     ================================================== */

  function drawSeries(
    item,
    seriesIndex
  ) {

    ctx.save();


    ctx.beginPath();


    ctx.strokeStyle =
      item.color;


    ctx.lineWidth =
      item.lineWidth;


    ctx.lineJoin =
      "miter";


    ctx.lineCap =
      "butt";


    if (item.glow) {

      ctx.shadowBlur = 14;


      ctx.shadowColor =
        "rgba(64,195,255,0.75)";

    }


    item.points.forEach(
      (point, index) => {

        const rendered =
          distortPoint(
            point,
            seriesIndex
          );


        if (index === 0) {

          ctx.moveTo(
            rendered.x,
            rendered.y
          );

        } else {

          ctx.lineTo(
            rendered.x,
            rendered.y
          );

        }

      }
    );


    ctx.stroke();


    ctx.restore();

  }


  /* ==================================================
     FOCAL POINT
     ================================================== */

  function drawCursor() {

    if (mouse.strength <= 0.01) {
      return;
    }


    ctx.save();


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
      `rgba(
        255,
        255,
        255,
        ${0.14 * mouse.strength}
      )`;


    ctx.lineWidth = 1;


    ctx.stroke();


    /*
      Horizontal reference.
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
      `rgba(
        255,
        255,
        255,
        ${0.06 * mouse.strength}
      )`;


    ctx.stroke();


    /*
      Halo.
    */

    const gradient =
      ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        120
      );


    gradient.addColorStop(
      0,
      `rgba(
        61,
        197,
        255,
        ${0.14 * mouse.strength}
      )`
    );


    gradient.addColorStop(
      1,
      "rgba(61,197,255,0)"
    );


    ctx.fillStyle =
      gradient;


    ctx.beginPath();


    ctx.arc(
      mouse.x,
      mouse.y,
      120,
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


    ctx.shadowBlur =
      22 * mouse.strength;


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
      12,
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
     DRAW
     ================================================== */

  function draw() {

    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    drawGrid();


    series.forEach(
      (item, index) => {

        drawSeries(
          item,
          index
        );

      }
    );


    drawCursor();

  }


  /* ==================================================
     SMOOTH ENTER / EXIT ANIMATION
     ================================================== */

  function animateInteraction() {

    /*
      Ease current strength toward target.

      0.075 controls the speed.

      Lower = slower
      Higher = faster
    */

    mouse.strength +=
      (
        mouse.targetStrength -
        mouse.strength
      ) * 0.075;


    /*
      Snap the final tiny fraction so
      animation doesn't run forever.
    */

    if (
      Math.abs(
        mouse.targetStrength -
        mouse.strength
      ) < 0.002
    ) {

      mouse.strength =
        mouse.targetStrength;

    }


    draw();


    /*
      Continue only while transition
      is still happening.
    */

    if (
      mouse.strength !==
      mouse.targetStrength
    ) {

      animationFrame =
        requestAnimationFrame(
          animateInteraction
        );

    } else {

      animationFrame = null;

    }

  }


  /* ==================================================
     START ANIMATION
     ================================================== */

  function startAnimation() {

    if (animationFrame !== null) {
      return;
    }


    animationFrame =
      requestAnimationFrame(
        animateInteraction
      );

  }


  /* ==================================================
     INITIAL STATIC DRAW
     ================================================== */

  draw();

});
