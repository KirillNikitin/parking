function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

class drawDiagram {
    resp: Array<any>;
    _kh: number;
    constructor() {
        //this.draw(this.timeLinePointer(this.commonCarArraySplitter(this.parseTimes(this.getFile()))))
    }
    init() {
        this.draw(this.timeLinePointer(this.commonCarArraySplitter(this.parseTimes(JSON.parse(this.getFile())))))
    }

    draw(arr: Array<any>) {
        var getCarsAndTimeInfo = function (arr: Array<any>) {
            this.maxNumCars = 0;
            var maxNumCars = 0, startTime = Infinity, endTime = 0, carsAndTimeInfo = {};
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].cars > maxNumCars) maxNumCars = arr[i].cars;
                if (arr[i].timescale < startTime) startTime = arr[i].timescale;
                if (arr[i].timescale > endTime) endTime = arr[i].timescale;
            }
            //carsAndTimeInfo = { maxNumCars: maxNumCars, startTime: startTime, endTime: endTime }
            this.maxNumCars = maxNumCars;
            this.startTime = startTime;
            this.endTime = endTime;
            return this;
        }

        var diagram = document.getElementById('diagram');
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
                arr[i].cars == arr[i + 1].cars
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
                } else {
                    div.style.height = arr[i + 1].cars * kh + "px"
                    div.style.display = "none";
                    span.style.display = "none";

                }
                div.style.width = k - 1 + "px"
                diagram.appendChild(div);
                div.appendChild(span);

            } else {
                diagram.appendChild(div);
                div.appendChild(span);
            }
        }

        var lineX = document.getElementById("x-line"), lineY = document.getElementById("y-line");

        diagram.onmouseover = function (e: MouseEvent) {
            //e = e || event;
            var target = e.target || e.srcElement;
            lineX.style.display = "block";
            lineY.style.display = "block";

        };
        diagram.onmousemove = function (e: MouseEvent) {
            //e = e || event;
            var target = e.target || e.srcElement; let x, y;
            if (document.all) {
                x = e.x + document.body.scrollLeft;
                y = e.y + document.body.scrollTop;
            } else {
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
                } else {
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
            };
        }
        diagram.onmouseout = function (e) {
            lineX.style.display = "none";
            lineY.style.display = "none";
        }
    }

    timeLinePointer(arr: Array<any>) {
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
    }

    commonCarArraySplitter(arr: Array<any>) {
        var arrivalArray = [], departureArray = [], outerArray = [];
        for (var i = 0; i < arr.length; i++) {
            arrivalArray.push(arr[i][0]);
            departureArray.push(arr[i][1]);
        }
        outerArray.push(arrivalArray.sort());
        outerArray.push(departureArray.sort());

        return outerArray;
    }

    parseTimes(resp: string) {
        var arr = [];
        var ar = resp.split("\n");
        for (var i = 0; i < ar.length; i++) { arr.push(ar[i].split(', ')) }
        return arr;
    }

    getFile() {
        var xmlhttp = getXmlHttp();
        xmlhttp.open('GET', 'files/list1', false);
        xmlhttp.send(null);
        if (xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            console.log(response);
            return response;
        }
    }

    parseMinutes(str: string) {
        var arr = str.split(':');
        return parseInt(arr[0]) * 60 + parseInt(arr[1]);
    }
}

class hideExcessText {
    _kh: number;
    constructor(_kh: number) {
        this._kh = _kh;
        //this.hideText(this.defineTimePeriods(), 55)
    }
    init() {
        //this._kh = _kh;
        this.hideText(this.defineTimePeriods(), 55)
    }
    defineTimePeriods() {
        var ar = document.getElementsByClassName('cars-time-and-number-view');
        return ar;
    }

    hideText(arr: NodeListOf<Element>, dt: number) {
        for (var i = 0; i < arr.length; i++) {
            for (var j = i + 1; j < arr.length; j++) {
                if ((arr[j]["offsetLeft"] - arr[i]["offsetLeft"] < dt) && (arr[j]["offsetHeight"] == arr[i]["offsetHeight"] || (Math.abs(arr[j]["offsetHeight"] - arr[i]["offsetHeight"]) < this._kh - 7)) && ((arr[j]["children"][0].innerHTML != "") && (arr[i]["children"][0].style.display != "none"))) {
                    arr[j]["children"][0].style.display = "none";
                }
            }
        }
    }
}

window.onload = function () {
    var dD = new drawDiagram();
    dD.init();
    var hT = new hideExcessText(dD._kh);
    hT.init();
}
