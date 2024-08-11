$(function () {
  let selectedTime, selectedDate;

  $("#datepicker").datepicker();

  $("#search-appointment").on("click", function (event) {
    let dateEntered = $("#datepicker").datepicker("getDate");
    $(".available-slots").css("display", "block");
    $("#slot-date").text(dateEntered.toDateString());

    axios
      .get(`/get-slots/${dateEntered.toDateString()}`)
      .then(function (response) {
        let { data } = response;
        let allSlots = $(".slot-card");
        allSlots.removeClass("slot-booked");
        allSlots.addClass("slot-available");
        data.map((i) => {
          let slot = document.getElementById(i.time);
          slot.classList.add("slot-booked");
          slot.classList.remove("slot-available");
        });
      })
      .catch(function (error) {
        alert("Error: " + error.response.data);
      });
  });

  $(".slot-available").on("click", function (event) {
    let isAvailable = Array.from(event.currentTarget.classList).includes("slot-available");

    if (isAvailable) {
      $(".date-time-selected").css("display", "block");
      selectedTime = event.currentTarget.innerText;
      selectedDate = $("#datepicker").datepicker("getDate");

      $(`#selected-date`).text(selectedDate.toDateString());
      $(`#selected-time`).text(selectedTime);
    } else {
      alert("This slot is booked");
    }
  });

  $("#create-slot").on("click", function (event) {
    axios
      .post("/create-slot", { selectedDate, selectedTime })
      .then(function (response) {
        alert(response.data.message);
        $("#search-appointment").click();
        $(".date-time-selected").css("display", "none");
      })
      .catch(function (error) {
        alert("Error: " + (error.response?.data || error.message));
      });
  });
});
