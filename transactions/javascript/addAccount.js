const { exec } = require('child_process');

function addAccount() {
    return new Promise(resolve => {
        exec(`flow accounts create --key 958296d26c34195f13a7cab7ca1aef34755a0cba3c029fd78cf707452a3100cfc35fe52bbeceae7292d389e37788d7976d51c2fe9d0f65410e5688c45380fed8 --signer emulator-account --results`, (error, data, stderr) => {
            if (data.indexOf('address (Address): ') !== -1) {
                let address = data.substr(data.indexOf('address (Address): ') + 19, 16)
                resolve(address)
            } else {
                resolve(false)
            }
        })
    })
}

module.exports = addAccount;