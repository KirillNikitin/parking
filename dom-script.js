function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}
var drawDiagram = (function () {
    function drawDiagram() {
        //this.draw(this.timeLinePointer(this.commonCarArraySplitter(this.parseTimes(this.getFile()))))
    }
    drawDiagram.prototype.init = function (contents) {
        this.draw(this.timeLinePointer(this.commonCarArraySplitter(this.parseTimes(contents))));
    };
    drawDiagram.prototype.draw = function (arr) {
        var getCarsAndTimeInfo = function (arr) {
            this.maxNumCars = 0;
            var maxNumCars = 0, startTime = Infinity, endTime = 0, carsAndTimeInfo = {};
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].cars > maxNumCars)
                    maxNumCars = arr[i].cars;
                if (arr[i].timescale < startTime)
                    startTime = arr[i].timescale;
                if (arr[i].timescale > endTime)
                    endTime = arr[i].timescale;
            }
            //carsAndTimeInfo = { maxNumCars: maxNumCars, startTime: startTime, endTime: endTime }
            this.maxNumCars = maxNumCars;
            this.startTime = startTime;
            this.endTime = endTime;
            return this;
        };
        var width = diagram.offsetWidth;
        var height = diagram.offsetHeight;
        var _carsAndTimeInfo = getCarsAndTimeInfo(arr);
        var maxCars = _carsAndTimeInfo.maxNumCars;
        var delta = _carsAndTimeInfo.endTime - _carsAndTimeInfo.startTime;
        var parkingOpeningTime = this.parseMinutes("10:00");
        var parkingClosingTime = this.parseMinutes("22:00");
        var k = (width - 5) / delta;
        var diagramHeight = height - 60;
        var kh = 1 / maxCars * diagramHeight;
        if (kh < 25) {
            kh = 25;
            diagramHeight = kh * maxCars;
            diagram.style.height = diagramHeight + 60 + "px";
        }
        this._kh = kh;
        var start = _carsAndTimeInfo.startTime - 7;
        for (var i = 1; i <= maxCars; i++) {
            var numScale = document.createElement('div');
            numScale.className = "num-scale";
            numScale.innerHTML = i + '';
            numScale.style.bottom = i * kh + "px";
            diagram.appendChild(numScale);
        }
        for (var i = 0; i < arr.length - 1; i++) {
            var div = document.createElement('div');
            div.className = "cars-time-and-number-view";
            div.style.left = (arr[i].timescale - start) * k + "px";
            div.style.height = arr[i].cars * kh + "px";
            div.style.width = (arr[i + 1].timescale - arr[i].timescale) * k - 1 + "px";
            div.style.zIndex = 9999 - i + '';
            var span = document.createElement('span');
            span.className = "cars-time-and-number-view-span";
            span.innerHTML = arr[i].time + " - " + arr[i + 1].time + "<br />" + "Cars: " + arr[i].cars;
            if (arr[i].timescale == arr[i + 1].timescale) {
                arr[i].cars == arr[i + 1].cars;
                diagram.appendChild(div);
                span.style.bottom = arr[i].cars * kh + "px";
                div.appendChild(span);
                var j = arr[i].cars;
                while ((arr[i].timescale == arr[i + 1].timescale) && (j < arr[i + 1].cars)) {
                    j = arr[i + 1].cars;
                    span.innerHTML = arr[i].time + " - " + arr[i + 1].time + "<br />" + "Cars: " + j;
                }
                if (arr[i].cars >= arr[i + 1].cars) {
                    div.style.height = arr[i].cars * kh + "px";
                    span.innerHTML = arr[i].time + " - " + arr[i + 1].time + "<br />" + "Cars: " + arr[i].cars;
                }
                else {
                    div.style.height = arr[i + 1].cars * kh + "px";
                    div.style.display = "none";
                    span.style.display = "none";
                }
                div.style.width = k - 1 + "px";
                diagram.appendChild(div);
                div.appendChild(span);
            }
            else {
                diagram.appendChild(div);
                div.appendChild(span);
            }
        }
        var lineX = document.getElementById("x-line"), lineY = document.getElementById("y-line");
        diagram.onmouseover = function (e) {
            //e = e || event;
            var target = e.target || e.srcElement;
            lineX.style.display = "block";
            lineY.style.display = "block";
        };
        diagram.onmousemove = function (e) {
            //e = e || event;
            var target = e.target || e.srcElement;
            var x, y;
            if (document.all) {
                x = e.x + document.body.scrollLeft;
                y = e.y + document.body.scrollTop;
            }
            else {
                x = e.pageX - diagram.offsetLeft;
                y = e.pageY - diagram.offsetTop;
            }
            lineX.style.left = x + "px";
            lineY.style.top = y + "px";
            x <= 10 ? lineX.style.display = "none" : lineX.style.display = "block";
            y <= 50 ? lineY.style.display = "none" : lineY.style.display = "block";
            var tooltip = document.getElementsByClassName('tooltip')[0];
            if (target["tagName"] == 'DIV' && target["className"] == "cars-time-and-number-view") {
                if (document.getElementsByClassName('tooltip').length < 1) {
                    showTooltip();
                }
                else {
                    tooltip["style"].left = x + 5 + "px";
                    tooltip["style"].top = y - 22 + "px";
                    if (tooltip.innerHTML != target["children"][0].innerText) {
                        tooltip.innerHTML = target["children"][0].innerText;
                    }
                }
            }
            function showTooltip() {
                var tooltip = document.createElement('div');
                tooltip.className = "tooltip";
                tooltip.style.left = x + "px";
                tooltip.style.top = y + "px";
                diagram.appendChild(tooltip);
                tooltip.innerHTML = target["children"][0].innerText;
                return tooltip;
            }
            ;
        };
        diagram.onmouseout = function (e) {
            lineX.style.display = "none";
            lineY.style.display = "none";
        };
    };
    drawDiagram.prototype.timeLinePointer = function (arr) {
        var cars = 0;
        var times = [];
        for (var i = this.parseMinutes("10:00"); i < this.parseMinutes("22:00"); i++) {
            for (var j = 0; j < arr[0].length; j++) {
                if (i == this.parseMinutes(arr[0][j])) {
                    cars++;
                    times.push({
                        cars: cars,
                        time: arr[0][j],
                        timescale: this.parseMinutes(arr[0][j])
                    });
                }
            }
            for (var j = 0; j < arr[1].length; j++) {
                if (i == this.parseMinutes(arr[1][j])) {
                    cars--;
                    times.push({
                        cars: cars,
                        time: arr[1][j],
                        timescale: this.parseMinutes(arr[1][j])
                    });
                }
            }
        }
        return times;
    };
    drawDiagram.prototype.commonCarArraySplitter = function (arr) {
        var arrivalArray = [], departureArray = [], outerArray = [];
        for (var i = 0; i < arr.length; i++) {
            arrivalArray.push(arr[i][0]);
            departureArray.push(arr[i][1]);
        }
        outerArray.push(arrivalArray.sort());
        outerArray.push(departureArray.sort());
        return outerArray;
    };
    drawDiagram.prototype.parseTimes = function (resp) {
        var arr = [];
        var ar = resp.split("\n");
        for (var i = 0; i < ar.length; i++) {
            arr.push(ar[i].split(', '));
        }
        return arr;
    };
