(function () {
  "use strict";
  var config = window.CONFIG || {};
  var form = document.querySelector("#setupForm");
  var recipient = config.NOTIFY_EMAIL || "petrobras280@gmail.com";
  document.querySelector("#recipient").textContent = recipient;
  form.action = "https://formsubmit.co/" + encodeURIComponent(recipient);
  form.querySelector('[name="_url"]').value = config.FORM_URL || new URL("./", location.href).href;
})();
