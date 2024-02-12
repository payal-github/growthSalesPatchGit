/**
 * jQuery Gantt Chart
 *
 * @see http://taitems.github.io/jQuery.Gantt/
 * @license MIT
 */
/*jshint camelcase:true, freeze:true, jquery:true */
(function ($, undefined) {
    "use strict";

    // custom selector `:findday` used to match on specified day in ms.
    //
    // The selector is passed a date in ms and elements are added to the
    // selection filter if the element date matches, as determined by the
    // id attribute containing a parsable date in ms.
    //test comment
    $.extend($.expr[":"], {
        findday: function (a, i, m) {
            var cd = new Date(parseInt(m[3], 10));
            var id = $(a).attr("id") || "";
            var si = id.indexOf("-") + 1;
            var ed = new Date(parseInt(id.substring(si, id.length), 10));
            cd = new Date(cd.getFullYear(), cd.getMonth(), cd.getDate());
            ed = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
            return cd.getTime() === ed.getTime();
        }
    });
    // custom selector `:findweek` used to match on specified week in ms.
    $.extend($.expr[":"], {
        findweek: function (a, i, m) {
            var cd = new Date(parseInt(m[3], 10));
            var id = $(a).attr("id") || "";
            var si = id.indexOf("-") + 1;
            cd = cd.getFullYear() + "-" + cd.getDayForWeek().getWeekOfYear();
            var ed = id.substring(si, id.length);
            return cd === ed;
        }
    });
    // custom selector `:findmonth` used to match on specified month in ms.
    $.extend($.expr[":"], {
        findmonth: function (a, i, m) {
            var cd = new Date(parseInt(m[3], 10));
            cd = cd.getFullYear() + "-" + cd.getMonth();
            var id = $(a).attr("id") || "";
            var si = id.indexOf("-") + 1;
            var ed = id.substring(si, id.length);
            return cd === ed;
        }
    });

    // Date prototype helpers
    // ======================

    // `getWeekId` returns a string in the form of 'dh-YYYY-WW', where WW is
    // the week # for the year.
    // It is used to add an id to the week divs
    Date.prototype.getWeekId = function () {
        var y = this.getFullYear();
        var w = this.getDayForWeek().getWeekOfYear();
        var m = this.getMonth();
        if (m === 11 && w === 1) {
            y++;
        }
        return 'dh-' + y + "-" + w;
    };

    // `getRepDate` returns the milliseconds since the epoch for a given date
    // depending on the active scale
    Date.prototype.getRepDate = function (scale) {
        switch (scale) {
            case "hours":
                return this.getTime();
            case "weeks":
                return this.getDayForWeek().getTime();
            case "months":
                return new Date(this.getFullYear(), this.getMonth(), 1).getTime();
            case "days":
            /* falls through */
            default:
                return this.getTime();
        }
    };

    // `getDayOfYear` returns the day number for the year
    Date.prototype.getDayOfYear = function () {
        var fd = new Date(this.getFullYear(), 0, 0);
        var sd = new Date(this.getFullYear(), this.getMonth(), this.getDate());
        return Math.ceil((sd - fd) / 86400000);
    };

    // `getWeekOfYear` returns the week number for the year
    Date.prototype.getWeekOfYear = function () {
        var ys = new Date(this.getFullYear(), 0, 1);
        var sd = new Date(this.getFullYear(), this.getMonth(), this.getDate());
        if (ys.getDay() > 3) {
            ys = new Date(sd.getFullYear(), 0, (7 - ys.getDay()));
        }
        var daysCount = sd.getDayOfYear() - ys.getDayOfYear();
        return Math.ceil(daysCount / 7);

    };

    // `getDayForWeek` returns the Date object for the starting date of
    // the week # for the year
    Date.prototype.getDayForWeek = function () {
        var df = new Date(this.valueOf());
        df.setDate(df.getDate() - df.getDay());
        var dt = new Date(this.valueOf());
        dt.setDate(dt.getDate() + (6 - dt.getDay()));
        if ((df.getMonth() === dt.getMonth()) || (df.getMonth() !== dt.getMonth() && dt.getDate() >= 4)) {
            return new Date(dt.setDate(dt.getDate() - 3));
        } else {
            return new Date(df.setDate(df.getDate() + 3));
        }
    };

    // fixes https://github.com/taitems/jQuery.Gantt/issues/62
    function ktkGetNextDate(currentDate, scaleStep) {
        for(var minIncrements = 1;; minIncrements++) {
            var nextDate = new Date(currentDate);
            nextDate.setHours(currentDate.getHours() + scaleStep * minIncrements);

            if (nextDate.getTime() !== currentDate.getTime()) {
                return nextDate;
            }

            // If code reaches here, it's because current didn't really increment (invalid local time) because of daylight-saving adjustments
            // => retry adding 2, 3, 4 hours, and so on (until nextDate > current)
        }
    }

    $.fn.gantt = function (options) {

        var scales = ["hours", "days", "weeks", "months"];
        //Default settings
        var settings = {
            source: [],
            cookieKey: "jquery.fn.gantt",
            itemsPerPage: 15,
			scrollTo: '',
            dow: ["S", "M", "T", "W", "T", "F", "S"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            navigate: "buttons",
            scale: "days",
            scrollToToday: true,
            useCookie: false,
            maxScale: "months",
            minScale: "hours",
            waitText: "Please wait...",
            onItemClick: function (data) { return; },
            onAddClick: function (dt, rowId) { return; },
            onRender: $.noop
        };

        // read options
        $.extend(settings, options);

        // can't use cookie if don't have `$.cookie`
        settings.useCookie = settings.useCookie && $.isFunction($.cookie);

        // Grid management
        // ===============

        // Core object is responsible for navigation and rendering
        var core = {
            // Return the element whose topmost point lies under the given point
            // Normalizes for old browsers (NOTE: doesn't work when element is outside viewport)
            //TODO: https://github.com/taitems/jQuery.Gantt/issues/137
            elementFromPoint: (function(){ // IIFE
                // version for normal browsers
                if (document.compatMode === "CSS1Compat") {
                    return function (x, y) {
                        x -= window.pageXOffset;
                        y -= window.pageYOffset;
                        return document.elementFromPoint(x, y);
                    };
                }
                // version for older browsers
                return function (x, y) {
                    x -= $(document).scrollLeft();
                    y -= $(document).scrollTop();
                    return document.elementFromPoint(x, y);
                };
            })(),

            // **Create the chart**
            create: function (element) {

                // Initialize data with a json object or fetch via an xhr
                // request depending on `settings.source`
                if (typeof settings.source !== "string") {
                    element.data = settings.source;
                    core.init(element);
                } else {
                    $.getJSON(settings.source, function (jsData) {
                        element.data = jsData;
                        core.init(element);
                    });
                }
            },

            // **Setup the initial view**
            // Here we calculate the number of rows, pages and visible start
            // and end dates once the data are ready
            init: function (element) {
                element.rowsNum = element.data.length;
                element.pageCount = Math.ceil(element.rowsNum / settings.itemsPerPage);
                element.rowsOnLastPage = element.rowsNum - (Math.floor(element.rowsNum / settings.itemsPerPage) * settings.itemsPerPage);

                element.dateStart = tools.getMinDate(element);
                element.dateEnd = tools.getMaxDate(element);
			if(element.pageCount==1)
			{
			jQuery('.navigate img').addClass("desaturate").removeClass("curcls") ;
			
			}
			else{
			jQuery('.navigate img:first').addClass("desaturate").removeClass("curcls") ;
			jQuery('.navigate img:last').removeClass("desaturate").addClass("curcls") ;
			}
			 jQuery("#pg_num").text("Page"+" "+"1"+" "+"of"+" "+element.pageCount);
           
                /* core.render(element); */
                core.waitToggle(element, true, function () { core.render(element); });
				
            },

            // **Render the grid**
            render: function (element) {
                var content = $('<div class="fn-content"/>');
                var $leftPanel = core.leftPanel(element);
                content.append($leftPanel);
                var $rightPanel = core.rightPanel(element, $leftPanel);
                var mLeft, hPos;

                content.append($rightPanel);
                content.append(core.navigation(element));

                var $dataPanel = $rightPanel.find(".dataPanel");

                element.gantt = $('<div class="fn-gantt" />').append(content);

                $(element).empty().append(element.gantt);

                element.scrollNavigation.panelMargin = parseInt($dataPanel.css("margin-left").replace("px", ""), 10);
                element.scrollNavigation.panelMaxPos = ($dataPanel.width() - $rightPanel.width());

                element.scrollNavigation.canScroll = ($dataPanel.width() > $rightPanel.width());

                core.markNow(element);
				core.markStart(element);
                core.fillData(element, $dataPanel, $leftPanel);

                // Set a cookie to record current position in the view
                if (settings.useCookie) {
                    var sc = $.cookie(settings.cookieKey + "ScrollPos");
                    if (sc) {
                        element.hPosition = sc;
                    }
                }

                // Scroll the grid to today's date
                if (settings.scrollToToday) {
                    core.navigateTo(element, 'toStart');
                    core.scrollPanel(element, 0);
                    // or, scroll the grid to the left most date in the panel
                } else {
                    if (element.hPosition !== 0) {
                        if (element.scaleOldWidth) {
                            mLeft = ($dataPanel.width() - $rightPanel.width());
                            hPos = mLeft * element.hPosition / element.scaleOldWidth;
                            element.hPosition = hPos > 0 ? 0 : hPos;
                            element.scaleOldWidth = null;
                        }
                        $dataPanel.css({ "margin-left": element.hPosition });
                        element.scrollNavigation.panelMargin = element.hPosition;
                    }
                    core.repositionLabel(element);
                }

                $dataPanel.css({ height: $leftPanel.height() });
                core.waitToggle(element, false);
                settings.onRender();
            },

            // Create and return the left panel with labels
            leftPanel: function (element) {
                /* Left panel */
              /*  var ganttLeftPanel = $('<div class="leftPanel"/>')
                    .append($('<div class="row spacer"/>')
					.css("height", tools.getCellSize() * element.headerRows)
                    .css("width", "100%"));*/
					
					 var ganttLeftPanel = $('<div class="leftPanel"/>')
                    .append($('<div class="row spacer"/>').append($('<div class="row name row0" style="height: 24px;"><span class="fn-label">'+element.data[0].optname+'</span></div><div class="row desc row0" style="height: 24px;"><span class="fn-label"><b>'+element.data[0].dateFirst+'</b></span></div><div class="row desc row0" style="height: 24px;"><span class="fn-label"><b>'+element.data[0].dateSecond+'</b></span></div>'))
                    .css("height", tools.getCellSize() * element.headerRows + "px")
                    .css("width", "100%"));

                var entries = [];
                $.each(element.data, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {
                        var dataId = ('id' in entry) ? '" data-id="' + entry.id : '';
                        entries.push('<div class="row name row' + i + (entry.desc ? '' : (' fn-wide '+dataId)) + '" id="rowheader' + i + '" data-offset="' + i % settings.itemsPerPage * tools.getCellSize() + '">');
                        entries.push('<span class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + (entry.name || '') + '</span>');
                        entries.push('</div>');

                        if (entry.desc) {
                            entries.push('<div class="row desc row' + i + ' " id="RowdId_' + i + dataId + '">');
                            entries.push('<span class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.desc + '</span>');
                            entries.push('</div>');
                        }
						
					  if (entry.desc1) {
                            entries.push('<div class="row desc row' + i + ' " id="RowdId_' + i + '" data-id="' + entry.id + '">');
                            entries.push('<span class="fn-label' + (entry.cssClass ? ' ' + entry.cssClass : '') + '">' + entry.desc1 + '</span>');
                            entries.push('</div>');
						 }

                    }
                });
                ganttLeftPanel.append(entries.join(""));
                return ganttLeftPanel;
            },

            // Create and return the data panel element
            dataPanel: function (element, width) {
                var dataPanel = $('<div class="dataPanel" style="width: ' + width + 'px;"/>');

                // Handle mousewheel events for scrolling the data panel
                var wheel = 'onwheel' in element ? 'wheel' : document.onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
                $(element).on(wheel, function (e) { core.wheelScroll(element, e); });

                // Handle click events and dispatch to registered `onAddClick` function
                dataPanel.click(function (e) {

                    e.stopPropagation();
                    var corrX/* <- never used? */, corrY;
                    var leftpanel = $(element).find(".fn-gantt .leftPanel");
                    var datapanel = $(element).find(".fn-gantt .dataPanel");
                    switch (settings.scale) {
                        case "months":
                            corrY = tools.getCellSize();
                            break;
                        case "hours":
                            corrY = tools.getCellSize() * 4;
                            break;
                        case "days":
                            corrY = tools.getCellSize() * 3;
                            break;
                        case "weeks":
                        /* falls through */
                        default:
                            corrY = tools.getCellSize() * 2;
                    }

                    /* Adjust, so get middle of elm
                     corrY -= Math.floor(tools.getCellSize() / 2);
                     */

                    // Find column where click occurred
                    var col = core.elementFromPoint(e.pageX, datapanel.offset().top + corrY);
                    // Was the label clicked directly?
                    if (col.className === "fn-label") {
                        col = $(col.parentNode);
                    } else {
                        col = $(col);
                    }

                    var dt = col.data("repdate");
                    // Find row where click occurred
                    var row = core.elementFromPoint(leftpanel.offset().left + leftpanel.width() - 10, e.pageY);
                    // Was the label clicked directly?
                    if (row.className.indexOf("fn-label") === 0) {
                        row = $(row.parentNode);
                    } else {
                        row = $(row);
                    }
                    var rowId = row.data('id');

                    // Dispatch user registered function with the DateTime in ms
                    // and the id if the clicked object is a row
                    settings.onAddClick(dt, rowId);
                });
                return dataPanel;
            },

            // Creates and return the right panel containing the year/week/day header
            rightPanel: function (element, leftPanel /* <- never used? */) {
                var range = null;
                // Days of the week have a class of one of
                // `sn` (Sunday), `sa` (Saturday), or `wd` (Weekday)
                var dowClass = ["sn", "wd", "wd", "wd", "wd", "wd", "sa"];
                //unused: was someone planning to allow styles to stretch to the bottom of the chart?
                //var gridDowClass = [" sn", "", "", "", "", "", " sa"];

                var yearArr = [];
                var daysInYear = 0;

                var monthArr = [];
                var daysInMonth = 0;

                var dayArr = [];
                var hoursInDay = 0;

                var dowArr = [];
                var horArr = [];

                var today = new Date();
                today.setHours(0, 0, 0, 0);

                // reused variables
                var i, len;
                var year, month, day;
                var rday, dayClass;
                var dataPanel;

                // Setup the headings based on the chosen `settings.scale`
                switch (settings.scale) {
                    // **Hours**
                    case "hours":
                        range = tools.parseTimeRange(element.dateStart, element.dateEnd, element.scaleStep);

                        year = range[0].getFullYear();
                        month = range[0].getMonth();
                        day = range[0];

                        for (i = 0, len = range.length; i < len; i++) {
                            rday = range[i];

                            // Fill years
                            var rfy = rday.getFullYear();
                            if (rfy !== year) {
                                yearArr.push(
                                    '<div class="row header year" style="width: ' +
                                    tools.getCellSize() * daysInYear +
                                    'px;"><div class="fn-label">' +
                                    year +
                                    '</div></div>');

                                year = rfy;
                                daysInYear = 0;
                            }
                            daysInYear++;


                            // Fill months
                            var rm = rday.getMonth();
                            if (rm !== month) {
                                monthArr.push(
                                    '<div class="row header month" style="width: ' +
                                    tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">' +
                                    settings.months[month] +
                                    '</div></div>');

                                month = rm;
                                daysInMonth = 0;
                            }
                            daysInMonth++;


                            // Fill days & hours

                            var rgetDay = rday.getDay();
                            var getDay = day.getDay();
                            dayClass = dowClass[rgetDay];
                            if (tools.isHoliday(rday)) {
                                dayClass = "holiday";
                            }
                            if (rgetDay !== getDay) {
                                var dayClass2 = (today - day === 0) ? "today" : tools.isHoliday( day.getTime() ) ? "holiday" : dowClass[getDay];

                                dayArr.push(
                                    '<div class="row date ' + dayClass2 + '" ' +
                                    ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> ' +
                                    ' <div class="fn-label">' + day.getDate() + '</div></div>');
                                dowArr.push(
                                    '<div class="row day ' + dayClass2 + '" ' +
                                    ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> ' +
                                    ' <div class="fn-label">' + settings.dow[getDay] + '</div></div>');

                                day = rday;
                                hoursInDay = 0;
                            }
                            hoursInDay++;

                            horArr.push(
                                '<div class="row day dh ' +
                                dayClass +
                                '" id="dh-' +
                                rday.getTime() +
                                '"  data-offset="' + i * tools.getCellSize() + '" data-repdate="' + rday.getRepDate(settings.scale) + '"><div class="fn-label">' +
                                rday.getHours() +
                                '</div></div>');
                        }


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: ' +
                            tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">' +
                            year +
                            '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: ' +
                            tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">' +
                            settings.months[month] +
                            '</div></div>');

                        dayClass = dowClass[day.getDay()];

                        if ( tools.isHoliday(day) ) {
                            dayClass = "holiday";
                        }

                        dayArr.push(
                            '<div class="row date ' + dayClass + '" ' +
                            ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> ' +
                            ' <div class="fn-label">' + day.getDate() + '</div></div>');

                        dowArr.push(
                            '<div class="row day ' + dayClass + '" ' +
                            ' style="width: ' + tools.getCellSize() * hoursInDay + 'px;"> ' +
                            ' <div class="fn-label">' + settings.dow[day.getDay()] + '</div></div>');

                        dataPanel = core.dataPanel(element, range.length * tools.getCellSize());


                        // Append panel elements
                        dataPanel.append(
                            $('<div class="row header"></div>').html(yearArr.join("")),
                            $('<div class="row header"></div>').html(monthArr.join("")),
                            $('<div class="row header"></div>').html(dayArr.join("")),
                            $('<div class="row header"></div>').html(dowArr.join("")),
                            $('<div class="row header"></div>').html(horArr.join(""))
                        );

                        break;

                    // **Weeks**
                    case "weeks":
                        range = tools.parseWeeksRange(element.dateStart, element.dateEnd);
                        yearArr = [];
                        monthArr = [];
                        year = range[0].getFullYear();
                        month = range[0].getMonth();
                        day = range[0];

                        for (i = 0, len = range.length; i < len; i++) {
                            rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    '<div class="row header year" style="width: ' +
                                    tools.getCellSize() * daysInYear +
                                    'px;"><div class="fn-label">' +
                                    year +
                                    '</div></div>');
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;

                            // Fill months
                            if (rday.getMonth() !== month) {
                                monthArr.push(
                                    '<div class="row header month" style="width:' +
                                    tools.getCellSize() * daysInMonth +
                                    'px;"><div class="fn-label">' +
                                    settings.months[month] +
                                    '</div></div>');
                                month = rday.getMonth();
                                daysInMonth = 0;
                            }
                            daysInMonth++;

                            // Fill weeks
                            dayArr.push(
                                '<div class="row day wd" ' +
                                ' id="' + rday.getWeekId() + '" data-offset="' + i * tools.getCellSize() + '" data-repdate="' + rday.getRepDate(settings.scale) + '"> ' +
                                ' <div class="fn-label">' + rday.getWeekOfYear() + '</div></div>');
                        }


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: ' +
                            tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">' +
                            year +
                            '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: ' +
                            tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">' +
                            settings.months[month] +
                            '</div></div>');

                        dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                        dataPanel.append(yearArr.join("") + monthArr.join("") + dayArr.join("") + dowArr.join(""));

                        break;

                    // **Months**
                    case 'months':
                        range = tools.parseMonthsRange(element.dateStart, element.dateEnd);

                        year = range[0].getFullYear();
                        month = range[0].getMonth();
                        day = range[0];

                        for (i = 0, len = range.length; i < len; i++) {
                            rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    '<div class="row header year" style="width: ' +
                                    tools.getCellSize() * daysInYear +
                                    'px;"><div class="fn-label">' +
                                    year +
                                    '</div></div>');
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;
                            monthArr.push('<div class="row day wd dh" id="dh-' + tools.genId(rday.getTime()) + '" data-offset="' + i * tools.getCellSize() + '" data-repdate="' + rday.getRepDate(settings.scale) + '">' + (1 + rday.getMonth()) + '</div>');
                        }


                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: ' +
                            tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">' +
                            year +
                            '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: ' +
                            tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">' +
                            settings.months[month] +
                            '</div></div>');

                        dataPanel = core.dataPanel(element, range.length * tools.getCellSize());

                        // Append panel elements
                        dataPanel.append(
                            $('<div class="row header"></div>').html(yearArr.join("")),
                            $('<div class="row header"></div>').html(monthArr.join("")),
                            $('<div class="row header"></div>').html(dayArr.join("")),
                            $('<div class="row header"></div>').html(dowArr.join(""))
                        );

                        break;

                    // **Days (default)**
                    default:
                        range = tools.parseDateRange(element.dateStart, element.dateEnd);

                        var dateBefore = ktkGetNextDate(range[0], -1);
                        year = dateBefore.getFullYear();
                        month = dateBefore.getMonth();
                        //day = dateBefore; // <- never used?

                        for (i = 0, len = range.length; i < len; i++) {
                            rday = range[i];

                            // Fill years
                            if (rday.getFullYear() !== year) {
                                yearArr.push(
                                    '<div class="row header year" style="width:' +
                                    tools.getCellSize() * daysInYear +
                                    'px;"><div class="fn-label">' +
                                    year +
                                    '</div></div>');
                                year = rday.getFullYear();
                                daysInYear = 0;
                            }
                            daysInYear++;

                            // Fill months
                            if (rday.getMonth() !== month) {
                                monthArr.push(
                                    '<div class="row header month" style="width:' +
                                    tools.getCellSize() * daysInMonth +
                                    'px;"><div class="fn-label">' +
                                    settings.months[month] +
                                    '</div></div>');
                                month = rday.getMonth();
                                daysInMonth = 0;
                            }
                            daysInMonth++;

                            day = rday.getDay();
                            dayClass = dowClass[day];
                            if ( tools.isHoliday(rday) ) {
                                dayClass = "holiday";
                            }

                            dayArr.push(
                                '<div class="row date ' + dayClass + '" ' +
                                ' id="dh-' + tools.genId(rday.getTime()) + '" data-offset="' + i * tools.getCellSize() + '" data-repdate="' + rday.getRepDate(settings.scale) + '"> ' +
                                ' <div class="fn-label">' + rday.getDate() + '</div></div>');
                            dowArr.push(
                                '<div class="row day ' + dayClass + '" ' +
                                ' id="dw-' + tools.genId(rday.getTime()) + '" data-repdate="' + rday.getRepDate(settings.scale) + '"> ' +
                                ' <div class="fn-label">' + settings.dow[day] + '</div></div>');
                        } //for

                        // Last year
                        yearArr.push(
                            '<div class="row header year" style="width: ' +
                            tools.getCellSize() * daysInYear + 'px;"><div class="fn-label">' +
                            year +
                            '</div></div>');

                        // Last month
                        monthArr.push(
                            '<div class="row header month" style="width: ' +
                            tools.getCellSize() * daysInMonth + 'px"><div class="fn-label">' +
                            settings.months[month] +
                            '</div></div>');

                        dataPanel = core.dataPanel(element, range.length * tools.getCellSize());


                        // Append panel elements
                        dataPanel.append(
                            $('<div class="row header"></div>').html(yearArr.join("")),
                            $('<div class="row header"></div>').html(monthArr.join("")),
                            $('<div class="row header"></div>').html(dayArr.join("")),
                            $('<div class="row header"></div>').html(dowArr.join(""))
                        );
                }

                return $('<div class="rightPanel"></div>').append(dataPanel);
            },

            // **Navigation**
            navigation: function (element) {
                var ganttNavigate = null;
                // Scrolling navigation is provided by setting
                // `settings.navigate='scroll'`
				var page="Page"; var of="of";
                if (settings.navigate === "scroll") {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<div class="nav-slider" />')
                            .append($('<div class="nav-slider-left" />')
                                .append($('<button type="button" class="nav-link nav-page-back"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        core.navigatePage(element, -1);
										
                                    }))
                                .append($('<div class="page-number"/>')
                                    .append($('<span/>')
                                        .html(page+' '+(element.pageNum + 1) +' '+ of + ' ' + element.pageCount)))
                                .append($('<button type="button" class="nav-link nav-page-next"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        core.navigatePage(element, 1);
									 
                                    }))
                                .append($('<button type="button" class="nav-link nav-now"/>')
                                    .html('&#9679;')
                                    .click(function () {
                                        core.navigateTo(element, 'now');
                                    }))
                                .append($('<button type="button" class="nav-link nav-prev-week"/>')
                                    .html('&lt;&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 6);
                                        }
                                    }))
                                .append($('<button type="button" class="nav-link nav-prev-day"/>')
                                    .html('&lt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * 7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * 4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * 3);
                                        }
                                    })))
                            .append($('<div class="nav-slider-content" />')
                                .append($('<div class="nav-slider-bar" />')
                                    .append($('<a class="nav-slider-button" />')
                                )
                                    .mousedown(function (e) {
                                        e.preventDefault();
                                        element.scrollNavigation.scrollerMouseDown = true;
                                        core.sliderScroll(element, e);
                                    })
                                    .mousemove(function (e) {
                                        if (element.scrollNavigation.scrollerMouseDown) {
                                            core.sliderScroll(element, e);
                                        }
                                    })
                            )
                        )
                            .append($('<div class="nav-slider-right" />')
                                .append($('<button type="button" class="nav-link nav-next-day"/>')
                                    .html('&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -7);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -4);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -3);
                                        }
                                    }))
                                .append($('<button type="button" class="nav-link nav-next-week"/>')
                                    .html('&gt;&gt;')
                                    .click(function () {
                                        if (settings.scale === 'hours') {
                                            core.navigateTo(element, tools.getCellSize() * -8);
                                        } else if (settings.scale === 'days') {
                                            core.navigateTo(element, tools.getCellSize() * -30);
                                        } else if (settings.scale === 'weeks') {
                                            core.navigateTo(element, tools.getCellSize() * -12);
                                        } else if (settings.scale === 'months') {
                                            core.navigateTo(element, tools.getCellSize() * -6);
                                        }
                                    }))
                                .append($('<button type="button" class="nav-link nav-zoomIn"/>')
                                    .html('&#43;')
                                    .click(function () {
                                        core.zoomInOut(element, -1);
                                    }))
                                .append($('<button type="button" class="nav-link nav-zoomOut"/>')
                                    .html('&#45;')
                                    .click(function () {
                                        core.zoomInOut(element, 1);
                                    }))
                        )
                    );
                    $(document).mouseup(function () {
                        element.scrollNavigation.scrollerMouseDown = false;
                    });
                    // Button navigation is provided by setting `settings.navigation='buttons'`
                } else {
                    ganttNavigate = $('<div class="navigate" />')
                        .append($('<button type="button" class="nav-link nav-page-back"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigatePage(element, -1);
                            }))
                        .append($('<div class="page-number"/>')
                            .append($('<span/>')
                                .html(page+' '+(element.pageNum + 1) +' '+ of + ' ' + element.pageCount)))
                        .append($('<button type="button" class="nav-link nav-page-next"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigatePage(element, 1);
                            }))
                        .append($('<button type="button" class="nav-link nav-begin"/>')
                            .html('&#124;&lt;')
                            .click(function () {
                                core.navigateTo(element, 'begin');
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-week"/>')
                            .html('&lt;&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * 7);
                            }))
                        .append($('<button type="button" class="nav-link nav-prev-day"/>')
                            .html('&lt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize());
                            }))
                        .append($('<button type="button" class="nav-link nav-now"/>')
                            .html('&#9679;')
                            .click(function () {
                                core.navigateTo(element, 'now');
                            }))
                        .append($('<button type="button" class="nav-link nav-next-day"/>')
                            .html('&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-next-week"/>')
                            .html('&gt;&gt;')
                            .click(function () {
                                core.navigateTo(element, tools.getCellSize() * -7);
                            }))
                        .append($('<button type="button" class="nav-link nav-end"/>')
                            .html('&gt;&#124;')
                            .click(function () {
                                core.navigateTo(element, 'end');
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomIn"/>')
                            .html('&#43;')
                            .click(function () {
                                core.zoomInOut(element, -1);
                            }))
                        .append($('<button type="button" class="nav-link nav-zoomOut"/>')
                            .html('&#45;')
                            .click(function () {
                                core.zoomInOut(element, 1);
                            }));
                }
                return $('<div class="bottom"></div>').append(ganttNavigate);
            },

            // **Progress Bar**
            // Return an element representing a progress of position within the entire chart
            createProgressBar: function (days, label, desc, classNames, dataObj) {
                label = label || "";
                var cellWidth = tools.getCellSize();
                var barMarg = tools.getProgressBarMargin() || 0;
                var bar = $('<div class="bar"><div class="fn-label">' + label + '</div></div>')
                    .css({
                        width: ((cellWidth * days) - barMarg) + 2
                    })
                    .data("dataObj", dataObj);
                if (desc) {
                    bar
                        .mouseenter(function (e) {
                            var hint = $('<div class="fn-gantt-hint" />').html(desc);
                            $("body").append(hint);
                            hint.css("left", e.pageX);
                            hint.css("top", e.pageY);
                            hint.show();
                        })
                        .mouseleave(function () {
                            $(".fn-gantt-hint").remove();
                        })
                        .mousemove(function (e) {
                            $(".fn-gantt-hint").css("left", e.pageX);
                            $(".fn-gantt-hint").css("top", e.pageY + 15);
                        });
                }
                if (classNames) {
                    bar.addClass(classNames);
                }
                bar.click(function (e) {
                    e.stopPropagation();
                    settings.onItemClick($(this).data("dataObj"));
                });
                return bar;
            },

            // Remove the `wd` (weekday) class and add `today` class to the
            // current day/week/month (depending on the current scale)
            markNow: function (element) {
                var cd = new Date().setHours(0, 0, 0, 0);
                switch (settings.scale) {
                    case "weeks":
                        $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('today');
                        break;
                    case "months":
                        $(element).find(':findmonth("' + new Date().getTime() + '")').removeClass('wd').addClass('today');
                        break;
                    case "days":
                    /* falls through */
                    case "hours":
                    /* falls through */
                    default:
                        $(element).find(':findday("' + cd + '")').removeClass('wd').addClass('today');
                }
            },
			
			markStart: function (element) {
                var cd = new Date(settings.scrollTo).setHours(0, 0, 0, 0);
                switch (settings.scale) {
                    case "weeks":
                        $(element).find(':findweek("' + cd + '")').removeClass('wd').addClass('stScroll');
                        break;
                    case "months":
                        $(element).find(':findmonth("' + new Date().getTime() + '")').removeClass('wd').addClass('stScroll');
                        break;
                    case "days":
                    /* falls through */
                    case "hours":
                    /* falls through */
                    default:
                        $(element).find(':findday("' + cd + '")').removeClass('wd').addClass('stScroll');
                }
            },

            // **Fill the Chart**
            // Parse the data and fill the data panel
            fillData: function (element, datapanel, leftpanel /* <- never used? */) {
                var invertColor = function (colStr) {
                    try {
                        colStr = colStr.replace("rgb(", "").replace(")", "");
                        var rgbArr = colStr.split(",");
                        var R = parseInt(rgbArr[0], 10);
                        var G = parseInt(rgbArr[1], 10);
                        var B = parseInt(rgbArr[2], 10);
                        var gray = Math.round((255 - (0.299 * R + 0.587 * G + 0.114 * B)) * 0.9);
                        return "rgb(" + gray + ", " + gray + ", " + gray + ")";
                    } catch (err) {
                        return "";
                    }
                };
                // Loop through the values of each data element and set a row
                $.each(element.data, function (i, entry) {
                    if (i >= element.pageNum * settings.itemsPerPage && i < (element.pageNum * settings.itemsPerPage + settings.itemsPerPage)) {

                        $.each(entry.values, function (j, day) {
                            var _bar;
                            var from, to, cFrom, cTo, dFrom, dTo, dl;
                            var topEl, top;
                            switch (settings.scale) {
                                // **Hourly data**
                                case "hours":

                                    // In fractional hour aware charts, this determines the pixel delta of d_from and d_to relative to the hour tick-mark
                                    var pixelOffsetFactor = tools.getCellSize() / (3600000.0*element.scaleStep);

                                    // dFrom/To: This is the truncated timestamp.
                                    //     Truncated meaning it matches up with the beginning timestamp of the appropriate block (hour, hours, day...)
                                    // dFromDelta: this is the delta between the actual time stamp and the truncated one (dFrom/To)
                                    //     multiplied by the pixelOffset value
                                    // from/to: The time display Div that this timestamp needs to be lined up with.
                                    //     It does this by matching up our dFrom TS to the id of the Div
                                    dFrom = tools.genId(tools.dateDeserialize(day.from).getTime(), element.scaleStep);
                                    var dFromDelta = settings.showFractionalHours ? (tools.dateDeserialize(day.from).getTime() - dFrom) * pixelOffsetFactor : 0;
                                    from = $(element).find('#dh-' + dFrom);

                                    dTo = tools.genId(tools.dateDeserialize(day.to).getTime(), element.scaleStep);
                                    var dToDelta = settings.showFractionalHours ?  (tools.dateDeserialize(day.to).getTime() - dTo) * pixelOffsetFactor :  0;
                                    to = $(element).find('#dh-' + dTo);

                                    // cFrom/To: gets the offset of the time display Div and adds the dFrom/To delta to it
                                    // dl: gets the number of "Blocks" to that need to be filled for this event. This will be passed to createProgressBar to
                                    //      determine the width this event element
                                    cFrom = parseInt(from.data("offset")) + dFromDelta;
                                    cTo = parseInt(to.data("offset")) + dToDelta;
                                    dl = Math.floor((cTo - cFrom) / tools.getCellSize()) + 1;

                                    _bar = core.createProgressBar(
                                        dl,
                                        day.label,
                                        day.desc,
                                        day.customClass,
                                        day.dataObj);

                                    // find row
                                    topEl = $(element).find("#rowheader" + i);
                                    top = tools.getCellSize() * 5 + 2 + topEl.data("offset");
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **Weekly data**
                                case "weeks":
                                    dFrom = tools.dateDeserialize(day.from);
                                    dTo = tools.dateDeserialize(day.to);

                                    if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                        dFrom.setDate(dFrom.getDate() + 4);
                                    }

                                    if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                        dFrom.setDate(dFrom.getDate() + 4);
                                    }

                                    if (dTo.getDate() <= 3 && dTo.getMonth() === 0) {
                                        dTo.setDate(dTo.getDate() + 4);
                                    }

                                    from = $(element).find("#" + dFrom.getWeekId());
                                    cFrom = from.data("offset");
                                    to = $(element).find("#" + dTo.getWeekId());
                                    cTo = to.data("offset");
                                    dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

                                    _bar = core.createProgressBar(dl, day.label, day.desc, day.customClass, day.dataObj);

                                    // find row
                                    topEl = $(element).find("#rowheader" + i);
                                    top = tools.getCellSize() * 3 + 2 + topEl.data("offset");
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **Monthly data**
                                case "months":
                                    dFrom = tools.dateDeserialize(day.from);
                                    dTo = tools.dateDeserialize(day.to);

                                    if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                        dFrom.setDate(dFrom.getDate() + 4);
                                    }

                                    if (dFrom.getDate() <= 3 && dFrom.getMonth() === 0) {
                                        dFrom.setDate(dFrom.getDate() + 4);
                                    }

                                    if (dTo.getDate() <= 3 && dTo.getMonth() === 0) {
                                        dTo.setDate(dTo.getDate() + 4);
                                    }

                                    from = $(element).find("#dh-" + tools.genId(dFrom.getTime()));
                                    cFrom = from.data("offset");
                                    to = $(element).find("#dh-" + tools.genId(dTo.getTime()));
                                    cTo = to.data("offset");
                                    dl = Math.round((cTo - cFrom) / tools.getCellSize()) + 1;

                                    _bar = core.createProgressBar(dl, day.label, day.desc, day.customClass, day.dataObj);

                                    // find row
                                    topEl = $(element).find("#rowheader" + i);
                                    top = tools.getCellSize() * 2 + 2 + topEl.data("offset");
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                                    break;

                                // **Days**
                                case "days":
                                /* falls through */
                                default:
                                    dFrom = tools.genId(tools.dateDeserialize(day.from).getTime());
                                    dTo = tools.genId(tools.dateDeserialize(day.to).getTime());
                                    from = $(element).find("#dh-" + dFrom);
                                    cFrom = from.data("offset");
                                    dl = Math.floor(((dTo / 1000) - (dFrom / 1000)) / 86400) + 1;
                                    _bar = core.createProgressBar(dl, day.label, day.desc, day.customClass, day.dataObj);

                                    // find row
                                    topEl = $(element).find("#rowheader" + i);
                                    top = tools.getCellSize() * 4 + 2 + topEl.data("offset");
                                    _bar.css({ 'top': top, 'left': Math.floor(cFrom) });

                                    datapanel.append(_bar);
                            }

                            var $l = _bar.find(".fn-label");
                            if ($l && _bar.length) {
                                var gray = invertColor(_bar[0].style.backgroundColor);
                                $l.css("color", gray);
                            } else if ($l) {
                                $l.css("color", "");
                            }
                        });

                    }
                });
            },
            // **Navigation**
            navigateTo: function (element, val) {
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                var rightPanelWidth = $rightPanel.width();
                var dataPanelWidth = $dataPanel.width();
                var shift = function () {
                    core.repositionLabel(element);
                };
                var maxLeft, curMarg;
                switch (val) {
                    case "begin":
                        $dataPanel.animate({ "margin-left": "0px" }, "fast", shift);
                        element.scrollNavigation.panelMargin = 0;
                        break;
                    case "end":
                        var mLeft = dataPanelWidth - rightPanelWidth;
                        element.scrollNavigation.panelMargin = mLeft * -1;
                        $dataPanel.animate({ "margin-left": "-" + mLeft }, "fast", shift);
                        break;
                    case "now":
                        if (!element.scrollNavigation.canScroll || !$dataPanel.find(".today").length) {
                            return false;
                        }
                        maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                        curMarg = $dataPanel.css("margin-left").replace("px", "");
                        val = $dataPanel.find(".today").offset().left - $dataPanel.offset().left;
                        val *= -1;
                        if (val > 0) {
                            val = 0;
                        } else if (val < maxLeft) {
                            val = maxLeft;
                        }
                        $dataPanel.animate({ "margin-left": val }, "fast", shift);
                        element.scrollNavigation.panelMargin = val;
                        break;
					case "toStart":
						if (!element.scrollNavigation.canScroll || !$dataPanel.find(".stScroll").length) {
                            return false;
                        }
                        maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                        curMarg = $dataPanel.css("margin-left").replace("px", "");
                        val = $dataPanel.find(".stScroll").offset().left - $dataPanel.offset().left;
                        val *= -1;
                        if (val > 0) {
                            val = 0;
                        } else if (val < maxLeft) {
                            val = maxLeft;
                        }
                        $dataPanel.animate({ "margin-left": val }, "fast", shift);
                        element.scrollNavigation.panelMargin = val;
                        break;
                    default:
                        maxLeft = (dataPanelWidth - rightPanelWidth) * -1;
                        curMarg = $dataPanel.css("margin-left").replace("px", "");
                        val = parseInt(curMarg, 10) + val;
                        if (val <= 0 && val >= maxLeft) {
                            $dataPanel.animate({ "margin-left": val }, "fast", shift);
                        }
                        element.scrollNavigation.panelMargin = val;
                }
                core.synchronizeScroller(element);
            },

            // Navigate to a specific page
            navigatePage: function (element, val) {
                if ((element.pageNum + val) >= 0 && (element.pageNum + val) < Math.ceil(element.rowsNum / settings.itemsPerPage)) {
                    core.waitToggle(element, true, function () {
                        element.pageNum += val;
                        element.hPosition = $(".fn-gantt .dataPanel").css("margin-left").replace("px", "");
                        element.scaleOldWidth = false;
                        core.init(element);
						var ab=parseInt(val);
						//ab=Math.abs(element.pageNum+ab);
						
					//	alert("Page Number"+ab );
						jQuery("#pg_num").text("Page"+" "+(element.pageNum+1)+" "+"of"+" "+element.pageCount);
						if(element.pageNum==0 )
						{
							jQuery('.navigate img:first').addClass("desaturate").removeClass("curcls"); 
							jQuery('.navigate img:last').removeClass("desaturate").addClass("curcls"); 
						}
						if(element.pageNum==0 && element.pageCount==1)
						{
						jQuery('.navigate img:first').addClass("desaturate").removeClass("curcls"); 
						jQuery('.navigate img:last').addClass("desaturate").removeClass("curcls");

						}
						if(element.pageNum>0)
						{
							jQuery('.navigate img').removeClass("desaturate").addClass("curcls"); 
							
							 
						}
						if(element.pageCount==element.pageNum+1){
							
							jQuery('.navigate img:first').removeClass("desaturate").addClass("curcls"); 
							jQuery('.navigate img:last').addClass("desaturate").removeClass("curcls"); 
							}
							
						
						 
						
						
                    });
                }
            },

            // Change zoom level
            zoomInOut: function (element, val) {
                core.waitToggle(element, true, function () {

                    var zoomIn = (val < 0);

                    var scaleSt = element.scaleStep + val * 3;
                    scaleSt = scaleSt <= 1 ? 1 : scaleSt === 4 ? 3 : scaleSt;
                    var scale = settings.scale;
                    var headerRows = element.headerRows;
                    if (settings.scale === "hours" && scaleSt >= 13) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "days" && zoomIn) {
                        scale = "hours";
                        headerRows = 5;
                        scaleSt = 12;
                    } else if (settings.scale === "days" && !zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    } else if (settings.scale === "weeks" && !zoomIn) {
                        scale = "months";
                        headerRows = 2;
                        scaleSt = 14;
                    } else if (settings.scale === "weeks" && zoomIn) {
                        scale = "days";
                        headerRows = 4;
                        scaleSt = 13;
                    } else if (settings.scale === "months" && zoomIn) {
                        scale = "weeks";
                        headerRows = 3;
                        scaleSt = 13;
                    }

                    // do nothing if attempting to zoom past max/min
                    if ((zoomIn && $.inArray(scale, scales) < $.inArray(settings.minScale, scales)) ||
                        (!zoomIn && $.inArray(scale, scales) > $.inArray(settings.maxScale, scales))) {
                        core.init(element);
                        return;
                    }

                    element.scaleStep = scaleSt;
                    settings.scale = scale;
                    element.headerRows = headerRows;
                    var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                    var $dataPanel = $rightPanel.find(".dataPanel");
                    element.hPosition = $dataPanel.css("margin-left").replace("px", "");
                    element.scaleOldWidth = ($dataPanel.width() - $rightPanel.width());

                    if (settings.useCookie) {
                        $.cookie(settings.cookieKey + "CurrentScale", settings.scale);
                        // reset scrollPos
                        $.cookie(settings.cookieKey + "ScrollPos", null);
                    }
                    core.init(element);
                });
            },

            // Move chart via mouseclick
            mouseScroll: function (element, e) {
                var $dataPanel = $(element).find(".fn-gantt .dataPanel");
                $dataPanel.css("cursor", "move");
                var bPos = $dataPanel.offset();
                var mPos = element.scrollNavigation.mouseX === null ? e.pageX : element.scrollNavigation.mouseX;
                var delta = e.pageX - mPos;
                element.scrollNavigation.mouseX = e.pageX;

                core.scrollPanel(element, delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via mousewheel
            wheelScroll: function (element, e) {
                e.preventDefault(); // e is a jQuery Event

                // attempts to normalize scroll wheel velocity
                var delta = ( 'detail' in e ? e.detail :
                    'wheelDelta' in e.originalEvent ? - 1/120 * e.originalEvent.wheelDelta :
                        e.originalEvent.deltaY ? e.originalEvent.deltaY / Math.abs(e.originalEvent.deltaY) :
                            e.originalEvent.detail );

                // simpler normalization, ignoring per-device/browser/platform acceleration & semantic variations
                //var delta = e.detail || - (e = e.originalEvent).wheelData || e.deltaY /* || e.deltaX */ || e.detail;
                //delta = ( delta / Math.abs(delta) ) || 0;

                core.scrollPanel(element, -50 * delta);

                clearTimeout(element.scrollNavigation.repositionDelay);
                element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 50, element);
            },

            // Move chart via slider control
            sliderScroll: function (element, e) {
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBarBtn = $sliderBar.find(".nav-slider-button");
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");

                var bPos = $sliderBar.offset();
                var bWidth = $sliderBar.width();
                var wButton = $sliderBarBtn.width();

                var pos, mLeft;

                if ((e.pageX >= bPos.left) && (e.pageX <= bPos.left + bWidth)) {
                    pos = e.pageX - bPos.left;
                    pos = pos - wButton / 2;
                    $sliderBarBtn.css("left", pos);

                    mLeft = $dataPanel.width() - $rightPanel.width();

                    var pPos = pos * mLeft / bWidth * -1;
                    if (pPos >= 0) {
                        $dataPanel.css("margin-left", "0px");
                        element.scrollNavigation.panelMargin = 0;
                    } else if (pos >= bWidth - (wButton * 1)) {
                        $dataPanel.css("margin-left", mLeft * -1);
                        element.scrollNavigation.panelMargin = mLeft * -1;
                    } else {
                        $dataPanel.css("margin-left", pPos);
                        element.scrollNavigation.panelMargin = pPos;
                    }
                    clearTimeout(element.scrollNavigation.repositionDelay);
                    element.scrollNavigation.repositionDelay = setTimeout(core.repositionLabel, 5, element);
                }
            },

            // Update scroll panel margins
            scrollPanel: function (element, delta) {
                if (!element.scrollNavigation.canScroll) {
                    return false;
                }
                var _panelMargin = parseInt(element.scrollNavigation.panelMargin, 10) + delta;
                if (_panelMargin > 0) {
                    element.scrollNavigation.panelMargin = 0;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin);
                } else if (_panelMargin < element.scrollNavigation.panelMaxPos * -1) {
                    element.scrollNavigation.panelMargin = element.scrollNavigation.panelMaxPos * -1;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin);
                } else {
                    element.scrollNavigation.panelMargin = _panelMargin;
                    $(element).find(".fn-gantt .dataPanel").css("margin-left", element.scrollNavigation.panelMargin);
                }
                core.synchronizeScroller(element);
            },

            // Synchronize scroller
            synchronizeScroller: function (element) {
                if (settings.navigate !== "scroll") { return; }
                var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                var $dataPanel = $rightPanel.find(".dataPanel");
                var $sliderBar = $(element).find(".nav-slider-bar");
                var $sliderBtn = $sliderBar.find(".nav-slider-button");

                var bWidth = $sliderBar.width();
                var wButton = $sliderBtn.width();

                var mLeft = $dataPanel.width() - $rightPanel.width();
                var hPos = $dataPanel.css("margin-left") || 0;
                if (hPos) {
                    hPos = hPos.replace("px", "");
                }
                var pos = hPos * bWidth / mLeft - $sliderBtn.width() * 0.25;
                pos = pos > 0 ? 0 : (pos * -1 >= bWidth - (wButton * 0.75)) ? (bWidth - (wButton * 1.25)) * -1 : pos;
                $sliderBtn.css("left", pos * -1);
            },

            // Reposition data labels
            repositionLabel: function (element) {
                setTimeout(function () {
                    var $dataPanel;
                    if (!element) {
                        $dataPanel = $(".fn-gantt .rightPanel .dataPanel");
                    } else {
                        var $rightPanel = $(element).find(".fn-gantt .rightPanel");
                        $dataPanel = $rightPanel.find(".dataPanel");
                    }

                    if (settings.useCookie) {
                        $.cookie(settings.cookieKey + "ScrollPos", $dataPanel.css("margin-left").replace("px", ""));
                    }
                }, 500);
            },

            // waitToggle
            waitToggle: function (element, show, fn) {
                if (show) {
                    var eo = $(element).offset();
                    var ew = $(element).outerWidth();
                    var eh = $(element).outerHeight();

                    if (!element.loader) {
                        element.loader = $('<div class="fn-gantt-loader">' +
                        '<div class="fn-gantt-loader-spinner"><span>' + settings.waitText + '</span></div></div>');
                    }
                    $(element).append(element.loader);
                    setTimeout(fn, 500);

                } else if (element.loader) {
                    element.loader.detach();
                }
            }
        };

        // Utility functions
        // =================
        var tools = {

            // Return the maximum available date in data depending on the scale
            getMaxDate: function (element) {
                var maxDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        maxDate = maxDate < tools.dateDeserialize(date.to) ? tools.dateDeserialize(date.to) : maxDate;
                    });
                });
                maxDate = maxDate || new Date();
                var bd;
                switch (settings.scale) {
                    case "hours":
                        maxDate.setHours(Math.ceil((maxDate.getHours()) / element.scaleStep) * element.scaleStep);
                        maxDate.setHours(maxDate.getHours() + element.scaleStep * 3);
                        break;
                    case "weeks":
                        bd = new Date(maxDate.getTime());
                        bd = new Date(bd.setDate(bd.getDate() + 3 * 7));
                        var md = Math.floor(bd.getDate() / 7) * 7;
                        maxDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);
                        break;
                    case "months":
                        bd = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
                        bd.setMonth(bd.getMonth() + 2);
                        maxDate = new Date(bd.getFullYear(), bd.getMonth(), 1);
                        break;
                    case "days":
                    /* falls through */
                    default:
                        maxDate.setHours(0);
                        maxDate.setDate(maxDate.getDate() + 3);
                }
                return maxDate;
            },

            // Return the minimum available date in data depending on the scale
            getMinDate: function (element) {
                var minDate = null;
                $.each(element.data, function (i, entry) {
                    $.each(entry.values, function (i, date) {
                        minDate = minDate > tools.dateDeserialize(date.from) || minDate === null ? tools.dateDeserialize(date.from) : minDate;
                    });
                });
                minDate = minDate || new Date();
                switch (settings.scale) {
                    case "hours":
                        minDate.setHours(Math.floor((minDate.getHours()) / element.scaleStep) * element.scaleStep);
                        minDate.setHours(minDate.getHours() - element.scaleStep * 3);
                        minDate.setMinutes(0);
                        minDate.setSeconds(0);
                        minDate.setMilliseconds(0);
                        break;
                    case "weeks":
                        // wtf is happening here?
                        var bd = new Date(minDate.getTime());
                        bd = new Date(bd.setDate(bd.getDate() - 3 * 7));
                        var md = Math.floor(bd.getDate() / 7) * 7;
                        minDate = new Date(bd.getFullYear(), bd.getMonth(), md === 0 ? 4 : md - 3);

                        break;
                    case "months":
                        minDate.setHours(0, 0, 0, 0);
                        minDate.setDate(1);
                        minDate.setMonth(minDate.getMonth() - 3);
                        break;
                    case "days":
                    /* falls through */
                    default:
                        minDate.setHours(0, 0, 0, 0);
                        minDate.setDate(minDate.getDate() - 3);
                }
                return minDate;
            },

            // Return an array of Date objects between `from` and `to`
            parseDateRange: function (from, to) {
                var current = new Date(from.getTime());
                var end = new Date(to.getTime()); // <- never used?
                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getTime());
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());
                return ret;

            },

            // Return an array of Date objects between `from` and `to`,
            // scaled hourly
            parseTimeRange: function (from, to, scaleStep) {
                var current = new Date(from);
                var end = new Date(to);

                // GR: Fix begin
                current.setHours(0, 0, 0, 0);

                end.setMilliseconds(0);
                end.setSeconds(0);
                if (end.getMinutes() > 0 || end.getHours() > 0) {
                    end.setMinutes(0);
                    end.setHours(0);
                    end.setTime(end.getTime() + (86400000)); // Add day
                }
                // GR: Fix end

                var ret = [];
                var i = 0;
                for(;;) {
                    var dayStartTime = new Date(current);
                    dayStartTime.setHours(Math.floor((current.getHours()) / scaleStep) * scaleStep);

                    if (ret[i] && dayStartTime.getDay() !== ret[i].getDay()) {
                        // If mark-cursor jumped to next day, make sure it starts at 0 hours
                        dayStartTime.setHours(0);
                    }
                    ret[i] = dayStartTime;

                    // Note that we use ">" because we want to include the end-time point.
                    if (current.getTime() > to.getTime()) break;

                    /* BUG-2: current is moved backwards producing a dead-lock! (crashes chrome/IE/firefox)
                     * SEE: https://github.com/taitems/jQuery.Gantt/issues/62
                     if (current.getDay() !== ret[i].getDay()) {
                     current.setHours(0);
                     }
                     */

                    // GR Fix Begin
                    current = ktkGetNextDate(dayStartTime, scaleStep);
                    // GR Fix End

                    i++;
                }

                return ret;
            },

            // Return an array of Date objects between a range of weeks
            // between `from` and `to`
            parseWeeksRange: function (from, to) {
                var current = new Date(from);
                var end = new Date(to); // <- never used?

                var ret = [];
                var i = 0;
                do {
                    if (current.getDay() === 0) {
                        ret[i++] = current.getDayForWeek();
                    }
                    current.setDate(current.getDate() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },


            // Return an array of Date objects between a range of months
            // between `from` and `to`
            parseMonthsRange: function (from, to) {
                var current = new Date(from);
                var end = new Date(to); // <- never used?

                var ret = [];
                var i = 0;
                do {
                    ret[i++] = new Date(current.getFullYear(), current.getMonth(), 1);
                    current.setMonth(current.getMonth() + 1);
                } while (current.getTime() <= to.getTime());

                return ret;
            },

            // Deserialize a date from a string or integer
            dateDeserialize: function (date) {
                if (typeof date === "string") {
                    date = date.replace(/\/Date\((.*)\)\//, "$1");
                    date = $.isNumeric(date) ? parseInt(date, 10) : $.trim(date);
                }
                return new Date( date );
            },

            // Generate an id for a date
            genId: function (ticks) { // varargs
                var t = new Date(ticks);
                switch (settings.scale) {
                    case "hours":
                        var hour = t.getHours();
                        if (arguments.length >= 2) {
                            hour = (Math.floor(t.getHours() / arguments[1]) * arguments[1]);
                        }
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate(), hour)).getTime();
                    case "weeks":
                        var y = t.getFullYear();
                        var w = t.getDayForWeek().getWeekOfYear();
                        var m = t.getMonth();
                        if (m === 11 && w === 1) {
                            y++;
                        }
                        return y + "-" + w;
                    case "months":
                        return t.getFullYear() + "-" + t.getMonth();
                    case "days":
                    /* falls through */
                    default:
                        return (new Date(t.getFullYear(), t.getMonth(), t.getDate())).getTime();
                }
            },

            // normalizes an array of dates into a map of start-of-day millisecond values
            _datesToDays: function ( dates ) {
                var dayMap = {};
                for (var i = 0, len = dates.length, day; i < len; i++) {
                    day = tools.dateDeserialize( dates[i] );
                    dayMap[ day.setHours(0, 0, 0, 0) ] = true;
                }
                return dayMap;
            },
            // Returns true when the given date appears in the array of holidays, if provided
            isHoliday: (function() { // IIFE
                // short-circuits the function if no holidays option was passed
                if (!settings.holidays || !settings.holidays.length) {
                    return function () { return false; };
                }
                var holidays = false;
                // returns the function that will be used to check for holidayness of a given date
                return function(date) {
                    if (!holidays) {
                        holidays = tools._datesToDays( settings.holidays );
                    }
                    return !!holidays[
                        // assumes numeric dates are already normalized to start-of-day
                        $.isNumeric(date) ?
                            date :
                            ( new Date(date.getFullYear(), date.getMonth(), date.getDate()) ).getTime()
                        ];
                };
            })(),

            // Get the current cell height
            getCellSize: function () {
                if (typeof tools._getCellSize === "undefined") {
                    var measure = $('<div style="display: none; position: absolute;" class="fn-gantt"><div class="row"></div></div>');
                    $("body").append(measure);
                    tools._getCellSize = measure.find(".row").height();
                    measure.empty().remove();
                }
                return tools._getCellSize;
            },

            // Get the current page height
            getPageHeight: function (element) {
                return element.pageNum + 1 === element.pageCount ? element.rowsOnLastPage * tools.getCellSize() : settings.itemsPerPage * tools.getCellSize();
            },

            // Get the current margin size of the progress bar
            getProgressBarMargin: function () {
                if (typeof tools._getProgressBarMargin === "undefined") {
                    var measure = $('<div style="display: none; position: absolute;"><div class="fn-gantt"><div class="rightPanel"><div class="dataPanel"><div class="row day"><div class="bar"></div></div></div></div></div></div>');
                    var bar = measure.find(".fn-gantt .rightPanel .day .bar");
                    $("body").append(measure);
                    tools._getProgressBarMargin = parseInt(bar.css("margin-left").replace("px", ""), 10);
                    tools._getProgressBarMargin += parseInt(bar.css("margin-right").replace("px", ""), 10);
                    measure.empty().remove();
                }
                return tools._getProgressBarMargin;
            }
        };


        this.each(function () {
            this.data = null;        // Received data
            this.pageNum = 0;        // Current page number
            this.pageCount = 0;      // Available pages count
            this.rowsOnLastPage = 0; // How many rows on last page
            this.rowsNum = 0;        // Number of total rows
            this.hPosition = 0;      // Current position on diagram (Horizontal)
            this.dateStart = null;
            this.dateEnd = null;
            this.scrollClicked = false;
            this.scaleOldWidth = null;
            this.headerRows = null;

            // Update cookie with current scale
            if (settings.useCookie) {
                var sc = $.cookie(settings.cookieKey + "CurrentScale");
                if (sc) {
                    settings.scale = sc;
                } else {
                    $.cookie(settings.cookieKey + "CurrentScale", settings.scale);
                }
            }

            switch (settings.scale) {
                //case "hours":
                //    this.headerRows = 5;
                //    this.scaleStep = 8;
                //    break;
                case "hours":
                    this.headerRows = 5;
                    this.scaleStep = 1;
                    break;
                case "weeks":
                    this.headerRows = 3;
                    this.scaleStep = 13;
                    break;
                case "months":
                    this.headerRows = 2;
                    this.scaleStep = 14;
                    break;
                case "days":
                /* falls through */
                default:
                    this.headerRows = 4;
                    this.scaleStep = 13;
            }

            this.scrollNavigation = {
                panelMouseDown: false,
                scrollerMouseDown: false,
                mouseX: null,
                panelMargin: 0,
                repositionDelay: 0,
                panelMaxPos: 0,
                canScroll: true
            };

            this.gantt = null;
            this.loader = null;

            core.create(this);

        });

    };
})(jQuery);