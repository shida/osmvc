osmvc.ActiveRecord = function() {

}

osmvc.ActiveRecord.apiBaseUrl = null;
osmvc.ActiveRecord.className  = 'osmvc.ActiveRecord';

osmvc.ActiveRecord.create = function(attr) {

    var url = this.apiBaseUrl;
    var me  = this;

    var params = {};
    params[gadgets.io.RequestParameters.METHOD]        = gadgets.io.MethodType.POST;
    params[gadgets.io.RequestParameters.CONTENT_TYPE]  = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;
    if (attr != null) {
        params[gadgets.io.RequestParameters.POST_DATA]     = gadgets.io.encodeValues(attr);
    }

    var d = new Deferred();
    gadgets.io.makeRequest(
        url,
        function(response) {
            if (! response.data) {
                d.fail(new Error(response.errors[0]));
            }
            else if (response.data.status == 'success') {
                var model = eval('new ' + me.className + '(response.data.result)');
                d.call(model);
            }
            else{
                d.fail(new Error('create is fail'));
            }
        },
        params);

    return d;
}

osmvc.ActiveRecord.find = function(attr) {

    var url    = this.apiBaseUrl;
    var isById = false;
    var me     = this;

    var params = {};
    params[gadgets.io.RequestParameters.METHOD]        = gadgets.io.MethodType.GET;
    params[gadgets.io.RequestParameters.CONTENT_TYPE]  = gadgets.io.ContentType.JSON;
    params[gadgets.io.RequestParameters.AUTHORIZATION] = gadgets.io.AuthorizationType.SIGNED;

    var queryString = '';
    if (typeof attr == 'number') {
        url += '/' + attr
        isById = true;
    }
    else {
        $.each(attr, function(key, value) {
            queryString += encodeURI(key)  + '=' + encodeURI(value) + '&';
        });
    }
    if (queryString.length != 0) {
        url += '?' + queryString;
    }

    var d = new Deferred();
    gadgets.io.makeRequest(
        url,
        function(response) {
            if (! response.data) {
                d.fail(new Error(response.errors[0]));
            }
            if (response.data.status == 'success') {
                if (isById) {
                    var model = eval('new ' + me.className + '(response.data.result)')
                    d.call(model);
                }
                else {
                    var models = [];
                    $.each(response.data.result, function (i, object) {
                        var model = eval('new ' + me.className + '(object)');
                        models.push(model);
                    });
                    d.call(models);
                }
            }else{
                d.fail(new Error('find is fail'));
            }
        },
        params);

    return d;
}

