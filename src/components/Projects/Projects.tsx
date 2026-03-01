import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import styles from './Projects.module.css'
import monitorIcon from '../../assets/icons/monitor.svg'
import githubIcon from '../../assets/icons/github.png'
import prevIcon from '../../assets/icons/prev.svg'
import nextIcon from '../../assets/icons/next.svg'
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

const PAGE_SIZE = 4

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

  const pages = useMemo(() => {
    const out: ProjectUI[][] = []
    for (let i = 0; i < projects.length; i += PAGE_SIZE) {
      out.push(projects.slice(i, i + PAGE_SIZE))
    }
    return out
  }, [projects])

  const totalPages = pages.length

  const loopPages = useMemo(() => {
    if (totalPages <= 1) return pages
    const first = pages[0]
    const last = pages[totalPages - 1]
    return [last, ...pages, first]
  }, [pages, totalPages])

  const [index, setIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [noTransition, setNoTransition] = useState(false)
  const pendingJumpRef = useRef(false)

  useEffect(() => {
    setIndex(totalPages <= 1 ? 0 : 1)
    setAnimating(false)
    setNoTransition(false)
    pendingJumpRef.current = false
  }, [totalPages])

  const page = totalPages <= 1 ? 0 : (index - 1 + totalPages) % totalPages

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
    setIndex(target + 1)
  }

  const onTransitionEnd = () => {
    if (totalPages <= 1) {
      setAnimating(false)
      return
    }

    const lastIndex = loopPages.length - 1

    if (pendingJumpRef.current) return

    if (index === 0) {
      pendingJumpRef.current = true
      setNoTransition(true)
      setIndex(totalPages)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNoTransition(false)
          pendingJumpRef.current = false
        })
      })
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
        <div className={styles.title}> Projects </div>

        <div className={styles.menu}>
          <div className={styles.category}> All </div>
          <div className={styles.category}> Frontend </div>
          <div className={styles.category}> Backend </div>
          <div className={styles.category}> Mobile </div>
        </div>

        <div className={styles.carousel}>
          <button
            type="button"
            className={styles.arrow}
            onClick={goPrev}
            aria-label="Previous page"
          >
            <img src={prevIcon} alt="prev" />
          </button>

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

                        <div className={styles.content}>
                          <div className={styles.projectTitle}>{project.title}</div>
                          <div className={styles.projectDescription}>{project.description}</div>

                          <div className={styles.projectSkills}>
                            {project.skills.map((skill) => (
                              <div key={skill} className={styles.projectSkill}>
                                {skill}
                              </div>
                            ))}
                          </div>

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
