module.exports = (pool) => {
    return {
      getAllPaths: async () => {
        const result = await pool.query('SELECT * FROM Paths');
        return result.rows;
      },
    };
  };