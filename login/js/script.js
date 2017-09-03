function overlayText() {
	var e = $(".overlay-text"),
		t = new Array;
	$(".overlay")[0] && $(".overlay").remove();
	for(var o = 0; o < e.length; o++) t[o] = {
		text: e.eq(o).html()
	}, e.eq(o).append('<span class="overlay"><span class="overlay-inner">' + t[o].text + "</span></span>"), e.eq(o).find(".overlay-inner").css({
		width: e.eq(o).parent().outerWidth(),
		left: -[e.eq(o).parent().outerWidth()] / 2
	});
	var n;
	$win.on("resize orientationchange", function() {
		clearTimeout(n), n = setTimeout(function() {
			for(var t = 0; t < e.length; t++) e.eq(t).find(".overlay-inner").css({
				width: e.eq(t).parent().outerWidth(),
				left: -[e.eq(t).parent().outerWidth()] / 2
			})
		}, 100)
	})
}

function btnLineTypeHover() {
	var e, t, o, n = $(".btn.line-type").not(".no-link");
	n.mouseenter(function() {
		e = $(this), e.addClass("hover-ph1"), t = setTimeout(function() {
			e.addClass("hover-ph2")
		}, 180), o = setTimeout(function() {
			e.addClass("hover-ph3")
		}, 360)
	}).mouseleave(function() {
		e.removeClass("hover-ph1").removeClass("hover-ph2").removeClass("hover-ph3"), clearTimeout(t), clearTimeout(o)
	})
}

function verticalMotion(e, t) {}

function tempResize() {
	winW = $win.width(), winH = $win.height(), $("#gnavi-wrap,#gnavi-bg").css({
		width: winW,
		height: 1.4 * winH
	}), $("#gnavi-contents-inner").css({
		top: [winH - $("#gnavi-contents-inner").outerHeight()] / 2
	}), $("#document").addClass("resize").css({
		"min-height": winH
	}), clearTimeout(tempResizeTimer), tempResizeTimer = setTimeout(function() {
		$("#document").removeClass("resize")
	}, 500), minW = winW > breakpoint ? 1080 : 320, minH = winW > breakpoint ? 550 : 0, winW > breakpoint ? $fullScreenWrap.css({
		width: winW,
		height: winH
	}) : $fullScreenWrap.css({
		width: winW,
		height: ""
	});
	var e = $("#pager-wrap").height() > winH ? winH - $("#pager-wrap").height() : 0;
	$("#pager-wrap").css({
		top: e
	})
}

function globalNavi() {
	var e, t, o = $("#gnavi-wrap"),
		n = $("#gnav-menu"),
		a = $("#site-logo"),
		i = !1,
		r = !1;
	$("#gnav-menu,#gnavi-bg").on(triggerEvent, function() {
		if(!r) {
			r = !0, tempResize();
			var s = n;
			if(s.hasClass("close-ph1")) s.find(".text").text("MENU"), s.removeClass("close-ph3").removeClass("close-ph2").removeClass("close-ph1"), a.removeClass("white"), o.removeClass("show"), i = !1, $(".hide-dom").removeClass("hide"), clearTimeout(e), e = setTimeout(function() {
				r = !1
			}, 480);
			else {
				if(i) return !1;
				i = !0, s.addClass("close-ph1"), clearTimeout(e), clearTimeout(t), e = setTimeout(function() {
					s.addClass("close-ph2"), a.addClass("white"), o.addClass("show"), $(".hide-dom").addClass("hide")
				}, 500), t = setTimeout(function() {
					s.find(".text").text("CLOSE"), s.addClass("close-ph3"), setTimeout(function() {
						r = !1
					}, 480)
				}, 1e3)
			}
		}
	})
}

