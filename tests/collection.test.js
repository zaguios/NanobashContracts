const sendNFT = require('../transactions/javascript/sendNFT');
const batchSend = require('../transactions/javascript/batchSend')
const createPiece = require('../transactions/javascript/createPiece');
const fetchTransaction = require('../scripts/javascript/fetchTransaction');
const getTokenMetadata = require('../scripts/javascript/getTokenMetadata');
const mintNFT = require('../transactions/javascript/mintNFT');
const addAccount = require('../transactions/javascript/addAccount')
const createAccount = require('../transactions/javascript/createAccount');

const mainContractAddress = '0xf8d6e0586b0a20c7'
const secondAccountAddress = '0x01cf0e2f2f715450'

describe('Collection', () => {
    let piece
    let edition

    beforeAll(() => {
        return new Promise(async(resolve) => {
            let transactionID = await createPiece({name: 'something', ipfs: 'something', quantity_minted: '1000'})
            piece = await fetchTransaction(transactionID)
            let mintTransactionID = await mintNFT(mainContractAddress, piece.pieceID) // Mints NFT and returns transaction ID for the mint
            edition = await fetchTransaction(mintTransactionID) // Retrieves editionID, pieceID, and edition
            resolve()
        });
    })

    it('Should be able to create a new collection for an account', async() => {
        let accountAddress = await addAccount()
        let createTransactionID = await createAccount('second-account')
    });

    it('Should be able to send an NFT between users', async() => {
        let originalHolder = await getTokenMetadata(mainContractAddress, edition.editionID)
        let futureHolder = await getTokenMetadata(secondAccountAddress, edition.editionID)

        expect(originalHolder).toBeTruthy()
        expect(futureHolder).toBeFalsy()

        let sendTransactionID = await sendNFT(secondAccountAddress, edition.editionID, 'emulator-account')
        originalHolder = await getTokenMetadata(mainContractAddress, edition.editionID)
        futureHolder = await getTokenMetadata(secondAccountAddress, edition.editionID)

        expect(originalHolder).toBeFalsy()
        expect(futureHolder).toBeTruthy()
    });

    it('Should be able to batch send NFTs between users', async() => {
        let mintTransactionID2 = await mintNFT(mainContractAddress, piece.pieceID)
        let edition2 = await fetchTransaction(mintTransactionID2)
        let mintTransactionID3 = await mintNFT(mainContractAddress, piece.pieceID)
        let edition3 = await fetchTransaction(mintTransactionID3)

        let originalHolder = await getTokenMetadata(mainContractAddress, edition3.editionID)
        let futureHolder = await getTokenMetadata(secondAccountAddress, edition3.editionID)

        expect(originalHolder).toBeTruthy()
        expect(futureHolder).toBeFalsy()

        await batchSend(secondAccountAddress, [edition2.editionID, edition3.editionID])

        originalHolder = await getTokenMetadata(mainContractAddress, edition3.editionID)
        futureHolder = await getTokenMetadata(secondAccountAddress, edition3.editionID)

        expect(originalHolder).toBeFalsy()
        expect(futureHolder).toBeTruthy()
    });
})