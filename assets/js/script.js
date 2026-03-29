// ===== Drop zone logic =====
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", () => {
    inputElement.click();
  });

  inputElement.addEventListener("change", () => {
    if (inputElement.files.length) {
      inputElement.closest("div").querySelector(".close-btn")
        // walk up from drop-zone to its parent, then find close-btn
      ;
      const wrapper = dropZoneElement.parentElement;
      const closeBtn = wrapper.querySelector(".close-btn");
      if (closeBtn) closeBtn.classList.add("active");
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, () => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      const wrapper = dropZoneElement.parentElement;
      const closeBtn = wrapper.querySelector(".close-btn");
      if (closeBtn) closeBtn.classList.add("active");
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }
    dropZoneElement.classList.remove("drop-zone--over");
  });
});

/**
 * Updates the thumbnail on a drop zone element.
 */
function updateThumbnail(dropZoneElement, file) {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // Hide the prompt
  const prompt = dropZoneElement.querySelector(".drop-zone__prompt");
  if (prompt) prompt.classList.remove("active");

  // Create thumbnail div if needed
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;

  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
    };
  } else {
    thumbnailElement.style.backgroundImage = null;
  }
}

// ===== Close buttons =====
document.querySelectorAll(".close-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const wrapper = btn.parentElement;
    const dropZone = wrapper.querySelector(".drop-zone");
    const thumb = dropZone.querySelector(".drop-zone__thumb");
    const prompt = dropZone.querySelector(".drop-zone__prompt");
    const input = dropZone.querySelector(".drop-zone__input");

    if (thumb) thumb.remove();
    if (prompt) prompt.classList.add("active");
    if (input) input.value = "";
    btn.classList.remove("active");
  });
});

// ===== Progress bar =====
var bars = document.querySelector(".meter > span");
var progressTimer = null;
var progressValue = 0;

function startProgress() {
  progressValue = 0;
  bars.style.width = "0%";
  progressTimer = setInterval(function () {
    progressValue += 2;
    if (progressValue > 95) progressValue = 95; // cap at 95% until response
    bars.style.width = progressValue + "%";
  }, 1000);
}

function stopProgress() {
  clearInterval(progressTimer);
  bars.style.width = "100%";
  setTimeout(function () {
    $(".meter").removeClass("active");
    bars.style.width = "0%";
    progressValue = 0;
  }, 400);
}

// ===== Form submission =====
$(document).ready(function () {
  $("#imgForm").on("submit", function (e) {
    e.preventDefault();
    var data = new FormData(this);

    if (!$("#image1").val() || !$("#image2").val()) {
      $(".warn-text").removeClass("active");
      return;
    }

    // Show progress & processing state
    $(".warn-text").addClass("active");
    $(".meter").addClass("active");
    $("#processingOverlay").addClass("active");
    startProgress();
    $("#imgForm :input").prop("disabled", true);

    var savedAuth = $("#authCode").val();

    $.ajax({
      url: "https://api.ikey.ie:5000/api/pilotStudy2",
      type: "POST",
      timeout: 0,
      processData: false,
      mimeType: "multipart/form-data",
      dataType: "json",
      contentType: false,
      data: data,
      success: function (response) {
        stopProgress();
        $("#processingOverlay").removeClass("active");
        $("#imgForm :input").prop("disabled", false);

        if (response.status === "OK") {
          $(".ikey-response").text(JSON.stringify(response.message));
        } else {
          $(".ikey-response").text(JSON.stringify(response));
        }
        $("#authCode").val(savedAuth);
      },
      error: function () {
        stopProgress();
        $("#processingOverlay").removeClass("active");
        $("#imgForm :input").prop("disabled", false);
        $(".ikey-response").text("An error occurred. Please try again.");
        $("#authCode").val(savedAuth);
      },
    });
  });

  // ===== Reset =====
  $("#resetBtn").click(function () {
    $(".ikey-response").text("");
    stopProgress();
    $("#processingOverlay").removeClass("active");
  });
});
