import Nanobash from 0xf8d6e0586b0a20c7

transaction(recipientAddr: Address, pieceID: UInt64) {
    let adminRef: &Nanobash.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&Nanobash.Admin>(from: /storage/NanobashAdmin)!
    }

    execute {
        let pieceRef = self.adminRef.borrowPiece(pieceID: pieceID)

        let piece <- pieceRef.mintEdition()

        let recipient = getAccount(recipientAddr)

        let receiverRef = recipient.getCapability(/public/EditionCollection).borrow<&{Nanobash.EditionCollectionPublic}>()
            ?? panic("Cannot borrow a reference to the recipient's edition collection")

        log(piece.id)

        receiverRef.deposit(token: <-piece)
    }
}