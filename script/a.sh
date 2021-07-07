#!/bin/bash

NODE_NAME="alice"
P2P_PORT=${P2P_PORT:-"30344"}
WS_PORT=${WS_PORT:-"44190"}
DATA_PATH=${DATA_PATH:-"$PWD/data/$NODE_NAME"}
NODLE_BIN=${NODLE_BIN:-"$PWD/bin/nodle-chain"}
CHAIN_CFG=${CHAIN_CFG:-"local"}

$NODLE_BIN \
  --chain "$CHAIN_CFG" \
  --base-path "$DATA_PATH" \
  --pruning=archive \
  --ws-port "$WS_PORT" \
  --port "$P2P_PORT" \
  --"$NODE_NAME" \
  --unsafe-ws-external \
  --unsafe-rpc-external \
  --rpc-methods=Unsafe \
  --rpc-cors=all \
  -l afg=debug,babe=trace \
  -l pallet_nodle_staking=trace \
  --node-key="721ad2a40449e78581c787b2cff1c3fb2148e0e6b7e083addc6c7634f55aa83e"
