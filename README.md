# Product Browser API

## Overview

A backend service for browsing 200,000+ products with:

* Cursor-based pagination
* Category filtering
* Snapshot consistency
* PostgreSQL database

The API guarantees users do not see duplicate products or miss products while browsing, even if new products are added or updated concurrently.

## Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Neon Database

## Features

### Product Browsing

* Newest products first
* Fast pagination
* Category filtering

### Cursor Pagination

Uses cursor-based pagination instead of OFFSET pagination.

Benefits:

* Better performance
* No duplicate records
* No skipped records
* Scales to large datasets

### Snapshot Consistency

Each browsing session receives a snapshot timestamp.

All subsequent requests use the same snapshot, ensuring:

* No duplicates
* No missing products
* Consistent results while data changes

## Database Schema

Products table:

* id
* name
* category
* price
* created_at
* updated_at

Indexes:

* (updated_at DESC, id DESC)
* (category, updated_at DESC, id DESC)

## Setup

Install dependencies:

npm install

Create .env:

DATABASE_URL=your_connection_string
PORT=3000

Run server:

node server.js

## Seed Database

Generate 200,000 products:

node seed.js

## API

### Get Products

GET /products

Query Parameters:

* limit
* category
* snapshot_time
* cursor

Examples:

/products

/products?limit=20

/products?category=Category 3

/products?snapshot_time=...&cursor=...

## Consistency Test

Insert 50 new products:

node simulate-updates.js

Continue browsing using the old snapshot_time and cursor.

Newly inserted products will not appear, proving snapshot consistency.

## Author

Harsh Raj
