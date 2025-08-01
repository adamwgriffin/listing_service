# Listing Service

A service for searching real estate listings written in Typescript with Koa.

Currently we only have boundaries for Seattle, so the
search is limited to Seattle neighborhoods. The listing data is automatically
generated using Faker. These are not real listings.

# Architecture of the Service

The service mostly follows a MVC pattern. The model part is implimented as
Mongoose models. However, the models are not used directly. We also follow a
repository pattern to interact with the models. These repository modules can be
located in the `repositories/` directory.

The views in the `views/` directory are just plain javascript functions that put the data that the controller
receives into plain javascript objects to be returned in the request by the controller.

The `routes/` directory has all the different routes but they are really just
used to wire up the route handler and middleware functions. The route handler
functions serve as the controllers in this MVC app, so they are in the
`controllers/` directory.

The `middlewares/` directory unsurprisingly includes all middleware, the most
important of which is the validationMiddleware. This middleware validates the
incoming request params by using Zod to parse a schema that matches the expected
shape of the request. These schemas are found in the `zod_schemas/` directory.
They are also used to generate some Typescript types for the app. If the request is
invalid the validationMiddleware middleware will throw an exception that is
handled by the errorMiddleware and returned in the response.

We also follow a service layer pattern. The modules under the `services/`
directory handle the logic for a particular grouping: the listingSearchService
has functions related to listing search requests, while the geocoderService handles
geocoding requests to the Google Maps Geocoder.

We have a Redis cache setup using the cache-manager library from the Cacheable
project. Right now this cache is only used for caching requests to the Google
Maps Geocoder API. This is for the sake of performance but, more importantly,
it's used to avoid making too many requests to the API, which can cost money.

## Installation

1. Copy the env.example file into a .env file and add the necessary values to
   the environment variables in the file (see Google Maps section).
2. Run `npm install`.
3. Run `docker-compose up` to build and run the containers.

Run the tests with `npm run test`.

### Google Maps

The service uses the Google Maps Geocoding API to find coordinates for address
strings, and to help generate listing data. Setting up Google Maps requires creating
an API key on [Google Cloud Console](https://console.cloud.google.com/). You
have to enable the Geocoding API.

After that's done, just add your Google Maps API key to the
`GOOGLE_MAPS_API_KEY` environment variable.

## Generating data

The mongodb Docker service automatically adds the dev data in the database dump
archive located under `docker/init-mongo/db.dump.archive.gz`. That should be
enough for general purposes. There's a script under `src/bin/dump-mongo.sh` that
can be used to create a new archive from the data that is currently in the db if
the need arises.

We have a number of scripts that are used to generate fake data for development
and testing. The scripts are all in the `src/bin/` directory and the data is in the
`src/data/` directory.

- `generate_listing_geocode_data`: This one only generates a file with geocode
  data for a set of geospatial boundaries. You feed it a file with an array of
  GeoJSON boundaries and it will randomly generate addresses and coordinates
  within each of those boundaries. **Be careful when running this script!** It
  makes requests to the Google Maps Geocoding API which can cost a lot of money
  if there are overages.

- `generate_listing_data`: Takes a json file with an array of geocode data
  (address, coordinates, etc) and generates fake listing data from it using
  Faker.js.

- `convert_seattle_neighborhood_boundaries`: Takes the City of Seattle GeoJSON
  boundary data and converts it into a form we can use in the database.

- `seed_listing_data`/`seed_boundary_data`: Just takes the static json files
  that were generated and saves them in the database.