//    drawDiagram.prototype.getFile = function (path) {
//        var xmlhttp = getXmlHttp();
//        xmlhttp.open('GET', path, false);
//        xmlhttp.send(null);
//        if (xmlhttp.status == 200) {
//            var response = xmlhttp.responseText;
//            console.log(response);
//            return response;
//        }
//    };
    drawDiagram.prototype.parseMinutes = function (str) {
        if(str !== ''){
            var arr = str.split(':');
            return parseInt(arr[0]) * 60 + parseInt(arr[1]);
        }
    };
    return drawDiagram;
}());
var hideExcessText = (function () {
    function hideExcessText(_kh) {
        this._kh = _kh;
        //this.hideText(this.defineTimePeriods(), 55)
    }
    hideExcessText.prototype.init = function () {
        //this._kh = _kh;
        this.hideText(this.defineTimePeriods(), 55);
    };
    hideExcessText.prototype.defineTimePeriods = function () {
        var ar = document.getElementsByClassName('cars-time-and-number-view');
        return ar;
    };
    hideExcessText.prototype.hideText = function (arr, dt) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = i + 1; j < arr.length; j++) {
                if ((arr[j]["offsetLeft"] - arr[i]["offsetLeft"] < dt) && (arr[j]["offsetHeight"] == arr[i]["offsetHeight"] || (Math.abs(arr[j]["offsetHeight"] - arr[i]["offsetHeight"]) < this._kh - 7)) && ((arr[j]["children"][0].innerHTML != "") && (arr[i]["children"][0].style.display != "none"))) {
                    arr[j]["children"][0].style.display = "none";
                }
            }
        }
    };
    return hideExcessText;
}());

