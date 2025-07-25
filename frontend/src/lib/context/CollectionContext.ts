import type { CollectionRow, WishlistRow } from '@/types'
import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface ICollectionContext {
  ownedCards: CollectionRow[]
  wishlistCards: WishlistRow[]
  setOwnedCards: Dispatch<SetStateAction<CollectionRow[]>>
  setWishlistCards: Dispatch<SetStateAction<WishlistRow[]>>
  selectedCardId: string
  setSelectedCardId: (cardId: string) => void
  selectedMissionCardOptions: string[]
  setSelectedMissionCardOptions: (missionCardOptions: string[]) => void
}

export const CollectionContext = createContext<ICollectionContext>({
  ownedCards: [],
  setOwnedCards: () => {},
  selectedCardId: '',
  setSelectedCardId: () => {},
  selectedMissionCardOptions: [],
  setSelectedMissionCardOptions: () => {},
  wishlistCards: [],
  setWishlistCards: () => {},
})
