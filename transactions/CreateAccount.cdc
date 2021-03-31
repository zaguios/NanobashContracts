import Nanobash from 0xf8d6e0586b0a20c7

transaction {

    prepare(acct: AuthAccount) {
        if acct.borrow<&Nanobash.Collection>(from: /storage/EditionCollection) == nil {

            let collection <- Nanobash.createEmptyCollection() as! @Nanobash.Collection
            acct.save(<-collection, to: /storage/EditionCollection)
            acct.link<&{Nanobash.EditionCollectionPublic}>(/public/EditionCollection, target: /storage/EditionCollection)
        }
    }
}