module.exports = (pool) => {
    return {
      createUser: async (username, passwordHash, email) => {
        const result = await pool.query(
          'INSERT INTO Users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING *',
          [username, passwordHash, email]
        );
        return result.rows[0];
      },
      getUserById: async (id) => {
        const result = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
        return result.rows[0];
      },
    };
  };