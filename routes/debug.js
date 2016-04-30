var express = require('express');
var router = express.Router();
router.route('/')
.get(function(req,res,next){
	console.log('debug...');
	console.log(req.user);
	res.send(JSON.stringify(req.user));
});

module.exports = router;