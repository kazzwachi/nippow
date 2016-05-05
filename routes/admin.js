var express = require('express');
var router = express.Router();
var acl = require('../lib/acl');
var roleRepository = require('../lib/roleRepository');

/* GET users listing. */
router.route('/')
.get(
//サーバー設置時は以下コメントアウトを解除すること
//	acl.middleware(),
	function(req, res, next) {
		res.send('Administration functionalities');
	}
);
router.route('/roles')
.get(
//サーバー設置時は以下コメントアウトを解除すること
//	acl.middleware(),
	function(req, res, next){
		res.render('admin/roles',{});
	}
);

module.exports = router;