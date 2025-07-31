const ScreenedCandidate = require('../models/ScreenedCandidate');

const saveScreenedCandidates = async (req, res) => {
  try {
    const candidates = req.body.candidates || [];
    
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "No candidates provided" });
    }

    // Add timestamps and default status if not provided
    const candidatesWithDefaults = candidates.map(candidate => ({
      ...candidate,
      status: candidate.status || 'Screened',
      dateScreened: candidate.dateScreened || new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Bulk upsert operation
    const bulkOps = candidatesWithDefaults.map(candidate => ({
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
      total: result.upsertedCount + result.modifiedCount,
      count: result.upsertedCount + result.modifiedCount
    });
  } catch (error) {
    console.error('Error saving screened candidates:', error);
    res.status(500).json({
      error: 'Failed to save candidates',
      details: error.message
    });
  }
};

const getScreenedCandidates = async (req, res) => {
  try {
    const { jobId, role, status } = req.query;
    const query = {};
    
    if (jobId) query.jobId = jobId;
    if (role) query.role = role;
    if (status) query.status = status;

    const candidates = await ScreenedCandidate.find(query)
      .sort({ match: -1, matchPercentage: -1, createdAt: -1 });

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching screened candidates:', error);
    res.status(500).json({
      error: 'Failed to fetch candidates',
      details: error.message
    });
  }
};

module.exports = {
  saveScreenedCandidates,
  getScreenedCandidates
};