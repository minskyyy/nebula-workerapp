// -----------------------------------------------------------------------
// BASE FUNCTIONS
// -----------------------------------------------------------------------
/**
 * Updates a bar chart with the current value, range, and target.
 *
 * @param {string} chartSelector - The selector for the bar chart container (e.g. '#temperature-barchart').
 * @param {number} value - The current measurement.
 * @param {number} minValue - The minimum possible value.
 * @param {number} maxValue - The maximum possible value.
 * @param {number} targetMin - The start of the target range.
 * @param {number} targetMax - The end of the target range.
 * @param {string} valueSelector - The selector for the text element showing the numeric value.
 */

function updateBarChart(
  chartSelector,
  value,
  minValue,
  maxValue,
  targetMin,
  targetMax,
  valueSelector
) {
  // Clamp the value.
  if (value < minValue) value = minValue;
  if (value > maxValue) value = maxValue;

  const totalRange = maxValue - minValue;
  const fillPercent = ((value - minValue) / totalRange) * 100;
  const targetStartPercent = ((targetMin - minValue) / totalRange) * 100;
  const targetWidthPercent = ((targetMax - targetMin) / totalRange) * 100;

  // Determine the fill color for the bar.
  let newColor = "accent-bg-alt2";
  const margin = totalRange * 0.05; // 5% margin threshold
  if (value >= targetMin && value <= targetMax) {
    newColor = "bg-green-500"; // inside target range
  } else if (
    (value < targetMin && targetMin - value <= margin) ||
    (value > targetMax && value - targetMax <= margin)
  ) {
    newColor = "bg-yellow-500"; // near target range
  }

  // Update the fill bar.
  let $fillBar = $(chartSelector).find(".bar-fill");
  $fillBar
    .removeClass("bg-red-600 bg-yellow-500 bg-green-500")
    .addClass(newColor);
  $fillBar.css("width", fillPercent + "%");

  // Update the sandclock target range SVG.
  $(chartSelector)
    .find(".range-svg")
    .css({
      left: targetStartPercent + "%",
      width: targetWidthPercent + "%",
    });

  // Update the indicator needles (centered via -translate-x-1/2).
  $(chartSelector)
    .find(".range-indicator")
    .first()
    .css("left", targetStartPercent + "%");
  $(chartSelector)
    .find(".range-indicator")
    .last()
    .css("left", targetStartPercent + targetWidthPercent + "%");

  // Update displayed numeric value and limit labels.
  $(valueSelector).text(value);
  $(chartSelector + " .lowerLimit").text(minValue);
  $(chartSelector + " .upperLimit").text(maxValue);

  // Update the status icon.
  let $icon = $(valueSelector).prev(".status-icon");
  let iconClass = "icon-warning-fill";
  let iconTextColor = "text-accent-alt";
  if (value >= targetMin && value <= targetMax) {
    iconClass = "icon-circle-checkmark-fill";
    iconTextColor = "text-green-500";
  } else if (
    (value < targetMin && targetMin - value <= margin) ||
    (value > targetMax && value - targetMax <= margin)
  ) {
    iconClass = "icon-warning-fill";
    iconTextColor = "text-yellow-500";
  }
  $icon
    .removeClass(
      "icon-warning-fill icon-circle-checkmark-fill text-accent-alt text-yellow-500 text-green-500"
    )
    .addClass(iconClass + " " + iconTextColor);
}

// Mockup Function Calls - Remove Later
// Update Temperature Chart
updateBarChart(
  "#temperature-barchart", // chart container selector
  0, // current temperature value
  0, // minimum temperature
  200, // maximum temperature
  140, // target range start
  180, // target range end
  ".temperature-value-all" // value display selector
);

// Update Pressure Chart
updateBarChart(
  "#pressure-barchart",
  0, // current pressure value
  0, // minimum pressure
  6, // maximum pressure
  4, // target range start
  5, // target range end
  ".pressure-value-all"
);

// Start the production timer
function startProductionTimer() {
  productionStartTime = Date.now();
  productionTimer = setInterval(() => {
    const now = Date.now();
    const diffMs = now - productionStartTime;
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    $("#production-time").text(`${minutes}:${seconds}`);
  }, 1000);
}

