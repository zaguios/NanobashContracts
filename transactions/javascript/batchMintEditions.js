const { exec } = require('child_process');

function mintNFT(address, pieceID, quantity) {
    let args = [
        {
            type: "UInt64",
            value: `${pieceID}`
        },
        {
            type: "UInt64",
            value: `${quantity}`
        },
        {
            type: "Address",
            value: address
        }
    ]

    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/BatchMintEdition.cdc --signer emulator-account --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            }
        });
    })
}

module.exports = mintNFT;