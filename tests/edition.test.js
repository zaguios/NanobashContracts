const createPiece = require('../transactions/javascript/createPiece');
const fetchTransaction = require('../scripts/javascript/fetchTransaction');
const getTokenMetadata = require('../scripts/javascript/getTokenMetadata');
const mintNFT = require('../transactions/javascript/mintNFT');

const mainContractAddress = '0xf8d6e0586b0a20c7'

const convertDictionaryToObject = (dictionary) => {
    let res = {}

    dictionary.value.forEach(item => {
        res[item.key.value] = item.value.value
    })

    return res
}

describe('Edition', () => {
    let transactionID
    let piece
    let mintTransactionID

    beforeAll(() => {
        return new Promise(async(resolve) => {
            transactionID = await createPiece({name: 'testname', ipfs: 'ipfslink', quantity_minted: '10'})
            piece = await fetchTransaction(transactionID) // Retrieves pieceID
            mintTransactionID = await mintNFT(mainContractAddress, piece.pieceID) // Mints NFT and returns transaction ID for the mint
            resolve()
        });
    })

    it('Should be able to get the editionID', async() => {
        let edition = await fetchTransaction(mintTransactionID) // Retrieves editionID, pieceID, and serialNumber

        expect(edition.editionID).toBeTruthy()
        expect(edition.serialNumber).toBe(1)
    });

    it('Should be able to retrieve the metadata from the edition', async() => {
        let edition = await fetchTransaction(mintTransactionID)
        let editionMetadata = await getTokenMetadata(mainContractAddress, edition.editionID) // Fetches metadata from edition
        let metadata = convertDictionaryToObject(editionMetadata)

        expect(metadata.name).toBe('testname')
        expect(metadata.ipfs).toBe('ipfslink')
    });
})