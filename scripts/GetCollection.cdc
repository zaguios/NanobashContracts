import Nanobash from 0xf8d6e0586b0a20c7

pub fun main(account: Address): [UInt64] {

    let acct = getAccount(account)

    let collectionRef = acct.getCapability(/public/EditionCollection).borrow<&{Nanobash.EditionCollectionPublic}>()!

    log(collectionRef.getIDs())

    return collectionRef.getIDs()
}