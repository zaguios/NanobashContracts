# Nanobash

## Introduction

This repository contains the smart contracts and transactions that implement
the core functionality of Nanobash.

The smart contracts are written in Cadence, a new resource oriented
smart contract programming language designed for the Flow Blockchain.

## Testing

Setup your `flow.json` to look like

```
{
	"emulators": {
		"default": {
			"port": 3569,
			"serviceAccount": "emulator-account"
		}
	},
	"contracts": {
		"Nanobash": "./cadence/contracts/Nanobash.cdc",
        "NonFungibleToken": "./cadence/contracts/NonFungibleToken.cdc"
    },
	"networks": {
		"emulator": {
			"host": "127.0.0.1:3569",
			"chain": "flow-emulator"
		}
	},
	"accounts": {
		"emulator-account": {
            "address": "f8d6e0586b0a20c7",
            "keys": "1aed285bd6edfd8aa21b6e1ea6f28e75a88d804647f3d8e6b8924162c966d074",
            "chain": "flow-emulator"
        }
	},
	"deployments": {
		"emulator": {
			 "emulator-account": ["Nanobash", "NonFungibleToken"]
		}
    }
}
```

Then run the following commands

Terminal 1: `flow project start-emulator`
Terminal 2: `flow project deploy`

After you have done this adjust your `flow.json` accounts section to be:

```
"accounts": {
    "emulator-account": {
        "address": "f8d6e0586b0a20c7",
        "privateKey": "1aed285bd6edfd8aa21b6e1ea6f28e75a88d804647f3d8e6b8924162c966d074",
        "chain": "flow-emulator",
        "sigAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256"
    },
    "second-account": {
        "address": "01cf0e2f2f715450",
        "keys": "55ed39765b3b9430ce009741367f86cdb83c521aa3468d50486f3e47a8d61a7f",
        "chain": "flow-emulator",
        "sigAlgorithm": "ECDSA_P256",
        "hashAlgorithm": "SHA3_256"
    }
}
```

Then run `yarn`

To run the tests run (Not in parallel since the transaction ids will get confused)

`yarn test tests/piece.test.js`
`yarn test tests/collection.test.js`
`yarn test tests/edition.test.js`