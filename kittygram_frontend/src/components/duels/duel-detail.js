import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { getDuel, voteInDuel, getDuelVotes } from "../../utils/api";
import styles from "./duels.module.css";

export const DuelDetail = () => {
  const { id } = useParams();
  const [duel, setDuel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const history = useHistory();

  const fetchDuel = async () => {
    try {
      const duelData = await getDuel(id);
      setDuel(duelData);

      // Проверяем, голосовал ли текущий пользователь
      try {
        const votesData = await getDuelVotes(id);
        const currentUserId = localStorage.getItem("user_id");
        const userVote = votesData.results?.some(
          (vote) => String(vote.user) === currentUserId
        );
        setVoted(userVote);
      } catch (err) {
        console.error("Error fetching votes:", err);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuel();
  }, [id]);

  const handleVote = async (chosenCatId) => {
    setError("");
    setSuccessMessage("");
    try {
      await voteInDuel(id, chosenCatId);
      setVoted(true);
      setSuccessMessage("Ваш голос учтён!");
      fetchDuel(); // обновляем данные дуэли
    } catch (err) {
      console.error("Vote error:", err);
      // Обработка ошибки от бэкенда
      if (err.error === "Вы уже голосовали в этой дуэли" || 
          (err.message && err.message.includes("уже голосовали"))) {
        setError("Вы уже голосовали в этой дуэли");
        setVoted(true); // помечаем как проголосовавшего
      } else if (err.detail) {
        setError(err.detail);
      } else if (typeof err === 'string') {
        setError(err);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError("Ошибка при голосовании. Попробуйте позже.");
      }
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!duel) return <div>Дуэль не найдена</div>;

  const isActive = duel.status === "active";

  return (
    <div className={styles.container}>
      <button onClick={() => history.goBack()} className={styles.backBtn}>
        ← Назад
      </button>
      <h2>Дуэль</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>{error}</div>
      )}
      
      <div className={styles.duelContainer}>
        <div className={styles.catCard}>
          <h3>{duel.cat_a_name}</h3>
          <p className={styles.voteCount}>Голосов: {duel.votes_a}</p>
          {isActive && !voted && (
            <button onClick={() => handleVote(duel.cat_a)}>Голосовать</button>
          )}
        </div>
        <div className={styles.vsMiddle}>VS</div>
        <div className={styles.catCard}>
          <h3>{duel.cat_b_name}</h3>
          <p className={styles.voteCount}>Голосов: {duel.votes_b}</p>
          {isActive && !voted && (
            <button onClick={() => handleVote(duel.cat_b)}>Голосовать</button>
          )}
        </div>
      </div>
      
      <div className={styles.status}>
        Статус: {isActive ? "Активна" : "Завершена"}
      </div>
      
      {voted && !successMessage && (
        <p className={styles.votedMsg}>Вы уже проголосовали в этой дуэли</p>
      )}
    </div>
  );
};