import Nanobash from 0xf8d6e0586b0a20c7

transaction(pieceID: UInt64, quantity: UInt64, recipientAddr: Address) {

    let adminRef: &Nanobash.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&Nanobash.Admin>(from: /storage/NanobashAdmin)!
    }

    execute {
        let pieceRef = self.adminRef.borrowPiece(pieceID: pieceID)
        let collection <- pieceRef.batchMintEditions(quantity: quantity)
        let recipient = getAccount(recipientAddr)

        let receiverRef = recipient.getCapability(/public/EditionCollection)!.borrow<&{Nanobash.EditionCollectionPublic}>()
            ?? panic("Cannot borrow a reference to the recipient's collection")
        receiverRef.batchDeposit(tokens: <-collection)
    }
}