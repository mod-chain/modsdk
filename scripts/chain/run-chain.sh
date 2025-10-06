#!/bin/bash

set -euo pipefail

PWD=$(pwd)

cp $PWD/.env $PWD/chain/.env

source $PWD/chain/.env

cd $PWD/chain

git stash

git checkout feat/testnet

cargo build --release

mkdir -p $HOME/.modnet/data

pm2 start "bash ./scripts/start_node.sh" --name modnet-node

pm2 save


