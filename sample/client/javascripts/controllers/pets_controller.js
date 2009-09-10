// コンストラクタ
furpeace.PetsController = function() {
}

$.extend(furpeace.PetsController.prototype, osmvc.ActionController.prototype, {

    // アクションメソッド
    add: function() {
        var me = this;
        this.afterRender = function() {
            me.bind($('#formPetCreate'),
                    'submit',
                    {controller: 'pets',
                     action:     'create'});
        }
    },

    addFirst: function() {
        var me = this;
        this.layout = 'pets_add_first';
        this.afterRender = function() {
            me.bind($('#formPetCreate'),
                    'submit',
                    {controller: 'pets',
                     action:     'create'});
        }
    },

    list: function() {
        var me = this;
        return Deferred.next(function() {
            return furpeace.Dog.find({only_pets: true});
        }).next(function(pets) {
            me.pets = pets;
        });
    },

    show: function() {
        var me = this;
        return Deferred.next(function() {
            return furpeace.Dog.find(me.params['id']);
        }).next(function(pet) {
            me.pet = pet;
        });
    },

    showNewBrother: function() {
        alert('pets - showNewBrother');
    },

    create: function() {

        var params = {
            name:                 $('#name').val(),
            kind:                 $('#kind').val(),
            pedigree_no:          $('#pedigree_no').val(),
            farthers_pedigree_no: $('#farthers_pedigree_no').val(),
            mothers_pedigree_no:  $('#mothers_pedigree_no').val()
        };

        var me = this;

        return Deferred.next(function() {
            return furpeace.Dog.create(params);
        }).next(function(pet) {
            if( pet ){
                return me.redirectTo('home', 'index');
            }else{
                throw new Error('cant create pet');
            }
        });
    }
});
