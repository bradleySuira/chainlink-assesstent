#!/bin/bash

# stop and remove existing containers
docker stop chainlink-db || true && docker rm chainlink-db || true
docker stop chainlink-rinkeby || true && docker rm chainlink-rinkeby || true
docker network rm chainlink || true

docker network create chainlink

PWD=$(pwd)
# Database
docker run --network=chainlink -it --rm -p 5432:5432 --name chainlink-db -v $PWD/data:/var/lib/postgresql/data/pgdata --env-file=db.env -d postgres

# Chaninlink
docker run --network=chainlink --name chainlink-rinkeby -p 6688:6688 -v $PWD/chainlink-rinkeby:/chainlink -it --env-file=chainlink.env smartcontract/chainlink local n -p /chainlink/.password -a /chainlink/.api

## docker exec -it chainlink-rinkeby /bin/bash
## chainlink admin login
## chainlink initiators create NAME /