module.exports = (pool) => {
    return {
      getNodesByPathId: async (pathId) => {
        const result = await pool.query('SELECT * FROM Nodes WHERE path_id = $1', [pathId]);
        return result.rows;
      },
    };
  };