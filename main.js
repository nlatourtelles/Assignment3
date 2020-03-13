
// GameBoard code below
function dateBase(gameEngine) {
    this.gameEngine = gameEngine;
    var socket = io.connect("http://24.16.255.56:8888");
  
    socket.on("load", function (circleState) {
        console.log(circleState.data);
        gameEngine.removeAll();
        cirArray = circleState.data.split("|");
        // console.log(cirArray[0]);
        for(i = 0; i < cirArray.length - 1; i++) {
            cir = String(cirArray[i]);
            // console.log(cir);
            cir2 = cir.split(",");
            // console.log(parseInt(cir2[0]));
            var circle = new Circle(gameEngine);
            circle.color = parseInt(cir2[0]);
            console.log(circle.color);
            circle.velocity.x = parseFloat(cir2[4]);
            circle.velocity.y = parseFloat(cir2[5]);
            if(String(cir2[1]) === "true") {
                circle.infected = true;
                circle.citizen = false;
            }

            if(String(cir2[2]) === "true") {
                circle.doctor = true;
                circle.citizen = false;
            }

            circle.x = parseFloat(cir2[6]);
            circle.y = parseFloat(cir2[7]);
            gameEngine.addEntity(circle);
        
        }
        console.log(gameEngine.entities);
    });
  
    var text = document.getElementById("text");
    var saveButton = document.getElementById("save");
    var loadButton = document.getElementById("load");
  
    saveButton.onclick = function () {
      console.log("save");
      text.innerHTML = "Saved."
      circles = "";
      for(i = 0; i < gameEngine.entities.length; i++) {
          cir = gameEngine.entities[i];
          tempString = "";
          tempString += String(cir.color);
          tempString +=",";
          tempString += String(cir.infected);
          tempString += ",";
          tempString += String(cir.doctor);
          tempString += ",";
          tempString += cir.citizen;
          tempString +=",";
          tempString += cir.velocity.x;
          tempString += ",";
          tempString += cir.velocity.y;
          tempString += ",";
          tempString += cir.x;
          tempString += ",";
          tempString += cir.y;
          tempString += "|";
          circles += tempString;
      }
      socket.emit("save", { studentname: "Nicholas La Tour-Telles", statename: "VirusSpread", data: circles });
    };
  
    loadButton.onclick = function () {
      console.log("load");
      text.innerHTML = "Loaded."
      socket.emit("load", { studentname: "Nicholas La Tour-Telles", statename: "VirusSpread" });
    };
  
  };
  
function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.colors = ["Red", "Green", "Blue", "White"];
    this.color = 3;
    this.infected = false;
    this.doctor = false;
    this.citizen = true;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.collideRight = function () {
    return this.x + this.radius > 800;
};
Circle.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Circle.prototype.collideBottom = function () {
    return this.y + this.radius > 800;
};
Circle.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {
            var temp = this.velocity;
            this.velocity = ent.velocity;
            ent.velocity = temp;
            
            if(this.infected) {
                if(ent.citizen) {
                    num = Math.random() * 100;
                    console.log(num);

                    // console.log(num);
                    if (num < 11) {
                        ent.citizen = false;
                        ent.infected = true;
                        ent.color = 0;
                        console.log("infected");
                        
                    }
                }
            }

            if(this.doctor) {
                if(ent.infected) {
                    num = Math.random() * 100;
                    // console.log(num);
                    if (num < 11) {
                        ent.citizen = true;
                        ent.infected = false;
                        ent.color = 3;
                        
                    }                    
                }
            }
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent) {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX / (dist * dist) * acceleration;
            this.velocity.y += difY / (dist * dist) * acceleration;

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            };
        };
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

}

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
}

var friction = 1;
var acceleration = 10;
var maxSpeed = 2000;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    window.onload = dateBase(gameEngine);
    var circle = new Circle(gameEngine);
    circle.color = 0;
    circle.infected = true;
    circle.citizen = false;
    gameEngine.addEntity(circle);

    for (var i = 0; i < 30; i++) {
        circle = new Circle(gameEngine);
        gameEngine.addEntity(circle);
    };

    var circle = new Circle(gameEngine);
    circle.color = 2;
    circle.doctor = true;
    circle.citizen = false;
    circle.x = 50;
    circle.y = 50;
    gameEngine.addEntity(circle);

    var circle = new Circle(gameEngine);
    circle.color = 2;
    circle.doctor = true;
    circle.citizen = false;
    gameEngine.addEntity(circle);

    var circle = new Circle(gameEngine);
    circle.color = 2;
    circle.doctor = true;
    circle.citizen = false;
    gameEngine.addEntity(circle);

    var circle = new Circle(gameEngine);
    circle.color = 2;
    circle.doctor = true;
    circle.citizen = false;
    gameEngine.addEntity(circle);

    gameEngine.init(ctx);
    gameEngine.start();
});
