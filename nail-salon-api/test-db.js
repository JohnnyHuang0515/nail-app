const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres@localhost:5432/postgres',
});

async function test() {
    try {
        await client.connect();
        console.log('Connected successfully to postgres db');

        const fs = require('fs');
        const path = require('path');
        const sql = fs.readFileSync(path.join(__dirname, 'manual_migration.sql'), 'utf8');

        // Connect to nail_salon database
        await client.end();

        const dbClient = new Client({
            connectionString: 'postgresql://postgres@localhost:5432/nail_salon',
        });

        try {
            await dbClient.connect();

            // Execute SQL
            await dbClient.query(sql);
            console.log('Database schema created successfully via SQL');

            await dbClient.end();
        } catch (err) {
            console.error('Error executing SQL on nail_salon:', err);
        }
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

test();
