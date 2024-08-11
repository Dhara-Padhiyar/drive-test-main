$(function () {
  // Fetch user data with license number
  $("#fetchLicenseData").on("click", function (event) {
    const inputLicenseNumber = $("#inputLicenseNumber").val();

    axios
      .get(`/get-user/${inputLicenseNumber}`)
      .then(function (response) {
        let { data } = response;
        let { make, model, plateNumber, year } = data.car_details;

        $("#gUserInfo").css("visibility", "visible");
        $("#gCarInfo").css("visibility", "visible");

        $("#firstName").val(data.firstName);
        $("#lastName").val(data.lastName);
        $("#licenseNumber").val(data.licenseNumber);
        $("#age").val(data.age);

        let date = new Date(data.dob);
        console.log("date", date);
        $("#dob").val(date);

        $("#make").val(make);
        $("#model").val(model);
        $("#plateNumber").val(plateNumber);
        $("#year").val(year);
      })
      .catch(function (error) {
        alert("Error: " + error.response.data);
      });

    // Update vehicle details
    $("#g-form-vehicle").on("click", function (event) {
      const userData = {
        licenseNumber: $("#inputLicenseNumber").val(),
        make: $("#make").val(),
        model: $("#model").val(),
        year: $("#year").val(),
        plateNumber: $("#plateNumber").val(),
      };

      // Simple data validation checks
      function isNonEmptyString(value) {
        return typeof value === "string" && value.length > 0;
      }

      function isNumeric(value) {
        return !isNaN(value) && value.trim() !== "";
      }

      function isValidYear(value) {
        const year = parseInt(value, 10);
        return isNumeric(value) && year >= 1886 && year <= new Date().getFullYear();
      }

      function displayError(field, message) {
        $(`#${field}_error`).text(message);
      }

      function clearErrors() {
        $(".error-message").text("");
      }

      // Clear previous errors
      clearErrors();

      const errors = [];

      if (!isNonEmptyString(userData.make)) {
        errors.push({ field: "make", message: "Car make is required." });
      }

      if (!isNonEmptyString(userData.model)) {
        errors.push({ field: "model", message: "Car model is required." });
      }

      if (!isValidYear(userData.year)) {
        errors.push({
          field: "year",
          message: "Car year must be a valid 4-digit year between 1886 and the current year.",
        });
      }

      if (!isNonEmptyString(userData.plateNumber)) {
        errors.push({ field: "plateNumber", message: "Plate number is required." });
      }

      // Display errors
      errors.forEach((error) => {
        displayError(error.field, error.message);
      });

      if (errors.length === 0) {
        axios
          .post("/update-car", userData)
          .then(function (response) {
            alert(response.data);
          })
          .catch(function (error) {
            alert("Error: " + (error.response?.data || error.message));
          });
      }
    });
  });

  setTimeout(() => {
    $("#fetchLicenseData").click();
  }, 20);
});
