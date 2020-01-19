import classNames from "classnames";
import { detectedLanguage } from "../utils";
import styles from "./song-pick.css";
import { useContext } from "preact/hooks";
import { XSquare } from "preact-feather";
import { TranslateContext } from "@denysvuika/preact-translate";


const isJapanese = detectedLanguage === "ja";

export function SongPick(props) {
    const { chart } = props;
    const { t } = useContext(TranslateContext);
    const {
        name,
        nameTranslation,
        artist,
        artistTranslation,
        bpm,
        difficulty,
        level,
        hasShock,
        abbreviation,
        jacket
    } = chart;

    const rootClassname = classNames(styles.chart, styles[difficulty]);

    let jacketBg = {};
    if (jacket) {
        jacketBg = {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("jackets/${jacket}")`
        };
    }

    return (
        <div className={rootClassname} >
            <div className={styles.cardCenter} style={jacketBg}>
                <div className={styles.name} title={nameTranslation}>
                    {name}
                </div>
                {isJapanese ? null : (
                    <div className={styles.nameTranslation}>{nameTranslation}</div>
                )}
                <div className={styles.artist} title={artistTranslation}>
                    {artist}
                </div>
            </div>
            <div className={styles.cardFooter}>
                <div className={styles.difficulty}>
                    {t(abbreviation)} {level}
                </div>
                <div title={t("shockArrows")}>
                    <XSquare
                        size={24}
                        color="white"
                        fill="red"
                        stroke-width="2"
                    />
                </div>
            </div>
        </div>
    );
}
