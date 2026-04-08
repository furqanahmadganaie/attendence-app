import db from "../config/db.js";

export const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM employees WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      resolve(results[0]);
    });
  });
};