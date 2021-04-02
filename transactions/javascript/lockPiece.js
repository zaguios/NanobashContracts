const { exec } = require('child_process');

function lockPiece(pieceID, signer='emulator-account') {
    let args = [
        {
            type: "UInt64",
            value: `${pieceID}`
        }
    ]

    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/LockPiece.cdc --signer ${signer} --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            } else {
                resolve(false)
            }
        });
    })
}

module.exports = lockPiece;