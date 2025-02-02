$(document).ready(function () {
  // Fetch quote from API
  $.ajax({
    url: "http://numbersapi.com/1/30/date?json",
    method: "GET",
    dataType: "json",
    success: function (data) {
      $("#factText").text(data.text);
      $("#factYear").text(data.year);
    },
    error: function () {
      const fallbackQuotes = [
        "The only bad workout is the one that didn't happen.",
        "Your body can stand almost anything. It's your mind you have to convince.",
        "Fitness is not about being better than someone else. It's about being better than you used to be.",
      ];
      const randomQuote =
        fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      $("#factText").text(randomQuote);
      $("#factYear").text("Infinity");
    },
  });

  const registerModal = new bootstrap.Modal($("#registerModal")[0]);

  $("#registerLink").on("click", function () {
    $("#passwordError").text("");
    $("#registerForm").trigger("reset");
    registerModal.show();
  });

  let hideTimeout;

  // Function to show toast message
  function showToast(message, type = "success") {
    $("<div>")
      .addClass(`alert alert-${type} position-fixed bottom-0 end-0 m-3`)
      .text(message)
      .appendTo("body")
      .delay(2000)
      .fadeOut(function () {
        $(this).remove();
      });
  }

  // Function to handle file selection
  function handleFile(file) {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#imagePreview").html(`
                <img src="${e.target.result}" alt="Preview" 
                    style="max-width: 200px; max-height: 200px; border-radius: 50%;" 
                    class="img-thumbnail"
                />
            `);
      };
      reader.readAsDataURL(file);
      $("#profile_image")[0].files = new DataTransfer().files;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      $("#profile_image")[0].files = dataTransfer.files;
    } else {
      showToast("Please upload an image file", "warning");
    }
  }

  // Handle drag and drop events
  const dropZone = $("#dropZone")[0];

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    $("#dropZone").addClass("dragover");
  }

  function unhighlight(e) {
    $("#dropZone").removeClass("dragover");
  }

  dropZone.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
  }

  // Handle normal file input change
  $("#profile_image").on("change", function (e) {
    const file = e.target.files[0];
    handleFile(file);
  });

  $("#registerForm").on("submit", async function (e) {
    e.preventDefault();

    // Create FormData from the actual form element
    const formData = new FormData(this);

    try {
      const response = await fetch("http://localhost:3000/create-user", {
        method: "POST",
        // Remove the Content-Type header - let the browser set it with boundary
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        showToast(data.error, "danger");
      } else {
        showToast("Account created successfully!");
        registerModal.hide();
        $("#imagePreview").html("");
        $("#registerForm")[0].reset();
      }
    } catch (error) {
      showToast("Something went wrong.", "danger");
    }
  });

  // Initialize carousel with custom settings
  const heroCarousel = new bootstrap.Carousel(
    document.querySelector("#heroCarousel"),
    {
      interval: 5000, // Change slides every 5 seconds
      fade: true,
    }
  );

  // Optional: Pause carousel on hover
  $(".hero-section").hover(
    function () {
      heroCarousel.pause();
    },
    function () {
      heroCarousel.cycle();
    }
  );

  // Function to update priority numbers
  function updatePriorities() {
    $("#sortableFeatures .feature-card").each(function (index) {
      let $priority = $(this).find(".feature-priority");
      if ($priority.length === 0) {
        $priority = $('<div class="feature-priority">').prependTo($(this));
      }
      $priority.text(index + 1);
    });
  }

  // Initialize sortable features with updated options
  $("#sortableFeatures").sortable({
    items: ".draggable-feature",
    handle: ".feature-card",
    placeholder: "sortable-placeholder",
    opacity: 0.8,
    tolerance: "pointer",
    containment: "parent",
    start: function (e, ui) {
      ui.placeholder.height(ui.item.height());
      $(ui.item).addClass("shadow-lg");
      // Show all priority numbers when dragging starts
      $(".feature-priority").css("opacity", "1");
    },
    stop: function (e, ui) {
      $(ui.item).removeClass("shadow-lg");
      updatePriorities();

      // Hide priority numbers again after drag unless hovering
      if (!$(".features-section:hover").length) {
        $(".feature-priority").css("opacity", "0");
      }

      // Save the new order
      const newOrder = $("#sortableFeatures .feature-card")
        .map(function () {
          return $(this).data("feature");
        })
        .get();

      localStorage.setItem("featuresOrder", JSON.stringify(newOrder));

      showToast("Preferences saved!");

      // Start hide timeout after drag
      hideTimeout = setTimeout(() => {
        $(".feature-priority, .feature-card::before").css("opacity", "0");
      }, 2000);
    },
  });

  // Initialize priority numbers
  updatePriorities();

  // Restore saved order and update priorities
  try {
    const savedOrder = JSON.parse(localStorage.getItem("featuresOrder"));
    if (savedOrder) {
      const $container = $("#sortableFeatures");
      savedOrder.forEach((feature) => {
        const $element = $container
          .find(`[data-feature="${feature}"]`)
          .closest(".draggable-feature");
        $container.append($element);
      });
      updatePriorities();
    }
  } catch (e) {
    console.log("No saved order found");
  }

  // Features section hover handling with auto-hide
  $(".features-section")
    .on("mouseenter", function () {
      clearTimeout(hideTimeout);
      $(".feature-priority, .feature-card::before").css("opacity", "1");
    })
    .on("mouseleave", function () {
      hideTimeout = setTimeout(() => {
        if (!$(".ui-sortable-helper").length) {
          // Don't hide if dragging
          $(".feature-priority, .feature-card::before").css("opacity", "0");
        }
      }, 2000);
    });
});
