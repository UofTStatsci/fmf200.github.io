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
     STATE
     ================================================== */

  let width = 0;
  let height = 0;
  let dpr = 1;

  let animationFrame = null;

  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    strength: 0
  };


  /* ==================================================
     SERIES DEFINITIONS
     ================================================== */

  const seriesDefinitions = [
    {
      seed: 17,
      base: 0.22,
      volatility: 0.055,
      trend: 0.08,
      color: "rgba(81,174,240,0.30)",
      lineWidth: 1.3
    },

    {
      seed: 31,
      base: 0.36,
      volatility: 0.07,
      trend: -0.03,
      color: "rgba(61,196,255,0.42)",
      lineWidth: 1.5
    },

    {
      seed: 49,
      base: 0.52,
      volatility: 0.085,
      trend: 0.06,
      color: "rgba(74,201,255,0.95)",
      lineWidth: 2.4,
      glow: true
    },

    {
      seed: 73,
      base: 0.66,
      volatility: 0.065,
      trend: -0.05,
      color: "rgba(151,211,255,0.28)",
      lineWidth: 1.2
    },

    {
      seed: 101,
      base: 0.78,
      volatility: 0.05,
      trend: 0.025,
      color: "rgba(97,177,235,0.20)",
      lineWidth: 1
    }
  ];


  let series = [];


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
     BUILD STATIC PRICE PATHS
     ================================================== */

  function buildSeries() {

    series = [];

    seriesDefinitions.forEach((definition) => {

      const points = [];

      /*
        More points = more realistic financial
        time-series geometry.
      */

      const segments = 52;

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


          /*
            Mostly small moves with occasional
            larger jumps.
          */

          let move =
            (random - 0.5) *
            height *
            definition.volatility;


          const jumpChance =
            seededRandom(
              definition.seed * 2000 +
              i * 91
            );


          if (jumpChance > 0.91) {

            const jumpDirection =
              seededRandom(
                definition.seed +
                i * 151
              ) > 0.5
                ? 1
                : -1;


            move +=
              jumpDirection *
              height *
              definition.volatility *
              0.8;
          }


          y += move;
        }


        /*
          Gradual directional trend.
        */

        const trend =
          definition.trend *
          height *
          (i / segments);


        /*
          Keep the chart reasonably
          contained inside the hero.
        */

        const finalY =
          Math.max(
            45,
            Math.min(
              height - 45,
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
     POINTER EVENTS
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


      mouse.targetX =
        mouse.x;

      mouse.targetY =
        mouse.y;


      mouse.active = true;

      startAnimation();

    }
  );


  hero.addEventListener(
    "pointermove",
    (event) => {

      const rect =
        hero.getBoundingClientRect();


      mouse.targetX =
        event.clientX -
        rect.left;

      mouse.targetY =
        event.clientY -
        rect.top;


      mouse.active = true;

      startAnimation();

    }
  );


  hero.addEventListener(
    "pointerleave",
    () => {

      mouse.active = false;

      startAnimation();

    }
  );


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
     CURSOR CONVERGENCE
     ================================================== */

  function distortPoint(
    point,
    seriesIndex
  ) {

    if (mouse.strength <= 0.001) {
      return point;
    }


    /*
      Only points within this horizontal
      region are affected.
    */

    const radius =
      Math.min(
        430,
        width * 0.38
      );


    const dx =
      point.x -
      mouse.x;


    const distance =
      Math.abs(dx);


    if (distance > radius) {
      return point;
    }


    /*
      Smooth falloff toward the cursor.
    */

    const normalized =
      1 -
      distance / radius;


    /*
      Very strong convergence close
      to the cursor.
    */

    const attraction =
      Math.pow(
        normalized,
        2.2
      ) *
      mouse.strength;


    /*
      Tiny vertical separation keeps
      all five lines visible while
      appearing to converge.
    */

    const separation =
      (
        seriesIndex -
        (series.length - 1) / 2
      ) * 2.2;


    const targetY =
      mouse.y +
      separation;


    const newY =
      point.y +
      (
        targetY -
        point.y
      ) *
      attraction *
      0.985;


    /*
      Slight horizontal pull creates
      a funnel shape.
    */

    const newX =
      point.x +
      (
        mouse.x -
        point.x
      ) *
      attraction *
      0.035;


    return {
      x: newX,
      y: newY
    };

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


    /*
      Sharp joins reinforce the
      financial-chart appearance.
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

        const distorted =
          distortPoint(
            point,
            seriesIndex
          );


        if (index === 0) {

          ctx.moveTo(
            distorted.x,
            distorted.y
          );

        } else {

          ctx.lineTo(
            distorted.x,
            distorted.y
          );

        }

      }
    );


    ctx.stroke();

    ctx.restore();

  }


  /* ==================================================
     CURSOR
     ================================================== */

  function drawCursor() {

    if (
      mouse.strength <
      0.01
    ) {
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
        ${0.16 * mouse.strength}
      )`;

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
      `rgba(
        255,
        255,
        255,
        ${0.07 * mouse.strength}
      )`;

    ctx.stroke();


    /*
      Cursor halo.
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
     INTERACTION ANIMATION
     ================================================== */

  function animate() {

    /*
      Cursor follows the real pointer
      with a slight easing effect.
    */

    mouse.x +=
      (
        mouse.targetX -
        mouse.x
      ) * 0.24;


    mouse.y +=
      (
        mouse.targetY -
        mouse.y
      ) * 0.24;


    /*
      Fade interaction strength in/out.
    */

    const targetStrength =
      mouse.active
        ? 1
        : 0;


    mouse.strength +=
      (
        targetStrength -
        mouse.strength
      ) * 0.12;


    draw();


    /*
      Stop animation completely once
      everything has returned to rest.
    */

    const pointerSettled =
      Math.abs(
        mouse.targetX -
        mouse.x
      ) < 0.1 &&
      Math.abs(
        mouse.targetY -
        mouse.y
      ) < 0.1;


    const strengthSettled =
      mouse.active
        ? Math.abs(
            1 -
            mouse.strength
          ) < 0.002
        : mouse.strength < 0.002;


    if (
      pointerSettled &&
      strengthSettled
    ) {

      if (!mouse.active) {

        mouse.strength = 0;

        draw();

      }


      animationFrame = null;

      return;

    }


    animationFrame =
      requestAnimationFrame(
        animate
      );

  }


  /* ==================================================
     START ANIMATION ONLY WHEN NEEDED
     ================================================== */

  function startAnimation() {

    if (animationFrame !== null) {
      return;
    }


    animationFrame =
      requestAnimationFrame(
        animate
      );

  }


  /* ==================================================
     INITIAL STATIC DRAW
     ================================================== */

  draw();


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
