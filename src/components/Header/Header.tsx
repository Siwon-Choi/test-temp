import { useLocation, useNavigate } from "react-router";
import styles from "./Header.module.css";

const Header = () => {

    const navigate = useNavigate();
    const location = useLocation();

    // 기본 활성 해시
    const currentHash = location.hash || "#home";

    const handleNavClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        sectionId: string
    ) => {
        e.preventDefault();

        if (location.pathname === "/") {
            document
                .getElementById(sectionId)
                ?.scrollIntoView({ behavior: "smooth" });

            navigate(`/#${sectionId}`, { replace: true });
            return;
        }

        navigate(`/#${sectionId}`);
    };

    return (
        <header className={styles.header}>
            <div
                className={styles.logo}
                onClick={() => {
                    if (location.pathname === "/") {
                        document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
                    } else {
                        navigate("/#home");
                    }
                }}
                role="button"
                tabIndex={0}
            >
                최시원 포트폴리오
            </div>
            <nav className={styles.nav}>
                <button
                    className={currentHash === "#home" ? styles.active : ""}
                    onClick={(e) => handleNavClick(e, "home")}
                >
                    Home
                </button>

                <button
                    className={currentHash === "#skills" ? styles.active : ""}
                    onClick={(e) => handleNavClick(e, "skills")}
                >
                    Skills
                </button>

                <button
                    className={currentHash === "#projects" ? styles.active : ""}
                    onClick={(e) => handleNavClick(e, "projects")}
                >
                    Projects
                </button>

                <button
                    className={currentHash === "#others" ? styles.active : ""}
                    onClick={(e) => handleNavClick(e, "others")}
                >
                    Others
                </button>
            </nav>
        </header>
    );
};

export default Header;