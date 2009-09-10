osmvc.defaultActions = {'canvas':  {'controller': 'home',
                                    'action':     'index'},
                        'profile': {'controller': 'home',
                                    'action':     'index'},
                        'home':    {'controller': 'home',
                                    'action':     'index'}};

osmvc.controllers = ['furpeace.PetsController', 'furpeace.HomeController'];

osmvc.templateBaseUrl = 'http://furpeace.ark-web.jp/opensocial/javascripts/views';
osmvc.apiBaseUrl      = 'http://furpeace.ark-web.jp/opensocial';
