#!/bin/sh

geth --dev --datadir data --password password --http --http.addr $(hostname -i) --http.port 8545 --allow-insecure-unlock --http.api personal,eth,net,web3 --http.vhosts "*" -http.corsdomain "*"