function common() {
	function e() {
		$.cookie("scrollInc", ""), "top" != $("body").attr("id") && ($.cookie("topFirst", "", {
			path: ""
		}), $.cookie("topCurrent", "", {
			path: ""
		}), $.cookie("topFirst", "", {
			path: "/en/"
		}), $.cookie("topCurrent", "", {
			path: "/en/"
		})), "mission_statement" != $("body").attr("id") && ($.cookie("missionCurrent", "", {
			path: "/mission_statement"
		}), $.cookie("missionCurrent", "", {
			path: "/en/mission_statement"
		}))
	}
	$(".link-box").on("click", function() {
		if(!$(this).hasClass("no-link")) {
			var t = $(this);
			return e(), "_blank" != t.find("a").attr("target") && $("#document").addClass("js-page-link"), setTimeout(function() {
				var e = t.find("a").attr("href");
				"_blank" == t.find("a").attr("target") ? window.open(e, "_blank") : window.location = e
			}, 1e3), !1
		}
	}), "pc" != divece ? $("#gnavi a,#gnavi-sub a").not(".no-link").on("touchend", function(t) {
		var o = $(this).attr("href");
		return e(), "_blank" == $(this).attr("target") ? window.open(o, "_blank") : window.location = o, !1
	}) : $("a").on("click", function(t) {
		if($(this).hasClass("no-link")) return !1;
		t.preventDefault(), e();
		var o = $(this);
		if("_blank" != o.attr("target")) $("#document").addClass("js-page-link"), setTimeout(function() {
			var e = o.attr("href");
			window.location = e
		}, 1e3);
		else {
			var n = o.attr("href");
			window.open(n, "_blank")
		}
	})
}

