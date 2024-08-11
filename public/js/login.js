// Simple data validation checks
const isNonEmptyString = (value) => {
  return typeof value === "string" && value.length > 0;
};

const displayError = (field, message) => {
  $(`#${field}_error`).text(message);
};

const clearErrors = () => {
  $(".error-message").text("");
};

// LOGIN FUNCTIONALITY
$(function () {
  $("#loginForm").on("submit", function (event) {
    event.preventDefault();

    // Clear previous errors
    clearErrors();

    let errors = [];

    const userData = {
      username: $("#loginUsername").val().trim(),
      password: $("#loginPassword").val().trim(),
    };
    console.log("userData", userData);

    if (!isNonEmptyString(userData.username)) {
      errors.push({ field: "loginUsername", message: "Username is required to login." });
    }

    if (!isNonEmptyString(userData.password)) {
      errors.push({ field: "loginPassword", message: "Password is required to login." });
    }

    console.log("errors", errors);
    
    // Display errors
    errors.forEach((error) => {
      displayError(error.field, error.message);
      window.scrollTo(0, 0);
    });

    if (errors.length === 0) {
      console.log("All data is valid:", userData);

      axios
        .post("/login", userData)
        .then(function (response) {
          console.log("logg", response.data);
          const { user } = response.data;
          if (user.userType == "Admin") {
            window.location.href = "/appointment";
          } else if (user.userType == "Driver") {
            window.location.href = "/class-g2";
          } else if (user.userType == "Examiner"){
            window.location.href = "/examiner"
          }
        })
        .catch(function (error) {
          alert("Error: " + (error.response?.data || error.message));
        });
    }
  });

  // SIGNUP FUNCTIONALITY
  $("#signupForm").on("submit", function (event) {
    event.preventDefault();
    const userData = {
      username: $("#signupUsername").val().trim(),
      password: $("#signupPassword").val().trim(),
      repeatPassword: $("#signupRepeatPassword").val().trim(),
      userType: $("#signupUserType").val(),
    };

    // Implement validation checks and display errors
    const errors = [];

    if (!userData.username) {
      errors.push({ field: "signupUsername", message: "Username is required." });
    }

    if (!userData.password) {
      errors.push({ field: "signupPassword", message: "Password is required." });
    }

    if (userData.password !== userData.repeatPassword) {
      errors.push({ field: "signupRepeatPassword", message: "Passwords do not match." });
    }

    if (!userData.userType) {
      errors.push({ field: "signupUserType", message: "User type is required." });
    }

    console.log("userData", userData);

    // Display errors
    $(".error-message").text("");
    errors.forEach((error) => {
      $(`#${error.field}_error`).text(error.message);
    });

    if (errors.length === 0) {
      axios
        .post("/signup", userData)
        .then((response) => {
          alert("Signup successful, please login.");
        })
        .catch((error) => {
          alert("Error: " + (error.response?.data || error.message));
        });
    }
  });
});
