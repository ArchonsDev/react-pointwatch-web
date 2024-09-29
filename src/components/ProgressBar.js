import { ProgressBar } from "react-bootstrap";
import styles from "./styles.module.css";

export const ProgBars = ({ swtd, term }) => {
  const termSWTDs = term
    ? swtd?.filter((item) => item.term.id === term?.id)
    : swtd;

  const categoryCounts = termSWTDs?.reduce((acc, item) => {
    const category = item.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts || {}).sort(
    (a, b) => b[1] - a[1]
  );
  const topCategories = sortedCategories.slice(0, 5);

  return (
    <div className={styles.progBars}>
      <span className={styles.header}>Overall Top Categories of SWTDs</span>
      {termSWTDs.length !== 0 ? (
        <>
          {topCategories.map(([category, count]) => (
            <div key={category} className="mb-3">
              {" "}
              <span
                className={
                  styles.barLabel
                }>{`${category}: ${count} SWTDs`}</span>
              <ProgressBar
                className={styles.bar}
                now={(count / termSWTDs.length) * 100}
              />
            </div>
          ))}
        </>
      ) : (
        <div>
          <span className={`${styles.barLabel} d-flex justify-content-center`}>
            No SWTDs for this term yet.
          </span>
        </div>
      )}
    </div>
  );
};
