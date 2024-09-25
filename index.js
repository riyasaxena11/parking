const express = require('express');
const calculateFare = require('./calculateFare'); // Import the calculateFare function
const hbs = require('hbs');
const Park = require('./models/park'); // Import the Park model
const path = require('path');
const bodyParser = require('body-parser'); // For form data parsing
const moment = require('moment'); // Import Moment.js for date and time calculations
require('./Dbconnect'); // Connect to MongoDB database

const app = express();
const encoder = bodyParser.urlencoded(); // Middleware for parsing URL-encoded form data

// Set view engine and views directory
app.set('view engine', 'hbs');
app.set('views', './views');

// Register partials directory for Handlebars templates
const partialPath = path.join(__dirname, './views/partials');
hbs.registerPartials(partialPath);

// Serve static files from the public directory
const staticPath = path.join(__dirname, './views/public');
app.use(express.static(staticPath));

// Body parser middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get all parked vehicles
app.get('/', async (req, res) => {
  const data = await Park.find(); // Fetch all parked vehicles from the database
  res.render('index', { data }); // Render the index view with the parked vehicles data
});

// Add a new parked vehicle
app.get('/add', (req, res) => {
  res.render('add'); // Render the add form view
});

app.post('/add', async (req, res) => {
  // Extract and validate input data
  const Car_Registration_number = req.body.Car_Registration_number?.trim() || '';
  const Owner = req.body.Owner.trim() || '';
  const arrivalTimeStr = req.body.Arrival;
  const departureTimeStr = req.body.Departure;

  // Format arrivalTime and departureTime using moment.js
  const arrivalTime = moment(arrivalTimeStr, 'HH:mm');
  const departureTime = moment(departureTimeStr, 'HH:mm');

  // Check for missing fields
//   if (!Car_Registration_number || !Owner || !arrivalTime || !departureTime) {
//     return res.status(400).send('Missing required fields: Car Registration number, Owner, Arrival, Departure');
//   }

  // Calculate fare using the calculateFare function
  const fare = calculateFare(arrivalTimeStr, departureTimeStr);

  // Create and save a new Park object
  const newPark = new Park({
    Car_Registration_number,
    Owner,
    Arrival: arrivalTime.format('HH:mm'), // Format arrivalTime before saving
    Departure: departureTime.format('HH:mm'), // Format departureTime before saving
    Fare: fare,
  });

  await newPark.save(); // Save the new parked vehicle to the database
  res.redirect('/'); // Redirect to the home page
});

// Get fare calculation
app.get('/fareCalculation', async (req, res) => {
  const arrivalTime = req.query.Arrival;
  const departureTime = req.query.Departure;

  // Calculate fare using the calculateFare function
  const fare = calculateFare(arrivalTime, departureTime);
  res.send({ fare }); // Send the calculated fare as JSON
});

// Get available parking slots
app.get('/availableSlots', async (req, res) => {
  const totalSlots = parseInt(req.query.totalSlots); // Get the total number of parking slots
  const parkedVehicles = await Park.find(); // Fetch all parked vehicles from the database

  const availableSlots = []; // Initialize an empty array to store available slots

  for (let i = 1; i <= totalSlots; i++) {
    let slotAvailable = true; // Assume the slot is initially available

    // Check if the slot is occupied by any parked vehicle
    for (const parkedVehicle of parkedVehicles) {
      if (parkedVehicle.slotNumber === i) {
        slotAvailable = false; // Mark the slot as occupied
        break;
      }
    }

    // Add the available slot to the array if it's not occupied
    if (slotAvailable) {
      availableSlots.push(i);
    }
  }

  res.send({
    availableSlots,
  });
});
// Delete parked vehicle
app.get('/deleteSlot/:id', async (req, res) => {
    await Park.deleteOne({ _id: req.params._id });
    res.redirect('/');
  });
  
  // Update parked vehicle
  app.get('/updateSlot/:id', async (req, res) => {
    const data = await Park.findOne({ _id: req.params._id });
    res.render('update', { data });
  });
  
  app.post('/updateSlot/:id', async (req, res) => {
    const data = await Park.findOne({ _id: req.params._id });
    data.Car_registration_number = req.body.Car_registration_number;
    data.Owner = req.body.Owner;
    data.Arrival = req.body.Arrival;
    data.Departure = req.body.Departure;
  
    await data.save();
    res.redirect('/');
  });
  
  // Server listen
  app.listen(3050, () => console.log('Server listening to port 3050'));
