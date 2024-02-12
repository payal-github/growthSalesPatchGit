"use strict";!function(e){"object"==typeof module&&"object"==typeof module.exports?e(require("jquery"),window,document):e(jQuery,window,document)}(function(e,t,i,n){var s=function(t,i){this.$chartContainer=e(t),this.opts=i,this.defaultOptions={nodeTitle:"name",nodeId:"id",toggleSiblingsResp:!1,visibleLevel:999,chartClass:"",exportButton:!1,exportFilename:"OrgChart",exportFileextension:"png",parentNodeSymbol:"fa-users",draggable:!1,direction:"t2b",pan:!1,zoom:!1,zoominLimit:7,zoomoutLimit:.5}};s.prototype={init:function(t){var i=this;this.options=e.extend({},this.defaultOptions,this.opts,t);var n=this.$chartContainer;this.$chart&&this.$chart.remove();var s=this.options.data,a=this.$chart=e("<div>",{data:{options:this.options},class:"orgchart"+(""!==this.options.chartClass?" "+this.options.chartClass:"")+("t2b"!==this.options.direction?" "+this.options.direction:""),click:function(t){e(t.target).closest(".node").length||a.find(".node.focused").removeClass("focused")}});return"undefined"!=typeof MutationObserver&&this.triggerInitEvent(),"object"===e.type(s)?s instanceof e?this.buildHierarchy(a,this.buildJsonDS(s.children()),0,this.options):this.buildHierarchy(a,this.options.ajaxURL?s:this.attachRel(s,"00")):(a.append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>'),e.ajax({url:s,dataType:"json"}).done(function(e,t,n){i.buildHierarchy(a,i.options.ajaxURL?e:i.attachRel(e,"00"),0,i.options)}).fail(function(e,t,i){console.log(i)}).always(function(){a.children(".spinner").remove()})),n.append(a),this.options.exportButton&&!n.find(".oc-export-btn").length&&this.attachExportButton(),this.options.pan&&this.bindPan(),this.options.zoom&&this.bindZoom(),this},triggerInitEvent:function(){var t=this,i=new MutationObserver(function(n){i.disconnect();e:for(var s=0;s<n.length;s++)for(var a=0;a<n[s].addedNodes.length;a++)if(n[s].addedNodes[a].classList.contains("orgchart")&&t.options.initCompleted&&"function"==typeof t.options.initCompleted){t.options.initCompleted(t.$chart);var o=e.Event("init.orgchart");t.$chart.trigger(o);break e}});i.observe(this.$chartContainer[0],{childList:!0})},attachExportButton:function(){var t=this,i=e("<button>",{class:"oc-export-btn"+(""!==this.options.chartClass?" "+this.options.chartClass:""),text:"Export",click:function(e){e.preventDefault(),t.export()}});this.$chartContainer.append(i)},setOptions:function(e,t){return"string"==typeof e&&("pan"===e&&(t?this.bindPan():this.unbindPan()),"zoom"===e&&(t?this.bindZoom():this.unbindZoom())),"object"==typeof e&&(e.data?this.init(e):(void 0!==e.pan&&(e.pan?this.bindPan():this.unbindPan()),void 0!==e.zoom&&(e.zoom?this.bindZoom():this.unbindZoom()))),this},panStartHandler:function(t){var i=e(t.delegateTarget);if(e(t.target).closest(".node").length||t.touches&&1<t.touches.length)i.data("panning",!1);else{i.css("cursor","move").data("panning",!0);var n=0,s=0,a=i.css("transform");if("none"!==a){var o=a.split(",");-1===a.indexOf("3d")?(n=parseInt(o[4]),s=parseInt(o[5])):(n=parseInt(o[12]),s=parseInt(o[13]))}var d=0,r=0;if(t.targetTouches){if(1===t.targetTouches.length)d=t.targetTouches[0].pageX-n,r=t.targetTouches[0].pageY-s;else if(1<t.targetTouches.length)return}else d=t.pageX-n,r=t.pageY-s;i.on("mousemove touchmove",function(e){if(i.data("panning")){var t=0,n=0;if(e.targetTouches){if(1===e.targetTouches.length)t=e.targetTouches[0].pageX-d,n=e.targetTouches[0].pageY-r;else if(1<e.targetTouches.length)return}else t=e.pageX-d,n=e.pageY-r;var s=i.css("transform");if("none"===s)-1===s.indexOf("3d")?i.css("transform","matrix(1, 0, 0, 1, "+t+", "+n+")"):i.css("transform","matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, "+t+", "+n+", 0, 1)");else{var a=s.split(",");-1===s.indexOf("3d")?(a[4]=" "+t,a[5]=" "+n+")"):(a[12]=" "+t,a[13]=" "+n),i.css("transform",a.join(","))}}})}},panEndHandler:function(e){e.data.chart.data("panning")&&e.data.chart.data("panning",!1).css("cursor","default").off("mousemove")},bindPan:function(){this.$chartContainer.css("overflow","hidden"),this.$chart.on("mousedown touchstart",this.panStartHandler),e(i).on("mouseup touchend",{chart:this.$chart},this.panEndHandler)},unbindPan:function(){this.$chartContainer.css("overflow","auto"),this.$chart.off("mousedown touchstart",this.panStartHandler),e(i).off("mouseup touchend",this.panEndHandler)},zoomWheelHandler:function(e){var t=e.data.oc;e.preventDefault();var i=1+(0<e.originalEvent.deltaY?-.2:.2);t.setChartScale(t.$chart,i)},zoomStartHandler:function(e){if(e.touches&&2===e.touches.length){var t=e.data.oc;t.$chart.data("pinching",!0);var i=t.getPinchDist(e);t.$chart.data("pinchDistStart",i)}},zoomingHandler:function(e){var t=e.data.oc;if(t.$chart.data("pinching")){var i=t.getPinchDist(e);t.$chart.data("pinchDistEnd",i)}},zoomEndHandler:function(e){var t=e.data.oc;if(t.$chart.data("pinching")){t.$chart.data("pinching",!1);var i=t.$chart.data("pinchDistEnd")-t.$chart.data("pinchDistStart");0<i?t.setChartScale(t.$chart,1.2):i<0&&t.setChartScale(t.$chart,.8)}},bindZoom:function(){this.$chartContainer.on("wheel",{oc:this},this.zoomWheelHandler),this.$chartContainer.on("touchstart",{oc:this},this.zoomStartHandler),e(i).on("touchmove",{oc:this},this.zoomingHandler),e(i).on("touchend",{oc:this},this.zoomEndHandler)},unbindZoom:function(){this.$chartContainer.off("wheel",this.zoomWheelHandler),this.$chartContainer.off("touchstart",this.zoomStartHandler),e(i).off("touchmove",this.zoomingHandler),e(i).off("touchend",this.zoomEndHandler)},getPinchDist:function(e){return Math.sqrt((e.touches[0].clientX-e.touches[1].clientX)*(e.touches[0].clientX-e.touches[1].clientX)+(e.touches[0].clientY-e.touches[1].clientY)*(e.touches[0].clientY-e.touches[1].clientY))},setChartScale:function(e,i){var n=e.data("options"),s=e.css("transform"),a="",o=1;"none"===s?e.css("transform","scale("+i+","+i+")"):(a=s.split(","),-1===s.indexOf("3d")?(o=Math.abs(t.parseFloat(a[3])*i))>n.zoomoutLimit&&o<n.zoominLimit&&e.css("transform",s+" scale("+i+","+i+")"):(o=Math.abs(t.parseFloat(a[1])*i))>n.zoomoutLimit&&o<n.zoominLimit&&e.css("transform",s+" scale3d("+i+","+i+", 1)"))},buildJsonDS:function(t){var i=this,n={name:t.contents().eq(0).text().trim(),relationship:(t.parent().parent().is("li")?"1":"0")+(t.siblings("li").length?1:0)+(t.children("ul").length?1:0)};return e.each(t.data(),function(e,t){n[e]=t}),t.children("ul").children().each(function(){n.children||(n.children=[]),n.children.push(i.buildJsonDS(e(this)))}),n},attachRel:function(e,t){var i=this;return e.relationship=t+(e.children&&0<e.children.length?1:0),e.children&&e.children.forEach(function(t){i.attachRel(t,"1"+(1<e.children.length?1:0))}),e},loopChart:function(t){var i=this,n=t.find("tr:first"),s={id:n.find(".node")[0].id};return n.siblings(":last").children().each(function(){s.children||(s.children=[]),s.children.push(i.loopChart(e(this)))}),s},getHierarchy:function(){if(void 0===this.$chart)return"Error: orgchart does not exist";if(!this.$chart.find(".node").length)return"Error: nodes do not exist";var e=!0;return this.$chart.find(".node").each(function(){if(!this.id)return e=!1}),e?this.loopChart(this.$chart):"Error: All nodes of orghcart to be exported must have data-id attribute!"},getNodeState:function(e,t){var i={};if("parent"===(t=t||"self")){if((i=e.closest(".nodes").siblings(":first")).length)return i.is(".hidden")||!i.is(".hidden")&&i.closest(".nodes").is(".hidden")?{exist:!0,visible:!1}:{exist:!0,visible:!0}}else if("children"===t){if((i=e.closest("tr").siblings(":last")).length)return i.is(".hidden")?{exist:!0,visible:!1}:{exist:!0,visible:!0}}else if("siblings"===t){if((i=e.closest("table").parent().siblings()).length)return i.is(".hidden")||i.parent().is(".hidden")?{exist:!0,visible:!1}:{exist:!0,visible:!0}}else if((i=e).length)return i.closest(".nodes").length&&i.closest(".nodes").is(".hidden")||i.closest("table").parent().length&&i.closest("table").parent().is(".hidden")||i.parent().is("li")&&(i.closest("ul").is(".hidden")||i.closest("verticalNodes").is(".hidden"))?{exist:!0,visible:!1}:{exist:!0,visible:!0};return{exist:!1,visible:!1}},getRelatedNodes:function(t,i){return t&&t instanceof e&&t.is(".node")?"parent"===i?t.closest(".nodes").parent().children(":first").find(".node"):"children"===i?t.closest("tr").siblings(".nodes").children().find(".node:first"):"siblings"===i?t.closest("table").parent().siblings().find(".node:first"):e():e()},hideParentEnd:function(t){e(t.target).removeClass("sliding"),t.data.upperLevel.addClass("hidden").slice(1).removeAttr("style")},hideParent:function(e){var t=e.closest(".nodes").siblings();t.eq(0).find(".spinner").length&&e.closest(".orgchart").data("inAjax",!1),this.getNodeState(e,"siblings").visible&&this.hideSiblings(e),t.slice(1).css("visibility","hidden");var i=t.eq(0).find(".node");this.getNodeState(i).visible&&i.addClass("sliding slide-down").one("transitionend",{upperLevel:t},this.hideParentEnd),this.getNodeState(i,"parent").visible&&this.hideParent(i)},showParentEnd:function(t){var i=t.data.node;e(t.target).removeClass("sliding"),this.isInAction(i)&&this.switchVerticalArrow(i.children(".topEdge"))},showParent:function(e){var t=e.closest(".nodes").siblings().removeClass("hidden");t.eq(2).children().slice(1,-1).addClass("hidden");var i=t.eq(0).find(".node");this.repaint(i[0]),i.addClass("sliding").removeClass("slide-down").one("transitionend",{node:e},this.showParentEnd.bind(this))},stopAjax:function(e){e.find(".spinner").length&&e.closest(".orgchart").data("inAjax",!1)},isVisibleNode:function(t,i){return this.getNodeState(e(i)).visible},hideChildrenEnd:function(e){var t=e.data.node;e.data.animatedNodes.removeClass("sliding"),e.data.isVerticalDesc?e.data.lowerLevel.addClass("hidden"):(e.data.animatedNodes.closest(".nodes").prevAll(".lines").removeAttr("style").addBack().addClass("hidden"),e.data.lowerLevel.last().find(".verticalNodes").addClass("hidden")),this.isInAction(t)&&this.switchVerticalArrow(t.children(".bottomEdge"))},hideChildren:function(e){var t=e.closest("tr").siblings();this.stopAjax(t.last());var i=t.last().find(".node").filter(this.isVisibleNode.bind(this)),n=!!t.last().is(".verticalNodes");n||i.closest("table").closest("tr").prevAll(".lines").css("visibility","hidden"),this.repaint(i.get(0)),i.addClass("sliding slide-up").eq(0).one("transitionend",{animatedNodes:i,lowerLevel:t,isVerticalDesc:n,node:e},this.hideChildrenEnd.bind(this))},showChildrenEnd:function(e){var t=e.data.node;e.data.animatedNodes.removeClass("sliding"),this.isInAction(t)&&this.switchVerticalArrow(t.children(".bottomEdge"))},showChildren:function(e){var t=e.closest("tr").siblings(),i=t.is(".verticalNodes")?t.removeClass("hidden").find(".node").filter(this.isVisibleNode.bind(this)):t.removeClass("hidden").eq(2).children().find(".node:first").filter(this.isVisibleNode.bind(this));this.repaint(i.get(0)),i.addClass("sliding").removeClass("slide-up").eq(0).one("transitionend",{node:e,animatedNodes:i},this.showChildrenEnd.bind(this))},hideSiblingsEnd:function(e){var t=e.data.node,i=e.data.nodeContainer,n=e.data.direction;e.data.lines.removeAttr("style");var s=n?"left"===n?i.prevAll(":not(.hidden)"):i.nextAll(":not(.hidden)"):i.siblings();i.closest(".nodes").prev().children(":not(.hidden)").slice(1,n?2*s.length+1:-1).addClass("hidden"),e.data.animatedNodes.removeClass("sliding"),s.find(".node:gt(0)").filter(this.isVisibleNode.bind(this)).removeClass("slide-left slide-right").addClass("slide-up"),s.find(".lines, .nodes, .verticalNodes").addClass("hidden").end().addClass("hidden"),this.isInAction(t)&&this.switchHorizontalArrow(t)},hideSiblings:function(e,t){var i=e.closest("table").parent();i.siblings().find(".spinner").length&&e.closest(".orgchart").data("inAjax",!1),t?"left"===t?i.prevAll().find(".node").filter(this.isVisibleNode.bind(this)).addClass("sliding slide-right"):i.nextAll().find(".node").filter(this.isVisibleNode.bind(this)).addClass("sliding slide-left"):(i.prevAll().find(".node").filter(this.isVisibleNode.bind(this)).addClass("sliding slide-right"),i.nextAll().find(".node").filter(this.isVisibleNode.bind(this)).addClass("sliding slide-left"));var n=i.siblings().find(".sliding"),s=n.closest(".nodes").prevAll(".lines").css("visibility","hidden");n.eq(0).one("transitionend",{node:e,nodeContainer:i,direction:t,animatedNodes:n,lines:s},this.hideSiblingsEnd.bind(this))},showSiblingsEnd:function(e){var t=e.data.node;e.data.visibleNodes.removeClass("sliding"),this.isInAction(t)&&(this.switchHorizontalArrow(t),t.children(".topEdge").removeClass("fa-chevron-up").addClass("fa-chevron-down"))},showRelatedParentEnd:function(t){e(t.target).removeClass("sliding")},showSiblings:function(t,i){var n=e();n=i?"left"===i?t.closest("table").parent().prevAll().removeClass("hidden"):t.closest("table").parent().nextAll().removeClass("hidden"):t.closest("table").parent().siblings().removeClass("hidden");var s=t.closest("table").closest("tr").siblings();if(i?s.eq(2).children(".hidden").slice(0,2*n.length).removeClass("hidden"):s.eq(2).children(".hidden").removeClass("hidden"),!this.getNodeState(t,"parent").visible){s.removeClass("hidden");var a=s.find(".node")[0];this.repaint(a),e(a).addClass("sliding").removeClass("slide-down").one("transitionend",this.showRelatedParentEnd)}var o=n.find(".node").filter(this.isVisibleNode.bind(this));this.repaint(o.get(0)),o.addClass("sliding").removeClass("slide-left slide-right"),o.eq(0).one("transitionend",{node:t,visibleNodes:o},this.showSiblingsEnd.bind(this))},startLoading:function(t){var i=this.$chart;return(void 0===i.data("inAjax")||!0!==i.data("inAjax"))&&(t.addClass("hidden"),t.parent().append('<i class="fa fa-circle-o-notch fa-spin spinner"></i>').children().not(".spinner").css("opacity",.2),i.data("inAjax",!0),e(".oc-export-btn"+(""!==this.options.chartClass?"."+this.options.chartClass:"")).prop("disabled",!0),!0)},endLoading:function(t){var i=t.parent();t.removeClass("hidden"),i.find(".spinner").remove(),i.children().removeAttr("style"),this.$chart.data("inAjax",!1),e(".oc-export-btn"+(""!==this.options.chartClass?"."+this.options.chartClass:"")).prop("disabled",!1)},isInAction:function(e){return-1<e.children(".edge").attr("class").indexOf("fa-")},switchVerticalArrow:function(e){e.toggleClass("fa-chevron-up").toggleClass("fa-chevron-down")},switchHorizontalArrow:function(e){var t=this.options;if(t.toggleSiblingsResp&&(void 0===t.ajaxURL||e.closest(".nodes").data("siblingsLoaded"))){var i=e.closest("table").parent().prev();i.length&&(i.is(".hidden")?e.children(".leftEdge").addClass("fa-chevron-left").removeClass("fa-chevron-right"):e.children(".leftEdge").addClass("fa-chevron-right").removeClass("fa-chevron-left"));var n=e.closest("table").parent().next();n.length&&(n.is(".hidden")?e.children(".rightEdge").addClass("fa-chevron-right").removeClass("fa-chevron-left"):e.children(".rightEdge").addClass("fa-chevron-left").removeClass("fa-chevron-right"))}else{var s=e.closest("table").parent().siblings(),a=!!s.length&&!s.is(".hidden");e.children(".leftEdge").toggleClass("fa-chevron-right",a).toggleClass("fa-chevron-left",!a),e.children(".rightEdge").toggleClass("fa-chevron-left",a).toggleClass("fa-chevron-right",!a)}},repaint:function(e){e&&(e.style.offsetWidth=e.offsetWidth)},nodeEnterLeaveHandler:function(t){var i=e(t.delegateTarget),n=!1,s=i.children(".topEdge"),a=(i.children(".rightEdge"),i.children(".bottomEdge")),o=i.children(".leftEdge");"mouseenter"===t.type?(s.length&&(n=this.getNodeState(i,"parent").visible,s.toggleClass("fa-chevron-up",!n).toggleClass("fa-chevron-down",n)),a.length&&(n=this.getNodeState(i,"children").visible,a.toggleClass("fa-chevron-down",!n).toggleClass("fa-chevron-up",n)),o.length&&this.switchHorizontalArrow(i)):i.children(".edge").removeClass("fa-chevron-up fa-chevron-down fa-chevron-right fa-chevron-left")},nodeClickHandler:function(t){this.$chart.find(".focused").removeClass("focused"),e(t.delegateTarget).addClass("focused")},loadNodes:function(t,i,n){var s=this;this.options,e.ajax({url:i,dataType:"json"}).done(function(i){s.$chart.data("inAjax")&&("parent"===t?e.isEmptyObject(i)||s.addParent(n.parent(),i):"children"===t?i.children.length&&s.addChildren(n.parent(),i[t]):s.addSiblings(n.parent(),i.siblings?i.siblings:i))}).fail(function(){console.log("Failed to get "+t+" data")}).always(function(){s.endLoading(n)})},HideFirstParentEnd:function(e){var t=e.data.topEdge,i=t.parent();this.isInAction(i)&&(this.switchVerticalArrow(t),this.switchHorizontalArrow(i))},topEdgeClickHandler:function(t){t.stopPropagation();var i=e(t.target),n=e(t.delegateTarget),s=this.getNodeState(n,"parent");if(s.exist){var a=n.closest("table").closest("tr").siblings(":first").find(".node");if(a.is(".sliding"))return;s.visible?(this.hideParent(n),a.one("transitionend",{topEdge:i},this.HideFirstParentEnd.bind(this))):this.showParent(n)}else if(this.startLoading(i)){var o=this.options,d=e.isFunction(o.ajaxURL.parent)?o.ajaxURL.parent(n.data("nodeData")):o.ajaxURL.parent+n[0].id;this.loadNodes("parent",d,i)}},bottomEdgeClickHandler:function(t){t.stopPropagation();var i=e(t.target),n=e(t.delegateTarget),s=this.getNodeState(n,"children");if(s.exist){if(n.closest("tr").siblings(":last").find(".sliding").length)return;s.visible?this.hideChildren(n):this.showChildren(n)}else if(this.startLoading(i)){var a=this.options,o=e.isFunction(a.ajaxURL.children)?a.ajaxURL.children(n.data("nodeData")):a.ajaxURL.children+n[0].id;this.loadNodes("children",o,i)}},hEdgeClickHandler:function(t){t.stopPropagation();var i=e(t.target),n=e(t.delegateTarget),s=this.options,a=this.getNodeState(n,"siblings");if(a.exist){if(n.closest("table").parent().siblings().find(".sliding").length)return;if(s.toggleSiblingsResp){var o=n.closest("table").parent().prev(),d=n.closest("table").parent().next();i.is(".leftEdge")?o.is(".hidden")?this.showSiblings(n,"left"):this.hideSiblings(n,"left"):d.is(".hidden")?this.showSiblings(n,"right"):this.hideSiblings(n,"right")}else a.visible?this.hideSiblings(n):this.showSiblings(n)}else if(this.startLoading(i)){var r=n[0].id,l=this.getNodeState(n,"parent").exist?e.isFunction(s.ajaxURL.siblings)?s.ajaxURL.siblings(n.data("nodeData")):s.ajaxURL.siblings+r:e.isFunction(s.ajaxURL.families)?s.ajaxURL.families(n.data("nodeData")):s.ajaxURL.families+r;this.loadNodes("siblings",l,i)}},expandVNodesEnd:function(e){e.data.vNodes.removeClass("sliding")},collapseVNodesEnd:function(e){e.data.vNodes.removeClass("sliding").closest("ul").addClass("hidden")},toggleVNodes:function(t){var i=e(t.target),n=i.parent().next(),s=n.find(".node"),a=n.children().children(".node");a.is(".sliding")||(i.toggleClass("fa-plus-square fa-minus-square"),s.eq(0).is(".slide-up")?(n.removeClass("hidden"),this.repaint(a.get(0)),a.addClass("sliding").removeClass("slide-up").eq(0).one("transitionend",{vNodes:a},this.expandVNodesEnd)):(s.addClass("sliding slide-up").eq(0).one("transitionend",{vNodes:s},this.collapseVNodesEnd),s.find(".toggleBtn").removeClass("fa-minus-square").addClass("fa-plus-square")))},createGhostNode:function(n){var s,a,o=e(n.target),d=this.options,r=n.originalEvent,l=/firefox/.test(t.navigator.userAgent.toLowerCase());i.querySelector(".ghost-node")?(s=o.closest(".orgchart").children(".ghost-node").get(0),a=e(s).children().get(0)):((s=i.createElementNS("http://www.w3.org/2000/svg","svg")).classList.add("ghost-node"),a=i.createElementNS("http://www.w3.org/2000/svg","rect"),s.appendChild(a),o.closest(".orgchart").append(s));var h=o.closest(".orgchart").css("transform").split(","),c="t2b"===d.direction||"b2t"===d.direction,g=Math.abs(t.parseFloat(c?h[0].slice(h[0].indexOf("(")+1):h[1]));s.setAttribute("width",c?o.outerWidth(!1):o.outerHeight(!1)),s.setAttribute("height",c?o.outerHeight(!1):o.outerWidth(!1)),a.setAttribute("x",5*g),a.setAttribute("y",5*g),a.setAttribute("width",120*g),a.setAttribute("height",40*g),a.setAttribute("rx",4*g),a.setAttribute("ry",4*g),a.setAttribute("stroke-width",1*g);var p=r.offsetX*g,f=r.offsetY*g;if("l2r"===d.direction?(p=r.offsetY*g,f=r.offsetX*g):"r2l"===d.direction?(p=o.outerWidth(!1)-r.offsetY*g,f=r.offsetX*g):"b2t"===d.direction&&(p=o.outerWidth(!1)-r.offsetX*g,f=o.outerHeight(!1)-r.offsetY*g),l){a.setAttribute("fill","rgb(255, 255, 255)"),a.setAttribute("stroke","rgb(191, 0, 0)");var v=i.createElement("img");v.src="data:image/svg+xml;utf8,"+(new XMLSerializer).serializeToString(s),r.dataTransfer.setDragImage(v,p,f)}else r.dataTransfer.setDragImage(s,p,f)},filterAllowedDropNodes:function(t){var i=this.options,n=t.closest(".nodes").siblings().eq(0).find(".node:first"),s=t.closest("table").find(".node");this.$chart.data("dragged",t).find(".node").each(function(a,o){-1===s.index(o)&&(i.dropCriteria?i.dropCriteria(t,n,e(o))&&e(o).addClass("allowedDrop"):e(o).addClass("allowedDrop"))})},dragstartHandler:function(t){t.originalEvent.dataTransfer.setData("text/html","hack for firefox"),"none"!==this.$chart.css("transform")&&this.createGhostNode(t),this.filterAllowedDropNodes(e(t.target))},dragoverHandler:function(t){t.preventDefault(),e(t.delegateTarget).is(".allowedDrop")||(t.originalEvent.dataTransfer.dropEffect="none")},dragendHandler:function(e){this.$chart.find(".allowedDrop").removeClass("allowedDrop")},dropHandler:function(t){var i=e(t.delegateTarget),n=this.$chart.data("dragged"),s=n.closest(".nodes").siblings().eq(0).children(),a=e.Event("nodedrop.orgchart");if(this.$chart.trigger(a,{draggedNode:n,dragZone:s.children(),dropZone:i}),!a.isDefaultPrevented()){if(i.closest("tr").siblings().length){var o=parseInt(i.parent().attr("colspan"))+2,d='<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i>';i.closest("tr").next().addBack().children().attr("colspan",o),n.find(".horizontalEdge").length||n.append(d),i.closest("tr").siblings().eq(1).children(":last").before('<td class="leftLine topLine"></td><td class="rightLine topLine"></td>').end().next().append(n.closest("table").parent());var r=n.closest("table").parent().siblings().find(".node:first");1===r.length&&r.append(d)}else i.append('<i class="edge verticalEdge bottomEdge fa"></i>').parent().attr("colspan",2).parent().after('<tr class="lines"><td colspan="2"><div class="downLine"></div></td></tr><tr class="lines"><td class="rightLine"></td><td class="leftLine"></td></tr><tr class="nodes"></tr>').siblings(":last").append(n.find(".horizontalEdge").remove().end().closest("table").parent());var l=parseInt(s.attr("colspan"));if(2<l){s.attr("colspan",l-2).parent().next().children().attr("colspan",l-2).end().next().children().slice(1,3).remove();var h=s.parent().siblings(".nodes").children().find(".node:first");1===h.length&&h.find(".horizontalEdge").remove()}else s.removeAttr("colspan").find(".bottomEdge").remove().end().end().siblings().remove()}},touchstartHandler:function(e){console.log("orgChart: touchstart 1: touchHandled="+this.touchHandled+", touchMoved="+this.touchMoved+", target="+e.target.innerText),this.touchHandled||(this.touchHandled=!0,this.touchMoved=!1,e.preventDefault())},touchmoveHandler:function(t){if(this.touchHandled){t.preventDefault(),this.touchMoved||(e(this).hasClass("focused"),console.log("orgChart: touchmove 1: "+t.touches.length+" touches, we have not moved, so simulate a drag start",t.touches),this.simulateMouseEvent(t,"dragstart")),this.touchMoved=!0;var n=e(i.elementFromPoint(t.touches[0].clientX,t.touches[0].clientY)).closest("div.node");if(0<n.length){var s=n[0];n.is(".allowedDrop")?(console.log("orgChart: touchmove 2: this node ("+s.id+") is allowed to be a drop target"),this.touchTargetNode=s):(console.log("orgChart: touchmove 3: this node ("+s.id+") is NOT allowed to be a drop target"),this.touchTargetNode=null)}else console.log("orgchart: touchmove 4: not touching a node"),this.touchTargetNode=null}},touchendHandler:function(e){if(console.log("orgChart: touchend 1: touchHandled="+this.touchHandled+", touchMoved="+this.touchMoved+", "+e.target.innerText+" "),this.touchHandled){if(this.touchMoved){if(this.touchTargetNode){console.log("orgChart: touchend 3: moved to a node, so simulating drop");var t={delegateTarget:this.touchTargetNode};this.dropHandler(t),this.touchTargetNode=null}console.log("orgChart: touchend 4: simulating dragend"),this.simulateMouseEvent(e,"dragend")}else console.log("orgChart: touchend 5: moved, so simulating click"),this.simulateMouseEvent(e,"click");this.touchHandled=!1}else console.log("orgChart: touchend 2: not handled by us, so aborting")},simulateMouseEvent:function(e,n){if(!(1<e.originalEvent.touches.length)){var s=e.originalEvent.changedTouches[0],a=i.createEvent("MouseEvents");a.initMouseEvent(n,!0,!0,t,1,s.screenX,s.screenY,s.clientX,s.clientY,!1,!1,!1,!1,0,null),e.target.dispatchEvent(a)}},bindDragDrop:function(e){e.on("dragstart",this.dragstartHandler.bind(this)).on("dragover",this.dragoverHandler.bind(this)).on("dragend",this.dragendHandler.bind(this)).on("drop",this.dropHandler.bind(this)).on("touchstart",this.touchstartHandler.bind(this)).on("touchmove",this.touchmoveHandler.bind(this)).on("touchend",this.touchendHandler.bind(this))},createNode:function(t){var i=this.options,n=t.level;t.children&&e.each(t.children,function(e,i){i.parentId=t.id});var s=e("<div"+(i.draggable?' draggable="true"':"")+(t[i.nodeId]?' id="'+t[i.nodeId]+'"':"")+(t.parentId?' data-parent="'+t.parentId+'"':"")+">").addClass("node "+(t.className||"")+(n>i.visibleLevel?" slide-up":""));i.nodeTemplate?s.append(i.nodeTemplate(t)):s.append('<div class="title">'+t[i.nodeTitle]+"</div>").append(void 0!==i.nodeContent?'<div class="content">'+(t[i.nodeContent]||"")+"</div>":"");var a=e.extend({},t);delete a.children,s.data("nodeData",a);var o=t.relationship||"";if(i.verticalLevel&&n>=i.verticalLevel){if(n+1>i.verticalLevel&&Number(o.substr(2,1))){var d=n+1>i.visibleLevel?"plus":"minus";s.append('<i class="toggleBtn fa fa-'+d+'-square"></i>')}}else Number(o.substr(2,1))&&s.append('<i class="edge verticalEdge bottomEdge fa"></i>').children(".title").prepend('<i class="fa '+i.parentNodeSymbol+' symbol"></i>');return s.on("mouseenter mouseleave",this.nodeEnterLeaveHandler.bind(this)),s.on("click",this.nodeClickHandler.bind(this)),s.on("click",".topEdge",this.topEdgeClickHandler.bind(this)),s.on("click",".bottomEdge",this.bottomEdgeClickHandler.bind(this)),s.on("click",".leftEdge, .rightEdge",this.hEdgeClickHandler.bind(this)),s.on("click",".toggleBtn",this.toggleVNodes.bind(this)),i.draggable&&(this.bindDragDrop(s),this.touchHandled=!1,this.touchMoved=!1,this.touchTargetNode=null),i.createNode&&i.createNode(s,t),s},buildHierarchy:function(t,i){var n,s=this,a=this.options;n=i.level?i.level:i.level=t.parentsUntil(".orgchart",".nodes").length+1;var o,d=i.children,r=!!d&&d.length;if(2<Object.keys(i).length){var l=this.createNode(i);a.verticalLevel&&n>=a.verticalLevel?t.append(l):(o=e("<table>"),t.append(o.append(e("<tr/>").append(e("<td"+(r?' colspan="'+2*d.length+'"':"")+"></td>").append(l)))))}if(r){var h,c=n+1>a.visibleLevel||i.collapsed?" hidden":"",g=!!(a.verticalLevel&&n+1>=a.verticalLevel);if(g)h=e("<ul>"),c&&n+1>a.verticalLevel&&h.addClass(c),n+1===a.verticalLevel?t.children("table").append('<tr class="verticalNodes'+c+'"><td></td></tr>').find(".verticalNodes").children().append(h):t.append(h);else{for(var p=e('<tr class="lines'+c+'"><td colspan="'+2*d.length+'"><div class="downLine"></div></td></tr>'),f='<tr class="lines'+c+'"><td class="rightLine"></td>',v=1;v<d.length;v++)f+='<td class="leftLine topLine"></td><td class="rightLine topLine"></td>';f+='<td class="leftLine"></td></tr>',h=e('<tr class="nodes'+c+'">'),2===Object.keys(i).length?t.append(p).append(f).append(h):o.append(p).append(f).append(h)}e.each(d,function(){var t=e(g?"<li>":'<td colspan="2">');h.append(t),this.level=n+1,s.buildHierarchy(t,this)})}},buildChildNode:function(e,t){e.find("td:first").attr("colspan",2*t.length),this.buildHierarchy(e,{children:t})},addChildren:function(e,t){this.buildChildNode(e.closest("table"),t),e.children(".bottomEdge").length||e.append('<i class="edge verticalEdge bottomEdge fa"></i>'),e.find(".symbol").length||e.children(".title").prepend('<i class="fa '+this.options.parentNodeSymbol+' symbol"></i>'),this.isInAction(e)&&this.switchVerticalArrow(e.children(".bottomEdge"))},buildParentNode:function(t,i){i.relationship=i.relationship||"001";var n=e("<table>").append(e("<tr>").append(e('<td colspan="2">').append(this.createNode(i)))).append('<tr class="lines"><td colspan="2"><div class="downLine"></div></td></tr>').append('<tr class="lines"><td class="rightLine"></td><td class="leftLine"></td></tr>');this.$chart.prepend(n).children("table:first").append('<tr class="nodes"><td colspan="2"></td></tr>').children("tr:last").children().append(this.$chart.children("table").last())},addParent:function(e,t){this.buildParentNode(e,t),e.children(".topEdge").length||e.children(".title").after('<i class="edge verticalEdge topEdge fa"></i>'),this.isInAction(e)&&this.switchVerticalArrow(e.children(".topEdge"))},complementLine:function(e,t,i){for(var n="",s=0;s<i;s++)n+='<td class="leftLine topLine"></td><td class="rightLine topLine"></td>';e.parent().prevAll("tr:gt(0)").children().attr("colspan",2*t).end().next().children(":first").after(n)},buildSiblingNode:function(t,i){var n=e.isArray(i)?i.length:i.children.length,s=t.parent().is("td")?t.closest("tr").children().length:1,a=s+n,o=1<a?Math.floor(a/2-1):0;if(t.parent().is("td")){t.closest("tr").prevAll("tr:last"),t.closest("tr").prevAll("tr:lt(2)").remove(),this.buildChildNode(t.parent().closest("table"),i);var d=t.parent().closest("table").children("tr:last").children("td");1<s?this.complementLine(d.eq(0).before(t.closest("td").siblings().addBack().unwrap()),a,s):this.complementLine(d.eq(o).after(t.closest("td").unwrap()),a,1)}else this.buildHierarchy(t.closest(".orgchart"),i),this.complementLine(t.next().children("tr:last").children().eq(o).after(e('<td colspan="2">').append(t)),a,1)},addSiblings:function(e,t){this.buildSiblingNode(e.closest("table"),t),e.closest(".nodes").data("siblingsLoaded",!0),e.children(".leftEdge").length||e.children(".topEdge").after('<i class="edge horizontalEdge rightEdge fa"></i><i class="edge horizontalEdge leftEdge fa"></i>'),this.isInAction(e)&&(this.switchHorizontalArrow(e),e.children(".topEdge").removeClass("fa-chevron-up").addClass("fa-chevron-down"))},removeNodes:function(e){var t=e.closest("table").parent(),i=t.parent().siblings();t.is("td")?this.getNodeState(e,"siblings").exist?(i.eq(2).children(".topLine:lt(2)").remove(),i.slice(0,2).children().attr("colspan",i.eq(2).children().length),t.remove()):i.eq(0).children().removeAttr("colspan").find(".bottomEdge").remove().end().end().siblings().remove():t.add(t.siblings()).remove()},export:function(n,s){var a=this;if(n=void 0!==n?n:this.options.exportFilename,s=void 0!==s?s:this.options.exportFileextension,e(this).children(".spinner").length)return!1;var o=this.$chartContainer,d=o.find(".mask");d.length?d.removeClass("hidden"):o.append('<div class="mask"><i class="fa fa-circle-o-notch fa-spin spinner"></i></div>');var r=o.addClass("canvasContainer").find('.orgchart:not(".hidden")').get(0),l="l2r"===a.options.direction||"r2l"===a.options.direction;html2canvas(r,{width:l?r.clientHeight:r.clientWidth,height:l?r.clientWidth:r.clientHeight,onclone:function(t){e(t).find(".canvasContainer").css("overflow","visible").find('.orgchart:not(".hidden"):first').css("transform","")},onrendered:function(e){if(o.find(".mask").addClass("hidden"),"pdf"===s.toLowerCase()){var d={},r=Math.floor(.2646*e.width),l=Math.floor(.2646*e.height);(d=l<r?new jsPDF("l","mm",[r,l]):new jsPDF("p","mm",[l,r])).addImage(e.toDataURL(),"png",0,0),d.save(n+".pdf")}else{var h="WebkitAppearance"in i.documentElement.style,c=!!t.sidebar,g="Microsoft Internet Explorer"===navigator.appName||"Netscape"===navigator.appName&&-1<navigator.appVersion.indexOf("Edge");if(!h&&!c||g)t.navigator.msSaveBlob(e.msToBlob(),n+".png");else{var p=".oc-download-btn"+(""!==a.options.chartClass?"."+a.options.chartClass:"");o.find(p).length||o.append('<a class="oc-download-btn'+(""!==a.options.chartClass?" "+a.options.chartClass:"")+'" download="'+n+'.png"></a>'),o.find(p).attr("href",e.toDataURL())[0].click()}}}}).then(function(){o.removeClass("canvasContainer")},function(){o.removeClass("canvasContainer")})}},e.fn.orgchart=function(e){return new s(this,e).init()}});