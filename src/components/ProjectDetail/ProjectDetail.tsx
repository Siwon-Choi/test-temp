import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../api/supabase'
import styles from './ProjectDetail.module.css'

type SkillRow = {
  skill_id: number
  name: string
  category: string | null
}

type ProjectSkillRow = {
  id: number
  project_id: number
  skill_id: number
  skill_reason: string | null
  skill: SkillRow | null
}

type ProjectDetailRow = {
  project_id: number
  slug: string
  title: string
  duration: string | null
  contribution: string | null
  role: string | null
  overview: string | null
  img_url: string | null
  readme: string | null
  category: string | null
  projectskill: ProjectSkillRow[] | null
}

const ProjectDetail = () => {
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  const { data: project, isLoading, error } = useQuery<ProjectDetailRow | null>({
    queryKey: ['project-detail', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project')
        .select(`
          project_id,
          slug,
          title,
          duration,
          contribution,
          role,
          overview,
          img_url,
          readme,
          category,
          projectskill (
            id,
            project_id,
            skill_id,
            skill_reason,
            skill:skill_id (
              skill_id,
              name,
              category
            )
          )
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error

      return (data as unknown as ProjectDetailRow) ?? null
    },
  })

  const skillCards = useMemo(() => {
    return (project?.projectskill ?? [])
      .filter((row) => row.skill)
      .map((row) => ({
        name: row.skill?.name ?? '',
        reason: row.skill_reason ?? `${row.skill?.name}를 활용해 프로젝트를 구현했습니다.`,
      }))
  }, [project])

  if (isLoading) return <p className={styles.status}>프로젝트를 불러오는 중...</p>
  if (error || !project) return <p className={styles.status}>프로젝트 정보를 찾을 수 없습니다.</p>

  const role = project.role ?? '-'
  const duration = project.duration ?? '-'
  const contribution = project.contribution ?? '-'
  const overview = project.readme || project.overview || '프로젝트 설명이 아직 등록되지 않았습니다.'

  return (
    <section className={styles.page}>
      <div className={styles.inner}>
        <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>

        <h1 className={styles.title}>{project.title}</h1>

        <div className={styles.layout}>
          <aside className={styles.metaCard}>
            <h2>Role</h2>
            <p>{role}</p>

            <h2>Duration</h2>
            <p>{duration}</p>

            <h2>Project Contribution</h2>
            <p>{contribution}</p>

            <h2>Tech Stack</h2>
            <div className={styles.skills}>
              {skillCards.map((skill) => (
                <span key={skill.name} className={styles.skillTag}>
                  {skill.name}
                </span>
              ))}
            </div>
          </aside>

          <main className={styles.content}>
            <h2>Project Overview</h2>
            <p>{overview}</p>

            <div className={styles.skillCards}>
              {skillCards.map((skill) => (
                <article key={`${skill.name}-card`} className={styles.skillCard}>
                  <span className={styles.skillBadge}>{skill.name}</span>
                  <p>{skill.reason}</p>
                </article>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetail
