var express = require('express');
var router = express.Router();
var acl = require('../lib/acl');

/* GET users listing. */
router.route('/')
.get(acl.middleware(),
	function(req, res, next) {
		res.send('Administration functionalities');
	}
);

module.exports = router;