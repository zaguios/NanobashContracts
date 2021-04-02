const { exec } = require('child_process');

function getNumberMinted(pieceID) {
    let args = [
        {
            type: "UInt64",
            value: `${pieceID}`
        }
    ]


    return new Promise((resolve, reject) => {
        exec(`flow scripts execute --code=./scripts/GetNumberMinted.cdc --args '${JSON.stringify(args)}'`, (error, data, stderr) => {
            let res = JSON.parse(data.substr(data.indexOf('{')))
            
            resolve(parseInt(res.value.value))
        });
    })
}

module.exports = getNumberMinted;