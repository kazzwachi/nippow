var express = require('express');
var router = express.Router();
var roleRepository = require('../lib/roleRepository');
var acl = require('../lib/acl');

router.route('/')
.get(function(req,res,next){
	res.send(req.user);
	return res.status(200).end();
});
router.route('/couchConf')
.get(function(req,res,next){
	var services = JSON.parse(process.env.VCAP_SERVICES);
	var credentials = services['cloudantNoSQLDB'][0].credentials;
	res.send(credentials);
	return res.status(200).end();
});
router.route('/showRoles')
.get(function(req,res,next){
	acl.userRoles(req.session.userId,function(err,roles){
		if(err){
			res.send(err);
		}
		res.send(roles);
		return res.status(200).end();
	});
});
module.exports = router;