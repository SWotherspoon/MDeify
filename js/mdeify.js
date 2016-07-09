(function(document) {

    var interval, 
        defaultReloadFreq = 3,
        previousText,
        storage = chrome.storage.local;

    var mdeify = window.markdownit({
        typographer: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) {}
            }

            return ''; // use external default escaping
        }
    }).use(window.markdownitMathjax).use(window.markdownitFootnote);
    
    function parseMatchPattern(input) {
        if (typeof input !== 'string') {
            return null;
        }
        var match_pattern = '(?:^', 
            regEscape = function(s) {return s.replace(/[[^$.|?*+(){}\\]/g, '\\$&');},  
            result = /^(\*|https?|file|ftp|chrome-extension):\/\//.exec(input);

        // Parse scheme
        if (!result) {
            return null;
        }

        input = input.substr(result[0].length);
        match_pattern += result[1] === '*' ? 'https?://' : result[1] + '://';

        // Parse host if scheme is not `file`
        if (result[1] !== 'file') {
            if (!(result = /^(?:\*|(\*\.)?([^\/*]+))/.exec(input))) return null;
            input = input.substr(result[0].length);
            if (result[0] === '*') {    // host is '*'
                match_pattern += '[^/]+';
            } else {
                if (match[1]) {         // Subdomain wildcard exists
                    match_pattern += '(?:[^/]+\.)?';
                }
                // Append host (escape special regex characters)
                match_pattern += regEscape(match[2]) + '/';
            }
        }

        // Add remainder (path)
        match_pattern += input.split('*').map(regEscape).join('.*');
        match_pattern += '$)';
        return match_pattern;
    }

    function makeHead(data) {
        // Inject viewport
        var meta = $('<meta/>').attr('name','viewport')
            .attr('content','width=device-width, initial-scale=1');
        $(document.head).prepend(meta);

        // Inject js to load MathJax
        var mathjax = $('<script/>').attr('type','text/javascript')
            .attr('src', 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS_HTML');
        $(document.head).append(mathjax);
        
    }

    
    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        var html = mdeify.render(data);
        html = '<main id="content" class="container">\n' + html + '\n</main>'; 
        $(document.body).html(html);

        // Add bootstrap classes to all tables but set auto width
        $('table').addClass("table table-bordered");
        $('table').css({'width' : 'auto'});
        
        // Inject js to reload MathJax
        var link = $('#math-rerender');
        if(link.length) {
            link.remove();
        }
        var mathjax = $('<script/>').attr('type', 'text/javascript')
            .attr('id', 'math-rerender')
            .attr('src', chrome.extension.getURL('js/runMathJax.js'));
        $(document.head).append(mathjax);
        
        previousText = data;
    }

    function setTheme(id,theme) {
        var pfx = (id === 'pgtheme') ? 'themes/bootstrap/' : 'themes/highlight/';
        var css = chrome.extension.getURL(pfx + theme + '.css');
        var link = $('#'+id);
        if(!link.length) {
            var style = $('<link/>').attr('rel', 'stylesheet')
                .attr('id', id)
                .attr('href', css);
            $(document.head).append(style);
        } else {
            link.attr('href', css);
        }
    }
    
    function stopAutoReload() {
        clearInterval(interval);
    }

    function startAutoReload() {
        stopAutoReload();

        var freq = defaultReloadFreq;
        storage.get('reload_freq', function(items) {
            if(items.reload_freq) {
                freq = items.reload_freq;
            }
        });

        interval = setInterval(function() {
            $.ajax({
                url : location.href, 
                cache : false,
                success : function(data) { 
                    if (previousText == data) {
                        return;
                    }
                    makeHtml(data); 
                }
            });
        }, freq * 1000);
    }

    function render() {
        $.ajax({
            url : location.href, 
            cache : false,
            success : function(data) {
     
                makeHtml(data);
                storage.get('pgtheme', function(items) {
                    theme = items.pgtheme ? items.pgtheme : 'bootstrap';
                    setTheme('pgtheme',theme);
                });
                storage.get('cdtheme', function(items) {
                    theme = items.cdtheme ? items.cdtheme : 'googlecode';
                    setTheme('cdtheme',theme);
                });

                storage.get('auto_reload', function(items) {
                    if(items.auto_reload) {
                        startAutoReload();
                    }
                });
            }
        });
    }

    storage.get(['exclude_exts', 'disable_markdown'], function(items) {
        if(items.disable_markdown) {
            return;
        }

        makeHead();
        var exts = items.exclude_exts;
        if(!exts) {
            render();
            return;
        }

        var parsed = $.map(exts, function(k, v) {
            return parseMatchPattern(v);
        });
        var pattern = new RegExp(parsed.join('|'));
        if(!parsed.length || !pattern.test(location.href)) {
            render();
        }
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
            var value = changes[key];
            if(key == 'pgtheme' || key == 'cdtheme') {
                setTheme(key,value.newValue);
            } else if(key == 'reload_freq') {
                storage.get('auto_reload', function(items) {
                    startAutoReload();
                });
            } else if(key == 'auto_reload') {
                if(value.newValue) {
                    startAutoReload();
                } else {
                    stopAutoReload();
                }
            } else if(key == 'disable_markdown') {
                location.reload();
            }
        }
    });

}(document));
