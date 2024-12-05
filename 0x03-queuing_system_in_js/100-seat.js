import { createClient } from 'redis';
import { createQueue } from 'kue';
import { promisify } from 'util';
import express from 'express';

// Create Redis client
const redisClient = createClient();

redisClient.on('connect', () => {
  console.log('Redis client connected to the server');
});

redisClient.on('error', (err) => {
  console.log(`Redis client not connected to the server: ${err}`);
});

// Promisify Redis operations
const asyncGet = promisify(redisClient.get).bind(redisClient);
const asyncSet = promisify(redisClient.set).bind(redisClient);

// Initialize seat reservation
let reservationEnabled = true;

// Function to set the available seats
async function reserveSeat(number) {
  try {
    await asyncSet('available_seats', number);
  } catch (error) {
    console.error(`Error reserving seat: ${error.message}`);
  }
}

// Function to get the current available seats
async function getCurrentAvailableSeats() {
  try {
    const seats = await asyncGet('available_seats');
    return seats !== null ? parseInt(seats, 10) : 0;
  } catch (error) {
    console.error(`Error fetching available seats: ${error.message}`);
    return 0;
  }
}

// Create Kue queue
const queue = createQueue();

// Create Express app
const app = express();

// Route to fetch available seats
app.get('/available_seats', async (req, res) => {
  const availableSeats = await getCurrentAvailableSeats();
  res.json({ numberOfAvailableSeats: availableSeats });
});

// Route to reserve a seat
app.get('/reserve_seat', async (req, res) => {
  if (!reservationEnabled) {
    res.json({ status: 'Reservation are blocked' });
    return;
  }

  const job = queue.create('reserve_seat', { seat: 1 }).save((error) => {
    if (error) {
      res.json({ status: 'Reservation failed' });
    } else {
      res.json({ status: 'Reservation in process' });
    }
  });

  job.on('complete', () => {
    console.log(`Seat reservation job ${job.id} completed`);
  });

  job.on('failed', (error) => {
    console.log(`Seat reservation job ${job.id} failed: ${error.message}`);
  });
});

// Route to process the queue
app.get('/process', (req, res) => {
  res.json({ status: 'Queue processing' });

  queue.process('reserve_seat', async (job, done) => {
    const seats = await getCurrentAvailableSeats();

    if (seats <= 0) {
      reservationEnabled = false;
      done(new Error('Not enough seats available'));
    } else {
      await reserveSeat(seats - 1);
      if (seats - 1 === 0) {
        reservationEnabled = false;
      }
      done();
    }
  });
});

// Start the server
const port = 1245;
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});

// Initialize available seats
reserveSeat(50);
