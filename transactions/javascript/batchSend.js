const { exec } = require('child_process');

function batchSend(address, editionIDs, signer='emulator-account') {
    let args = [
        {
            type: "Address",
            value: address
        },
        {
            type: "Array",
            value: []
        }
    ]

    editionIDs.forEach(id => {
        args[1].value.push({
            type: "UInt64",
            value: `${id}`
        })
    })

    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/BatchSend.cdc --signer ${signer} --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            } else {
                resolve(false)
            }
        });
    })
}

module.exports = batchSend;