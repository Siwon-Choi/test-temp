import styles from "./Home.module.css";

import githubIcon from "../../assets/icons/github.png";
import instaIcon from "../../assets/icons/insta.png";
import linkedinIcon from "../../assets/icons/linkedIn.png";

import phoneIcon from "../../assets/icons/phone.png";
import birthIcon from "../../assets/icons/birth.png";
import emailIcon from "../../assets/icons/email.png";
import schoolIcon from "../../assets/icons/school.png";

const Home = () => {
    return (
        // 홈 영역
        <div className={styles.home}>
            {/* Hero 영역 */}
            <div className={styles.hero}>
                {/* 배경 사진(오버레이 포함) 및 소개글 */}
                <div className={styles.bg} />
                <div className={styles.overlay} />
                <div className={styles.content}>
                    <div className={styles.title}>
                        <div>백엔드 개발자</div>
                        <div>최시원입니다.</div>
                    </div>
                    <div className={styles.subtitle}>
                        사용자 욕구를 서비스로 충족시키고자 하는<br />
                        백엔드 개발자입니다.
                    </div>
                </div>
            </div>

            {/* 하단 영역 */}
            <div className={styles.bottom}>
                {/* 하단의 좌측 프로필 사진칸 */}
                <div className={styles.bottomLeft}>
                    {/* 프로필 사진 */}
                    <div className={styles.avatar}>
                        <img
                            className={styles.avatarImg}
                            src="/profile.jpeg"
                            alt="profile"
                        />
                    </div>
                </div>

                {/* 우측 정보 */}
                <div className={styles.bottomRight}>
                    {/* 이름 + 링크 */}
                    <div className={styles.profileHeader}>
                        <h3 className={styles.name}>최시원</h3>

                        <div className={styles.links}>
                            <a
                                className={styles.linkBtn}
                                href="https://github.com/Siwon-Choi"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={githubIcon} alt="github" />
                            </a>

                            <a
                                className={styles.linkBtn}
                                href="https://www.instagram.com/coe0317/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={instaIcon} alt="instagram" />
                            </a>

                            <a
                                className={styles.linkBtn}
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={linkedinIcon} alt="linkedin" />
                            </a>
                        </div>
                    </div>

                    {/* 개인정보 */}
                    <div className={styles.profileInfo}>
                        <div className={styles.infoRow}>
                            <div className={styles.infoItem}>
                                <img src={phoneIcon} alt="" />
                                <span>010-7647-2979</span>
                            </div>

                            <div className={styles.infoItem}>
                                <img src={birthIcon} alt="" />
                                <span>1999.12.31</span>
                            </div>
                        </div>

                        <div className={styles.infoRow}>
                            <div className={styles.infoItem}>
                                <img src={emailIcon} alt="email" />
                                <a href="mailto:c00031781@gmail.com">
                                    c00031781@gmail.com
                                </a>
                            </div>
                            
                            <div className={styles.infoItem}>
                                <img src={schoolIcon} alt="" />
                                <span>인하대학교 정보통신공학과</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;