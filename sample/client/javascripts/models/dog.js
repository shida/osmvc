// コンストラクタ
furpeace.Dog = function(attr) {
    this.id                   = attr['id'];
    this.name                 = attr['name'];
    this.kind                 = attr['kind'];
    this.pedigree_no          = attr['pedigree_no'];
    this.farthers_pedigree_no = attr['farthers_pedigree_no'];
    this.mothers_pedigree_no  = attr['mothers_pedigree_no'];
}


$.extend(furpeace.Dog, osmvc.ActiveRecord, {
    className: 'furpeace.Dog',
    apiBaseUrl: osmvc.apiBaseUrl + '/dogs'
});

$.extend(furpeace.Dog.prototype, osmvc.ActiveRecord.prototype, {

    id:                   '',
    name:                 '',
    kind:                 '',
    pedigree_no:          '',
    farthers_pedigree_no: '',
    mothers_pedigree_no:  '',

    getNewBrothers: function() {

        var params = {};
        var url = 'http://furpeace.ark-web.jp/opensocial/dogs/new_brothers';

        var d = new Deferred();

        params[gadgets.io.RequestParameters.METHOD]        = gadgets.io.MethodType.POST;
        params[gadgets.io.RequestParameters.CONTENT_TYPE]  = gadgets.io.ContentType.JSON;
        params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
        params[gadgets.io.RequestParameters.POST_DATA]     = gadgets.io.encodeValues();

        gadgets.io.makeRequest(
            url,
            function(response) {
                var dog;
                if (response.data.status == 'success') {
                    dog = new furpeace.Dog(attr);
                }else{
                    dog = false;
                }
                d.call.apply(d, [dog]);
            },
            params);

        return d;
    }
});

