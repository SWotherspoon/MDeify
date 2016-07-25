# MDeify

Chrome extension to render markdown files within chrome according to
the [CommonMark Spec](http://spec.commonmark.org/) using the
extensible [markdown-it](https://github.com/markdown-it/markdown-it)
parser.

Can be set to periodically reload to reflect changes in the document.

## Features

1. [MathJax](https://www.mathjax.org/) within markdown. Use
   `\(...\)` for inline math, `\[...\]` for displayed math.
1. Pandoc style footnotes through the
   [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)
   plugin.
1. Code highlighting with [highlightjs](https://highlightjs.org/).
1. [Bootswatch](http://bootswatch.com/) themes.
1. Live editing by periodic reloading.

## Usage

1. Download source from [GitHub](https://github.com/SWotherspoon/MDeify)
1. Open the Chrome `chrome://extensions` page in developer mode, and
   load as an unpacked extension.
1. Check "Allow access to file URLs" in the listing on the
   `chrome://extensions` page.
1. Open a local or remote markdown file in Chrome.


## Provenance

Based on volca's [fork](https://github.com/volca/markdown-preview) of
Boris Smus' [markdown preview](https://github.com/borismus/markdown-preview).

