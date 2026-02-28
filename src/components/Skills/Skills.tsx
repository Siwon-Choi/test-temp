import styles from "./Skills.module.css";
import LanguageIcon from "../../assets/icons/language.png";
import BackendIcon from "../../assets/icons/backend.png";
import DevOpsIcon from "../../assets/icons/devops.png";

// 데이터
type SkillRow = {
    category: string;
    items: string[];
};

const SKILLS: SkillRow[] = [
    {
        category: "Language",
        items: ["TypeScript", "JavaScript", "Java"],
    },
    {
        category: "Backend",
        items: ["Spring Boot", "Node.js", "Supabase"],
    },
    {
        category: "DevOps",
        items: ["Docker", "AWS EC2", "Nginx"],
    },
];

// 카테고리에 아이콘 매핑
const CATEGORY_ICONS: Record<string, string> = {
    Language: LanguageIcon,
    Backend: BackendIcon,
    DevOps: DevOpsIcon,
};

const Skills = () => {
    return (
        <section id="skills" className={styles.section}>
            <div className={styles.inner}>
                <h2 className={styles.title}>SKILLS</h2>

                <div className={styles.card}>
                    {SKILLS.map((row) => (
                        <div key={row.category} className={styles.row}>
                            <div className={styles.iconBox}>
                                <img
                                    className={styles.iconImg}
                                    src={CATEGORY_ICONS[row.category]}
                                    alt=""
                                    aria-hidden
                                />
                            </div>
                            <div className={styles.category}>{row.category}</div>

                            <div className={styles.chips}>
                                {row.items.map((item) => (
                                    <span key={`${row.category}-${item}`} className={styles.chip}>
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;