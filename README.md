# Listing Service

A service for searching real estate listings.

## Dev Setup

1. Copy the .env.example file into a .env file and add your Google Maps API key to the `GOOGLE_MAPS_API_KEY` environment
   variable.
2. Create a directory called "node_modules" if it doesn't already exist. This is used to map the node_modules directory
   inside the container to your local host machine via a bind mount that's setup in docker-compose.yml.
2. Run `docker-compose up` to build and run the containers.
3. Run `yarn seed_dev_data` to add test data to work with in dev.
