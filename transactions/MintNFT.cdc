import Nanobash from 0xf8d6e0586b0a20c7

transaction(recipientAddr: Address, pieceID: UInt64) {
    // local variable for the admin reference
    let adminRef: &Nanobash.Admin

    prepare(acct: AuthAccount) {
        // borrow a reference to the Admin resource in storage
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

        log("This ia a test")
    }
}