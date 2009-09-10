var furpeace  = new Object();

// コンストラクタ
furpeace.HomeController = function() {
}

$.extend(furpeace.HomeController.prototype, osmvc.ActionController.prototype, {

    before: {'index': ['loadViewer',
                       'checkCreatePet',
                       'checkNewBrother']},

    // action メソッド
    index: function() {
    },

    // before フィルタ用メソッド
    checkNewBrother: function() {

        var me = this;
        return Deferred.next(function() {
            return [];
        }).next(function(newBrothers) {
            if (newBrothers.length > 0) {
                return Deferred.next(function() {
                    return me.redirectTo('pets', 'show_new_brothers', newBrothers);
                }).next(function() {
                    return false;
                });
            }
            else {
                return true;
            }
        });
    },

    checkCreatePet: function() {

        if (osmvc.global.isCreatedPet) {
            return true;
        }

        var me = this;
        return Deferred.next(function() {
            return furpeace.User.isExists();
        })
        .next(function(exists) {
            result = true;
            if (! exists) {
                return Deferred.next(function() {
                    return me.redirectTo('pets', 'add_first');
                }).next(function() {
                    return false;
                });
            }
            else {
                osmvc.global.isCreatedPet = true;
                return true;
            }
        })
    },

    loadViewer: function() {
        if (osmvc.global.viewer == null) {
            return Deferred.next(function() {
                return furpeace.User.loadViewer();
            }).next(function(viewer) {
                osmvc.global.viewer = viewer;
                return true;
            });
        }
        else {
            return true;
        }
    }
});
