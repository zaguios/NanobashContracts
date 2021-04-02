const { exec } = require('child_process');

function fetchTransaction(transactionID) {
    return new Promise((resolve, reject) => {
        exec(`flow transactions status ${transactionID}`, (error, data, stderr) => {
            if (data.indexOf('Execution Error:') !== -1) {
                resolve({success: false})
                return
            }

            let res = {success: true}

            if (data.indexOf('id (UInt64): ') !== -1) {
                let editionID = parseInt(data.substr(data.indexOf('editionID (UInt64): ') + 20))
                res.editionID = editionID
            }

            if (data.indexOf('pieceID (UInt64): ') !== -1) {
                let pieceID = parseInt(data.substr(data.indexOf('pieceID (UInt64): ') + 18))
                res.pieceID = pieceID
            }

            if (data.indexOf('serialNumber (UInt64): ') !== -1) {
                let serialNumber = parseInt(data.substr(data.indexOf('serialNumber (UInt64): ') + 23))
                res.serialNumber = serialNumber
            }

            resolve(res)
        });
    })
}

module.exports = fetchTransaction;