"use strict";

var storage = chrome.storage.local,
    defaultReloadFreq = 3;

function message(text, type) {
    var msgType = type || 'success',
        msgClass = 'alert-' + msgType;
    $('#msg').html('<div class="alert ' + msgClass + '">' + text + '</div>');
    setTimeout(function() {
        $('div.alert').hide(500);
    }, 3000);
}

// auto-reload
storage.get('auto_reload', function(items) {
    if(items.auto_reload) {
        $('#auto-reload').attr('checked', 'checked');
    } else {
        $('#auto-reload').removeAttr('checked');
    }
});

$('#auto-reload').change(function() {
    if($(this).prop('checked')) {
        storage.set({'auto_reload' : 1});
    } else {
        storage.remove('auto_reload');
    }
});

// Page theme
function pageTheme() {
    storage.get('pgtheme', function(items) {
        if(items.pgtheme) {
            $('#pgtheme').val(items.pgtheme);
        } 
    });
}

pageTheme();
$('#pgtheme').change(function() {
    storage.set({'pgtheme' : $(this).val()}, function() {
        message('You changed the default page theme.');
    });
});


// Code theme
function codeTheme() {
    storage.get('cdtheme', function(items) {
        if(items.cdtheme) {
            $('#cdtheme').val(items.cdtheme);
        } 
    });
}

codeTheme();
$('#cdtheme').change(function() {
    storage.set({'cdtheme' : $(this).val()}, function() {
        message('You changed the default code theme.');
    });
});


// file extensions

$('.exts input').change(function() {
    var fileExt = this.value,
        isChecked = this.checked;
    storage.get('exclude_exts', function(items) {
        var exts = items.exclude_exts,
            key = fileExt;

        if(!exts) {
            exts = {};
        }

        if(isChecked) {
            delete exts[key];
        } else {
            exts[key] = 1;
        }

        storage.set({'exclude_exts' : exts}); 
    });
});

storage.get('reload_freq', function(items) {
    var freq = items.reload_freq;
    freq = freq ? freq : defaultReloadFreq;
    
    $.each($('#reload-freq option'), function(k, v) {
        if($(v).val() == freq) {
            $(v).attr('selected', 'selected');
        }
    });
});

$('#reload-freq').change(function() {
    storage.set({'reload_freq' : $(this).val()});
});

storage.get('exclude_exts', function(items) {
    var exts = items.exclude_exts;
    if(!exts) {
        return;
    }

    $.each(exts, function(k, v) {
        $('input[value="' + k + '"]').attr('checked', false);
    });
});
