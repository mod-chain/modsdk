#!/bin/bash

SIGNATURE="0x5af05bbbab224d9256b793d409d61c0cf2dc743ee272ef330442a28e7f1c91466079050394dde8c96115c928b5e420710af5805070be07d986ee04d6ef8a3387"

DATA="123"

KEY="5DyPNNRLbrLWgPZPVES45LfEgFKyfmPbrtJkFLiSbmWLumYj"

HEADERS="Content-Type: application/json"

JSON_DATA="{\"data\":\"$DATA\",\"server\":{\"address\":\"$KEY\",\"signature\":\"$SIGNATURE\"}}"

URL="http://localhost:3000/v1/verify"


curl -sS -X POST -H "$HEADERS" -d "$JSON_DATA" $URL | jq