// Stop and reset the production timer
function stopProductionTimer() {
  clearInterval(productionTimer);
  productionTimer = null;
  productionStartTime = null;
  $("#production-time").text("00:00");
}

// Show a step (hide others)
function activateStep(stepNumber) {
  $(`#step-${stepNumber}-content`).removeClass("hidden");
  $(`#step-${stepNumber}`).addClass("border-primary");
  $(`#step-${stepNumber}`).removeClass("text-gray-400");
  $(`#step-${stepNumber}-number`).addClass("accent-bg");
  $(`#step-${stepNumber}`).prop("disabled", false);

  if (stepNumber == 2) {
    $("#motif-id").focus();
  }
  currentStep = stepNumber;
}

// -----------------------------------------------------------------------
// Updated completeStep function:
// Instead of hiding the step, we grey it out (using Tailwind classes).
// -----------------------------------------------------------------------
function completeStep(stepNumber) {
  $(`#step-${stepNumber}-check`).removeClass("hidden");
  $(`#step-${stepNumber}-content`).addClass("hidden");
  $(`#step-${stepNumber}-number`).removeClass("accent-bg");
  // $(`#step-${i}`).removeClass("text-gray-400");
  $(`#step-${stepNumber}-number`).addClass("hidden");
  $(`#step-${stepNumber}`).addClass("border-confirm");
  // Add classes to grey out the step and disable further interaction
  $(`#step-${stepNumber}`).addClass("text-gray-400 pointer-events-none");
  $(`#step-${stepNumber}`).prop("disabled", true);
}

// Reset all steps to initial state
function resetSteps() {
  for (let stepNumber = 1; stepNumber <= 5; stepNumber++) {
    $(`#step-${stepNumber}-check`).addClass("hidden");
    // $(`#step-${i}`).removeClass("text-gray-400");
    $(`#step-${stepNumber}-number`).removeClass("hidden accent-bg");
    $(`#step-${stepNumber}-content`).addClass("hidden");
    $(`#step-${stepNumber}`).removeClass("border-confirm");
    // Add classes to grey out the step and disable further interaction
    $(`#step-${stepNumber}`).removeClass(
      "text-gray-400 border-primary pointer-events-none"
    );
  }
  $("#motif-id").val("");
  $("#production-finished-panel").hide();
  currentStep = 1;
}

// Start new production: show steps panel, hide "New production", reset UI
function startProduction() {
  $("#new-production-panel").hide();
  $("#production-process-panel").show();
  resetSteps();
  activateStep(1);
  startProductionTimer();
}

// Cancel production: hide steps panel, show "New production", reset UI
function cancelProduction() {
  $("#production-process-panel").hide();
  $("#new-production-panel").show();
  resetSteps();
  stopProductionTimer();
  // Send production_cycle_end MQTT message
  // Prepare message data
  const messageData = {
    timestamp: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    tshirt_id: tshirtId,
    machine_id: MACHINE_ID,
  };
  // Send production_cycle_end MQTT message and reset tshirtId after confirmation
  sendMqttMessage("tshirtpress/cyclemetrics/production_cycle_end", messageData, () => {
    tshirtId = ""; // Reset only after message is sent
  });
}

// Production done: show final "New production" box and stop the timer
function showProductionFinished() {
  $("#new-production-panel").show();
  stopProductionTimer();
}

// Barcode: Convert Link to ID
function extractQueryValue(url) {
  try {
    const parts = url.split("?");
    return parts.length > 1 ? parts[1] : null;
  } catch (e) {
    return null; // Not a valid URL
  }
}

let runtimeDisplay = "0h 0m 0s";


// Global variable to hold the formatted runtime display
/**
 * Updates runtimeDisplay by calculating the difference between the current time
 * and today's 8:00 AM. If the current time is before 8:00 AM, runtime is 0.
 * Uses a self-adjusting setTimeout to update precisely on the next second tick.
 */
