const { exec } = require('child_process');

function sendNFT(address, editionID, signer='emulator-account') {
    let args = [
        {
            type: "Address",
            value: address
        },
        {
            type: "UInt64",
            value: `${editionID}`
        }
    ]

    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/SendNFT.cdc --signer ${signer} --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            } else {
                resolve(false)
            }
        });
    })
}

module.exports = sendNFT;