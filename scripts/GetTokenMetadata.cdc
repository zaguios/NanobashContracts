import Nanobash from 0xf8d6e0586b0a20c7

pub fun main(account: Address, id: UInt64): {String: String} {

    let collectionRef = getAccount(account).getCapability(/public/EditionCollection)
        .borrow<&{Nanobash.EditionCollectionPublic}>()
        ?? panic("Could not get public edition collection reference")

    let token = collectionRef.borrowEdition(id: id)
        ?? panic("Could not borrow a reference to the specified edition")

    let data = token.data

    let metadata = Nanobash.getPieceMetaData(pieceID: data.pieceID) ?? panic("Piece doesn't exist")

    log(metadata)

    return metadata
}