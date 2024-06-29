const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'SiteSeekApp',
    password: '1111',
    port: 5432,
});

// Create an event
router.post('/events', async (req, res) => {
    const { name, description, country, city, district, town, place, latitude, longitude, google_maps_link, frequency, capacity, gender_allowance, time, duration } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO Events (name, description, country, city, district, town, place, latitude, longitude, google_maps_link, frequency, capacity, gender_allowance, time, duration)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             RETURNING *`, [name, description, country, city, district, town, place, latitude, longitude, google_maps_link, frequency, capacity, gender_allowance, time, duration]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Read all events
router.get('/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Events');
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Read a single event
router.get('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Events WHERE event_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update an event
router.put('/events/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, country, city, district, town, place, latitude, longitude, google_maps_link, frequency, capacity, gender_allowance, time, duration } = req.body;
    try {
        const result = await pool.query(
            `UPDATE Events SET name = $1, description = $2, country = $3, city = $4, district = $5, town = $6, place = $7, latitude = $8, longitude = $9, google_maps_link = $10, frequency = $11, capacity = $12, gender_allowance = $13, time = $14, duration = $15 WHERE event_id = $16 RETURNING *`,
            [name, description, country, city, district, town, place, latitude, longitude, google_maps_link, frequency, capacity, gender_allowance, time, duration, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an event
router.delete('/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM Events WHERE event_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
