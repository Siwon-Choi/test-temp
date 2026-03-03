// https://github.com/hjunhuh/solvedac-info/blob/main/get_info.js

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
    const query = new URLSearchParams({ handle }).toString()

    const response = await fetch(`/api/solvedac/user/show?${query}`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'x-solvedac-language': 'ko',
        },
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to fetch solved.ac profile (${response.status}): ${errorText || response.statusText}`)
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
