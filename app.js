const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');
const eventsRouter = require('./routes/events');

const app = express();
const port = 3000;



// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public/SiteSeeker/dist')));
app.use('/api', eventsRouter);




// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SiteSeekApp',
    password: '1111',
    port: 5432,
});

// Basic route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/SiteSeeker/dist', 'index.html'));
});





app.get('/api/countries', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT country FROM events');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cities', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT city FROM events');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/districts', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT district FROM events');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/locationTypes', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT frequency AS locationType FROM events');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events', async (req, res) => {
    const { country, city, district, locationType } = req.query;

    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    if (country) {
        query += ' AND country = $1';
        params.push(country);
    }
    if (city) {
        query += ' AND city = $2';
        params.push(city);
    }
    if (district) {
        query += ' AND district = $3';
        params.push(district);
    }
    if (locationType) {
        query += ' AND time = $4';
        params.push(locationType);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM events WHERE event_id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/events/:id/reviews', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM reviews WHERE event_id = $1', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/events/:id/reviews', async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    try {
        await pool.query('INSERT INTO reviews (event_id, user, comment) VALUES ($1, $2, $3)', [id, 'Anonymous', comment]);
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// // Endpoint to get distinct countries
// app.get('/api/countries', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT DISTINCT country FROM Events');
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Endpoint to get distinct cities
// app.get('/api/cities', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT DISTINCT city FROM Events');
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Endpoint to get distinct districts
// app.get('/api/districts', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT DISTINCT district FROM Events');
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Endpoint to get distinct location types
// app.get('/api/locationTypes', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT DISTINCT frequency AS locationType FROM Events');
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // Contact form endpoint
// app.post('/api/contact', (req, res) => {
//     const { email, query } = req.body;
//     console.log(`Received query from ${email}: ${query}`);
//     res.status(200).json({ message: 'Query received' });
// });






// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
