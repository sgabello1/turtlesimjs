var Turtle = (function() {
// Represents the turtle as a PNG image.
    image = new Image();
    image.src = 'images/robot-turtle.png';

  var Turtle = function(options) {
    var that = this;
    options = options || {};
    that.ros     = options.ros;
    that.name    = options.name;
    that.context = options.context;

    // Keeps track of the turtle's current position and velocity.
    that.orientation = 0.0;
    that.angularVelocity = 0.0;
    that.linearVelocity  = 0.0;
    that.pose = new that.ros.Message({
      position : {
        x : that.context.canvas.width / 2
      , y : that.context.canvas.height / 2
      }
    });

    // Subscribes to the Velocity topic, which act as // directions to the
    // turtle.
    that.velocityTopic = new that.ros.Topic({
      name        : '/' + that.name + '/command_velocity'
    , messageType : 'geometry_msgs/Twist'
    });
    that.velocityTopic.subscribe(that.onVelocity.bind(that));

    // Represents the turtle as a PNG image.
    // that.image = new Image();
    // that.image.src = 'images/robot-turtle.png';
    that.c=document.getElementById("world");

    that.draw();
    console.log("Draw turtle")
  };
  Turtle.prototype.__proto__ = EventEmitter2.prototype;

  Turtle.prototype.onVelocity = function(message) {
    this.linearVelocity  = message.linear;
    this.angularVelocity = message.angular;
    // console.log("message.linear.x", message.linear.x)
    // console.log("message.angular.y", message.angular.y)

    this.orientation = (this.orientation + this.angularVelocity.z) % (2 * Math.PI);
    // console.log("this.orientation", this.orientation)

    var pose = new this.ros.Message({position:{}});
    pose.position.x = this.pose.position.x
      + Math.sin(this.orientation + (Math.PI / 2)) * this.linearVelocity.x;          
      // console.log("pose.x",pose.x)

    pose.position.y = this.pose.position.y 
      + Math.cos(this.orientation + (Math.PI / 2)) * this.linearVelocity.x;

     // pose.theta = this.orientation.y;
    // pose.linear_velocity = this.linearVelocity;
    // pose.angular_velocity = this.angularVelocity;
    this.pose = pose;

    var poseTopic = new this.ros.Topic({
      name        : '/' + this.name + '/pose'
    , messageType : 'geometry_msgs/Pose'
    });
    poseTopic.publish(pose);
    this.emit('dirty');
  };

  Turtle.prototype.draw = function() {

    x = this.pose.position.x;
    y = this.pose.position.y;
    var imageWidth  = image.width;
    var imageHeight = image.height;
    // ctx=c.getContext("2d");

    // console.log(" x e y ", x, y );
    // console.log("im drawing imageWidth imageHeight", imageWidth, imageHeight);
    this.context.save();


    this.context.translate(x, y);
    this.context.rotate(-this.orientation);
    this.context.drawImage(
      image
    , -(imageWidth / 2)
    , -(imageHeight / 2)
    , imageWidth
    , imageHeight
    );
    this.context.restore();

    // console.log("im drawing ", x, y);
    // x0 = 0; 
    // y0 = 0;

    var point = new Object();
    point.x = x;
    point.y = y;

    Path.push(point);

    for(var i = 0; i < Path.length; i++){
      
      this.context.moveTo(Path[i].x,Path[i].y);
      if (Path.length > 1 && i > 1) {
          console.log(" i", i);

      this.context.lineTo(Path[i-1].x,Path[i-1].y);
    }else
      {
    console.log(" inizio");
      }
      this.context.lineTo(Path[i].x,Path[i].y);
      this.context.stroke();
    }
   
  }

  
  Turtle.prototype.moveForward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : 5
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveBackward = function() {
    var velocity = new this.ros.Message({
      angular : 0
    , linear  : -5
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveRight = function() {
    var velocity = new this.ros.Message({
      angular : -0.3
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  Turtle.prototype.moveLeft = function() {
    var velocity = new this.ros.Message({
      angular : 0.3
    , linear  : 0
    });

    this.velocityTopic.publish(velocity);
  };

  return Turtle;
}());

