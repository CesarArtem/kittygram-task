import { URL } from "./constants";

const checkResponse = (res) => {
  if (res.ok) {
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};
const headersWithContentType = { "Content-Type": "application/json" };

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  authorization: `Token ${localStorage.getItem("auth_token")}`,
});

export const registerUser = (username, password) => {
  return fetch(`${URL}/api/users/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  }).then(checkResponse);
};

export const loginUser = (username, password) => {
  return fetch(`${URL}/api/token/login/`, {
    method: "POST",
    headers: headersWithContentType,
    body: JSON.stringify({ username, password }),
  })
    .then(checkResponse)
    .then((data) => {
      if (data.auth_token) {
        localStorage.setItem("auth_token", data.auth_token);
        return data;
      }
      return null;
    });
};

export const logoutUser = () => {
  return fetch(`${URL}/api/token/logout/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then((res) => {
    if (res.status === 204) {
      localStorage.removeItem("auth_token");
      return res;
    }
    return null;
  });
};

export const getUser = () => {
  return fetch(`${URL}/api/users/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const getCards = (page = 1) => {
  return fetch(`${URL}/api/cats/?page=${page}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const getCard = (id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const getAchievements = () => {
  return fetch(`${URL}/api/achievements/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then(checkResponse);
};

export const sendCard = (card) => {
  return fetch(`${URL}/api/cats/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const updateCard = (card, id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
    body: JSON.stringify(card),
  }).then(checkResponse);
};

export const deleteCard = (id) => {
  return fetch(`${URL}/api/cats/${id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Token ${localStorage.getItem("auth_token")}`,
    },
  }).then((res) => {
    if (res.status === 204) {
      return { status: true };
    }
    return { status: false };
  });
};

export const getDuels = (status = "active", page = 1) => {
  const url = `${URL}/api/duels/?status=${status}&page=${page}`;
  return fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  }).then(checkResponse);
};

// Получить одну дуэль по ID
export const getDuel = (id) => {
  return fetch(`${URL}/api/duels/${id}/`, {
    method: "GET",
    headers: getAuthHeaders(),
  }).then(checkResponse);
};

// Создать дуэль
export const createDuel = (catAId, catBId) => {
  return fetch(`${URL}/api/duels/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ cat_a: catAId, cat_b: catBId }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        // Пробрасываем ошибку с сообщением от сервера
        throw data;
      }
      return data;
    });
};

// Проголосовать в дуэли
export const voteInDuel = (duelId, chosenCatId) => {
  return fetch(`${URL}/api/duels/${duelId}/vote/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ chosen_cat: chosenCatId }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        // Пробрасываем ошибку с сообщением от сервера
        throw data;
      }
      return data;
    });
};

// Получить список голосов в дуэли (для проверки, голосовал ли пользователь)
export const getDuelVotes = (duelId) => {
  return fetch(`${URL}/api/duels/${duelId}/votes/`, {
    method: "GET",
    headers: getAuthHeaders(),
  }).then(checkResponse);
};

// Получить результаты дуэли
export const getDuelResults = (duelId) => {
  return fetch(`${URL}/api/duels/${duelId}/results/`, {
    method: "GET",
    headers: getAuthHeaders(),
  }).then(checkResponse);
};
