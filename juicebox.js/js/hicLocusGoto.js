/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Created by dat on 3/3/17.
 */

var hic = (function (hic) {

    hic.LocusGoto = function (browser, $container) {
        var $label;

        this.browser = browser;

        this.$container = $('<div class="hic-chromosome-goto-container">');
        $container.append(this.$container);

        // shim for nav alignment purposes
        $label = $('<div>');
        this.$container.append($label);
        $label.text('shim');

        this.$resolution_selector = $('<input type="text" placeholder="chr-x-axis chr-y-axis">');
        this.$container.append(this.$resolution_selector);

        this.$resolution_selector.on('change', function (e) {
            var value = $(this).val();
            browser.parseGotoInput(value);
        });

        this.browser.eventBus.subscribe("LocusChange", this);
    };

    hic.LocusGoto.prototype.receiveEvent = function (event) {

        var self = this,
            bpPerBin,
            pixelsPerBin,
            dimensionsPixels,
            chrs,
            startBP1,
            startBP2,
            endBP1,
            endBP2,
            xy,
            state,
            chr1,
            chr2;

        if (event.type === "LocusChange") {

            state = event.data,
            chr1 = self.browser.dataset.chromosomes[state.chr1];
            chr2 = self.browser.dataset.chromosomes[state.chr2];

            bpPerBin = this.browser.dataset.bpResolutions[state.zoom];
            dimensionsPixels = this.browser.contactMatrixView.getViewDimensions();
            pixelsPerBin = state.pixelSize;

            startBP1 = 1 + Math.round(state.x * bpPerBin);
            startBP2 = 1 + Math.round(state.y * bpPerBin);

            endBP1 = Math.min(chr1.size, Math.round(((dimensionsPixels.width / pixelsPerBin) * bpPerBin)) + startBP1 - 1);
            endBP2 = Math.min(chr2.size, Math.round(((dimensionsPixels.height / pixelsPerBin) * bpPerBin)) + startBP2 - 1);

            xy = chr1.name + ":" + igv.numberFormatter(startBP1) + "-" + igv.numberFormatter(endBP1) + " " +
                chr2.name + ":" + igv.numberFormatter(startBP2) + "-" + igv.numberFormatter(endBP2);


            this.$resolution_selector.val(xy);
        }


    };

    return hic;

})
(hic || {});
