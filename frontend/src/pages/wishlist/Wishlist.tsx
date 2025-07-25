import { CardsTable } from '@/components/CardsTable.tsx'
import type { Filters } from '@/components/FiltersPanel'
import { getCardById } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { Card } from '@/types'
import { useContext, useEffect, useState } from 'react'
import CardDetail from '../collection/CardDetail'

function Wishlist() {
  const { selectedCardId, setSelectedCardId } = useContext(CollectionContext)
  const [filteredCards, setFilteredCards] = useState<Card[] | null>(null)

  const [filters] = useState<Filters>({
    search: '',
    expansion: 'all',
    pack: 'all',
    cardType: [],
    rarity: [],
    owned: 'all',
    sortBy: 'default',
    minNumber: 0,
    maxNumber: 100,
    deckbuildingMode: false,
    allTextSearch: false,
  })
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)

  useEffect(() => {
    setResetScrollTrigger(true)

    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)

    return () => clearTimeout(timeout)
  }, [filteredCards])

  useEffect(() => {
    const stored = localStorage.getItem('wishlistCards')
    if (stored) {
      try {
        const cardIds: string[] = JSON.parse(stored)
        const cards: Card[] = cardIds.map((cardId) => getCardById(cardId)).filter((card): card is Card => !!card)
        setFilteredCards(cards)
      } catch {
        setFilteredCards([])
      }
    } else {
      setFilteredCards([])
    }
  }, [])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div>
        {filteredCards && (
          <CardsTable
            cards={filteredCards}
            resetScrollTrigger={resetScrollTrigger}
            showStats={!filters.deckbuildingMode}
            extraOffset={24}
            editable={!filters.deckbuildingMode}
          />
        )}
      </div>
      {selectedCardId && <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />}
    </div>
  )
}

export default Wishlist
