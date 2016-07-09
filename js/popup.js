"use strict";

var storage = chrome.storage.local;

storage.get('disable_markdown', function(items) {
    if(items.disable_markdown) {
        $('#disable-markdown').attr('checked', 'checked');
    } else {
        $('#disable-markdown').removeAttr('checked');
    }
});

$('#disable-markdown').change(function() {
    if($(this).prop('checked')) {
        storage.set({'disable_markdown' : 1});
    } else {
        storage.remove('disable_markdown');
    }
});
