// Imports
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

// Models
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const mongoose = require("mongoose");

const uri =
  "mongodb+srv://dharakansara994:hUJ4SYroevuH9Csy@cluster.ue5m1w7.mongodb.net/_main?retryWrites=true&w=majority&appName=Cluster";

// Config
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret-key", resave: false, saveUninitialized: true }));

// DB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
const authenticate = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId).populate("appointment").exec();

    if (!user) {
      return res.redirect("/login");
    }
    req.user = user;

    // Format user DOB
    const userDOB = user.dob?.toISOString().split("T")[0];
    req.user.userDOB = userDOB;

    // Format user appointment date
    if (user.appointment?.date) {
      let userAppointmentDate;
      userAppointmentDate = user.appointment?.date.toDateString();
      req.user.appointment.userAppointmentDate = userAppointmentDate;
    }

    next();
  } else {
    res.redirect("/login");
  }
};

// Get Routes
app.get("/", authenticate, (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

// Protected routes
app.get("/class-g2", authenticate, (req, res) => {
  if (req.user.userType === "Driver") {
    res.render("class-g2", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.get("/class-g", authenticate, (req, res) => {
  if (req.user.userType === "Driver") {
    res.render("class-g", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.get("/get-user/:licenseNumber", async (req, res) => {
  const { licenseNumber } = req.params;

  try {
    const user = await User.findOne({ licenseNumber });

    if (!user) {
      res.status(404).send("No User Found");
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).send("Error fetching user: " + error.message);
  }
});

app.get("/examiner", authenticate, (req, res) => {
  if (req.user.userType === "Examiner") {
    res.render("examiner", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/save-user", async (req, res) => {
  const { firstName, lastName, licenseNumber, age, dob, carMake, carModel, carYear, plateNumber } =
    req.body;

  const updatedUser = {
    firstName,
    lastName,
    licenseNumber,
    age,
    dob,
    car_details: {
      make: carMake,
      model: carModel,
      year: carYear,
      plateNumber,
    },
  };

  try {
    let foundUser = await User.findOneAndUpdate({ _id: req.session.userId }, updatedUser);
    res.status(200).json({ message: "User saved successfully", user: foundUser });
  } catch (error) {
    res.status(500).send("Error saving user: " + error.message);
  }
});

app.post("/update-car", async (req, res) => {
  const { licenseNumber, make, model, year, plateNumber } = req.body;

  try {
    const user = await User.findOne({ licenseNumber });

    if (!user) {
      res.status(404).send("No User Found");
    } else {
      user.car_details = {
        make,
        model,
        year,
        plateNumber,
      };

      await user.save();
      res.status(200).send("Car details updated successfully");
    }
  } catch (error) {
    res.status(500).send("Error updating car details: " + error.message);
  }
});

//A-3

// Sign up
app.post("/signup", async (req, res) => {
  try {
    const { username, password, userType } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    let encryptedPassword = await bcrypt.hash(password, 10).then(function (hash) {
      return hash;
    });

    const user = new User({ username, password: encryptedPassword, userType });
    await user.save();
    res.status(201).send("User created.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send("Invalid username or password.");
    }
    req.session.userId = user._id;
    res.send({ message: "Login Successful", user: { username: user.username, userType: user.userType } });
    console.log(req.user.userType);
  } catch (error) {
      if (!res.headersSent) {
        res.status(500).send(error.message);
      } else {
        console.error("Error during login:", error.message);
      }  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

app.get("/appointment", authenticate, (req, res) => {
  if (req.user.userType === "Admin") {
    res.render("appointment", { user: req.user });
  } else {
    res.status(403).send("Forbidden");
  }
});

app.post("/create-slot", async (req, res) => {
  const { selectedDate, selectedTime } = req.body;

  const dateObj = new Date(selectedDate);
  console.log("dateObj", dateObj);
  const dateISO = dateObj.toISOString();

  try {
    const existingAppointment = await Appointment.findOne({
      date: dateISO,
      time: selectedTime,
    });

    if (existingAppointment) {
      return res.status(400).send("Appointment already exists.");
    }

    const appointment = new Appointment({ date: selectedDate, time: selectedTime });
    await appointment.save();
    res.json({ message: "Created!", appointment: appointment });
  } catch (error) {
    res.status(500).send("Error updating car details: " + error.message);
  }
});

app.get("/get-slots/:date", async (req, res) => {
  const { date } = req.params;
  console.log("date", date);
  const dateObj = new Date(date);
  console.log("dateObj", dateObj);

  const dateISO = dateObj.toISOString();

  try {
    const appointments = await Appointment.find({ date: dateISO });

    if (!appointments) {
      res.status(404).send("No User Found");
    } else {
      res.status(200).json(appointments);
    }
  } catch (error) {
    res.status(500).send("Error fetching user: " + error.message);
  }
});

app.post("/book-slot", async (req, res) => {
  const { selectedDate, selectedTime } = req.body;

  const dateObj = new Date(selectedDate);
  console.log("dateObj", dateObj);
  const dateISO = dateObj.toISOString();

  try {
    // const existingAppointment = await Appointment.findOne({
    //   date: dateISO,
    //   time: selectedTime,
    // });

    let updatedAppointment = await Appointment.findOneAndUpdate(
      { date: dateISO, time: selectedTime },
      { isTimeSlotAvailable: false }
    );

    if (updatedAppointment) {
      console.log("FOUND", updatedAppointment);

      let updatedUser = await User.findOneAndUpdate(
        { _id: req.session.userId },
        { appointment: updatedAppointment._id }
      );

      console.log("updatedUser", updatedUser);

      res.json({ message: "Slot Booked!", appointment: updatedAppointment });
    } else {
      console.log("NOT FOUND");
      return res.status(400).send("Appointment not available.");
    }

    // const appointment = new Appointment({ date: selectedDate, time: selectedTime });
    // await appointment.save();
  } catch (error) {
    console.log("err", error);
    res.status(500).send("Error updating car details: " + error.message);
  }
});

// Listen
app.listen(1000, () => {
  console.log("Hello! App listening on port 1000");
});
