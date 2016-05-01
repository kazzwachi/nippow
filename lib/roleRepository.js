var cradle = require('cradle');
var services = JSON.parse(process.env.VCAP_SERVICES);
var credentials = services['cloudantNoSQLDB'][0].credentials;
var repository = new(cradle.Connection)(credentials.host, credentials.port, {
	secure:true,
	auth:{username:credentials.username,password:credentials.password},
	cache: false,
    raw: false,
	}).database('user_roles');

module.exports.findByUserid = function(userid,callback){
	var option = {
		key : userid
	};
	repository.view('roles/by_userid',option,callback);
}