import { useEffect, useMemo, useRef, useState, type TransitionEvent } from 'react'
import styles from './Projects.module.css'
import monitorIcon from '../../assets/icons/monitor.svg'
import githubIcon from '../../assets/icons/github.png'
import prevIcon from '../../assets/icons/prev.svg'
import nextIcon from '../../assets/icons/next.svg'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../api/supabase'

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

type ProjectRow = {
  project_id: number
  slug: string
  title: string
  overview: string | null
  img_url: string | null
  category: string | null
  projectskill: ProjectSkillRow[] | null
}

// UI에서 쓰기 편한 형태
type ProjectUI = {
  project_id: number
  slug: string
  title: string
  description: string
  skills: string[]
  img_url: string | null
  category: string | null
  demoUrl: string
  githubUrl: string
}

const Projects = () => {

    // 프로젝트 15개
    const { data: projects = [], isLoading, error } = useQuery<ProjectUI[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('project')
                .select(`
                    project_id,
                    slug,
                    title,
                    overview,
                    img_url,
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
                .order('project_id', { ascending: true })

            if (error) throw error

            const rows = (data ?? []) as unknown as ProjectRow[]

            // DB rows -> UI rows
            return rows.map((p) => {
                const skills =
                    (p.projectskill ?? [])
                        .map((ps) => ps.skill?.name)
                        .filter((v): v is string => Boolean(v))

                return {
                    project_id: p.project_id,
                    slug: p.slug,
                    title: p.title,
                    description: p.overview ?? '',
                    skills,
                    img_url: p.img_url ?? null,
                    category: p.category ?? null,

                    // 필요하면 slug로 라우팅 연결해도 됨
                    demoUrl: '#',
                    githubUrl: '#',
                }
            })
        },
    })

    // 페이징
    const PAGE_SIZE = 4

    const pages = useMemo(() => {
        const out: typeof projects[] = []
        for (let i = 0; i < projects.length; i += PAGE_SIZE) {
            out.push(projects.slice(i, i + PAGE_SIZE))
        }
        return out
    }, [projects])

    const totalPages = pages.length

    // 무한 슬라이드용: [마지막페이지, ...원본, 첫페이지]
    const loopPages = useMemo(() => {
        if (totalPages <= 1) return pages
        const first = pages[0]
        const last = pages[totalPages - 1]
        return [last, ...pages, first]
    }, [pages, totalPages])

    // 현재 슬라이드 인덱스 (loopPages 기준)
    // 0: 복제(last), 1..totalPages: 실제, lastIndex: 복제(first)
    const [index, setIndex] = useState(1)

    useEffect(() => {
        if (totalPages <= 1) {
            setIndex(0)
            return
        }

        if (index < 1 || index > totalPages) {
            setIndex(1)
        }
    }, [index, totalPages])

    // dot 표시용 현재 페이지(0..totalPages-1)
    const page = totalPages <= 1 ? 0 : (index - 1 + totalPages) % totalPages

    const [animating, setAnimating] = useState(false)
    const [noTransition, setNoTransition] = useState(false)

    const pendingJumpRef = useRef(false)

    const goPrev = () => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex((prev) => prev - 1)
    }

    const goNext = () => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex((prev) => prev + 1)
    }

    const goTo = (target: number) => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex(target + 1) // loopPages에서 실제 페이지는 +1 오프셋
    }

    const onTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget || e.propertyName !== 'transform') return
        if (totalPages <= 1) {
            setAnimating(false)
            return
        }

        const lastIndex = loopPages.length - 1

        // 점프 중에 transitionEnd가 여러 번 들어올 수 있어서 방어
        if (pendingJumpRef.current) return

        if (index === 0) {
            // clone(last) -> real(last)
            pendingJumpRef.current = true
            setNoTransition(true)
            setIndex(totalPages)

            // ⭐ 핵심: rAF 2번으로 "transition:none 적용 → 점프 반영"을 확실히 한 뒤 다시 켬
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setNoTransition(false)
                    pendingJumpRef.current = false
                })
            })
        } else if (index === lastIndex) {
            // clone(first) -> real(first)
            pendingJumpRef.current = true
            setNoTransition(true)
            setIndex(1)

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setNoTransition(false)
                    pendingJumpRef.current = false
                })
            })
        }

        setAnimating(false)
    }

    if (isLoading) return <p>로딩 중...</p>
    if (error) return <p>에러가 발생했습니다.</p>

    return (
        <section id="projects" className={styles.projects}>
            <div className={styles.inner}>

                {/* 제목 */}
                <div className={styles.title}> Projects </div>

                {/* 메뉴 */}
                <div className={styles.menu}>
                    <div className={styles.category}> All </div>
                    <div className={styles.category}> Frontend </div>
                    <div className={styles.category}> Backend </div>
                    <div className={styles.category}> Mobile </div>
                </div>

                {/* 프로젝트 삽입 */}
                <div className={styles.carousel}>

                    <button
                        type="button"
                        className={styles.arrow}
                        onClick={goPrev}
                        aria-label="Previous page"
                    >
                        <img src={prevIcon} alt="prev" />
                    </button>

                    {/* viewport + track */}
                    <div className={styles.viewport}>
                        <div
                            className={`${styles.track} ${noTransition ? styles.noTransition : ''}`}
                            style={{ transform: `translateX(-${index * 100}%)` }}
                            onTransitionEnd={onTransitionEnd}
                        >
                            {loopPages.map((pageProjects, pIndex) => (
                                <div key={pIndex} className={styles.slide}>
                                    <div className={styles.cards}>
                                        {pageProjects.map((project, i) => (
                                            <div key={`${pIndex}-${project.project_id}-${i}`} className={styles.card}>

                                                {/* 이미지 */}
                                                <div
                                                    className={styles.image}
                                                    style={
                                                        project.img_url
                                                            ? {
                                                                backgroundImage: `url(${project.img_url})`,
                                                                backgroundSize: 'cover',
                                                                backgroundPosition: 'center',
                                                              }
                                                            : undefined
                                                    }
                                                ></div>

                                                {/* 프로젝트 컨텐츠 */}
                                                <div className={styles.content}>

                                                    {/* 제목 */}
                                                    <div className={styles.projectTitle}>
                                                        {project.title}
                                                    </div>

                                                    {/* 한줄 소개 */}
                                                    <div className={styles.projectDescription}>
                                                        {project.description}
                                                    </div>

                                                    {/* 스킬 */}
                                                    <div className={styles.projectSkills}>
                                                        {project.skills.map((skill) => (
                                                            <div key={skill} className={styles.projectSkill}>
                                                                {skill}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* 버튼 */}
                                                    <div className={styles.buttons}>
                                                        <a href={project.demoUrl} className={styles.button}>
                                                            <img src={monitorIcon} alt="demo" />
                                                            Live Demo
                                                        </a>

                                                        <a href={project.githubUrl} className={styles.button}>
                                                            <img src={githubIcon} alt="github" />
                                                            GitHub
                                                        </a>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.arrow}
                        onClick={goNext}
                        aria-label="Next page"
                    >
                        <img src={nextIcon} alt="next" />
                    </button>

                </div>

                {/* 페이징 */}
                <div className={styles.paging}>

                    <div className={styles.dots}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                className={`${styles.dot} ${i === page ? styles.dotActive : ''}`}
                                onClick={() => goTo(i)}
                            />
                        ))}
                    </div>

                </div>

            </div>
        </section>
    )
}

export default Projects
