#!/bin/bash
SCRIPT_DIR=$(dirname $BASH_SOURCE)

docker build -t eth-dev-network $SCRIPT_DIR

CONTAINER=$(docker run -d --rm eth-dev-network)

read -s -p "Enter password: " PWD 

docker exec $CONTAINER sh -c "echo $PWD > password.txt"
docker exec -it $CONTAINER geth account new --datadir eth-dev-network --password password.txt
docker cp $CONTAINER:/geth/eth-dev-network/keystore $SCRIPT_DIR


docker stop $CONTAINER
