# Listing Service

A service for searching real estate listings.

## Dev Setup

1. Copy the env.example file into a .env file and add your Google Maps API key to the `GOOGLE_MAPS_API_KEY` environment
   variable. The makeup a username and password for the database and add them to the `DB_USER` and `DB_PASSWORD` variables.
2. Run `docker-compose up` to build and run the containers.
3. Run `yarn seed_dev_data` to add test data to work with in dev.
