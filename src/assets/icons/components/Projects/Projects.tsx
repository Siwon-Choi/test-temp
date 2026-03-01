import { useMemo, useState } from 'react'
import styles from './Projects.module.css'
import monitorIcon from '../../assets/icons/monitor.svg'
import githubIcon from '../../assets/icons/github.png'
import prevIcon from '../../assets/icons/prev.svg'
import nextIcon from '../../assets/icons/next.svg'

const Projects = () => {

    // 프로젝트 15개
    const projects = useMemo(() => ([
        { title: 'My First Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Second Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Third Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Fourth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Fifth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Sixth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Seventh Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Eighth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Ninth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Tenth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Eleventh Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Twelfth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Thirteenth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Fourteenth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
        { title: 'My Fifteenth Project', description: 'This is a sample project description', skills: ['React'], demoUrl: '#', githubUrl: '#' },
    ]), [])

    // 페이징
    const PAGE_SIZE = 4
    const totalPages = Math.ceil(projects.length / PAGE_SIZE)
    const [page, setPage] = useState(0)

    const visibleProjects = useMemo(() => {
        const start = page * PAGE_SIZE
        return projects.slice(start, start + PAGE_SIZE)
    }, [page, projects])

    const goPrev = () => {
        setPage((prev) => (prev - 1 + totalPages) % totalPages)
    }

    const goNext = () => {
        setPage((prev) => (prev + 1) % totalPages)
    }

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

                {/* prev/next + 프로젝트 삽입 */}
                <div className={styles.carousel}>

                    <button
                        type="button"
                        className={styles.arrow}
                        onClick={goPrev}
                        aria-label="Previous page"
                    >
                        <img src={prevIcon} alt="prev" />
                    </button>

                    {/* 프로젝트 삽입 */}
                    <div className={styles.cards}>

                        {visibleProjects.map((project, index) => (
                            <div key={index} className={styles.card}>

                                {/* 이미지 */}
                                <div className={styles.image}></div>

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
                                onClick={() => setPage(i)}
                            />
                        ))}
                    </div>

                </div>

            </div>
        </section>
    )
}

export default Projects