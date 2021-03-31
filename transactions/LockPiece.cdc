import Nanobash from 0xf8d6e0586b0a20c7

transaction(pieceID: UInt64) {

    let adminRef: &Nanobash.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&Nanobash.Admin>(from: /storage/NanobashAdmin)
            ?? panic("No admin resource in storage")
    }

    execute {
        let pieceRef = self.adminRef.borrowPiece(pieceID: pieceID)
        pieceRef.lock()
    }
}