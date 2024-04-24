#!/bin/bash

# Stop and remove containers defined in docker-compose.yml
docker-compose down

# Remove Docker images
docker rmi ps8back:v0.1

# Remove data directory (use sudo if necessary)
sudo rm -rf data

# Start containers defined in docker-compose.yml in detached mode
docker-compose up -d
