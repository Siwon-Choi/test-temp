import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { supabase } from '../../api/supabase'
import Header from '../Header/Header'
import styles from './ProjectDetailInput.module.css'

type SkillInput = {
    id: number
    name: string
    reason: string
    category: string
    isNew: boolean
}

type SkillRow = {
    name: string
}

const SKILL_CATEGORY_ORDER = ['Language', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Database', 'Embedded']
const PROJECT_CATEGORY_OPTIONS = ['Frontend', 'Backend', 'Mobile', 'Embedded']

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

const ProjectDetailInput = () => {
    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [content, setContent] = useState('')

    const [role, setRole] = useState('')
    const [duration, setDuration] = useState('')
    const [contribution, setContribution] = useState('')
    const [projectCategory, setProjectCategory] = useState(PROJECT_CATEGORY_OPTIONS[0])
    const [imageUrl, setImageUrl] = useState('')

    const [skills, setSkills] = useState<SkillInput[]>([])
    const [skillNameDraft, setSkillNameDraft] = useState('')
    const [skillReasonDraft, setSkillReasonDraft] = useState('')
    const [skillCategoryDraft, setSkillCategoryDraft] = useState(SKILL_CATEGORY_ORDER[0])
    const [selectedSkillName, setSelectedSkillName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: existingSkillNames = [] } = useQuery<string[]>({
        queryKey: ['skill-name-list'],
        queryFn: async () => {
            const { data, error } = await supabase.from('skill').select('name')
            if (error) throw error
            return ((data ?? []) as SkillRow[]).map((row) => row.name.toLowerCase())
        },
    })

    const addSkill = () => {
        const name = skillNameDraft.trim()
        if (!name) {
            window.alert('스킬 이름을 입력해주세요.')
            return
        }

        if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
            window.alert('이미 추가된 스킬입니다.')
            return
        }

        const isNewSkill = !existingSkillNames.includes(name.toLowerCase())

        if (isNewSkill) {
            const ok = window.confirm(`${name}은(는) 기존 Skill에 없습니다. 최종 추가 시 Skill 컴포넌트에 새 스킬로 추가할까요?`)
            if (!ok) return
            window.alert('최종 추가 시 Skill 컴포넌트에 추가됩니다.')
        }

        const nextSkill: SkillInput = {
            id: Date.now(),
            name,
            reason: skillReasonDraft.trim(),
            category: skillCategoryDraft,
            isNew: isNewSkill,
        }

        setSkills((prev) => [...prev, nextSkill])
        setSelectedSkillName(name)
        setSkillNameDraft('')
        setSkillReasonDraft('')
        setSkillCategoryDraft(SKILL_CATEGORY_ORDER[0])
    }

    const onSubmit = async () => {
        if (!title.trim()) {
            window.alert('TITLE을 입력해주세요.')
            return
        }

        if (isSubmitting) return

        setIsSubmitting(true)

        try {
            let baseSlug = slugify(title)
            if (!baseSlug) baseSlug = `project-${Date.now()}`

            const { count: duplicateSlugCount, error: duplicateSlugError } = await supabase
                .from('project')
                .select('project_id', { count: 'exact', head: true })
                .like('slug', `${baseSlug}%`)

            if (duplicateSlugError) throw duplicateSlugError

            const nextSlug = duplicateSlugCount && duplicateSlugCount > 0
                ? `${baseSlug}-${duplicateSlugCount + 1}`
                : baseSlug

            const { data: insertedProject, error: projectInsertError } = await supabase
                .from('project')
                .insert({
                    slug: nextSlug,
                    title: title.trim(),
                    overview: subtitle.trim() || null,
                    img_url: imageUrl.trim() || null,
                    category: projectCategory,
                    role: role.trim() || null,
                    duration: duration.trim() || null,
                    contribution: contribution.trim() || null,
                    readme: content.trim() || null,
                })
                .select('project_id')
                .single()

            if (projectInsertError) throw projectInsertError

            const projectId = insertedProject.project_id as number

            const skillIdsByName = new Map<string, number>()
            const existingNames = skills.filter((skill) => !skill.isNew).map((skill) => skill.name)

            if (existingNames.length > 0) {
                const { data: existingSkillRows, error: existingSkillError } = await supabase
                    .from('skill')
                    .select('skill_id,name')
                    .in('name', existingNames)

                if (existingSkillError) throw existingSkillError

                    ; (existingSkillRows ?? []).forEach((row) => {
                        const typedRow = row as { skill_id: number; name: string }
                        skillIdsByName.set(typedRow.name.toLowerCase(), typedRow.skill_id)
                    })
            }

            const newSkills = skills.filter((skill) => skill.isNew)

            if (newSkills.length > 0) {
                const { data: insertedSkillRows, error: insertSkillError } = await supabase
                    .from('skill')
                    .insert(
                        newSkills.map((skill) => ({
                            name: skill.name,
                            category: skill.category,
                        })),
                    )
                    .select('skill_id,name')

                if (insertSkillError) throw insertSkillError

                    ; (insertedSkillRows ?? []).forEach((row) => {
                        const typedRow = row as { skill_id: number; name: string }
                        skillIdsByName.set(typedRow.name.toLowerCase(), typedRow.skill_id)
                    })
            }

            const projectSkillsToInsert = skills
                .map((skill) => {
                    const skillId = skillIdsByName.get(skill.name.toLowerCase())
                    if (!skillId) return null

                    return {
                        project_id: projectId,
                        skill_id: skillId,
                        skill_reason: skill.reason || null,
                    }
                })
                .filter((row): row is { project_id: number; skill_id: number; skill_reason: string | null } => Boolean(row))

            if (projectSkillsToInsert.length > 0) {
                const { error: projectSkillError } = await supabase
                    .from('projectskill')
                    .insert(projectSkillsToInsert)

                if (projectSkillError) throw projectSkillError
            }

            window.alert('프로젝트가 추가되었습니다.')
            navigate(`/projects/${nextSlug}`)
        } catch (error) {
            console.error(error)
            window.alert('프로젝트 추가에 실패했습니다. 콘솔 로그를 확인해주세요.')
        } finally {
            setIsSubmitting(false)
        }
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
                        <button type="button" className={styles.backButton} onClick={() => navigate('/#projects')}>
                            뒤로가기
                        </button>

                        <div className={styles.metaCard}>
                            <h2>Role</h2>
                            <input className={styles.input} value={role} onChange={(event) => setRole(event.target.value)} placeholder="예: Frontend Developer" />

                            <h2>Duration</h2>
                            <input className={styles.input} value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="예: 2024.03 - 2024.05" />

                            <h2>Project Contribution</h2>
                            <textarea className={styles.textarea} value={contribution} onChange={(event) => setContribution(event.target.value)} placeholder="프로젝트 기여도를 입력하세요." rows={3} />

                            <h2>Project Category</h2>
                            <select className={styles.select} value={projectCategory} onChange={(event) => setProjectCategory(event.target.value)}>
                                {PROJECT_CATEGORY_OPTIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>

                            <h2>Image URL</h2>
                            <input className={styles.input} value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="로컬 이미지 URL을 입력하세요." />

                            <div className={styles.techStackHeader}>
                                <h2>Tech Stack</h2>
                                <button type="button" className={styles.addSkillButton} onClick={addSkill} aria-label="스킬 추가">+</button>
                            </div>

                            <div className={styles.skillComposer}>
                                <input className={styles.input} value={skillNameDraft} onChange={(event) => setSkillNameDraft(event.target.value)} placeholder="스킬 이름" />
                                <select className={styles.select} value={skillCategoryDraft} onChange={(event) => setSkillCategoryDraft(event.target.value)}>
                                    {SKILL_CATEGORY_ORDER.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <textarea className={styles.textarea} value={skillReasonDraft} onChange={(event) => setSkillReasonDraft(event.target.value)} placeholder="스킬 사용 이유 (선택)" rows={2} />
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
                                <p>
                                    카테고리: {selectedSkill.category}
                                    <br />
                                    {selectedSkill.reason || '스킬 사용 이유가 아직 입력되지 않았습니다.'}
                                </p>
                            </article>
                        )}
                    </aside>

                    <main className={styles.main}>
                        <header className={styles.contentHeader}>
                            <input className={styles.titleInput} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="TITLE" />
                            <input className={styles.subtitleInput} value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="SUBTITLE" />
                        </header>

                        <section className={styles.markdownSection}>
                            {imageUrl.trim() ? <img className={styles.previewImage} src={imageUrl} alt="프로젝트 미리보기" /> : null}
                            <textarea
                                className={styles.contentInput}
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                placeholder="프로젝트 상세 내용을 입력하세요. (Markdown 지원)"
                                rows={12}
                            />
                        </section>

                        <section className={styles.previewSection}>
                            <h3 className={styles.previewHeading}>Preview</h3>
                            <div className={styles.markdownSection}>
                                <h1 className={styles.projectTitle}>{resolvedTitle}</h1>
                                <p className={styles.projectSubtitle}>{resolvedSubtitle}</p>
                                <p className={styles.previewMeta}>Project Category: {projectCategory}</p>
                                <div className={styles.markdownBody}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                                </div>
                            </div>
                        </section>

                        <button type="button" className={styles.submitButton} onClick={onSubmit} disabled={isSubmitting}>
                            {isSubmitting ? '추가 중...' : '최종 추가하기'}
                        </button>
                    </main>
                </div>
            </section>
        </>
    )
}

export default ProjectDetailInput
