#!/bin/bash

# Start MongoDB in the background
service mongodb start

# Start Redis in the background
service redis-server start

# Start the Node.js app
yarn start:single
