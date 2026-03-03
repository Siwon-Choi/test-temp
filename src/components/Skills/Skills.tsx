import styles from "./Skills.module.css";
import LanguageIcon from "../../assets/icons/language.png";
import BackendIcon from "../../assets/icons/backend.png";
import DevOpsIcon from "../../assets/icons/devops.png";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../api/supabase";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../utils/authStorage";

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

type EditMode = "delete" | "edit" | "add" | null;

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
    const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState<EditMode>(null);

    useEffect(() => {
        const syncAuthState = () => {
            const auth = isAuthenticated();
            setLoggedIn(auth);

            if (!auth) {
                setIsEditMenuOpen(false);
                setEditMode(null);
            }
        };

        window.addEventListener("auth-changed", syncAuthState);
        window.addEventListener("storage", syncAuthState);

        return () => {
            window.removeEventListener("auth-changed", syncAuthState);
            window.removeEventListener("storage", syncAuthState);
        };
    }, []);

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
                    {loggedIn ? (
                        <div className={styles.editorControls}>
                            <button
                                type="button"
                                className={styles.editToggleButton}
                                onClick={() => setIsEditMenuOpen((prev) => !prev)}
                            >
                                편집
                            </button>

                            {isEditMenuOpen ? (
                                <div className={styles.editMenu}>
                                    <button
                                        type="button"
                                        className={`${styles.editMenuItem} ${editMode === "delete" ? styles.activeMenuItem : ""}`}
                                        onClick={() => {
                                            setEditMode("delete");
                                            setIsEditMenuOpen(false);
                                        }}
                                    >
                                        삭제
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.editMenuItem} ${editMode === "edit" ? styles.activeMenuItem : ""}`}
                                        onClick={() => {
                                            setEditMode("edit");
                                            setIsEditMenuOpen(false);
                                        }}
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.editMenuItem} ${editMode === "add" ? styles.activeMenuItem : ""}`}
                                        onClick={() => {
                                            setEditMode("add");
                                            setIsEditMenuOpen(false);
                                        }}
                                    >
                                        추가
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

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
                                        <div key={`${row.category}-${item}`} className={styles.skillItem}>
                                            <span
                                                className={styles.chip}
                                                style={{ backgroundColor: getColorFromText(item) }}
                                            >
                                                {item}
                                            </span>

                                            {loggedIn && editMode === "delete" ? (
                                                <button type="button" className={`${styles.modeBadge} ${styles.deleteBadge}`}>
                                                    ×
                                                </button>
                                            ) : null}

                                            {loggedIn && editMode === "edit" ? (
                                                <span className={`${styles.modeBadge} ${styles.editBadge}`}>o</span>
                                            ) : null}
                                        </div>
                                    ))}

                                    {loggedIn && editMode === "add" ? (
                                        <button type="button" className={`${styles.modeBadge} ${styles.addBadge}`}>
                                            +
                                        </button>
                                    ) : null}
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
