#!/bin/bash

# Script to transfer the Vela Protocol Upgrade Authority to a Squads Multisig or Cold Wallet

PROGRAM_ID="6m9oA9MM7vMEoLfLjc24q3FqZCgGF58hGjSiJmCKtqyN"
NEW_AUTHORITY="SQd2..." # Replace with actual Squads Multisig Address on Mainnet

echo "Transferring Upgrade Authority for $PROGRAM_ID to $NEW_AUTHORITY"

# This command must be run by the current upgrade authority keypair
solana program set-upgrade-authority $PROGRAM_ID --new-upgrade-authority $NEW_AUTHORITY

echo "Upgrade authority successfully transferred. The protocol is now securely governed by the multisig."
