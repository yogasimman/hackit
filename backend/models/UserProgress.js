module.exports = (pool) => {
    return {
      markNodeCompleted: async (userId, nodeId) => {
        const result = await pool.query(
          'INSERT INTO UserProgress (user_id, node_id) VALUES ($1, $2) RETURNING *',
          [userId, nodeId]
        );
        return result.rows[0];
      },
    };
  };