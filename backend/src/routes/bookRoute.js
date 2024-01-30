const asyncHandler = require('express-async-handler');
const express = require('express');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const { addNewBook } = require('../controllers/bookController');
const { newBookValidator } = require('../middleware/validators');

const router = express.Router();

router.post(
    '/',
    runValidatorsAndHandleResult(newBookValidator),
    asyncHandler(addNewBook)
);

module.exports = router;