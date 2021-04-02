const { exec } = require('child_process');

function createAccount(signer='emulator-account') {
    return new Promise(resolve => {
        exec(`flow transactions send --code ./transactions/CreateAccount.cdc --signer ${signer}`, (error, data, stderr) => {
            if (data.indexOf("Successfully submitted transaction with ID") != -1) {
                let transactionID = data.substr(data.indexOf(' ID ') + 4, 64)
                resolve(transactionID)
            } else {
                resolve(false)
            }
        });
    })
}

module.exports = createAccount;