import { supabase } from './supabase'

export type ProjectCategoryRow = {
  category: string | null
}

export type SkillCountRow = {
  skill_id: number
}

export type ProjectStats = {
  total: number
  frontend: number
  backend: number
  mobile: number
  other: number
}

const normalizeCategory = (category: string | null) => category?.trim().toLowerCase() ?? ''

export const getProjectCategories = async () => {
  const { data, error } = await supabase.from('project').select('category')
  if (error) throw error
  return (data ?? []) as ProjectCategoryRow[]
}

export const getSkillRows = async () => {
  const { data, error } = await supabase.from('skill').select('skill_id')
  if (error) throw error
  return (data ?? []) as SkillCountRow[]
}

export const calculateProjectStats = (projectCategories: ProjectCategoryRow[]): ProjectStats => {
  return projectCategories.reduce(
    (acc, row) => {
      const category = normalizeCategory(row.category)

      acc.total += 1
      if (category.includes('front')) acc.frontend += 1
      else if (category.includes('back')) acc.backend += 1
      else if (category.includes('mobile')) acc.mobile += 1
      else acc.other += 1

      return acc
    },
    { total: 0, frontend: 0, backend: 0, mobile: 0, other: 0 },
  )
}
