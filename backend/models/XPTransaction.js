module.exports = (pool) => {
    return {
      addXP: async (userId, xpAmount, transactionType) => {
        const result = await pool.query(
          'INSERT INTO XPTransactions (user_id, xp_amount, transaction_type) VALUES ($1, $2, $3) RETURNING *',
          [userId, xpAmount, transactionType]
        );
        return result.rows[0];
      },
    };
  };