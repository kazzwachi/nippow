var app = app || {};

app.Item = Backbone.Model.extend({
    urlRoot : '/api/roles',
    idAttribute: "_id"
});

app.ItemList = Backbone.Collection.extend({
    model : app.Item,
    url : '/api/roles'
});

app.RowView = Backbone.View.extend({
    template : _.template($('#row_template').text()),
    tagName : 'tr',
    render : function(){
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

app.ListView = Backbone.View.extend({
    el : $('#table_roles')
});

app.ItemView = Backbone.View.extend({
    el : $('#div_role'),
    template : _.template($('#form_template').text()),
    tagName : 'div',
    render : function(){
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});
app.Router = Backbone.Router.extend({
    routes : {
        "" : "listView",
        "/" : "listView",
        "edit/:id" : "editForm",
        "new" : "createForm",
        "save" : "saveData",
        "delete" : "deleteData"
    },
    editForm   : function(id){
        $('#list_area').hide();
        $('#item_area').show();
        app.editForm(id);
    },
    createForm : function(){
        $('#list_area').hide();
        $('#item_area').show();
        app.createForm();
    },
    saveData   : function(){
        $('#list_area').show();
        $('#item_area').hide();
        app.saveData();
    },
    deleteData : function(){
        $('#list_area').show();
        $('#item_area').hide();
        app.deleteData();
    },
    listView   : function(){
        $('#list_area').show();
        $('#item_area').hide();
        app.emptyFormData();
        app.refreshList();
    }
});
app.editForm = function(id){
    var item = app.itemList.get(id);
    app.itemView = new app.ItemView({model : item});
    app.itemView.render();
    
    $('#input_id').attr('disabled',true);
    $('#input_rev').attr('disabled',true);
    $('#input_userid').attr('disabled',true);
    $('#input_userid_exp').attr('disabled',true);
    $('#button_delete').removeAttr('disabled');
};
app.createForm = function(){
    var item = new app.Item({
        _id : null,
        _rev : null,
        userid : 'sso-cmtr-dev-0lh28ssyz2-cp16.iam.ibmcloud.com/www.ibm.com/',
        userid_exp : '',
        roles : ''
    });
    app.itemView = new app.ItemView({model : item});
    app.itemView.render();

    $('#input_id').attr('disabled',true);
    $('#input_rev').attr('disabled',true);
    $('#input_userid').attr('disabled',true);
    $('#input_userid_exp').removeAttr('disabled');
    $('#button_delete').attr('disabled',true);
};
app.emptyFormData = function(){
    $('#input_id').val('');
    $('#input_rev').val('');
    $('#input_userid').val('');
    $('#input_userid_exp').val('');
};
app.saveData = function(){
    loadingImage.show();
    var model = app.itemView.model;
    model.unset('userid_exp');
    if(model.isNew()){
        var attrs = {
            userid : $('#input_userid').val() + $('#input_userid_exp').val(),
            roles  : $('#input_roles').val().split(',')
        };
        app.itemList.create(attrs,{wait : true});
        app.router.navigate('/',{trigger : false});
    }else{
        var attrs = {
            roles  : $('#input_roles').val().split(',')
        };
        model.save(attrs,{
            success:function(model, response, options){
                app.itemList.trigger('changed');
                app.router.navigate('/',{trigger : false});
            },
            error:function(){
                console.log('error');
            }
        });
    }
};
app.deleteData = function(){
    loadingImage.show();
    var model = app.itemView.model;
    model.destroy({
        success : function(){
            app.router.navigate('/',{trigger : false});
        },
        error : function(){
            console.log('error');
        },
        wait : true
    });
};
app.refreshList = function(){
    loadingImage.show();
    app.itemList.reset();
    app.itemList.fetch({
        success:function(collection,response,options){
            app.itemList.trigger('fetched');
        },
        error:function(err){
            console.log(err);
        }
    });
};
app.refreshListView = function(){
    app.listView.$el.empty();
    _.each(app.itemList.models,function(model){
        var userid_exp = model.attributes.userid;
        userid_exp = userid_exp.substring(userid_exp.lastIndexOf('/')+1);
        model.set({userid_exp : userid_exp});
    
        var rowView = new app.RowView({model : model});
        app.listView.$el.append(rowView.render().el);
    });
    loadingImage.hide();
};

$(function(){
    //コレクションとビューの設定
    app.itemList = new app.ItemList();
    app.listView = new app.ListView();
    app.listView.listenTo(app.itemList,'fetched',app.refreshListView);
    app.listView.listenTo(app.itemList,'add',app.refreshListView);
    app.listView.listenTo(app.itemList,'changed',app.refreshListView);
    app.listView.listenTo(app.itemList,'destroy',app.refreshListView);

    //ルーターの設定
    app.router = new app.Router();
    Backbone.history.start();
    
    //イベントハンドラの割り当て
    $('#button_back').click(function(){
        app.router.navigate('',{trigger:true,replace:true});
    });
    $('#button_save').click(function(){
        modalConfirm.show('保存します。よろしいですか？',function(){
            app.router.navigate('#save',{trigger : true,replace: true});
        });
    });
    $('#button_delete').click(function(){
        modalConfirm.show('削除します。よろしいですか？',function(){
            app.router.navigate('#delete',{trigger : true,replace: true});
        });
    });
});