function lowlayer() {
	function e() {
		winW > breakpoint ? (u.enabled(!0), f.enabled(!0), v.enabled(!0), x.enabled(!0), k.enabled(!0)) : (u.enabled(!1), f.enabled(!1), v.enabled(!1), x.enabled(!1), k.enabled(!1))
	}

	function t(e, t) {
		for(var o = $(".vertical-motion,.horizontal-motion").not(".not").not(".show"), n = 0; n < o.length; n++) winW > breakpoint ? o.eq(n).offset().top - t < e && o.eq(n).addClass("show").css({
			"transition-delay": 30 * n + "ms"
		}) : o.eq(n).addClass("show").css({
			"transition-delay": 30 * n + "ms"
		});
		var a = $(".vertical").not(".not");
		if(winW > breakpoint) {
			for(var n = 0; n < a.length; n++)
				if(a.eq(n).offset().top - t < e) {
					var i = a.hasClass("slow") ? 20 : 14,
						r = [a.eq(n).offset().top - t - e] / i;
					a.eq(n).parent().css({
						transform: "matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,0," + r + ",0,1)"
					})
				}
		} else a.parent().css({
			transform: ""
		})
	}

	function o() {
		if($(".photo-inner-box")[0])
			for(var e = 0; e < $(".photo-inner-box").length; e++) {
				var t = $(".photo-inner-box").eq(e),
					o = t.data("width") ? t.data("width") : t.parents(".photo-size").width();
				t.css({
					width: o
				})
			}
	}

	function n() {
		sct = winW > breakpoint ? window : "#lowlayer-page-wrap", "top" != $(".page-id").attr("id") ? ($("#page-contents-wrap").css({
			height: ""
		}), breakpoint >= winW || $("#lowlayer-page-wrap").css({
			height: ""
		}), o()) : $("#lowlayer-page-wrap").css({
			height: ""
		})
	}
	if("top" == $(".page-id").attr("id")) return !1;
	var a = $win.scrollTop();
	sct = winW > breakpoint ? window : "#lowlayer-page-wrap";
	var i = winW > breakpoint ? winH + a : 1.5 * [winH + a];
	t(i, 0), $("#page-top").on(triggerEvent, function() {
		lowlayerPageTopMotion(.68)
	}), o(), $(".horizontal-motion")[0] && $(".horizontal-motion").css({
		width: 0
	});
	var r = new ScrollMagic.Controller;
	if(!$("#stage-wrap")[0]) {
		var s = new TweenMax.staggerTo($(".vertical-motion").not(".show"), 1.68, {
			transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
			"-webkit-filter": "blur(0px)",
			filter: "blur(0px)",
			opacity: 100,
			ease: Power1.easeOut
		}, .2, function() {});
		new ScrollMagic.Scene({
			duration: winH / 2,
			offset: -winH / 2
		}).setTween(s).addTo(r)
	}
	if($("#stage-wrap")[0]) {
		var l = new TweenMax.staggerTo($("#investment-stage .vertical-motion").not(".show"), 1.68, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
				"-webkit-filter": "blur(0px)",
				filter: "blur(0px)",
				opacity: 100,
				ease: Power1.easeOut
			}, .2, function() {}),
			c = (new ScrollMagic.Scene({
				triggerElement: "#lowlayer-page-wrap"
			}).setClassToggle("#investment-stage", "show").setTween(l).addTo(r), new TweenMax.staggerTo($("#stage-wrap .vertical-motion"), 1.68, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
				"-webkit-filter": "blur(0px)",
				filter: "blur(0px)",
				opacity: 100,
				ease: Power1.easeOut
			}, .2, function() {})),
			w = (new ScrollMagic.Scene({
				triggerElement: "#investment-stage"
			}).setClassToggle("#stage-wrap,#investment-stage .section-title.vertical-motion", "show").setTween(c).addTo(r), new TweenMax.staggerTo($("#fund-wrap .vertical-motion"), 1.68, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
				"-webkit-filter": "blur(0px)",
				filter: "blur(0px)",
				opacity: 100,
				ease: Power1.easeOut
			}, .2, function() {})),
			d = (new ScrollMagic.Scene({
				triggerElement: "#stage-wrap"
			}).setClassToggle("#fund-wrap", "show").setTween(w).addTo(r), new TweenMax.staggerTo($("#investment-area-wrap .vertical-motion"), 1.68, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
				"-webkit-filter": "blur(0px)",
				filter: "blur(0px)",
				opacity: 100,
				ease: Power1.easeOut
			}, .2, function() {})),
			p = (new ScrollMagic.Scene({
				triggerElement: "#stage-wrap"
			}).setClassToggle("#investment-area-wrap", "show").setTween(d).addTo(r), new TweenMax.staggerTo($("#process-wrap .vertical-motion"), 1.68, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)",
				"-webkit-filter": "blur(0px)",
				filter: "blur(0px)",
				opacity: 100,
				ease: Power1.easeOut
			}, .2, function() {}));
		new ScrollMagic.Scene({
			triggerElement: "#investment-area-wrap"
		}).setClassToggle("#process-wrap", "show").setTween(p).addTo(r)
	}
	if($("#message-wrap")[0]) {
		var m = new TweenMax.staggerTo(".horizontal-motion", 1.68, {
				width: "100%",
				ease: Power1.easeOut
			}, .2, function() {}),
			u = new ScrollMagic.Scene({
				triggerElement: ".horizontal-motion",
				duration: winH / 2,
				offset: -winH / 2
			}).setTween(m).addTo(r),
			h = (new TimelineMax).add([TweenMax.fromTo(".message-box-outline.message01", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 100, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -100, 0, 1)",
				ease: Circ.easeOut
			}), TweenMax.fromTo(".photo-box.photo01", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 50, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -50, 0, 1)",
				ease: Circ.easeOut
			})]),
			f = new ScrollMagic.Scene({
				triggerElement: ".message-box-outline.message01",
				duration: winH,
				offset: -winH / 2
			}).setTween(h).addTo(r),
			g = (new TimelineMax).add([TweenMax.fromTo(".photo-box.photo01 .photo-inner-box", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -80, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 80, 0, 1)",
				ease: Circ.easeOut
			})]),
			v = new ScrollMagic.Scene({
				triggerElement: ".photo-box.photo01",
				duration: winH,
				offset: -winH / 2
			}).setTween(g).addTo(r),
			T = (new TimelineMax).add([TweenMax.fromTo(".message-box-outline.message02", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 100, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -100, 0, 1)",
				ease: Circ.easeOut
			}), TweenMax.fromTo(".photo-box.photo02", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 50, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -50, 0, 1)",
				ease: Circ.easeOut
			})]),
			x = new ScrollMagic.Scene({
				triggerElement: ".message-box-outline.message02",
				duration: winH,
				offset: -winH / 2
			}).setTween(T).addTo(r),
			b = (new TimelineMax).add([TweenMax.fromTo(".photo-box.photo02 .photo-inner-box", 1, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -80, 0, 1)"
			}, {
				transform: "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 80, 0, 1)",
				ease: Circ.easeOut
			})]),
			k = new ScrollMagic.Scene({
				triggerElement: ".photo-box.photo02",
				duration: winH,
				offset: -winH / 2
			}).setTween(b).addTo(r);
		e(), $win.on("resize", function() {
			e()
		})
	}
	n(), $win.on("resize orientationchange", function() {
		n()
	})
}