window.onload = function(){
    fileInput = document.getElementById('file');
    diagram = document.getElementById('diagram');
    dropZone = document.getElementById('drop-area');
    button = document.getElementById('button');
    var f;
    function handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.dataTransfer.files;
        if(fileInput.files.length > 0){fileInput.value = ''}
        if(document.getElementById('info') != null){document.getElementById('info').remove()}
        if(document.getElementById('errorInfo') != null){document.getElementById('errorInfo').remove()}
        f = files[0];
        evt.currentTarget.style.color = '#777';
        evt.currentTarget.style.fontSize = 1+'em';
        evt.currentTarget.innerHTML = '<span style="font-size: 110%; font-weight: bold">'+f.name+'</span>'+', '+f.type+' - '+f.size+ ' bytes, last modified: '+ f.lastModifiedDate.toLocaleDateString();
    }
    function handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy';
    }
    function inputFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var files = evt.currentTarget.files;
        if( f!= undefined || f != null){
            dropZone.innerHTML = 'Drag file here';
            dropZone.style.color = '';
            dropZone.style.fontSize = '';
        }
        if(document.getElementById('info') != null){document.getElementById('info').remove()}
        if(document.getElementById('errorInfo') != null){document.getElementById('errorInfo').remove()}
        f = files[0];
    }
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
    fileInput.addEventListener('change', inputFileSelect, false);

    button.onclick = function() {
        if(f){
            var r = new FileReader();
            r.onload = function(e){
                if(diagram.children.length>2){
                    diagram.innerHTML = '<div id="x-line" class="x-line"></div><div id="y-line" class="y-line"></div>';
                    diagram.style.height = '';
                }
                var filesContents = e.target.result;
                if(filesContents.match(/[^\d|:|,|\s]+/g) !== null){
                    var errorInfo = document.createElement('span');
                    errorInfo.className = "errorInfo";
                    errorInfo.id = "errorInfo";
                    errorInfo.innerText = "Sorry, but the file is not formatted right way. The file you're uploading should contain a text where each car's arrival and departure times are separated with a comma, like so:\n11:15, 14:20\n12:10, 18:00\n14:00, 20:04";
                    var container = document.getElementsByClassName('container')[0];
                    if(container.children.length < 5){
                        container.appendChild(errorInfo);
                    }

                    return;
                }
                var dD = new drawDiagram(filesContents);
                dD.init(filesContents);
                var hT = new hideExcessText(dD._kh);
                hT.init();
            }
            r.readAsText(f);
        } else {
            var info = document.createElement('span');
            info.className = "info";
            info.id = "info";
            info.innerText = 'File is not chosen. Please, choose a file.';
            var container = document.getElementsByClassName('container')[0];
            if(container.children.length < 5){
                container.appendChild(info);
            }
            return;
        }
    };
}



