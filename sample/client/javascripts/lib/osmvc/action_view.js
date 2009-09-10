osmvc.linkTo = function(name, options, htmlOptions) {

    var tagOptions = '';
    var classes = [];

    if (htmlOptions == null) {
        htmlOptions = {};
    }

    classes.push('osmvcLinkTo');
    $.each(options, function(key, value) {
        classes.push('osmvcLinkTo-' + key + '-' + value);
    });

    if (classes.length > 0) {
        htmlOptions['class'] = ' ' + classes.join(' ');
    }

    $.each(htmlOptions, function(key, value) {
        tagOptions += key + '="' + value + '" ';
    });

    return "<a href='javascript:void(0)'" + tagOptions + ">" + name + "</a>";
}
