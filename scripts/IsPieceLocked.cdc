import Nanobash from 0xf8d6e0586b0a20c7

pub fun main(pieceID: UInt64): Bool? {
    return Nanobash.isPieceLocked(pieceID: pieceID)
}