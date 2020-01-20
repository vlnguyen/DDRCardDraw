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
    const [playerName, setPlayerName] = useState("");

    const handleChartPicked = (chart) => {
        if (!pickedCharts.some(c => c.name === chart.name && c.difficulty === chart.difficulty)) {
            setPickedCharts([...pickedCharts, chart]);
        }
    };

    const handleChartRemoved = (index) => {
        const newPickedCharts = [...pickedCharts];
        newPickedCharts.splice(index, 1);
        setPickedCharts(newPickedCharts);
    }

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
                        Player name: <input
                            style={{ fontSize: "16px" }}
                            value={playerName}
                            onChange={e => setPlayerName(e.target.value)}
                        />
                    </div>
                    <div className={styles.group}>
                        {pickedCharts.map((chart, index) =>
                            <SongPick
                                chart={chart}
                                index={index}
                                onRemove={handleChartRemoved}
                            />
                        )}
                    </div>
                    {pickedCharts.length > 0 &&
                        <div className={styles.group}>
                            <button>Add Picks</button>
                        </div>
                    }
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
