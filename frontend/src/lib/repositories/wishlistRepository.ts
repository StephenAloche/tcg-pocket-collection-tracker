import type { WishlistRow } from '@/types'
import { getCardById } from '../CardsDB'

export const wishlistRepository = {
  getWishlist: (): string[] => {
    try {
      const stored = localStorage.getItem('wishlistCards')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  setWishlist: (wishlist: string[]) => {
    localStorage.setItem('wishlistCards', JSON.stringify(wishlist))
  },

  toggleWishlist: (cardId: string) => {
    const wishlist = wishlistRepository.getWishlist()
    const updated = wishlist.includes(cardId) ? wishlist.filter((id) => id !== cardId) : [...wishlist, cardId]
    wishlistRepository.setWishlist(updated)
    const wishlistRows = updated.map((id) => {
      return {
        email: '',
        card_id: id,
        updated_at: new Date().toISOString(),
      } as WishlistRow
    })

    return wishlistRows
  },
}

export async function fetchWishlist(_email?: string): Promise<WishlistRow[]> {
  const cardIds = wishlistRepository.getWishlist()
  const cards = await Promise.all(
    cardIds.map(async (id) => {
      const card = await getCardById(id)
      if (!card) return undefined
      return {
        ...card,
        email: '', // Provide appropriate email value if available
        updated_at: new Date().toISOString(), // Or use a relevant timestamp
      } as WishlistRow
    }),
  )
  // Filter out any undefined results
  return cards.filter((row): row is WishlistRow => !!row)
}
