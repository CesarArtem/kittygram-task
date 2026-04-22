import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDuels } from "../../utils/api";
import styles from "./duels.module.css";

export const DuelList = () => {
  const [duels, setDuels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuels = async () => {
      try {
        const data = await getDuels("active");
        setDuels(data.results || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDuels();
  }, []);

  if (loading) return <div>Загрузка дуэлей...</div>;

  return (
    <div className={styles.container}>
      <h2>Активные дуэли</h2>
      <Link to="/duels/create" className={styles.createLink}>
        Создать дуэль
      </Link>
      {duels.length === 0 ? (
        <p>Нет активных дуэлей</p>
      ) : (
        <ul className={styles.duelList}>
          {duels.map((duel) => (
            <li key={duel.id} className={styles.duelItem}>
              <Link to={`/duels/${duel.id}`}>
                <span className={styles.catA}>{duel.cat_a_name}</span>
                <span className={styles.vs}>vs</span>
                <span className={styles.catB}>{duel.cat_b_name}</span>
                <span className={styles.votes}>
                  {duel.votes_a} : {duel.votes_b}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};