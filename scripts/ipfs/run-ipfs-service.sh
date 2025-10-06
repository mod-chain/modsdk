#!/bin/bash

set -euo pipefail


PWD=$(pwd)  

cp $PWD/.env $PWD/ipfs-service/.env

source $PWD/ipfs-service/.env

# Start IPFS service
cd $PWD/ipfs-service

bash scripts/start-services.sh