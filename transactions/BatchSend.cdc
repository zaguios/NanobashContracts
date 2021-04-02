import NonFungibleToken from 0xf8d6e0586b0a20c7
import Nanobash from 0xf8d6e0586b0a20c7

transaction(recipientAddress: Address, editionIDs: [UInt64]) {

    let transferTokens: @NonFungibleToken.Collection
    
    prepare(acct: AuthAccount) {
        self.transferTokens <- acct.borrow<&Nanobash.Collection>(from: /storage/EditionCollection)!.batchWithdraw(ids: editionIDs)
    }

    execute {
        let recipient = getAccount(recipientAddress)
        let receiverRef = recipient.getCapability(/public/EditionCollection).borrow<&{Nanobash.EditionCollectionPublic}>()
            ?? panic("Could not borrow a reference to the recipients edition receiver")
        receiverRef.batchDeposit(tokens: <-self.transferTokens)
    }
}