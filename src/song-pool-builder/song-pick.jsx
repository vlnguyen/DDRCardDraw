import classNames from "classnames";
import { detectedLanguage } from "../utils";
import styles from "./song-pick.css";
import { useContext } from "preact/hooks";
import { XSquare } from "preact-feather";
import { TranslateContext } from "@denysvuika/preact-translate";

export function SongPick(props) {
    const { chart, index, onRemove } = props;
    const { t } = useContext(TranslateContext);
    const {
        name,
        nameTranslation,
        difficulty,
        level,
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
                    {nameTranslation || name}
                </div>
            </div>
            <div className={styles.cardFooter}>
                <div className={styles.difficulty}>
                    {t(abbreviation)} {level}
                </div>
                {onRemove &&
                    <XSquare
                        size={24}
                        color="white"
                        fill="red"
                        stroke-width="2"
                        onClick={() => onRemove(index)}
                    />
                }
            </div>
        </div>
    );
}
