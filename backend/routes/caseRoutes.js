const express = require('express');
const router = express.Router();
const { 
  createCase, 
  getCases, 
  getCase, 
  updateCase, 
  deleteCase,
  addDocument 
} = require('../controllers/CaseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.route('/')
  .post(createCase)
  .get(getCases);

router.route('/:id')
  .get(getCase)
  .put(updateCase)
  .delete(deleteCase);

router.post('/:id/documents', addDocument);

module.exports = router;