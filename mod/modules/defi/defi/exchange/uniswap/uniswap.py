
import time
import csv
import os
import json
import requests
from typing import Tuple

GET_RESERVES_SELECTOR = '0x0902f1ac'

class UniswapAgent:
    """Minimal Uniswap V2 agent: fetch reserves, predict swap outputs, and record guesses."""

    def __init__(self, rpc_url: str, pairs: list, log_path: str = '/app/data/guesses.csv'):
        self.rpc_url = rpc_url
        self.pairs = [p.lower() for p in pairs]
        self.log_path = log_path
        os.makedirs(os.path.dirname(self.log_path), exist_ok=True)
        if not os.path.exists(self.log_path):
            with open(self.log_path, 'w', newline='') as f:
                csv.writer(f).writerow(['ts', 'pair', 'direction', 'amount_in', 'predicted_out', 'reserve_in', 'reserve_out'])

    # ----- PRIVATE METHODS -----

    def _json_rpc(self, method: str, params: list):
        payload = {'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': params}
        r = requests.post(self.rpc_url, json=payload, timeout=15)
        r.raise_for_status()
        j = r.json()
        if 'error' in j:
            raise RuntimeError(j['error'])
        return j['result']

    # ----- PUBLIC METHODS -----

    def get_reserves(self, pair: str) -> Tuple[int, int, int]:
        call = {'to': pair, 'data': GET_RESERVES_SELECTOR}
        result = self._json_rpc('eth_call', [call, 'latest'])
        b = bytes.fromhex(result[2:])
        r0 = int.from_bytes(b[0:32], 'big')
        r1 = int.from_bytes(b[32:64], 'big')
        ts = int.from_bytes(b[64:96], 'big')
        return r0, r1, ts

    @staticmethod
    def compute_amount_out(amount_in: int, reserve_in: int, reserve_out: int, fee: float = 0.003) -> int:
        if amount_in <= 0 or reserve_in <= 0 or reserve_out <= 0:
            return 0
        amount_in_with_fee = amount_in * (1 - fee)
        numerator = amount_in_with_fee * reserve_out
        denominator = reserve_in + amount_in_with_fee
        return int(numerator // denominator)

    def predict_swap(self, pair: str, amount_in: int, direction: str = '0->1') -> dict:
        r0, r1, ts = self.get_reserves(pair)
        if direction == '0->1':
            out = self.compute_amount_out(amount_in, r0, r1)
            rin, rout = r0, r1
        else:
            out = self.compute_amount_out(amount_in, r1, r0)
            rin, rout = r1, r0
        guess = {
            'ts': int(time.time()),
            'pair': pair,
            'direction': direction,
            'amount_in': amount_in,
            'predicted_out': out,
            'reserve_in': rin,
            'reserve_out': rout
        }
        self.record_guess(guess)
        return guess

    def record_guess(self, guess: dict):
        with open(self.log_path, 'a', newline='') as f:
            csv.writer(f).writerow([guess[k] for k in ['ts', 'pair', 'direction', 'amount_in', 'predicted_out', 'reserve_in', 'reserve_out']])

    def run_loop(self, poll_interval: int = 30, default_amount: int = 10**18):
        while True:
            for pair in self.pairs:
                try:
                    for direction in ['0->1', '1->0']:
                        g = self.predict_swap(pair, default_amount, direction)
                        print(f"[{pair}] {direction} in {default_amount} -> out {g['predicted_out']}")
                except Exception as e:
                    print('Error:', e)
            time.sleep(poll_interval)