import * as classNames from "classnames";
import { TranslateContext } from "@denysvuika/preact-translate";
import "formdata-polyfill";
import { useContext, useState } from "preact/hooks";
import globalStyles from "../app.css";
import styles from "./song-pool-builder.css";
import { SongSearch } from "../song-search";
import { SongPick } from "./song-pick";

export function SongPoolBuilder() {
    const { t } = useContext(TranslateContext);
    const [collapsed, setCollapsed] = useState(true);
    const [pickedCharts, setPickedCharts] = useState([]);

    const handleChartPicked = (chart) => {
        setPickedCharts([...pickedCharts, chart]);
    };

    return (
        <div className={collapsed ? " " + styles.collapsed : ""}>
            <section className={styles.columns}>
                <div className={styles.column}>
                    <div className={styles.group}>
                        <SongSearch onSongSelect={handleChartPicked} />
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.group}>
                        {pickedCharts.map(chart =>
                            <SongPick chart={chart} />
                        )}
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={classNames(globalStyles.padded, styles.buttons)}>
                        <button onClick={() => setCollapsed(!collapsed)}>
                            {t(collapsed ? "songPoolBuilder.show" : "songPoolBuilder.hide")}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
