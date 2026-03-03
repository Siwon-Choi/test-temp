export type SolvedAcUser = {
  solvedCount: number
  tier: number
  maxStreak: number
  arenaRating: number
}

const allTier = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ruby']
const allSubtier = ['V', 'IV', 'III', 'II', 'I']

export const getSolvedAcHandle = () => import.meta.env.VITE_SOLVEDAC_HANDLE?.trim() ?? ''

export const getSolvedAcUser = async (handle: string) => {
  const response = await fetch(`https://solved.ac/api/v3/user/show?handle=${handle}`)

  if (!response.ok) {
    throw new Error('Failed to fetch solved.ac profile')
  }

  return response.json() as Promise<SolvedAcUser>
}

export const getSolvedAcTierText = (idx: number) => {
  if (!idx || idx < 1) return 'Unrated'

  const tier = Number.isInteger(idx / 5) ? Math.floor(idx / 5) - 1 : Math.floor(idx / 5)
  const safeTier = Math.min(Math.max(tier, 0), allTier.length - 1)

  let subtier = 0
  if (idx % 5 === 1) subtier = 0
  else if (idx % 5 === 0) subtier = 4
  else subtier = (idx % 5) - 1

  return `${allTier[safeTier]} ${allSubtier[subtier]}`
}