function updateRuntime() {
  const now = new Date();
  // Recalculate today's 8:00 AM in case the day has changed
  const today8AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0
  );

  // Calculate elapsed time in seconds, ensuring it doesn't go negative
  let diffSec = Math.floor((now - today8AM) / 1000);
  diffSec = diffSec < 0 ? 0 : diffSec;

  const hours = Math.floor(diffSec / 3600);
  const minutes = Math.floor((diffSec % 3600) / 60);
  const seconds = diffSec % 60;

  runtimeDisplay = `${hours}h ${minutes}m ${seconds}s`;

  // Calculate milliseconds until the next full second
  const msToNextTick = 1000 - now.getMilliseconds();
  setTimeout(updateRuntime, msToNextTick);
  $("#runtime-value").text(runtimeDisplay);
}
updateRuntime();


function isValidNumericId(value) {
  return /^\d+$/.test(value); // Checks if the value consists only of digits
}

let runtimeSeconds = 0; // Start from 0

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  return `${hours}h ${minutes}m ${secs}s`;
}

function runCountdown(countdownSeconds) {
  let timeLeft = countdownSeconds;
  $("#modal").removeClass("hidden"); // Show modal

  // Reset box color, progress bar, and countdown
  $("#timer-box").removeClass("bg-[rgba(78,173,88,1)]").addClass("bg-[rgba(255,204,76,1)]");
  $("#progress-bar").css("width", "0%");
  $("#countdown").text(timeLeft);
  $("#timer-box").removeClass("hidden"); // Ensure timer box is shown
  $("#status-box").addClass("hidden"); // Ensure status box is hidden

  let interval = setInterval(function () {
    timeLeft--;
    $("#countdown").text(timeLeft);
    let progressWidth = ((countdownSeconds - timeLeft) / countdownSeconds) * 100 + "%";
    $("#progress-bar").css("width", progressWidth);

    if (timeLeft <= 0) {
      clearInterval(interval);
      setTimeout(() => {
        $("#timer-box").addClass("hidden"); // Hide timer box
        $("#status-box").removeClass("hidden"); // Show success box
      }, 1000);
    }
  }, 1000);
}

let status = -1; // Store status globally within the script

function checkTempPress(temperature, pressure) {
  let inRange = (temperature >= 140 && temperature <= 180) && (pressure >= 4 && pressure <= 5);
  if (inRange && status !== 1) {
    status = 1;
    handleStep(1); // Send "1" only once when entering range
  }
  else if (!inRange && status !== 0) {
    status = 0;
    handleStep(0); // Send "0" only once when leaving range
  }
}

function closeResetTimer() {
  $("#timer-box").removeClass("hidden"); // show Timer
  $("#status-box").addClass("hidden"); // Hide Status
  closeModal();
};

function closeModal() {
  $("#modal").addClass("hidden"); // Hide modal
  // You might not want to remove the modal if it needs to be shown again
  // $("#modal").remove();
}

//Update images
function updateImageAnimated(index) {
  const stepImage = document.getElementById('step-image');
  const paddedIndex = String(index).padStart(4, '0'); // Ensures 4-digit formatting (e.g., 0000, 0001, ..., 0060)
  stepImage.src = `images/${paddedIndex}.png`;
}

// Function to show the feedback form inside the existing step 5 content
function showFeedbackForm() {
  // Append the feedback form to the existing step 5 content
  $("#step-5-outof").remove();
  $("#step-5-tolerance").remove();
  $("#feedback-section").show();
  // Handle send feedback button click
//   $("#send-feedback").on("click", function () {
//     const feedbackText = $("#feedback-input").val().trim();

//     if (feedbackText) {
//       // Send feedback through MQTT
//       sendMqttMessage("tshirtpress/cyclemetrics/fail", {
//         timestamp: new Date().toISOString(),
//         tshirt_id: tshirtId,
//         feedback: feedbackText,
//         machine_id: MACHINE_ID,
//         description: feedbackText,
//       });

//       // Remove the feedback form after submission
//       $("#feedback-section").remove();
//     } else {
//       alert("Please enter a reason before submitting.");
//     }
//   }
// );
}


// -----------------------------------------------------------------------
// MQTT SETUP
// -----------------------------------------------------------------------

