import styles from "./Skills.module.css";
import LanguageIcon from "../../assets/icons/language.png";
import BackendIcon from "../../assets/icons/backend.png";
import DevOpsIcon from "../../assets/icons/devops.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../api/supabase";

// 데이터
type SkillRowDB = {
    skill_id: number;
    name: string;
    category: string;
};

type SkillRowUI = {
    category: string;
    items: string[];
};

// 카테고리에 아이콘 매핑
const CATEGORY_ICONS: Record<string, string> = {
    Language: LanguageIcon,
    Backend: BackendIcon,
    DevOps: DevOpsIcon,
};


const CHIP_COLORS = [
    "#2f6df6", 
    "#7c4dff",
    "#00b894",
    "#ff7675",
    "#fdcb6e",
    "#00cec9",
];

const getColorFromText = (text: string) => {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
};

// DB rows -> UI rows
const groupByCategory = (rows: SkillRowDB[]): SkillRowUI[] => {
    const map = new Map<string, string[]>();

    for (const r of rows) {
        const key = r.category?.trim();
        if (!key) continue;

        const arr = map.get(key) ?? [];
        arr.push(r.name);
        map.set(key, arr);
    }

    const order = ["Language", "Frontend", "Backend", "Mobile", "DevOps", "Database", "Embedded"];

    const result: SkillRowUI[] = Array.from(map.entries())
        .map(([category, items]) => ({
            category,
            items,
        }))
        .sort((a, b) => {
            const ai = order.indexOf(a.category);
            const bi = order.indexOf(b.category);

            const aRank = ai === -1 ? 999 : ai;
            const bRank = bi === -1 ? 999 : bi;

            if (aRank !== bRank) return aRank - bRank;
            return a.category.localeCompare(b.category);
        });

    return result;
};



const Skills = () => {
    const { data, isLoading, error } = useQuery<SkillRowUI[]>({
        queryKey: ["skill"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("skill")
                .select("skill_id,name,category")
                .order("skill_id");

            if (error) throw error;

            return groupByCategory((data ?? []) as SkillRowDB[]);
        },
    });

    if (isLoading) return <section className={styles.section}>로딩 중...</section>;
    if (error) return <section className={styles.section}>에러가 발생했습니다.</section>;

    const rows = data ?? [];

    return (
        <section id="skills" className={styles.section}>
            <div className={styles.inner}>
                <h2 className={styles.title}>SKILLS</h2>

                <div className={styles.card}>
                    {rows.map((row) => {
                        const iconSrc = CATEGORY_ICONS[row.category] ?? LanguageIcon;

                        return (
                            <div key={row.category} className={styles.row}>
                                <div className={styles.iconBox}>
                                    <img 
                                        className={styles.iconImg} 
                                        src={iconSrc} 
                                        alt="" 
                                        aria-hidden 
                                    />
                                </div>

                                <div className={styles.category}>{row.category}</div>

                                <div className={styles.chips}>
                                    {row.items.map((item) => (
                                        <span
                                            key={`${row.category}-${item}`}
                                            className={styles.chip}
                                            style={{ backgroundColor: getColorFromText(item) }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {rows.length === 0 && <div>데이터가 없습니다.</div>}
                </div>
            </div>
        </section>
    );
};

export default Skills;