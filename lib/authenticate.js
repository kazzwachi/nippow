var roleRepository = require('./roleRepository');
var acl = require('./acl');

module.exports.ssoCallback = function(req,res,next){
	var redirectUrl = req.session.originalUrl || '/';
	res.redirect(redirectUrl);	
};

module.exports.ensureAuthenticated = function(req,res,next){
	if(req.path === '/login'){
		return next();
	}
	if(req.path === '/auth/sso/callback'){
		return next();
	}
	if(req.isAuthenticated()){
		if(!req.session.userId){
			req.session.userId = req.user.id;
			roleRepository.findByUserid(req.user.id,function(err,roles){
				if(err){
					console.log(err);
				}
				if(roles && roles.length > 0){
					//一旦古いロールを消す
					acl.userRoles(req.user.id,function(err,oldRoles){
						if(err){
							acl.addUserRoles(req.user.id,roles[0].value);
						}else{
							acl.removeUserRoles(req.user.id,oldRoles,function(err){
								acl.addUserRoles(req.user.id,roles[0].value);
							});
						}
					});
				}
				return next();
			});
		};
		return next();
	}else{
		req.session.originalUrl = req.originalUrl;
		res.redirect('/login');
	}
}