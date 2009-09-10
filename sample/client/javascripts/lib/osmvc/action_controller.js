var osmvc     = new Object();
osmvc.c       = {};
osmvc.global  = {};

osmvc.ActionController = function() {

}

osmvc.ActionController.initialize = function() {

    osmvc.ActionController.loadControllers();
    var viewName      = gadgets.views.getCurrentView().getName();
    var defaultAction = osmvc.defaultActions[viewName];
    var controller    = osmvc.c[defaultAction['controller']];
    var me            = this;

    controller.controllerName = defaultAction['controller'];
    controller.setAction(defaultAction['action']);

    Deferred.next(function() {
        return controller.performAction();
    });

}

osmvc.ActionController.loadControllers = function() {

    $.each(osmvc.controllers, function(i, longName){
        var matchs = longName.match(/([a-zA-Z1-9]+)Controller$/)
        var shortName = matchs[1];
        shortName = osmvc.ActionController.camelToSnake(shortName);
        osmvc.c[shortName] = eval('new ' + longName);
    });
}

osmvc.ActionController.camelToSnake = function(camelStr) {
    var snakeStr = camelStr.replace(/([A-Z])/g,
        function(str, p1) {
            return "_" + p1.toLowerCase();
        });
    snakeStr = snakeStr.replace(/^_/, "");
    return snakeStr;
}

osmvc.ActionController.snakeToCamel = function(snakeStr) {

    var camelStr = snakeStr.replace(/_([a-z])/g,
        function(str, p1) {
            return p1.toUpperCase();
        });
    return camelStr;
}


osmvc.ActionController.prototype = {

    controllerName: null,
    actionName: null,
    actionMethodName: null,
    params: {},
    afterRender: null,
    layout: 'common',
    cachedTemplates: {},
    performedRender: false,
    event: null,

    setAction: function(actionName) {
        this.actionName       = actionName;
        this.actionMethodName = osmvc.ActionController.snakeToCamel(actionName);

    },

    performAction: function() {

        console.log('controller: ' + this.controllerName + ', ' +
                    'action: ' + this.actionName);

        var me = this;
        var beforeResult = false;

        return Deferred.next(function() {
            // beforeフィルタ
            beforeHandlers = me.getBeforeHandlers();

            return me.processBeforeRecursive(
                beforeHandlers,
                true);
        }).next(function(result) {
            beforeResult = result;
            // actionメソッド実行
            if (beforeResult) {
                var action = me[me.actionMethodName];
                return action.apply(me);
            }
        }).next(function() {
            if (beforeResult && ! me.performedRender) {
                return me.render();
            }
        }).next(function() {
            me.performedRender = false;
            me.setHandlerToLinkTo();
        }).error(function(e) {
            return me.processError(e);
        });
    },

    redirectTo: function(controllerName, actionName, params, event) {
        if (osmvc.c[controllerName] == null) {
            throw new Error('invalid controller name: ' + controllerName);
        }
        var controller = osmvc.c[controllerName];
        controller.controllerName = controllerName;
        controller.setAction(actionName);
        controller.params = params;
        controller.event  = event;
        var me = this;

        return Deferred.next(function() {
            return controller.performAction();
        }).next(function() {
            me.performedRender = true;
        });
    },

    render: function() {

        if (this.performedRender) {
            return true;
        }

        var layoutUrl   = osmvc.templateBaseUrl +
                              '/layouts/' + this.layout + '.tmpl';
        var templateUrl = osmvc.templateBaseUrl +
                              '/' + this.controllerName + '/' + this.actionName + '.tmpl';
        var layout      = '';
        var template    = '';
        var me          = this;

        return Deferred.next(function() {
            return me.loadTemplate(layoutUrl);
        }).next(function(loaded) {
            layout = loaded;
            return me.loadTemplate(templateUrl);
        }).next(function(loaded) {
            template = loaded;
            var data     = me;
            data = $.extend(data, osmvc.global);
            var main     = template.process(data);
            data = $.extend(data, {main: main});
            var contents = layout.process(data);

            $('#contents').html(contents);
            if (me.afterRender != null) {
                me.afterRender();
            }
            me.performedRender = true;
        });
    },

    setHandlerToLinkTo: function() {
        var me = this;

        $('a.osmvcLinkTo').bind('click', function(e) {
            me.onClickLinkTo(e);
            return false;
        });
    },

    processError: function(e) {
        console.log('error is occered!!!');
        console.log(e);
    },

    bind: function(obj, evt, option) {

        var me = this;

        obj.bind(evt, function(e) {
            Deferred.next(function() {
                return me.redirectTo(option['controller'],
                                     option['action'],
                                     option['params'],
                                     e);
            }).next(function() {
                me.performedRender = false;
            }).error(function(e) {
                me.processError(e);
            });
            return false;
        });
    },

    // private
    getBeforeHandlers: function() {

        var beforeHandlers = [];
        if (this.before != null) {
            var beforeHandlerNames = this.before[this.actionName];

            for (var i = 0;i < beforeHandlerNames.length;++i) {
                var beforeHandlerName = beforeHandlerNames[i];
                var beforeHandler     = this[beforeHandlerName];
                beforeHandlers.push(beforeHandler);
            }
        }

        return beforeHandlers;
    },

    processBeforeRecursive: function(beforeHandlers, result) {

        var beforeHandler = beforeHandlers.shift();

        // 再起終了条件
        if (! result || ! beforeHandler) {
            return result;
        }
        else {
            var me = this;
            return Deferred.next(function() {
                return beforeHandler.apply(me);
            }).next(function(result) {
                return me.processBeforeRecursive(beforeHandlers,
                                                 result);
            });
        }
    },

    loadTemplate: function(url) {

        if (this.cachedTemplates[url]) {
            return this.cachedTemplates[url];
        }

        var params = {};
        params[gadgets.io.RequestParameters.METHOD]        = gadgets.io.MethodType.GET;
        params[gadgets.io.RequestParameters.CONTENT_TYPE]  = gadgets.io.ContentType.TEXT;
        var me = this;

        return Deferred.next(function() {
            var d = new Deferred();
            gadgets.io.makeRequest(
                url,
                function(response) {
                    if (! response.data) {
                        var e = new Error('template file is not found ');
                        d.call.apply(d, [e]);
                    }
                    else {
                        me.cachedTemplates[url] = response.data;
                        d.call.apply(d, [response.data]);
                    }
                },
                params);

            return d;
        }).next(function(result) {
            if (result.toString().indexOf("Error") != -1) {
                throw result;
            }
            else {
                return result;
            }
        });
    },

    onClickLinkTo: function(e) {

        var classNames = $(e.target).attr('class').split(' ');
        var controllerName = '';
        var actionName     = '';
        var params         = {}
        var me             = this;

        $.each(classNames, function(j, className) {
            var match;
            if (match = className.match(/osmvcLinkTo-controller-(.*)/)) {
                controllerName = match[1];
            }
            else if (match = className.match(/osmvcLinkTo-action-(.*)/)) {
                actionName = match[1];
            }
            else if (match = className.match(/osmvcLinkTo-([a-zA-Z0-9]+)-(.*)/)) {
                if (match[1] == 'id') {
                    params[match[1]] = parseInt(match[2]);
                }
                else {
                    params[match[1]] = match[2];
                }
            }
        });

        Deferred.next(function() {
            return me.redirectTo(controllerName, actionName, params);
        }).next(function() {
            me.performedRender = false;
        });
    }
}

gadgets.util.registerOnLoadHandler(function() {
    osmvc.ActionController.initialize();
});