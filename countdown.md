---
layout: page 
banner: images/capilla.jpg 
title: Cuenta atrás
nav_weight: 5
permalink: /countdown
---

<script src="js/moment.js"></script>
<script src="js/countdown.min.js"></script>
<script src="js/moment-countdown.min.js"></script>

<style>
  /* Contenedor de la barra */
  .barra-container {
    width: 100%;
    background: #f5f5f5;
    border-radius: 20px;
    overflow: hidden;
    height: 25px;
    margin-top: 15px;
    box-shadow: inset 0 2px 5px rgba(0,0,0,0.1);
  }

  /* Barra de progreso */
  .barra-progreso {
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #d4af37, #f7e7a0);
    transition: width 1s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    font-weight: bold;
    font-size: 0.9em;
  }

  /* Texto cuenta atrás */
  #countdown {
    font-size: 1.2em;
    margin-bottom: 10px;
  }
</style>

<script>
  moment.locale('es');

  countdown.setLabels(
    " milisegundo| segundo| minuto| hora| día| semana| mes| año| década| siglo| milenio",
    " milisegundos| segundos| minutos| horas| días| semanas| meses| años| décadas| siglos| milenios",
    " y ",
    ", ",
    "ahora"
  );
</script>

<article>

<h3>Cuenta atrás para la boda</h3>
<p id="countdown"></p>

<div class="barra-container">
  <div id="progressBar" class="barra-progreso">0%</div>
</div>

<script>
  var fechaInicio = moment("2025-11-15 12:00:00");
  var fechaBoda = moment("2027-07-10 12:00:00");

  function actualizarCuenta() {
    var ahora = moment();

    // Texto cuenta atrás
    var texto = fechaBoda.isAfter(ahora)
      ? "Faltan " + ahora.countdown(fechaBoda).toString() + " para la boda."
      : "La boda fue hace " + fechaBoda.countdown(ahora).toString() + ".";

    document.getElementById("countdown").innerHTML = texto;

    // Progreso
    var total = fechaBoda.diff(fechaInicio);
    var transcurrido = ahora.diff(fechaInicio);

    var porcentaje = Math.min(100, Math.max(0, (transcurrido / total) * 100));
    porcentaje = porcentaje.toFixed(1);

    var barra = document.getElementById("progressBar");
    barra.style.width = porcentaje + "%";
    barra.innerHTML = porcentaje + "%";
  }

  setInterval(actualizarCuenta, 1000);
  actualizarCuenta();
</script>
<img src="/images/giphy.gif" alt="" class="aligncenter size-full" />
</article>