const mqttTopic = "tshirtpress/#";
const MACHINE_ID = "b3ad7aa9-3caa-40af-bf7b-0cb429665461";
let tshirtId = ""; // For storing the motif ID
const clientId = "webserver_localWorker";
const host = "ws://localhost:8083/mqtt";
const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: "MQTT",
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  will: {
    topic: "WillMsg",
    payload: "Connection Closed abnormally..!",
    qos: 0,
    retain: false,
  },
};

console.log("Connecting MQTT client");
const client = mqtt.connect(host, options);

// Function to send MQTT messages
function sendMqttMessage(topic, payload) {
  const message = JSON.stringify(payload);
  if (client.connected) {
    client.publish(topic, message, { qos: 0, retain: false }, function (err) {
      if (err) {
        console.error(`Failed to send MQTT message to ${topic}:`, err);
      } else {
        console.log(`MQTT message sent to ${topic}:`, message);
      }
    });
  } else {
    console.warn("MQTT client not connected, message not sent");
  }
}

// MQTT event handlers
client.on("connect", function () {
  console.log("Connected to MQTT broker");
  client.subscribe(mqttTopic, function (err) {
    if (err) {
      console.error("Subscription error:", err);
    } else {
      console.log("Subscribed to " + mqttTopic);
    }
  });
});

client.on("error", function (err) {
  console.error("MQTT Connection error:", err);
  client.end();
});

client.on("reconnect", function () {
  console.log("MQTT Reconnecting...");
});

// Listen for incoming sensor data or status updates
client.on("message", function (topic, message) {
  try {
    const payload = JSON.parse(message.toString());
    // Temperature
    if (topic === "tshirtpress/esp/temperature") {
      const temperature = payload.value || payload.temperature || payload;
      updateBarChart(
        "#temperature-barchart", // chart container selector
        temperature, // current temperature value
        0, // minimum temperature
        200, // maximum temperature
        140, // target range start
        180, // target range end
        ".temperature-value-all", // value display selector
        checkTempPress(temperature)
      );
    }
    // Pressure
    else if (topic === "tshirtpress/cr/pressure") {
      const pressure = payload.value || payload.pressure || payload;

      updateBarChart(
        "#pressure-barchart", // chart container selector
        pressure, // current temperature value
        0, // minimum pressure
        6, // maximum pressure
        4, // target range start
        5, // target range end
        ".pressure-value-all", // value display selector
        checkTempPress(pressure)
      );
    }
    // Possibly machine runtime, if your device publishes it
    /*else if (topic === "tshirtpress/cr/runtime") {
      const totalMinutes = parseInt(payload.value, 10) || 0;
      const hrs = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      const secs = mins % 60;
      $("#runtime-value").text(`${hrs}h ${mins}min ${secs}sec`);
    }*/
    else if (topic === "tshirtpress/status/images") {
      const imageTag = payload.value || payload.image || payload;
      updateImageAnimated(imageTag);
    }
    // Additional status-based step activation could be handled here:
    else if (topic === "tshirtpress/status") {
      console.log("Received status from MQTT:", payload);
      const msgValue = payload.value;
      switch (msgValue) {
        case 0:
          handleStep(0); //Ready to print - machine prepped
          break;
        case 1:
          handleStep(1); // Not ready anymore - temperature to low / pressure to low
          break;
        case 2:
          handleStep(2); //Send scanned motif id
          break;
        case 3:
          handleStep(3); // Insert motif and foil
          break;
        case 4:
          handleStep(4); //Start transfer process / press closed
          break;
        case 5:
          handleStep(5); //Close Timer
          break;
        case 6:
          handleStep(6); //Cancel Production
          break;
        default:
          console.warn("Received unknown message:", msgValue);
      }
    }
  } catch (error) {
    console.error("Error processing MQTT message:", error);
  }
});

// -----------------------------------------------------------------------
// UI / PRODUCTION FLOW
// -----------------------------------------------------------------------
let currentStep = 1;
let productionTimer = null;
let productionStartTime = null;

// -----------------------------------------------------------------------
// EVENT HANDLERS
// -----------------------------------------------------------------------


