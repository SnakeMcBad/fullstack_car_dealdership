const express = require('express');
const mongoose = require('mongoose'); // Keep this declaration
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json()); // Parse JSON bodies

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Connect to MongoDB
mongoose.connect("mongodb://mongo_db:27017/", { dbName: 'dealershipsDB' })
  .then(() => {
    console.log('MongoDB connected');
    seedData(); // Call seedData after successful connection
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Seed database with initial data
async function seedData() {
  try {
    const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
    const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

    await Reviews.deleteMany({});
    await Reviews.insertMany(reviews_data['reviews']);

    await Dealerships.deleteMany({});
    await Dealerships.insertMany(dealerships_data['dealerships']);

    // No need to return anything from seedData
    // Ensure that data seeding is completed before starting the server
    startServer();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1); // Exit with failure status
  }
}

// Start the Express server
function startServer() {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealerships = await Dealerships.find();
    res.json(dealerships);
  } catch (error) {
    console.error('Error fetching dealerships:', error);
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealerships by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const dealerships = await Dealerships.find({ state: { $regex: new RegExp('^' + state, 'i') } });
    res.json(dealerships);
  } catch (error) {
    console.error('Error fetching dealerships by state:', error);
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

// Fetch dealership by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('ID:', id); // Add this line to log the ID

    // Find dealership by the 'id' field instead of checking for ObjectID validity
    const dealership = await Dealerships.findOne({ id: id });

    console.log('Dealership:', dealership); // Add this line to log the dealership fetched
    if (dealership) {
      res.json(dealership);
    } else {
      res.status(404).json({ message: `Dealership with ID ${id} not found` });
    }
  } catch (error) {
    console.error('Error fetching dealership by ID:', error);
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});


// Insert review
app.post('/insert_review', async (req, res) => {
  try {
    const review = new Reviews(req.body);
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error('Error inserting review:', error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const reviews = await Reviews.find();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await Reviews.find({ dealership: id });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews by dealer ID:', error);
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});
