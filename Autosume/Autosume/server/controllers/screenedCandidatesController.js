import ScreenedCandidate from '../models/ScreenedCandidate.js';

export const saveScreenedCandidates = async (req, res) => {
  try {
    const candidates = req.body.candidates || [];
    
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "No candidates provided" });
    }

    // Bulk upsert operation
    const bulkOps = candidates.map(candidate => ({
      updateOne: {
        filter: { email: candidate.email, jobId: candidate.jobId },
        update: { $set: candidate },
        upsert: true
      }
    }));

    const result = await ScreenedCandidate.bulkWrite(bulkOps);
    
    res.json({
      success: true,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: result.upsertedCount + result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to save candidates',
      details: error.message
    });
  }
};

export const getScreenedCandidates = async (req, res) => {
  try {
    const { jobId, role, status } = req.query;
    const query = {};
    
    if (jobId) query.jobId = jobId;
    if (role) query.role = role;
    if (status) query.status = status;

    const candidates = await ScreenedCandidate.find(query)
      .sort({ matchPercentage: -1, createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch candidates',
      details: error.message
    });
  }
};