// Restart production after finishing
$("#restart-production-btn").on("click", function () {
  cancelProduction();
});

$("#motif-id").on("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    $("#confirm-step-2").click();
  }
});

$("#empty-motif-id").on("click", function () {
  $("#motif-id").val("");
});

// Function to handle steps
function handleStep(step) {
  switch (step) {
    case 0:
      // Start new production
      startProduction();
      // Send machine_start MQTT message
      break;
    case 1:
      completeStep(1);
      activateStep(2);
      sendMqttMessage("tshirtpress/cyclemetrics/machine_start", {
        timestamp: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        machine_id: MACHINE_ID,
      });
      break;

    case 2:
      const motif = $("#motif-id").val().trim();
      const extractedValue = extractQueryValue(motif);

      if (!motif) {
        alert("Please enter a valid numeric ID or link before confirming.");
        return;
      }

      if (isValidNumericId(motif)) {
        tshirtId = motif;
      } else if (extractedValue && isValidNumericId(extractedValue)) {
        tshirtId = extractedValue;
      } else {
        alert("Invalid input format. Expected a numeric ID or a link containing '?ID'.");
        return;
      }

      $("#motif-id").val(tshirtId);
      $("#order-value").text(tshirtId).addClass("pulse");

      setTimeout(() => {
        $("#order-value").removeClass("pulse");
      }, 1000);

      sendMqttMessage("tshirtpress/cyclemetrics/production_cycle_start", {
        timestamp: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        tshirt_id: tshirtId,
        machine_id: MACHINE_ID,
      });

      completeStep(2);
      activateStep(3);
      break;

    case 3:
      sendMqttMessage("tshirtpress/cyclemetrics/printing_start", {
        timestamp: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        tshirt_id: tshirtId,
        machine_id: MACHINE_ID,
      });
      completeStep(3);
      activateStep(4);
      break;

    case 4:
      runCountdown(5);
      completeStep(4);
      sendMqttMessage("tshirtpress/cyclemetrics/printing_end", {
        timestamp: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
        tshirt_id: tshirtId,
        machine_id: MACHINE_ID,
      });
      activateStep(5);
      break;
    case 5:
      closeResetTimer();
      break;
    case 6:
      cancelProduction();
      break;
    default:
      console.warn("Unhandled step:", step);
  }
}

// STEP 5: Evaluate product quality (In tolerance)
$("#step-5-tolerance").on("click", function () {
  completeStep(5);
  sendMqttMessage("tshirtpress/cyclemetrics/quality_pass", {
    timestamp: new Date().toISOString(),
    tshirt_id: tshirtId,
    machine_id: MACHINE_ID,
  });
  showProductionFinished();
});

// STEP 5: Evaluate product quality (Out of tolerance)
$("#step-5-outof").on("click", function () {
  //completeStep(5);
  // Show feedback form
  showFeedbackForm();
  //showProductionFinished();
});

// STEP 5: Evaluate product quality (Out of tolerance)
$("#send-feedback").on("click", function () {
  // Get the input value correctly
  const description_value = $("#feedback-input").val().trim();

  // Ensure the input is not empty before sending
  if (!description_value) {
    alert("Please enter a reason before submitting.");
    return;
  }

  completeStep(5);
  sendMqttMessage("tshirtpress/cyclemetrics/quality_fail", {
    timestamp: new Date().toISOString(),
    tshirt_id: tshirtId,
    machine_id: MACHINE_ID,
    description: description_value
  });
  showProductionFinished();
});
// STEP 0: Start Production
$("#start-production-btn").on("click", function () {
  handleStep(0);
});

// STEP 1: Activate on click
$("#step-1").on("click", function () {
  handleStep(1);
});

// STEP 2: Activate on button click
$("#confirm-step-2").on("click", function () {
  handleStep(2);
});

$("#step-3").on("click", function () {
  handleStep(3);
});

$("#step-4").on("click", function () {
  handleStep(4);
});

// Cancel production (top-right button)
$("#cancel-production-btn").on("click", function () {
  handleStep(6);
});

$("#modal").on("click", function () {
  closeModal();
});
