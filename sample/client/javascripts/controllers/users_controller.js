// コンストラクタ
furpeace.UsersController = function() {
}

furpeace.UsersController.prototype = {

    existHandler: null,

    exists: function(existHandler) {
        this.existHandler = existHandler;
        furpeace.User.exists(
            furpeace.c.users.onLoadExist);
    },

    onLoadExist: function(exist) {
        if (exist) {
            furpeace.existHandler();
        }
        else {
            furpeace.c.dogs.showNew();
        }
    }
}


