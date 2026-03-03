import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../api/supabase'
import Header from '../Header/Header'
import styles from './ProjectDetail.module.css'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
                .select(
                    `
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
        `
                )
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
    const overview =
        project.overview || '프로젝트 설명이 아직 등록되지 않았습니다.'

    // markdown 내용
    const markdown = project.readme || project.overview || ''

    return (
        <>
            <Header />
            {/* 전체 상세 페이지 */}
            <section className={styles.page}>
                <div className={styles.shell}>

                    {/* 왼쪽 사이드 */}
                    <aside className={styles.sidebar}>

                        {/* 뒤로가기 버튼 */}
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </button>

                        {/* 메타 data 카드 */}
                        <div className={styles.metaCard}>
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
                        </div>
                    </aside>

                    {/* 내용 부분 = A파트 + B파트 */}
                    <main className={styles.main}>


                        {/* A파트 : 프로젝트 기본 정보 + 기술 사용 이유*/}
                        <header className={styles.contentHeader}>
                            <h1 className={styles.projectTitle}>{project.title}</h1>
                            <p className={styles.projectSubtitle}>{overview}</p>
                        </header>

                        <div className={styles.skillCards}>
                            {skillCards.map((skill) => (
                                <article key={`${skill.name}-card`} className={styles.skillCard}>
                                    <span className={styles.skillBadge}>{skill.name}</span>
                                    <p>{skill.reason}</p>
                                </article>
                            ))}
                        </div>

                        {/* B파트 : Markdown 상세 내용 */}
                        {markdown && (
                            <section className={styles.markdownSection}>
                                <div className={styles.markdownBody}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {markdown}
                                    </ReactMarkdown>
                                </div>
                            </section>
                        )}
                    </main>
                </div>
            </section>
        </>
    )
}

export default ProjectDetail