require(["jquery"], function($) {

	var c, ctx;
	var boxW, boxH;
	var offsetX, offsetY;

	var path, pathArray = [];

	var imageLoader = new ImageLoader();

	var mode = "none";

    function init() {
		c = document.getElementById("editor");
		ctx = c.getContext("2d");

		boxW = c.width  / 10;
		boxH = c.height / 10;

		console.log("main.html | canvas.pos : (" + c.style.left + ", " + c.style.top + ")");
		console.log("main.html | canvas.size : (" + c.width + ", " + c.height + ")");

		clear();
		c.onmousedown = mouseDown;
	}

	//==========================<MOUSE>==========================

	function mouseDown(e) {
		switch (mode) {
			case "node" :
				print("Choose what you want to do.");
				break;
			case "rabbit" :
				setRabbit(e.offsetX, e.offsetY);
				break;
			case "hole" :
				setHole(e.offsetX, e.offsetY);
				break;
			case "box" :
				addBox(e.offsetX, e.offsetY);
				break;
			case "trap" :
				addTrap(e.offsetX, e.offsetY);
				break;
			case "carrot" :
				addCarrot(e.offsetX, e.offsetY);
				break;
			case "key" :
				addKey(e.offsetX, e.offsetY);
				break;
			case "door" :
				addDoor(e.offsetX, e.offsetY);
				break;
			case "remove" :
				removeItem(e.offsetX, e.offsetY);
				break;
		}
		//path.setStartDot(e.offsetX, e.offsetY);
	}

	//=========================</MOUSE>==========================

	//==========================<UTILS>==========================

	var traps = [];
	function addTrap(x, y) {
		var trap = coordToIndexes(x, y);

		addTrapDot(trap);
	}

	function addTrapDot(trap) {
		if (!alreadyExistInAny(trap)) {
			traps.push(trap);

			imageLoader.loadImage("box_trap.png", {
				x : trap[1] * boxW,
				y : trap[0] * boxH,
				width  : boxW,
				height : boxH
			});
		} else {
			print("Trap in [" + trap[0] + ", " + trap[1] + "] already exist.")
		}
	}

	var carrots = [];
	function addCarrot(x, y) {
		var carrot = coordToIndexes(x, y);

		addCarrotDot(carrot);
	}

	function addCarrotDot(carrot) {
		if (!alreadyExistInAny(carrot)) {
			if (carrots.length < 3) {
				carrots.push(carrot);

				imageLoader.loadImage("carrot.png", {
					x : carrot[1] * boxW,
					y : carrot[0] * boxH,
					width  : boxW,
					height : boxH
				});
			}
		} else {
			print("Carrot in [" + carrot[0] + ", " + carrot[1] + "] already exist.");
		}
	}

	var boxes = [];
	function addBox(x, y) {
		var box = coordToIndexes(x, y);

		addBoxDot(box);
	}

	function addBoxDot(box) {
		if (!alreadyExistInAny(box)) {
			boxes.push(box);
			console.log("Box in [" + box[0] + ", " + box[1] + "] added.");

			imageLoader.loadImage("stone.png", {
				x : box[1] * boxW,
				y : box[0] * boxH,
				width  : boxW,
				height : boxH
			});
		} else {
			print("Box in [" + box[0] + ", " + box[1] + "] already exist.");
		}
	}

	var rabbit = null;
	function setRabbit(x, y) {
		if (rabbit != null) {
			removeItemDot(rabbit);
		}

		rabbit = coordToIndexes(x, y);
		drawRabbit();
	}

	function drawRabbit() {
		if (rabbit != null) {
			imageLoader.loadImage("rabbit2.png", {
				x : rabbit[1] * boxW,
				y : rabbit[0] * boxH,
				width  : boxW,
				height : boxH
			});
		}
	}

	var hole = null;
	function setHole(x, y) {
		if (hole != null) {
			removeItemDot(hole);
		}

		hole = coordToIndexes(x, y);
		drawHole();
	}

	function drawHole() {
		if (hole != null) {
			imageLoader.loadImage("hole.png", {
				x : hole[1] * boxW,
				y : hole[0] * boxH,
				width  : boxW,
				height : boxH
			});
		}
	}

	var spiderKeys = [];
	function addKey(x, y) {
		var spiderKey = coordToIndexes(x, y);

		addKeyDot(spiderKey);		
	}

	function addKeyDot(dot) {
		imageLoader.loadImage("key.png", {
			x : dot[1] * boxW,
			y : dot[0] * boxH,
			width  : boxW,
			height : boxH
		});

		spiderKeys.push(dot);
	}

	var doors = [];
	function addDoor(x, y) {
		var door = coordToIndexes(x, y);

		addDoorDot(door);
	}

	function addDoorDot(dot) {
		imageLoader.loadImage("door.png", {
			x : dot[1] * boxW,
			y : dot[0] * boxH,
			width  : boxW,
			height : boxH
		});

		doors.push(dot);
	}

	function coordToIndexes(x, y) {
		var res = [];

		res[0] = Math.floor(y / boxH);
		res[1] = Math.floor(x / boxW);

		return res;
	}

	function alreadyExistInArray(dot, array) {
		for (var key in array) {
			if ( (array[key][0] == dot[0]) && (array[key][1] == dot[1]) ) {
				return true;
			}
		}

		return false;
	}

	function alreadyExistInAny(dot) {
		var bufRabbit = ( (rabbit == null) ? [-1, -1] : rabbit );
		var bufHole   = ( (hole   == null) ? [-1, -1] : hole   );

		return (
			alreadyExistInArray(dot, boxes) ||
			alreadyExistInArray(dot, traps) ||
			alreadyExistInArray(dot, doors) ||
			alreadyExistInArray(dot, carrots) ||
			alreadyExistInArray(dot, spiderKeys) ||
			( ( dot[0] == bufRabbit[0] ) && ( dot[1] == bufRabbit[1] ) ) ||
			( ( dot[0] == bufHole[0]   ) && ( dot[1] == bufHole[1]   ) )
		);
	}

	function clear(callback) {
		ctx.clearRect(0, 0, c.width, c.height);
		imageLoader.loadImage("fon_fall.png", {
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

	function removeItem(x, y) {
		var dot = coordToIndexes(x, y);
		console.log("removeItem | dot[" + dot[0] + ", " + dot[1] + "]");

		removeItemDot(dot);
	}

	function removeItemDot(dot) {
		clear(function() {

			if (rabbit != null) {
				if ( !( (dot[0] == rabbit[0]) && (dot[1] == rabbit[1]) ) ) {
					drawRabbit();//rabbit = null;
				} else {
					rabbit = null;
				}
			}

			if (hole != null) {
				if ( !( (dot[0] == hole[0]) && (dot[1] == hole[1]) ) ) {
					drawHole();//hole = null;
				} else {
					hole = null;
				}
			}

			var bufArray = boxes;
			boxes = [];
			for (var key in bufArray) {
				console.log("removeItem | dot[" + dot[0] + ", " + dot[1] + "] = box : [" + bufArray[key][0] + ", " + bufArray[key][1] + "]");
			
				if ( !( (dot[0] == bufArray[key][0]) && (dot[1] == bufArray[key][1]) ) ) {
					addBoxDot(bufArray[key]);
				}
			}

			bufArray = traps;
			traps = [];
			for (var key in bufArray) {
				if ( !( (dot[0] == bufArray[key][0]) && (dot[1] == bufArray[key][1]) ) ) {
					addTrapDot(bufArray[key]);
				}
			}

			bufArray = carrots;
			carrots = [];
			for (var key in bufArray) {
				if ( !( (dot[0] == bufArray[key][0]) && (dot[1] == bufArray[key][1]) ) ) {
					addCarrotDot(bufArray[key]);
				}
			}

			bufArray = spiderKeys;
			spiderKeys = [];
			for (var key in bufArray) {
				if ( !( (dot[0] == bufArray[key][0]) && (dot[1] == bufArray[key][1]) ) ) {
					addKeyDot(bufArray[key]);
				}
			}

			bufArray = doors;
			doors = [];
			for (var key in bufArray) {
				if ( !( (dot[0] == bufArray[key][0]) && (dot[1] == bufArray[key][1]) ) ) {
					addDoorDot(bufArray[key]);
				}
			}
		});
	}

	function printJson() {
		var res = {
			name : "new_lvl",
			base_path : "img/"
		};

		res.images = {
	        "box" : ["stone.png", "stone2.png", "koloda.png", "mushroom1.png", "mushroom2.png", "poop.png"],
	        "trap" : [{
	                "image" : "box_trap.png",
	                "name"  : "trap"
	            }, {
	                "file" : "eg.xml",
	                "frames" : "10",
	                "speed" : "150",
	                "name" : "eg"
	            }],
	        "hole" : ["hole.png"],
	        "carrot" : ["carrot.png"],
	        "rabbit" : {
	            "stand" : "rabbit2.png",
	            "run" : "rabbitAnimation2.xml"
	        },
	        "lock" : {
	            "key"  : "key.png",
	            "door" : "door.png"
	        },
	        "background" : {
	            "grass" : "fon.png",
	            "trees" : "kustu.png",
	            "box"   : "box.png"
	        }
	    }

		res.scheme = {
			rabbit : ( (rabbit == null) ? [0, 0] : rabbit ),
			hole   : ( (hole   == null) ? [0, 0] : hole   ),
			traps  : traps,
			carrot : carrots,
			boxes  : boxes,
			lock   : {
				keys  : spiderKeys,
				doors : doors
			}
		};

		print(IBuilMyOwnStringify(res));
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

	function clickAnimation(button, newMode) {
		$(button).animate({
			"height" : "40px"
		}, 100, function() {
			$(button).animate({
				"height" : "50px"
			}, 100);
		});

		if (newMode != undefined) {
			mode = newMode;
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
						if (typeof localArray[i] === "object") {
							res += "{\r\n" + deeperInObj(localArray[i], offset + "    ") + "\r\n" + offset +"}";
						} else {
							res += localArray[i];
						}
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
		clickAnimation($(this));

		printJson();
	});
	$("#clearButton").click(function() {
		clickAnimation($(this));

		clear(function() {
			traps   = [];
			boxes   = [];
			doors   = [];
			carrots = [];
			spiderKeys = [];
			hole   = null;
			rabbit = null;
		});
	});
	$("#removeButton").click(function() {
		clickAnimation($(this), "remove");
	});
	$("#trapButton").click(function() {
		clickAnimation($(this), "trap");
	});
	$("#carrotButton").click(function() {
		clickAnimation($(this), "carrot");
	});
	$("#boxButton").click(function() {
		clickAnimation($(this), "box");
	});
	$("#holeButton").click(function() {
		clickAnimation($(this), "hole");
	});
	$("#rabbitButton").click(function() {
		clickAnimation($(this), "rabbit");
	});
	$("#keyButton").click(function() {
		clickAnimation($(this), "key");
	});
	$("#doorButton").click(function() {
		clickAnimation($(this), "door");
	});

	$(window).resize(function() {
		resizeWindow();
	});

	//========================</EVENTS>==========================

});