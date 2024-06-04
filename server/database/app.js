const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors')
const app = express()
const port = 3030;

app.use(cors())
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data['reviews']);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data['dealerships']);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API")
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
      const dealerships = await getAllDealerships();
      res.status(200).json(dealerships);
    } catch (error) {
      console.error('Error fetching dealerships:', error);
      res.status(500).json({ message: 'Error fetching dealerships', error: error.message });
    }
  });
  
    
// Express route to fetch dealer by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
    const { state } = req.params;
    try {
      const dealerships = await getDealershipsByState(state);
      res.status(200).json(dealerships);
    } catch (error) {
      console.error(`Error fetching dealerships in state ${state}:`, error);
      res.status(500).json({ message: `Error fetching dealerships in state ${state}`, error: error.message });
    }
  });
  
  
// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const dealership = await getDealershipById(id);
      if (dealership) {
        res.status(200).json(dealership);
      } else {
        res.status(404).json({ message: `Dealership with ID ${id} not found` });
      }
    } catch (error) {
      console.error(`Error fetching dealership with ID ${id}:`, error);
      res.status(500).json({ message: `Error fetching dealership with ID ${id}`, error: error.message });
    }
  });
  
  

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } )
  let new_id = documents[0]['id']+1

  const review = new Reviews({
		"id": new_id,
		"name": data['name'],
		"dealership": data['dealership'],
		"review": data['review'],
		"purchase": data['purchase'],
		"purchase_date": data['purchase_date'],
		"car_make": data['car_make'],
		"car_model": data['car_model'],
		"car_year": data['car_year'],
	});

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

async function getAllDealerships() {
    // Simulating a delay as if fetching from a database
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(dealerships);
      }, 1000);
    });
  }
  
  async function getDealershipsByState(state) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = dealerships.filter(dealer => dealer.state === state);
        resolve(result);
      }, 1000);
    });
  }
  
  async function getDealershipById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const result = dealerships.find(dealer => dealer.id === parseInt(id, 10));
        resolve(result);
      }, 1000);
    });
  }