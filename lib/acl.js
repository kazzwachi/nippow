var acl = require('acl');
module.exports = new acl(new acl.memoryBackend());
module.exports.allow([
	{
		roles:['admin'],
		allows:[{resources:'/admin',permissions:'*'}]
	}
]);