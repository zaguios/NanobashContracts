import NonFungibleToken from "./NonFungibleToken.cdc"

pub contract Nanobash: NonFungibleToken {
    pub var nextPieceID: UInt64
    pub var totalSupply: UInt64
    access(self) var pieces: @{UInt64: Piece}

    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event EditionMinted(id: UInt64, pieceID: UInt64, serialNumber: UInt64)
    pub event PieceCreated(id: UInt64, metadata: {String: String})
    
    pub resource Piece {
        pub let pieceID: UInt64
        pub let metadata: {String: String}
        pub var numberMinted: UInt64
        pub let maxEditions: UInt64
        // Prevents new editions from being minted
        pub var locked: Bool

        init(metadata: {String: String}, maxEditions: UInt64) {
            pre {
                metadata.length != 0: "New Piece metadata cannot be empty"
            }
            self.pieceID = Nanobash.nextPieceID
            self.metadata = metadata
            self.maxEditions = maxEditions
            self.numberMinted = 0
            self.locked = false
            Nanobash.nextPieceID = Nanobash.nextPieceID + (1 as UInt64)
            emit PieceCreated(id: self.pieceID, metadata: self.metadata)
        }

        pub fun lock() {
            if !self.locked {
                self.locked = true
            }
        }

        pub fun mintEdition(): @NFT {
            pre {
                !self.locked: "Cannot add the piece to the Set after the set has been locked."
                self.numberMinted < self.maxEditions: "Maximum editions minted."
            }

            let newEdition: @NFT <- create NFT(serialNumber: self.numberMinted + (1 as UInt64), pieceID: self.pieceID)

            self.numberMinted = self.numberMinted + (1 as UInt64)

            return <-newEdition
        }

        pub fun batchMintEditions(quantity: UInt64): @Collection {
            let newCollection <- create Collection()

            var i: UInt64 = 0
            while i < quantity {
                newCollection.deposit(token: <- self.mintEdition())
                i = i + (1 as UInt64)
            }

            return <-newCollection
        }
    }

    pub struct EditionData {
        pub let pieceID: UInt64
        pub let serialNumber: UInt64

        init(pieceID: UInt64, serialNumber: UInt64) {
            self.pieceID = pieceID
            self.serialNumber = serialNumber
        }
    }

    pub resource NFT: NonFungibleToken.INFT {

        pub let id: UInt64
        pub let data: EditionData

        init(serialNumber: UInt64, pieceID: UInt64) {
            Nanobash.totalSupply = Nanobash.totalSupply + (1 as UInt64)
            self.id = Nanobash.totalSupply
            self.data = EditionData(pieceID: pieceID, serialNumber: serialNumber)
            emit EditionMinted(id: self.id, pieceID: pieceID, serialNumber: serialNumber)
        }
    }

    pub resource Admin {
        pub fun createPiece(metadata: {String: String}, maxEditions: UInt64): UInt64 {
            var newPiece <- create Piece(metadata: metadata, maxEditions: maxEditions)
            let newID = newPiece.pieceID

            Nanobash.pieces[newID] <-! newPiece
            return newID
        }

        pub fun borrowPiece(pieceID: UInt64): &Piece {
            pre {
                Nanobash.pieces[pieceID] != nil: "Cannot borrow Piece: The Piece doesn't exist"
            }
            
            return &Nanobash.pieces[pieceID] as &Piece
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }
    }

    pub resource interface EditionCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun batchDeposit(tokens: @NonFungibleToken.Collection)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowEdition(id: UInt64): &Nanobash.NFT? {
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Edition reference: The ID of the returned reference is incorrect"
            }
        }
    }

    pub resource Collection: EditionCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic { 
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: Edition does not exist in the collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun batchWithdraw(ids: [UInt64]): @NonFungibleToken.Collection {
            var batchCollection <- create Collection()
            for id in ids {
                batchCollection.deposit(token: <-self.withdraw(withdrawID: id))
            }
            return <-batchCollection
        }

        pub fun deposit(token: @NonFungibleToken.NFT) { 
            let token <- token as! @Nanobash.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token

            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }

            destroy oldToken
        }

        pub fun batchDeposit(tokens: @NonFungibleToken.Collection) {

            let keys = tokens.getIDs()
            for key in keys {
                self.deposit(token: <-tokens.withdraw(withdrawID: key))
            }
            destroy tokens
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        pub fun borrowEdition(id: UInt64): &Nanobash.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &Nanobash.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create Nanobash.Collection()
    }

    pub fun getPieceMetaData(pieceID: UInt64): {String: String}? {
        return Nanobash.pieces[pieceID]?.metadata
    }

    pub fun isPieceLocked(pieceID: UInt64): Bool? {
        return Nanobash.pieces[pieceID]?.locked
    }

    pub fun maxEditions(pieceID: UInt64): UInt64? {
        return Nanobash.pieces[pieceID]?.maxEditions
    }

    pub fun numberMinted(pieceID: UInt64): UInt64? {
        return Nanobash.pieces[pieceID]?.numberMinted
    }

    init() {
        self.pieces <- {}
        self.nextPieceID = 1
        self.totalSupply = 0

        self.account.save<@Collection>(<- create Collection(), to: /storage/EditionCollection)
        self.account.link<&{EditionCollectionPublic}>(/public/EditionCollection, target: /storage/EditionCollection)
        self.account.save<@Admin>(<- create Admin(), to: /storage/NanobashAdmin)

        emit ContractInitialized()
    }
}