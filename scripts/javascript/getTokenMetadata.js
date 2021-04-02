const { exec } = require('child_process');

function getTokenMetadata(address, editionID) {
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


    return new Promise((resolve, reject) => {
        exec(`flow scripts execute --code=./scripts/GetTokenMetadata.cdc --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            if (data.indexOf('Failed to submit executable script') !== -1) {
                resolve(false)
                return
            }

            let res = JSON.parse(data.substr(data.indexOf('{')))
            resolve(res)
        });
    })
}

module.exports = getTokenMetadata;