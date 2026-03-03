import { useMemo, useRef, useState } from 'react'
import styles from './Projects.module.css'
import monitorIcon from '../../assets/icons/monitor.svg'
import githubIcon from '../../assets/icons/github.png'
import prevIcon from '../../assets/icons/prev.svg'
import nextIcon from '../../assets/icons/next.svg'
import { supabase } from '../../api/supabase'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'


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

const ALL_CATEGORY = 'All'

// 대문자 -> 소문자
const normalizeCategory = (category: string | null) => {
    if (!category) return null
    return category.trim()
}
// Front, front-end 이런 표기들 싹 매핑
const getCategoryTone = (category: string | null) => {
    const value = normalizeCategory(category)?.toLowerCase()

    if (!value) return 'default'
    if (value.includes('front')) return 'frontend'
    if (value.includes('back')) return 'backend'
    if (value.includes('mobile')) return 'mobile'
    if (value.includes('iot')) return 'iot'
    if (value.includes('devops')) return 'devops'

    return 'default'
}


const Projects = () => {
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

            return rows.map((p) => ({
                project_id: p.project_id,
                slug: p.slug,
                title: p.title,
                description: p.overview ?? '',
                skills: (p.projectskill ?? [])
                    .map((ps) => ps.skill?.name)
                    .filter((v): v is string => Boolean(v)),
                img_url: p.img_url ?? null,
                category: p.category ?? null,
                demoUrl: '#',
                githubUrl: '#',
            }))
        },
    })

    const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY)

    const categories = useMemo(() => {
        const unique = new Set(
            projects
                .map((project) => normalizeCategory(project.category))
                .filter((category): category is string => Boolean(category)),
        )

        return [ALL_CATEGORY, ...Array.from(unique).sort((a, b) => a.localeCompare(b))]
    }, [projects])

    const selectedCategory = categories.includes(activeCategory) ? activeCategory : ALL_CATEGORY

    const filteredProjects = useMemo(() => {
        if (selectedCategory === ALL_CATEGORY) return projects

        return projects.filter((project) => normalizeCategory(project.category) === selectedCategory)
    }, [projects, selectedCategory])


    // 페이징
    const PAGE_SIZE = 3

    const pages = useMemo(() => {
        const out: typeof projects[] = []
        for (let i = 0; i < filteredProjects.length; i += PAGE_SIZE) {
            out.push(filteredProjects.slice(i, i + PAGE_SIZE))
        }
        return out
    }, [filteredProjects])

    const totalPages = pages.length
    const showArrows = totalPages > 1


    // 무한 케러셀(슬라이드) -> [마지막 페이지, 원본 페이지들, 첫 페이지]
    const loopPages = useMemo(() => {
        if (totalPages <= 1) return pages
        const first = pages[0]
        const last = pages[totalPages - 1]
        return [last, ...pages, first]
    }, [pages, totalPages])

    // 캐러셀 인덱스(무한 루프 구성 시 기본 시작점은 1)
    const [index, setIndex] = useState(1)

    const trackIndex = totalPages <= 1 ? 0 : index

    // dot 표시용 현재 페이지
    const page = totalPages <= 1 ? 0 : (index - 1 + totalPages) % totalPages

    // 연타 방지
    const [animating, setAnimating] = useState(false)

    // 무한 슬라이드 구현 필수 
    const [noTransition, setNoTransition] = useState(false)

    // css
    const pendingJumpRef = useRef(false)


    const resetCarousel = () => {
        const targetIndex = 1

        setNoTransition(true)
        setAnimating(false)
        pendingJumpRef.current = false
        setIndex(targetIndex)

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setNoTransition(false)
            })
        })
    }

    const onCategoryChange = (category: string) => {
        setActiveCategory(category)
        resetCarousel()
    }


    // 이전 페이지로 이동
    const goPrev = () => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex((prev) => prev - 1)
    }

    // 다음 페이지로 이동
    const goNext = () => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex((prev) => prev + 1)
    }

    // 특정 페이지로 이동
    const goTo = (target: number) => {
        if (animating || totalPages <= 1) return
        setAnimating(true)
        setIndex(target + 1)
    }

    // 슬라이드 종료 시 실행
    const onTransitionEnd = () => {
        // 페이지가 1페이지인 케이스
        if (totalPages <= 1) {
            setAnimating(false)
            return
        }

        // 마지막 인텍스는 길이의 - 1로 설정
        const lastIndex = loopPages.length - 1

        // 이미 가짜 -> 진짜 점프 처리 중이면
        // transitionEnd가 중복 실행되지 않도록 종료
        if (pendingJumpRef.current) return

        // 0번 인덱스라면 (무한 슬라이드) -> 가짜 슬라이드에서 진짜 마지막 페이지로 이동
        if (index === 0) {

            // 애니메이션 아직 진행 중
            // 재실행 방지
            pendingJumpRef.current = true

            // css 효과 잠시 종료 -> 화면 튐 방지
            setNoTransition(true)

            // 페이지 실제 교체(애니메이션)
            setIndex(totalPages)

            // transition을 다시 켜는 타이밍 조절
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setNoTransition(false)
                    pendingJumpRef.current = false
                })
            })
            // 마지막 페이지 -> 첫페이지(가짜) -> 첫페이지
        } else if (index === lastIndex) {
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
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={`${styles.category} ${selectedCategory === category ? styles.categoryActive : ''}`}
                            onClick={() => onCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* 프로젝트 삽입 */}
                <div className={styles.carousel}>
                    {showArrows ? (
                        <button
                            type="button"
                            className={styles.arrow}
                            onClick={goPrev}
                            aria-label="Previous page"
                        >
                            <img src={prevIcon} alt="prev" />
                        </button>
                    ) : (
                        <div className={styles.arrowSpacer} aria-hidden="true" />
                    )}

                    {/* viewport */}
                    <div className={styles.viewport}>
                        {/* track */}
                        <div
                            className={`${styles.track} ${noTransition ? styles.noTransition : ''}`}
                            style={{ transform: `translateX(-${trackIndex * 100}%)` }}
                            onTransitionEnd={onTransitionEnd}
                        >
                            {loopPages.map((pageProjects, pIndex) => (
                                <div key={pIndex} className={styles.slide}>
                                    <div className={styles.cards}>
                                        <button type="button" className={styles.addCard} aria-label="프로젝트 추가">
                                            <span className={styles.addPlus}>+</span>
                                        </button>

                                        {pageProjects.map((project, i) => {
                                            const category = normalizeCategory(project.category)
                                            const categoryTone = getCategoryTone(category)

                                            return <div key={`${pIndex}-${project.project_id}-${i}`} className={styles.card}>

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
                                                        {category && (
                                                            <div className={`${styles.projectCategory} ${styles[`categoryTone_${categoryTone}`]}`}>
                                                                {category}
                                                            </div>
                                                        )}
                                                        {project.skills.map((skill) => (
                                                            <div key={skill} className={styles.projectSkill}>
                                                                {skill}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* 버튼 */}
                                                    <div className={styles.buttons}>
                                                        <Link to={`/projects/${project.slug}`} className={styles.button}>
                                                            <img src={monitorIcon} alt="demo" />
                                                            상세 보기
                                                        </Link>

                                                        <a href={project.githubUrl} className={styles.button}>
                                                            <img src={githubIcon} alt="github" />
                                                            GitHub
                                                        </a>
                                                    </div>

                                                </div>
                                            </div>
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showArrows ? (
                        <button
                            type="button"
                            className={styles.arrow}
                            onClick={goNext}
                            aria-label="Next page"
                        >
                            <img src={nextIcon} alt="next" />
                        </button>
                    ) : (
                        <div className={styles.arrowSpacer} aria-hidden="true" />
                    )}

                </div>

                {/* 페이징 */}
                <div className={styles.paging}>

                    {totalPages > 0 ? (
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
                    ) : (
                        <p className={styles.empty}>선택한 카테고리에 해당하는 프로젝트가 없습니다.</p>
                    )}

                </div>

            </div>
        </section>
    )
}

export default Projects
