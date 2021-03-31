import NonFungibleToken from 0xf8d6e0586b0a20c7
import Nanobash from 0xf8d6e0586b0a20c7

transaction(account: Address, editionID: UInt64) {

    let transferToken: @NonFungibleToken.NFT
    
    prepare(acct: AuthAccount) {
        let collectionRef = acct.borrow<&Nanobash.Collection>(from: /storage/EditionCollection)
            ?? panic("Could not borrow a reference to the stored edition collection")
        
        self.transferToken <- collectionRef.withdraw(withdrawID: editionID)
    }

    execute {
        let recipient = getAccount(account)
        let receiverRef = recipient.getCapability(/public/EditionCollection).borrow<&{Nanobash.EditionCollectionPublic}>()!
        receiverRef.deposit(token: <-self.transferToken)
    }
}