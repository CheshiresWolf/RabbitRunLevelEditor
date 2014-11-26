require(["jquery"], function($) {

	var c, ctx;
	var boxW, boxH;
	var offsetX, offsetY;

	var path, pathArray = [];

	var imageLoader = new ImageLoader();

    function init() {
		c = document.getElementById("editor");
		ctx = c.getContext("2d");

		boxW = c.width  / 10;
		boxH = c.height / 10;

		console.log("main.html | canvas.pos : (" + c.style.left + ", " + c.style.top + ")");
		console.log("main.html | canvas.size : (" + c.width + ", " + c.height + ")");

		clear();
	}

	//==========================<MOUSE>==========================

	function mouseDown(e) {
		//init path
		path = new Path();

		path.setStartDot(e.offsetX, e.offsetY);

		c.onmousemove = mouseMove;
		c.onmouseout  = mouseOut;
	}

	function mouseUp(e) {
		path.setEndDot(e.offsetX, e.offsetY);
		
		c.onmousemove = function() {};
		c.onmouseout  = function() {};

		//save path
		pathArray.push(path);
	}

	function mouseMove(e) {
		path.setPathDot(e.offsetX, e.offsetY);
	}

	function mouseOut(e) {
		var bufX = e.offsetX, bufY = e.offsetY;

		if (e.offsetX < 0) bufX = 0;
		if (e.offsetX > c.width) bufX = c.width - 1;

		if (e.offsetY < 0) bufY = 0;
		if (e.offsetY > c.height) bufY = c.height - 1;

		mouseUp({
			pageX: bufX,
			pageY: bufY
		});
	}

	//=========================</MOUSE>==========================

	//==========================<UTILS>==========================

	function addPath() {
		c.onmousedown = mouseDown;
		c.onmouseup   = mouseUp;
	}

	function addTrap() {
		if (path) {
			c.onmousedown = function(e) {
				path.addTrap(e.offsetX, e.offsetY);
			};
			c.onmouseup   = function() {};
		} else {
			print("First add path.");
		}
	}

	function addCarrot() {
		if (path) {
			c.onmousedown = function(e) {
				path.addCarrot(e.offsetX, e.offsetY);
			};
			c.onmouseup   = function() {};
		} else {
			print("First add path.");
		}
	}

	function addBox() {
		if (path) {
			c.onmousedown = function(e) {
				path.addWall(e.offsetX, e.offsetY);
			};
			c.onmouseup   = function() {};
		} else {
			print("First add path.");
		}
	}

	function coordToIndexes(x, y) {
		var res = [];

		res[0] = Math.floor(y / boxH);
		res[1] = Math.floor(x / boxW);

		return res;
	}

	function clear(callback) {
		pathArray = [];

		ctx.clearRect(0, 0, c.width, c.height);
		imageLoader.loadImage("fon.png", {
			x : 0,
			y : 0,
			width  : 800,
			height : 800
		}, function() {
			//draw grid
			for (var i = boxW; i < c.width; i += boxW) {
				ctx.moveTo(i, 0);
				ctx.lineTo(i, c.height);
				ctx.stroke();
			}

			for (var i = boxH; i < c.height; i += boxH) {
				ctx.moveTo(0, i);
				ctx.lineTo(c.width, i);
				ctx.stroke();
			}

			if (callback) callback();
		});
	}

	function print(text) {
		$("#textarea").html(text);
	}

	function resizeWindow() {
		var w = window.innerWidth;

		if (w > 1020) {
			$("#container").css("left", ((window.innerWidth - 1020) / 2) + "px");
		}
	}

	//=========================</UTILS>==========================

	//==========================<CLASS>==========================

	function ImageLoader() {
		var self = this;

		self.images = [];

		self.loadImage = function(name, opts, callback) {
			var img = new Image();

		    img.onload = function() {
		    	self.images.push(img);
		    	ctx.drawImage(img, opts.x, opts.y, opts.width, opts.height);

		    	if (callback) callback();
		    }
		    img.src = "img/" + name;
		}

		return self;
	}

	function Path() {
		var self = this;

		var defaultJSONStyle = {
	        "box"  : ["stone.png", "stone2.png", "bereza.png", "stog.png", "koloda.png"],
	        "trap" : ["kapkan.png", "eg.png"],
	        "hole" : ["hole.png"],
	        "carrot" : ["carrot.png"],
	        "rabbit" : {
	            "stand" : "rabbit2.png",
	            "run"   : "rabbitAnimation2.xml"
	        }
        };

		var initDot, endDot;
		var bodyDots = [];

		var prevDot = [];

		var traps = [];
		var carrots = [];
		var walls = [];

		self.setStartDot = function(x, y) {
			initDot = coordToIndexes(x, y);
			bodyDots.push(initDot);

			imageLoader.loadImage("rabbit2.png", {
				x : initDot[1] * boxW,
				y : initDot[0] * boxH,
				width  : boxW,
				height : boxH
			});

			prevDot = initDot;
		};

		self.setPathDot = function(x, y) {
			var bufDot = coordToIndexes(x, y);

			if ( (prevDot[0] != bufDot[0]) || (prevDot[1] != bufDot[1]) ) {
				bodyDots.push(bufDot);

				ctx.fillStyle = "#00CF1F";
				ctx.fillRect(
					bufDot[1] * boxW,
					bufDot[0] * boxH,
					boxW,
					boxH
				);

				prevDot = bufDot;
			}
		};

		self.setEndDot = function(x, y) {
			endDot = coordToIndexes(x, y);
			if (!alreadyExist(endDot, bodyDots)) bodyDots.push(endDot);

			imageLoader.loadImage("hole.png", {
				x : endDot[1] * boxW,
				y : endDot[0] * boxH,
				width  : boxW,
				height : boxH
			});

			drawWalls();
		};

		function alreadyExist(dot, array) {
			for (var key in array) {
				if ( (array[key][0] == dot[0]) && (array[key][1] == dot[1]) ) {
					return true;
				}
			}

			return false;
		}

		self.createJson = function() {
			var res = {
				name : "new_lvl",
				base_path : "img/"
			};

			res.images = defaultJSONStyle;

			res.scheme = {
				rabbit : initDot,
				hole   : endDot,
				traps  : traps,
				carrot : carrots
			};

			res.scheme.boxes = [];

			for (var key in walls) {
				if ( (walls[key][0] >= 0 && walls[key][0] <= 9) && (walls[key][1] >= 0 && walls[key][1] <= 9)) {
					res.scheme.boxes.push(walls[key]);
				}
			}

			return IBuilMyOwnStringify(res);
		}

		self.getDots = function() {
			return bodyDots;
		};

		self.addTrap = function(x, y) {
			var bufTrap = coordToIndexes(x, y);
			traps.push(bufTrap);

			imageLoader.loadImage("trap.png", {
				x : bufTrap[1] * boxW,
				y : bufTrap[0] * boxH,
				width  : boxW,
				height : boxH
			});
		};

		self.addCarrot = function(x, y) {
			if (carrots.length < 3) {
				var bufCarrot = coordToIndexes(x, y);
				carrots.push(bufCarrot);

				imageLoader.loadImage("carrot.png", {
					x : bufCarrot[1] * boxW,
					y : bufCarrot[0] * boxH,
					width  : boxW,
					height : boxH
				});
			} else {
				print("You can place only three carrot.");
			}
		};

		self.addWall = function(x, y) {
			var bufWall = coordToIndexes(x, y);
			walls.push(bufWall);

			imageLoader.loadImage("stone.png", {
				x : bufWall[1] * boxW,
				y : bufWall[0] * boxH,
				width  : boxW,
				height : boxH
			});
		};

		function drawWalls() {
			walls = [];

			var oldD = [], newD = [];
			for (var i = 0; i < bodyDots.length - 1; i++) {
				newD[0] = bodyDots[i + 1][0] - bodyDots[i][0];
				newD[1] = bodyDots[i + 1][1] - bodyDots[i][1];

				if (oldD.length > 0) {
					if ( (oldD[0] != newD[0]) || (oldD[1] != newD[1]) ) {
						walls.push([
							bodyDots[i][0] + oldD[0],
							bodyDots[i][1] + oldD[1]
						])
					}
				}

				oldD[0] = newD[0];
				oldD[1] = newD[1];
			}

			dontWeForgetWall(
				[ initDot[0] - 1, initDot[1] ],
				initDot,
				walls,
				bodyDots
			);
			dontWeForgetWall(
				bodyDots[bodyDots.length - 2],
				bodyDots[bodyDots.length - 1],
				walls
			);

			for (var key in walls) {
				imageLoader.loadImage("stone.png", {
					x : walls[key][1] * boxW,
					y : walls[key][0] * boxH,
					width  : boxW,
					height : boxH
				});
			}
		}

		function dontWeForgetWall(aDot, bDot, walls, another) {
			var bufD = [];
			bufD[0] = bDot[0] - aDot[0];
			bufD[1] = bDot[1] - aDot[1];

			var bufDot = [];
			bufDot[0] = bDot[0] + bufD[0];
			bufDot[1] = bDot[1] + bufD[1];

			if (!alreadyExist(bufDot, walls)) {
				if (another) {
					if (alreadyExist(bufDot, another)) return;
				}

				walls.push(bufDot);
			}
		}

		return self;
	}

	function IBuilMyOwnStringify(obj) {

		function deeperInObj(localObj, offset) {
			var res = "";
			var prefix;

			var keys = [];
			for (var key in localObj) {
				keys.push(key);
			}

			for(var i = 0; i < keys.length; i++) {
				var key = keys[i];
				prefix = offset + "\"" + key + "\" : ";

				if (typeof localObj[key] === "object") {

					if (localObj[key] instanceof Array) {
						res += prefix + "[" + deeperInArray(localObj[key], offset + "    ", offset);
					} else {
						res += prefix + "{\r\n" + deeperInObj(localObj[key], offset + "    ") + "\r\n" + offset +"}";
					}

				} else {
					res += prefix + "\"" + localObj[key] + "\"";
				}

				if (i != keys.length - 1) {
					res += ",\r\n";
				}
			}

			return res;
		}

		function deeperInArray(localArray, offset, oldoffset) {
			var res = "";
			var evilFlag = false;

			for (var i = 0; i < localArray.length; i++) {
				if (localArray[i] instanceof Array) {
					res += "\r\n" + offset + "[" + deeperInArray(localArray[i], offset + "    ");

					if (i != localArray.length - 1) {
						res += ",";
					}

					evilFlag = true;
				} else {
					if (typeof localArray[i] === "string") {
						res += "\"" + localArray[i] + "\"";
					} else {
						res += localArray[i];
					}

					if (i != localArray.length - 1) {
						res += ", ";
					}
				}
			}

			if (evilFlag) {
				res += "\r\n" + ((oldoffset) ? oldoffset : offset) + "]";
			} else {
				res += "]";
			}

			return res;
		}

		return "{\r\n" + deeperInObj(obj, "    ") + "\r\n}";
	}

	//=========================</CLASS>==========================

	//=========================<EVENTS>==========================

	$(document).ready(function() {
		console.log("ready");
		resizeWindow();
		init();
	});

	$("#printButton").click(function() {
		if (path) {
			print(path.createJson());
		} else {
			print("Nothing to print");
		}
	});
	$("#pathButton").click(function() {
		addPath();
	});
	$("#clearButton").click(function() {
		clear();
	});
	$("#trapButton").click(function() {
		addTrap();
	});
	$("#carrotButton").click(function() {
		addCarrot();
	});
	$("#boxButton").click(function() {
		addBox();
	});

	$(window).resize(function() {
		resizeWindow();
	});

	//========================</EVENTS>==========================

});