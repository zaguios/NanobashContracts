import Nanobash from 0xf8d6e0586b0a20c7

transaction(metadata: {String: String}, maxEditions: UInt64) {

    // Local variable for the nanobash Admin object
    let adminRef: &Nanobash.Admin
    let currPieceID: UInt64

    prepare(acct: AuthAccount) {

        // borrow a reference to the admin resource
        self.currPieceID = Nanobash.nextPieceID;
        self.adminRef = acct.borrow<&Nanobash.Admin>(from: /storage/NanobashAdmin)
            ?? panic("No admin resource in storage")
    }

    execute {
        self.adminRef.createPiece(metadata: metadata, maxEditions: maxEditions)
    }

    post {
        Nanobash.getPieceMetaData(pieceID: self.currPieceID) != nil:
            "pieceID doesnt exist"
    }
}