function lowlayerPageTopMotion(e) {
	TweenMax.to(window, e, {
		scrollTo: 0,
		ease: Power1.easeOut
	})
}

function cookieSave() {
	var e = $("body").attr("id"),
		t = !1;
	"top" != e && "mission_statement" != e ? ("" != $.cookie("scrollInc") && TweenMax.to(window, 0, {
		scrollTo: $.cookie("scrollInc"),
		ease: Power4.easeOut,
		onComplete: function() {
			t = !0
		}
	}), $win.on("scroll", function() {
		if(t) {
			var e = $win.scrollTop();
			$.cookie("scrollInc", e)
		}
	})) : $.cookie("scrollInc", "");
	supportTouch ? "touchmove" : "mousemove"
}

function loadBaseFunction() {
	$(".pace").length > 1 && $(".pace").eq(0).remove(), setTimeout(function() {
		$("body").addClass("hide")
	}, 500), setTimeout(function() {
		"top" != $(".page-id").attr("id") && $("#header,#footer,#pager-wrap").addClass("show")
	}, 1500), $fullScreenWrap = $(".full-screen-wrap"), $(".pf-link").on("click", function() {
		pfStatus.selectType = $(this).data("selectType"), pfStatus.select = $(this).data("select"), pfStatus.current = $(this).data("current"), pfStatus.click = !0
		}), "top" != $(".page-id").attr("id") && (lowlayerPageTopMotion(0), setTimeout(function() {
		lowlayer()
	}, 1e3)), "pc" == divece ? $("#document").addClass("ua-pc") : $("#document").addClass("ua-other")
}
var $doc = $(document),
	$win = $(window),
	winW = $win.width(),
	winH = $win.height(),
	minW = 1080,
	minH = 550,
	breakpoint = 760,
	pageUrl = location.href,
	ajaxLoadFlg = !1,
	mousewheelevent = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll",
	$fullScreenWrap, ua = navigator.userAgent,
	isIE = ua.match(/msie/i) || ua.match(/(T|t)rident/),
	isIE6 = ua.match(/msie [6.]/i),
	isIE7 = ua.match(/msie [7.]/i),
	isIE8 = ua.match(/msie [8.]/i),
	isIE9 = ua.match(/msie [9.]/i),
	isIE10 = ua.match(/msie [10.]/i),
	smpUa = {
		iPhone: -1 != ua.indexOf("iPhone"),
		iPad: -1 != ua.indexOf("iPad"),
		iPod: -1 != ua.indexOf("iPod"),
		android: -1 != ua.indexOf("Android"),
		windows: -1 != ua.indexOf("Windows Phone")
	};
if(smpUa.iPhone || smpUa.iPad || smpUa.android || smpUa.windows) {
	var triggerEvent = "click";
	if(winW > breakpoint) var divece = "tablet";
	else var divece = "other"
} else var triggerEvent = "click",
	divece = "pc";
var pjaxSt = {
		load: !1
	},
	paceLoad = !1,
	$lowlayerPageW = $("#lowlayer-page-wrap"),
	pfStatus = {
		selectType: "main",
		select: "all",
		current: 1,
		click: !1
	},
	tempResizeTimer = [],
	lowlayerPageTopMotionTimer = [];
$win.on("load", function() {
	console.log('123456');
	"top" == $(".page-id").attr("id") && $("#document").css("opacity", 1), 
		loadBaseFunction(), 
		common(), 
		globalNavi(), 
		btnLineTypeHover(), 
		tempResize(), 
		overlayText(),
				$("#document").addClass("show"),
						 	 $("#loading").hide(),
						         $('#zmmlogin').show(),
		 setTimeout(function() {
		 	 		jby()
		 $('#zmmcc').show();
		$('#zmmcc').addClass('animated zoomInRight');
		setTimeout(function(){
        $('#zmmcc').removeClass('zoomInRight');
        $('#zmmcc').hide();
    }, 2000);
	}, 1500)
		//$("#zmmlogin").show()
}), $win.on("resize orientationchange", function() {
	winW = $win.width(), winH = $win.height(), tempResize()
});