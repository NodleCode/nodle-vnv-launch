#!/bin/bash

NODE_NAME="novnv-05"
P2P_PORT=${P2P_PORT:-"30354"}
WS_PORT=${WS_PORT:-"44244"}
DATA_PATH=${DATA_PATH:-"$PWD/data/$NODE_NAME"}
NODLE_BIN=${NODLE_BIN:-"$PWD/bin/nodle-chain"}
CHAIN_CFG=${CHAIN_CFG:-"local"}

$NODLE_BIN \
  --chain "$CHAIN_CFG" \
  --base-path "$DATA_PATH" \
  --pruning=archive \
  --ws-port "$WS_PORT" \
  --port "$P2P_PORT" \
  --name="$NODE_NAME" \
  --unsafe-ws-external \
  --unsafe-rpc-external \
  --rpc-methods=Unsafe \
  --rpc-cors=all \
  --validator \
  -l sync=debug,afg=trace,babe=trace,telemetry=debug,txpool=info,usage=debug \
  -l db=info,gossip=info,peerset=info,state-db=info,state-trace=info,sub-libp2p=info,trie=info \
  -l wasm-executor=info,wasm-heap=info \
  -l pallet_nodle_staking=trace \
  --bootnodes="/ip4/127.0.0.1/tcp/30344/p2p/12D3KooWJ7UA1uxvVV4V62z6GMMcB5RcLu3BeBvBpxeXX7xEQPYS"
