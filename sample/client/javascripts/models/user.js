// コンストラクタ
furpeace.User = function(attr) {
    this.id = attr['id'];
}


$.extend(furpeace.User, osmvc.ActiveRecord, {
    className: 'furpeace.User',
    apiBaseUrl: osmvc.apiBaseUrl + '/users',

    isExists: function() {

        var me = this;

        return Deferred.next(function() {
            return me.find({'find_by_viewer_id': true});
        }).next(function(models) {
            if (models.length == 1) {
                return true;
            }
            else {
                return false;
            }
        });
    },

    loadViewer: function() {

        var req = opensocial.newDataRequest();
        req.add(req.newFetchPersonRequest(
            opensocial.IdSpec.PersonId.VIEWER),
                'person');

        var d = new Deferred();

        req.send(function(res) {
            var item = res.get('person');
            var data = item.getData();
            d.call.apply(d, [data]);
        });

        return d;
    }
});

$.extend(furpeace.User.prototype, osmvc.ActiveRecord.prototype, {
    id: ''
});



