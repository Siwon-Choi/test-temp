import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../Header/Header'
import styles from './ProjectDetailInput.module.css'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type SkillInput = {
    id: number
    name: string
    reason: string
}

const ProjectDetailInput = () => {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [content, setContent] = useState('')

    const [role, setRole] = useState('')
    const [duration, setDuration] = useState('')
    const [contribution, setContribution] = useState('')
    const [category, setCategory] = useState('')
    const [imageUrl, setImageUrl] = useState('')

    const [skills, setSkills] = useState<SkillInput[]>([])
    const [skillNameDraft, setSkillNameDraft] = useState('')
    const [skillReasonDraft, setSkillReasonDraft] = useState('')
    const [selectedSkillName, setSelectedSkillName] = useState('')

    const addSkill = () => {
        const name = skillNameDraft.trim()
        if (!name) return

        if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) return

        const nextSkill: SkillInput = {
            id: Date.now(),
            name,
            reason: skillReasonDraft.trim(),
        }

        setSkills((prev) => [...prev, nextSkill])
        setSelectedSkillName(name)
        setSkillNameDraft('')
        setSkillReasonDraft('')
    }

    const selectedSkill = useMemo(() => {
        if (!skills.length) return null

        const activeName = skills.some((skill) => skill.name === selectedSkillName)
            ? selectedSkillName
            : skills[0].name

        return skills.find((skill) => skill.name === activeName) ?? null
    }, [skills, selectedSkillName])

    const resolvedTitle = title.trim() || '프로젝트 제목을 입력하세요.'
    const resolvedSubtitle = subtitle.trim() || '프로젝트 서브타이틀(요약)을 입력하세요.'

    return (
        <>
            <Header />
            <section className={styles.page}>
                <div className={styles.shell}>
                    <aside className={styles.sidebar}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={() => navigate(-1)}
                        >
                            뒤로가기
                        </button>

                        <div className={styles.metaCard}>
                            <h2>Role</h2>
                            <input
                                className={styles.input}
                                value={role}
                                onChange={(event) => setRole(event.target.value)}
                                placeholder="예: Frontend Developer"
                            />

                            <h2>Duration</h2>
                            <input
                                className={styles.input}
                                value={duration}
                                onChange={(event) => setDuration(event.target.value)}
                                placeholder="예: 2024.03 - 2024.05"
                            />

                            <h2>Project Contribution</h2>
                            <textarea
                                className={styles.textarea}
                                value={contribution}
                                onChange={(event) => setContribution(event.target.value)}
                                placeholder="프로젝트 기여도를 입력하세요."
                                rows={3}
                            />

                            <h2>Category</h2>
                            <input
                                className={styles.input}
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                placeholder="예: Frontend"
                            />

                            <h2>Image URL</h2>
                            <input
                                className={styles.input}
                                value={imageUrl}
                                onChange={(event) => setImageUrl(event.target.value)}
                                placeholder="로컬 이미지 URL을 입력하세요."
                            />

                            <div className={styles.techStackHeader}>
                                <h2>Tech Stack</h2>
                                <button type="button" className={styles.addSkillButton} onClick={addSkill} aria-label="스킬 추가">
                                    +
                                </button>
                            </div>

                            <div className={styles.skillComposer}>
                                <input
                                    className={styles.input}
                                    value={skillNameDraft}
                                    onChange={(event) => setSkillNameDraft(event.target.value)}
                                    placeholder="스킬 이름"
                                />
                                <textarea
                                    className={styles.textarea}
                                    value={skillReasonDraft}
                                    onChange={(event) => setSkillReasonDraft(event.target.value)}
                                    placeholder="스킬 사용 이유 (선택)"
                                    rows={2}
                                />
                            </div>

                            <div className={styles.skills}>
                                {skills.map((skill) => (
                                    <button
                                        type="button"
                                        key={skill.id}
                                        className={`${styles.skillTag} ${selectedSkill?.name === skill.name ? styles.skillTagActive : ''}`}
                                        onClick={() => setSelectedSkillName(skill.name)}
                                    >
                                        {skill.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedSkill && (
                            <article className={`${styles.skillCard} ${styles.sidebarSkillCard}`}>
                                <span className={styles.skillBadge}>{selectedSkill.name}</span>
                                <p>{selectedSkill.reason || '스킬 사용 이유가 아직 입력되지 않았습니다.'}</p>
                            </article>
                        )}
                    </aside>

                    <main className={styles.main}>
                        <header className={styles.contentHeader}>
                            <input
                                className={styles.titleInput}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="TITLE"
                            />
                            <input
                                className={styles.subtitleInput}
                                value={subtitle}
                                onChange={(event) => setSubtitle(event.target.value)}
                                placeholder="SUBTITLE"
                            />
                        </header>

                        <section className={styles.markdownSection}>
                            {imageUrl.trim() ? (
                                <img className={styles.previewImage} src={imageUrl} alt="프로젝트 미리보기" />
                            ) : null}
                            <textarea
                                className={styles.contentInput}
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                placeholder="프로젝트 상세 내용을 입력하세요. (Markdown 지원)"
                                rows={12}
                            />
                        </section>

                        <section className={styles.markdownSection}>
                            <h3>Preview</h3>
                            <h1 className={styles.projectTitle}>{resolvedTitle}</h1>
                            <p className={styles.projectSubtitle}>{resolvedSubtitle}</p>
                            <div className={styles.markdownBody}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </section>
                    </main>
                </div>
            </section>
        </>
    )
}

export default ProjectDetailInput
