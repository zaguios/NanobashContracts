const { exec } = require('child_process');

function createPiece(piece, exclude=null, signer='emulator-account') {
    let args = [
        {
            type: "Dictionary",
            value: [
                {
                    key: {
                        type: "String",
                        value: "name"
                    },
                    value: {
                        type: "String",
                        value: piece.name
                    }
                },
                {
                    key: {
                        type: "String",
                        value: "ipfs"
                    },
                    value: {
                        type: "String",
                        value: piece.ipfs
                    }
                }
            ]
        },
        {
            type: "UInt64",
            value: (piece.quantity_minted) + ""
        }
    ]

    if (exclude === "metadata") {
        args[0].value = []
    } else if (exclude === "maxEditions") {
        args.splice(1, 1)
    }

    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/CreatePiece.cdc --signer ${signer} --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            } else {
                resolve(false)
            }
        });
    })
}

module.exports = createPiece;