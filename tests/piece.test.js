const createPiece = require('../transactions/javascript/createPiece');
const fetchTransaction = require('../scripts/javascript/fetchTransaction');
const getTokenMetadata = require('../scripts/javascript/getTokenMetadata');
const getPieceMetadata = require('../scripts/javascript/getPieceMetadata');
const mintNFT = require('../transactions/javascript/mintNFT');
const getNumberMinted = require('../scripts/javascript/getNumberMinted');
const getMaxEditions = require('../scripts/javascript/getMaxEditions');
const lockPiece = require('../transactions/javascript/lockPiece');
const isPieceLocked = require('../scripts/javascript/isPieceLocked')
const batchMintEditions = require('../transactions/javascript/batchMintEditions')
const addAccount = require('../transactions/javascript/addAccount')
const createAccount = require('../transactions/javascript/createAccount');

const mainContractAddress = '0xf8d6e0586b0a20c7'

const convertDictionaryToObject = (dictionary) => {
    let res = {}

    dictionary.value.forEach(item => {
        res[item.key.value] = item.value.value
    })

    return res
}

describe('Piece', () => {
    let transactionID
    let piece

    beforeAll(() => {
        return new Promise(async(resolve) => {
            transactionID = await createPiece({name: 'something', ipfs: 'something', quantity_minted: '1000'})
            piece = await fetchTransaction(transactionID) // Retrieves the piece from the transaction
            let accountAddress = await addAccount()
            let createTransactionID = await createAccount('second-account')
            resolve()
        });
    })

    it('Should be able to retrieve metadata', async() => {
        let pieceMetadata = await getPieceMetadata(piece.pieceID) // Retrieves the metadata on the piece
        let metadata = convertDictionaryToObject(pieceMetadata.value) // Converts metadata to readable form

        expect(metadata.name).toBe('something');
        expect(metadata.ipfs).toBe('something');
    });

    it('Should be able to mint different items', async() => {
        let secondTransactionID = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '10'})
        let piece2 = await fetchTransaction(secondTransactionID) // Retrieves the piece from the transaction

        expect(piece.pieceID === piece2.pieceID).toBeFalsy()

        let pieceMetadata = await getPieceMetadata(piece.pieceID) // Retrieves the metadata on the piece
        let metadata = convertDictionaryToObject(pieceMetadata.value) // Converts metadata to readable form

        let piece2Metadata = await getPieceMetadata(piece2.pieceID) // Retrieves the metadata on the piece
        let metadata2 = convertDictionaryToObject(piece2Metadata.value) // Converts metadata to readable form

        expect(metadata.name).toBe('something');
        expect(metadata2.name).toBe('other');
    });

    it('Should be mintable', async() => {
        let numberMinted = await getNumberMinted(piece.pieceID)
        let mintTransactionID = await mintNFT(mainContractAddress, piece.pieceID) // Mints NFT and returns transaction ID for the mint
        let edition = await fetchTransaction(mintTransactionID) // Retrieves editionID, pieceID, and edition
        let newNumberMinted = await getNumberMinted(piece.pieceID)

        expect(edition.pieceID).toBe(piece.pieceID)
        expect(newNumberMinted).toBe(numberMinted + 1)

        let editionMetadata = await getTokenMetadata(mainContractAddress, edition.editionID) // Fetches metadata from edition
        let metadata = convertDictionaryToObject(editionMetadata)

        expect(metadata.name).toBe('something')
    })

    it('Should be able to batch mint', async() => {
        const editionsToMint = 10

        let originalNumberMinted = await getNumberMinted(piece.pieceID)
        await batchMintEditions(mainContractAddress, piece.pieceID, editionsToMint) // Mints NFT and returns transaction ID for the mint
        let newNumberMinted = await getNumberMinted(piece.pieceID)

        expect(newNumberMinted).toBe(originalNumberMinted + editionsToMint)
    });

    it('Should not allow over maxEditions to be minted', async() => {
        let secondTransactionID = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '1'})
        let piece2 = await fetchTransaction(secondTransactionID) // Retrieves the piece from the transaction
        let initialMinted = await getNumberMinted(piece2.pieceID)

        await mintNFT(mainContractAddress, piece2.pieceID) // Should succeed
        let afterNoLockMinted = await getNumberMinted(piece2.pieceID)

        await mintNFT(mainContractAddress, piece2.pieceID) // Should fail due to max editions hit
        let afterLockMinted = await getNumberMinted(piece2.pieceID)

        expect(afterNoLockMinted).toBe(1) // Should increase by 1 since minting before max editions reached
        expect(afterLockMinted).toBe(1) // Should no longer increase since max editions reached
    });

    it('Should not allow a piece to be created without metadata', async() => {
        let secondTransactionID = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '1'}, "metadata")
        let piece2 = await fetchTransaction(secondTransactionID) // Retrieves the piece from the transaction
        expect(piece2.success).toBeFalsy()
    });

    it('Should not allow a piece to be created without maxEditions', async() => {
        let secondTransactionID = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '1'}, "maxEditions")
        let piece2 = await fetchTransaction(secondTransactionID) // Retrieves the piece from the transaction
        expect(piece2.success).toBeFalsy()
    });

    it('Should not allow unauthorized accounts to mint', async() => {
        let numberMinted = await getNumberMinted(piece.pieceID)
        await mintNFT(mainContractAddress, piece.pieceID, 'second-account') // Mints NFT and returns transaction ID for the mint
        let newNumberMinted = await getNumberMinted(piece.pieceID)

        // A new edition should not have been minted
        expect(newNumberMinted).toBe(numberMinted)
    });

    it('Should not allow unauthorized accounts to create pieces', async() => {
        let failedTransaction = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '1'}, null, 'second-account')
        let res = await fetchTransaction(failedTransaction)
        expect(res.success).toBeFalsy()
    });

    it('Should not allow authorized accounts to lock pieces', async() => {
        let failedTransaction = await lockPiece(piece.pieceID, 'second-account')
        let res = await fetchTransaction(failedTransaction)
        expect(res.success).toBeFalsy()
    })

    it('Should not allow locked pieces to be minted', async() => {
        let secondTransactionID = await createPiece({name: 'other', ipfs: 'other', quantity_minted: '10'})
        let piece2 = await fetchTransaction(secondTransactionID) // Retrieves the piece from the transaction
        let initialMinted = await getNumberMinted(piece2.pieceID)

        await mintNFT(mainContractAddress, piece2.pieceID) // Should succeed
        let afterNoLockMinted = await getNumberMinted(piece2.pieceID)
        await lockPiece(piece2.pieceID)

        await mintNFT(mainContractAddress, piece2.pieceID) // Should fail
        let afterLockMinted = await getNumberMinted(piece2.pieceID)

        let locked = await isPieceLocked(piece2.pieceID)

        expect(afterNoLockMinted).toBe(initialMinted + 1) // Should increase by 1 since minting before lock
        expect(afterLockMinted).toBe(afterNoLockMinted) // Should no longer increase since minting is locked
        expect(locked).toBeTruthy()
    });

    it('Should be able to retrieve maxEditions', async() => {
        let maxEditions = await getMaxEditions(piece.pieceID)

        expect(maxEditions).toBe(1000)
    });

    it('Should be able to retrieve numberMinted', async() => {
        let numberMinted = await getNumberMinted(piece.pieceID)
        await mintNFT(mainContractAddress, piece.pieceID)
        let newNumberMinted = await getNumberMinted(piece.pieceID)
        expect(newNumberMinted).toBe(numberMinted + 1)
    });

    it('Should be able to retrieve isPieceLocked', async() => {
        let locked = await isPieceLocked(piece.pieceID)

        expect(locked).toBeFalsy
    });
});