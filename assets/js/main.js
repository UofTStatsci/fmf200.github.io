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
     CANVAS SETUP
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

  const mouse = {
    x: 0,
    y: 0,
    active: false
  };


  /* ==================================================
     SERIES DEFINITIONS
     ================================================== */

  const seriesDefinitions = [
    {
      seed: 17,
      base: 0.20,
      volatility: 0.045,
      trend: 0.08,
      color: "rgba(81,174,240,0.32)",
      lineWidth: 1.3
    },

    {
      seed: 31,
      base: 0.34,
      volatility: 0.055,
      trend: -0.025,
      color: "rgba(61,196,255,0.44)",
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
      color: "rgba(151,211,255,0.30)",
      lineWidth: 1.2
    },

    {
      seed: 101,
      base: 0.79,
      volatility: 0.04,
      trend: 0.025,
      color: "rgba(97,177,235,0.22)",
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
     CREATE STATIC PRICE PATHS
     ================================================== */

  function buildSeries() {

    series = [];

    seriesDefinitions.forEach((definition) => {

      const points = [];

      const segments = 58;
      const stepX = width / segments;

      let y =
        height * definition.base;


      for (let i = 0; i <= segments; i++) {

        const x =
          i * stepX;


        if (i > 0) {

          const random =
            seededRandom(
              definition.seed * 1000 +
              i * 37
            );


          /*
            Small irregular price movements.
          */

          let move =
            (random - 0.5) *
            height *
            definition.volatility;


          /*
            Occasional sharper move.
          */

          const jump =
            seededRandom(
              definition.seed * 3000 +
              i * 79
            );


          if (jump > 0.93) {

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
              0.75;
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
          originalX: x,
          originalY: finalY,

          /*
            Current position can be permanently
            altered by cursor interaction.
          */

          x: x,
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


    /*
      Rebuild only when the browser dimensions
      actually change.
    */

    buildSeries();

    draw();

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

      updateSeries();
      draw();

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

      updateSeries();
      draw();

    }
  );


  hero.addEventListener(
    "pointerleave",
    () => {

      /*
        Do NOT reset the lines.

        Their current positions remain exactly
        where the last cursor interaction left them.
      */

      mouse.active = false;

      draw();

    }
  );


  /* ==================================================
     MOVE SERIES TOWARD CURSOR
     ================================================== */

  function updateSeries() {

    if (!mouse.active) return;


    /*
      Wide region around the cursor is affected.
    */

    const radius =
      Math.min(
        440,
        width * 0.40
      );


    series.forEach(
      (item, seriesIndex) => {

        item.points.forEach((point) => {

          const dx =
            point.x -
            mouse.x;


          const distance =
            Math.abs(dx);


          if (distance > radius) {
            return;
          }


          /*
            Strong nonlinear convergence.
          */

          const normalized =
            1 -
            distance / radius;


          const attraction =
            Math.pow(
              normalized,
              2.1
            );


          /*
            Tiny separation keeps individual
            lines visible at the focal point.
          */

          const separation =
            (
              seriesIndex -
              (series.length - 1) / 2
            ) * 2;


          const targetY =
            mouse.y +
            separation;


          /*
            Pull toward cursor.

            Because we're changing point.y itself,
            the new shape persists after the
            cursor leaves.
          */

          point.y +=
            (
              targetY -
              point.y
            ) *
            attraction *
            0.72;


          /*
            Slight horizontal convergence.
          */

          point.x +=
            (
              mouse.x -
              point.x
            ) *
            attraction *
            0.025;

        });

      }
    );

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

  function drawSeries(item) {

    ctx.save();

    ctx.beginPath();


    ctx.strokeStyle =
      item.color;

    ctx.lineWidth =
      item.lineWidth;


    /*
      Sharp angular geometry.
    */

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

        if (index === 0) {

          ctx.moveTo(
            point.x,
            point.y
          );

        } else {

          ctx.lineTo(
            point.x,
            point.y
          );

        }

      }
    );


    ctx.stroke();

    ctx.restore();

  }


  /* ==================================================
     CURSOR FOCUS
     ================================================== */

  function drawCursor() {

    if (!mouse.active) {
      return;
    }


    ctx.save();


    /*
      Vertical time marker.
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
      "rgba(255,255,255,0.16)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /*
      Horizontal value marker.
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
      "rgba(255,255,255,0.07)";

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
        130
      );


    gradient.addColorStop(
      0,
      "rgba(61,197,255,0.13)"
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
      130,
      0,
      Math.PI * 2
    );

    ctx.fill();


    /*
      Focal point.
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
      "rgba(255,212,0,1)";


    ctx.shadowBlur = 22;

    ctx.shadowColor =
      "rgba(255,212,0,0.9)";


    ctx.fill();


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
      drawSeries
    );


    drawCursor();

  }


  /* ==================================================
     INITIAL STATIC DRAW
     ================================================== */

  draw();

});
