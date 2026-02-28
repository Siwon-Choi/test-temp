import styles from './Projects.module.css'

type ProjectItem = {
  id: number
  title: string
  description: string
  stack: string[]
  demoUrl: string
  repoUrl: string
}

const FILTERS = ['frontend', 'backend', 'all']

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: 'My First Project',
    description: 'A short project description goes here.',
    stack: ['React', 'TypeScript'],
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 2,
    title: 'My First Project',
    description: 'A short project description goes here.',
    stack: ['Node.js', 'Express'],
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 3,
    title: 'My First Project',
    description: 'A short project description goes here.',
    stack: ['Spring', 'MySQL'],
    demoUrl: '#',
    repoUrl: '#',
  },
  {
    id: 4,
    title: 'My First Project',
    description: 'A short project description goes here.',
    stack: ['Supabase', 'Vite'],
    demoUrl: '#',
    repoUrl: '#',
  },
]

const Projects = () => {
  return (
    <section id="projects" className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>Projects</h2>

        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button key={filter} type="button" className={styles.filterButton}>
              {filter}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {PROJECTS.map((project) => (
            <article key={project.id} className={styles.card}>
              <div className={styles.thumbnail}>600 × 400</div>

              <h3 className={styles.cardTitle}>{project.title} ↗</h3>
              <p className={styles.description}>{project.description}</p>

              <div className={styles.stackRow}>
                {project.stack.map((tech) => (
                  <span key={`${project.id}-${tech}`} className={styles.stackChip}>
                    {tech}
                  </span>
                ))}
              </div>

              <div className={styles.linkRow}>
                <a href={project.demoUrl} className={styles.linkButton}>
                  ↗ Live Demo
                </a>
                <a href={project.repoUrl} className={styles.linkButtonGhost}>
                  ○ GitHub
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
