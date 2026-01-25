--- 
layout: page 
banner: images/cropped-awesome-starfish-background-picture-new-best-hd-wallpapers-of-starfish-2.jpg 
title: Countdown
nav_weight: 5
permalink: /countdown
---


<script src="js/moment.js"></script>
<script src="js/countdown.min.js"></script>
<script src="js/moment-countdown.min.js"></script>

<article id="post-5" class="post-5 page type-page status-publish hentry xfolkentry">

<h3>Wedding Countdown</h3>
<p id="countdown"> </p>

<script>
  var fechaBoda = moment("2027-07-10 12:00:00");
  var ahora = moment();

  var texto = fechaBoda.isAfter(ahora)
    ? "Faltan " + ahora.countdown(fechaBoda).toString() + " para la boda."
    : "La boda será dentro de " + fechaBoda.countdown(ahora).toString() + "!";

  document.getElementById("countdown").innerHTML = texto;
</script>

</article>
