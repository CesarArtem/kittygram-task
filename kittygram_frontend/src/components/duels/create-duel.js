import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getCards, createDuel } from "../../utils/api";
import styles from "./duels.module.css";

export const CreateDuel = () => {
  const [cats, setCats] = useState([]);
  const [catA, setCatA] = useState("");
  const [catB, setCatB] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

  useEffect(() => {
    const fetchUserCats = async () => {
      try {
        const data = await getCards(1);
        setCats(data.results || data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserCats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Простая валидация на фронте
    if (catA === catB) {
      setError("Кот не может сражаться сам с собой");
      setLoading(false);
      return;
    }
    
    try {
      await createDuel(catA, catB);
      history.push("/duels");
    } catch (err) {
      console.error("Create duel error:", err);
      
      // Обработка различных ошибок от бэкенда
      if (err.non_field_errors) {
        setError(err.non_field_errors[0]);
      } else if (err.detail) {
        setError(err.detail);
      } else if (err.error) {
        setError(err.error);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError("Ошибка создания дуэли. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Создать дуэль</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <select 
          value={catA} 
          onChange={(e) => setCatA(e.target.value)} 
          required
          className={styles.select}
        >
          <option value="">Выберите первого кота</option>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        
        <span className={styles.vsText}>VS</span>
        
        <select 
          value={catB} 
          onChange={(e) => setCatB(e.target.value)} 
          required
          className={styles.select}
        >
          <option value="">Выберите второго кота</option>
          {cats.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        
        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? "Создание..." : "Создать дуэль"}
        </button>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
      </form>
    </div>
  );
};