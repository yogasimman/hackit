module.exports = (pool) => {
    return {
      getAssessmentByNodeId: async (nodeId) => {
        const result = await pool.query('SELECT * FROM Assessments WHERE node_id = $1', [nodeId]);
        return result.rows;
      },
    };
  };