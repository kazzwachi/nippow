var express = require('express');
var router = express.Router();
var acl = require('../../lib/acl');
var cradle = require('cradle');
var services = JSON.parse(process.env.VCAP_SERVICES);
var credentials = services['cloudantNoSQLDB'][0].credentials;
var repository = new(cradle.Connection)(credentials.host, credentials.port, {
	secure:true,
	auth:{username:credentials.username,password:credentials.password},
	cache: false,
    raw: false,
	}).database('user_roles');

router.route('/')
.get(function(req, res, next){
	repository.view('roles/all',function(err,result){
		res.type('application/json');
		if(err){
			return res.status(500).send({msg:'database access failed.'});
		}
		var roles = result.rows.map(function(e){
			return e.value;
		});
		return res.status(200).send(roles);
	});
})
.post(function(req,res,next){
	repository.save(req.body,function(err,result){
		if(err){
			return res.status(500).send(err);
		}
		console.log(result);
		var response = {
			_id  : result.id,
			_rev : result.rev,
			userid : req.body.userid,
			roles : req.body.roles
		};
		
		return res.status(201).send(response);
	});
});

router.route('/:id')
.get(function(req,res,next){
	repository.view('roles/all',{key : req.params.id},function(err,result){
		if(err){
			return res.status(404).send(err);
		}
		return res.status(200).send(result);
	});
})
.put(function(req,res,next){
	repository.save(req.params.id,req.body,function(err,result){
		if(err){
			console.log(err);
			return res.status(500).send(err);
		}
		return res.status(204).send(result);
	});
})
.delete(function(req,res,next){
	repository.remove(req.params.id,function(err,result){
		if(err){
			console.log(err);
			return res.status(500).send(err);
		}
		return res.status(204).send(result);
	});
});

module.exports = router;