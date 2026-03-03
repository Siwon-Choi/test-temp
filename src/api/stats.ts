import { supabase } from './supabase'

export type ProjectCategoryRow = {
  category: string | null
}

export type SkillCountRow = {
  skill_id: number
}

export type ProjectStats = {
  total: number
  byCategory: Record<string, number>
}

const norm = (v: string | null) => (v ?? '').trim()

export const getProjectCategories = async (): Promise<ProjectCategoryRow[]> => {
  const { data, error } = await supabase.from('project').select('category')
  if (error) throw error
  return (data ?? []) as ProjectCategoryRow[]
}

export const getSkillRows = async (): Promise<SkillCountRow[]> => {
  const { data, error } = await supabase.from('skill').select('skill_id')
  if (error) throw error
  return (data ?? []) as SkillCountRow[]
}

export const calculateProjectStats = (rows: ProjectCategoryRow[]): ProjectStats => {
  const byCategory: Record<string, number> = {}
  let total = 0

  for (const r of rows) {
    const c = norm(r.category)
    if (!c) continue

    total += 1
    byCategory[c] = (byCategory[c] ?? 0) + 1
  }

  return { total, byCategory }
}