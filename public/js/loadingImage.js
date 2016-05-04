var loadingImage = loadingImage || {
    show:function(){
        if($("#loading").size() == 0){
            $("body").append("<div id='loading'></div>");
        }
    },
    hide:function(){
        $("#loading").remove();
    }
};